import { Router } from 'express';
import { prisma } from '../prisma';
import { authedRouter } from '../lib/router';
import { authenticate } from '../middleware/auth';
import { AppError, asyncHandler } from '../middleware/error';
import { ok, Input, userId, rangeOf } from '../lib/http';
import { findFor, forBusiness, assertInBusiness, assertMember } from '../lib/guard';
import { audit } from '../lib/audit';
import { notifyBusiness, notifyUsers } from '../lib/notify';
import { emitEvent } from '../services/automation';
import { sha256, randomToken } from '../lib/crypto';
import { signedFileToken } from '../lib/storage';
import { rateLimit } from '../middleware/rate-limit';

/**
 * Creative production: request → review → project (members, tasks) → deliverable versions →
 * client review (approve / request revision) → final delivery → project completed.
 * Clients review through a tokenised link (no account needed); only someone with the link, or a
 * member with approve rights, can approve.
 */
const router = authedRouter({ publicPrefixes: ['/review/'] });

// ---------------------------------------------------------------- public client review (no auth)

async function deliverableByToken(token: string) {
  const d = await prisma.creativeDeliverable.findUnique({
    where: { reviewTokenHash: sha256(token) },
    include: { project: { select: { id: true, title: true, managerId: true, business: { select: { name: true, logoUrl: true } } } }, file: true },
  });
  if (!d) throw new AppError('This review link is invalid', 404);
  return d;
}

router.get('/review/:token', rateLimit({ windowMs: 60_000, max: 60 }), asyncHandler(async (req, res) => {
  const d = await deliverableByToken(String(req.params.token));
  const comments = await prisma.projectComment.findMany({ where: { deliverableId: d.id, isInternal: false }, orderBy: { createdAt: 'asc' }, select: { body: true, authorName: true, createdAt: true, author: { select: { firstName: true } } } });
  const reviews = await prisma.creativeReview.findMany({ where: { deliverableId: d.id }, orderBy: { createdAt: 'asc' }, select: { status: true, feedback: true, reviewerName: true, reviewedAt: true, version: true } });
  const open = d.status === 'IN_REVIEW' && (!d.reviewDeadline || d.reviewDeadline > new Date());
  return ok(res, {
    business: d.project.business,
    project: { title: d.project.title },
    deliverable: { title: d.title, version: d.version, notes: d.notes, status: d.status, reviewDeadline: d.reviewDeadline, url: d.url },
    preview: d.file ? { name: d.file.name, mimeType: d.file.mimeType, path: `/files/shared/${signedFileToken(d.file.id, 3600)}` } : null,
    comments,
    reviews,
    canDecide: open,
  });
}));

router.post('/review/:token/comment', rateLimit({ windowMs: 60_000, max: 20 }), asyncHandler(async (req, res) => {
  const d = await deliverableByToken(String(req.params.token));
  const i = Input.of(req);
  const c = await prisma.projectComment.create({
    data: { projectId: d.projectId, deliverableId: d.id, body: i.reqStr('body', 5000), authorName: i.str('name', { max: 100 }) ?? 'Client', isInternal: false },
  });
  await notifyUsers([d.project.managerId], { title: 'Client comment', message: `${c.authorName}: ${c.body.slice(0, 140)}`, type: 'CREATIVE', actionUrl: `/creative/projects/${d.projectId}` });
  return ok(res, { id: c.id, createdAt: c.createdAt }, 201);
}));

router.post('/review/:token/decision', rateLimit({ windowMs: 60_000, max: 10 }), asyncHandler(async (req, res) => {
  const d = await deliverableByToken(String(req.params.token));
  const i = Input.of(req);
  const result = await decide(d.id, {
    decision: i.oneOf('decision', ['APPROVED', 'REVISION_REQUESTED'] as const, true)!,
    feedback: i.str('feedback', { max: 5000 }),
    reviewerName: i.str('name', { required: true, max: 100 })!,
    reviewedById: null,
    viaLink: true,
  });
  return ok(res, { status: result.status });
}));

// ---------------------------------------------------------------- authenticated


/** POST /creative-requests — the brief. */
router.post('/creative-requests', asyncHandler(async (req, res) => {
  const i = Input.of(req);
  const { businessId } = await forBusiness(req, i.raw('businessId'), 'creativeRequest', 'create');
  const customerId = i.id('customerId');
  const packageId = i.id('packageId');
  await assertInBusiness('cRMCustomer', customerId, businessId, 'customerId');
  await assertInBusiness('servicePackage', packageId, businessId, 'packageId');
  const refs = i.list('referenceFileIds', 20) ?? [];
  for (const f of refs) await assertInBusiness('fileAsset', f, businessId, 'referenceFileIds');
  const deadline = i.date('deadline');
  if (deadline && deadline < new Date()) throw new AppError('deadline must be in the future', 400);
  const request = await prisma.creativeRequest.create({
    data: {
      businessId,
      createdById: userId(req),
      customerId,
      packageId,
      title: i.reqStr('title', 200),
      description: i.str('description', { max: 10000 }),
      serviceType: i.oneOf('serviceType', ['SOCIAL_POST', 'SOCIAL_CAMPAIGN', 'POSTER_FLYER', 'LOGO_BRANDING', 'VIDEO_EDITING', 'ADVERTISEMENT', 'MARKETING_MATERIAL', 'OTHER'] as const) ?? 'OTHER',
      objective: i.str('objective', { max: 2000 }),
      targetAudience: i.str('targetAudience', { max: 1000 }),
      platforms: i.list('platforms', 20) ?? [],
      format: i.str('format', { max: 200 }),
      priority: i.int('priority', { min: 1, max: 5 }) ?? 3,
      deadline,
      requirements: { text: i.str('contentRequirements', { max: 10000 }) ?? null, referenceFileIds: refs },
    },
  });
  await notifyBusiness(businessId, { title: 'New creative request', message: request.title, type: 'CREATIVE', actionUrl: `/creative/requests/${request.id}` });
  return ok(res, request, 201);
}));

/** Review a brief: approve, reject, or ask the client for more information. */
router.post('/creative-requests/:id/review', asyncHandler(async (req, res) => {
  const { row, businessId } = await findFor(req, 'creativeRequest', req.params.id, 'write', { action: 'approve' });
  if (!['SUBMITTED', 'REVIEWING', 'WAITING_FOR_CLIENT'].includes(row.status)) throw new AppError(`A ${row.status.toLowerCase()} request can't be reviewed again`, 409);
  const i = Input.of(req);
  const decision = i.oneOf('decision', ['APPROVE', 'REJECT', 'NEED_INFO'] as const, true)!;
  const status = decision === 'APPROVE' ? 'APPROVED' : decision === 'REJECT' ? 'CANCELLED' : 'WAITING_FOR_CLIENT';
  const feedback = i.str('feedback', { max: 5000 });
  const updated = await prisma.$transaction(async (tx) => {
    const u = await tx.creativeRequest.update({ where: { id: row.id }, data: { status } });
    await tx.creativeReview.create({ data: { requestId: row.id, status: decision === 'APPROVE' ? 'APPROVED' : decision === 'REJECT' ? 'REJECTED' : 'REVISION_REQUESTED', feedback, reviewedById: userId(req), reviewedAt: new Date() } });
    return u;
  });
  await audit(req, { action: `creative_request.${decision.toLowerCase()}`, entityType: 'CreativeRequest', entityId: row.id, businessId, metadata: { feedback } });
  await notifyUsers([row.createdById], { title: `Creative request ${status.toLowerCase().replace(/_/g, ' ')}`, message: `${row.title}${feedback ? `: ${feedback.slice(0, 140)}` : ''}`, type: 'CREATIVE' });
  return ok(res, updated);
}));

/** Turn an approved request into a project with a manager, team and deadline. */
router.post('/creative-requests/:id/convert', asyncHandler(async (req, res) => {
  const { row, businessId } = await findFor(req, 'creativeRequest', req.params.id, 'write', { action: 'approve' });
  if (row.status !== 'APPROVED') throw new AppError('Only approved requests can become projects', 409);
  const existing = await prisma.creativeProject.findUnique({ where: { requestId: row.id } });
  if (existing) throw new AppError('This request already has a project', 409);
  const i = Input.of(req);
  const managerId = i.id('managerId') ?? userId(req);
  await assertMember(managerId, businessId, 'managerId');
  const memberIds = i.list('memberIds', 50) ?? [];
  for (const m of memberIds) await assertMember(m, businessId, 'memberIds');
  const project = await prisma.$transaction(async (tx) => {
    const p = await tx.creativeProject.create({
      data: {
        businessId,
        requestId: row.id,
        customerId: row.customerId,
        managerId,
        title: i.str('title', { max: 200 }) ?? row.title,
        description: row.description,
        status: 'IN_PROGRESS',
        stage: 'BRIEF',
        startDate: new Date(),
        deadline: i.date('deadline') ?? row.deadline,
        members: { create: [...new Set([managerId, ...memberIds])].map((uid) => ({ userId: uid, role: uid === managerId ? 'MANAGER' : 'DESIGNER' })) },
      },
    });
    await tx.creativeRequest.update({ where: { id: row.id }, data: { status: 'IN_PROGRESS' } });
    return p;
  });
  await notifyUsers([managerId, ...memberIds], { title: 'New creative project', message: project.title, type: 'CREATIVE', actionUrl: `/creative/projects/${project.id}` });
  return ok(res, project, 201);
}));

/** Create a project directly (no request). */
router.post('/creative-projects', asyncHandler(async (req, res) => {
  const i = Input.of(req);
  const { businessId } = await forBusiness(req, i.raw('businessId'), 'creativeProject', 'create');
  const managerId = i.id('managerId') ?? userId(req);
  const customerId = i.id('customerId');
  await assertMember(managerId, businessId, 'managerId');
  await assertInBusiness('cRMCustomer', customerId, businessId, 'customerId');
  const memberIds = i.list('memberIds', 50) ?? [];
  for (const m of memberIds) await assertMember(m, businessId, 'memberIds');
  const project = await prisma.creativeProject.create({
    data: {
      businessId,
      customerId,
      managerId,
      title: i.reqStr('title', 200),
      description: i.str('description', { max: 10000 }),
      status: 'PLANNING',
      deadline: i.date('deadline'),
      startDate: i.date('startDate'),
      members: { create: [...new Set([managerId, ...memberIds])].map((uid) => ({ userId: uid, role: uid === managerId ? 'MANAGER' : 'DESIGNER' })) },
    },
  });
  return ok(res, project, 201);
}));

router.get('/creative-projects/:id/overview', asyncHandler(async (req, res) => {
  const { row } = await findFor(req, 'creativeProject', req.params.id, 'read', {
    include: {
      members: { include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } } },
      tasks: { orderBy: [{ status: 'asc' }, { deadline: 'asc' }], include: { assignedTo: { select: { id: true, firstName: true, lastName: true } } } },
      deliverables: { orderBy: [{ title: 'asc' }, { version: 'desc' }], include: { file: { select: { id: true, name: true, mimeType: true } } } },
      request: true,
      customer: { select: { id: true, name: true } },
    },
  });
  const done = row.tasks.filter((t: any) => t.status === 'COMPLETED').length;
  const { reviewTokenHash: _hidden, ...safe } = row as any;
  return ok(res, {
    ...safe,
    deliverables: row.deliverables.map(({ reviewTokenHash, ...d }: any) => d),
    progress: row.tasks.length ? Math.round((done / row.tasks.length) * 100) : 0,
    overdueTasks: row.tasks.filter((t: any) => t.deadline && t.deadline < new Date() && !['COMPLETED', 'CANCELLED'].includes(t.status)).length,
  });
}));

router.post('/creative-projects/:id/members', asyncHandler(async (req, res) => {
  const { row, businessId } = await findFor(req, 'creativeProject', req.params.id, 'write');
  const i = Input.of(req);
  const uid = i.reqId('userId');
  await assertMember(uid, businessId);
  const m = await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: row.id, userId: uid } },
    create: { projectId: row.id, userId: uid, role: i.str('role', { max: 40 }) ?? 'DESIGNER' },
    update: { role: i.str('role', { max: 40 }) ?? undefined },
  });
  await notifyUsers([uid], { title: 'Added to a creative project', message: row.title, type: 'CREATIVE', actionUrl: `/creative/projects/${row.id}` });
  return ok(res, m, 201);
}));

router.delete('/creative-projects/:id/members/:userId', asyncHandler(async (req, res) => {
  const { row } = await findFor(req, 'creativeProject', req.params.id, 'write');
  await prisma.projectMember.deleteMany({ where: { projectId: row.id, userId: String(req.params.userId) } });
  return ok(res, { removed: true });
}));

router.get('/creative-projects/:id/comments', asyncHandler(async (req, res) => {
  const { row } = await findFor(req, 'creativeProject', req.params.id);
  return ok(res, await prisma.projectComment.findMany({ where: { projectId: row.id }, orderBy: { createdAt: 'asc' }, include: { author: { select: { id: true, firstName: true, lastName: true } } } }));
}));

router.post('/creative-projects/:id/comments', asyncHandler(async (req, res) => {
  const { row } = await findFor(req, 'creativeProject', req.params.id, 'write');
  const i = Input.of(req);
  const taskId = i.id('taskId');
  const deliverableId = i.id('deliverableId');
  if (taskId && !(await prisma.creativeTask.count({ where: { id: taskId, projectId: row.id } }))) throw new AppError('taskId is not in this project', 400);
  if (deliverableId && !(await prisma.creativeDeliverable.count({ where: { id: deliverableId, projectId: row.id } }))) throw new AppError('deliverableId is not in this project', 400);
  const c = await prisma.projectComment.create({
    data: { projectId: row.id, taskId, deliverableId, authorId: userId(req), body: i.reqStr('body', 5000), isInternal: i.bool('isInternal') ?? true },
  });
  return ok(res, c, 201);
}));

/** Complete a project: needs a delivered final and nothing still in review. */
router.post('/creative-projects/:id/complete', asyncHandler(async (req, res) => {
  const { row, businessId } = await findFor(req, 'creativeProject', req.params.id, 'write', { action: 'approve' });
  if (['COMPLETED', 'CANCELLED'].includes(row.status)) throw new AppError(`Project is already ${row.status.toLowerCase()}`, 409);
  const [delivered, inReview] = await Promise.all([
    prisma.creativeDeliverable.count({ where: { projectId: row.id, status: 'DELIVERED' } }),
    prisma.creativeDeliverable.count({ where: { projectId: row.id, status: 'IN_REVIEW' } }),
  ]);
  if (!delivered) throw new AppError('Deliver at least one approved final file before completing the project', 409);
  if (inReview) throw new AppError('Some deliverables are still in client review', 409);
  const updated = await prisma.$transaction(async (tx) => {
    const u = await tx.creativeProject.update({ where: { id: row.id }, data: { status: 'COMPLETED', stage: 'DELIVERED', completedAt: new Date() } });
    if (row.requestId) await tx.creativeRequest.update({ where: { id: row.requestId }, data: { status: 'COMPLETED' } });
    return u;
  });
  const members = await prisma.projectMember.findMany({ where: { projectId: row.id }, select: { userId: true } });
  await notifyUsers(members.map((m) => m.userId), { title: 'Project completed', message: row.title, type: 'CREATIVE' });
  await audit(req, { action: 'creative_project.complete', entityType: 'CreativeProject', entityId: row.id, businessId });
  return ok(res, updated);
}));

// ---- tasks

router.post('/creative-tasks', asyncHandler(async (req, res) => {
  const i = Input.of(req);
  const projectId = i.reqId('projectId');
  const { row: project, businessId } = await findFor(req, 'creativeProject', projectId, 'write');
  const assignedToId = i.id('assignedToId');
  await assertMember(assignedToId, businessId, 'assignedToId');
  const parentId = i.id('parentId');
  if (parentId && !(await prisma.creativeTask.count({ where: { id: parentId, projectId } }))) throw new AppError('parentId is not a task of this project', 400);
  const task = await prisma.creativeTask.create({
    data: {
      projectId,
      parentId,
      assignedToId,
      title: i.reqStr('title', 200),
      description: i.str('description', { max: 5000 }),
      stage: i.oneOf('stage', ['BRIEF', 'SCRIPTING', 'SHOOTING', 'DESIGN', 'EDITING', 'INTERNAL_REVIEW', 'CLIENT_REVIEW', 'REVISION', 'DELIVERED'] as const) ?? 'DESIGN',
      priority: i.int('priority', { min: 1, max: 5 }) ?? 3,
      deadline: i.date('deadline'),
      estimatedHours: i.num('estimatedHours', { min: 0, max: 1000 }),
    },
  });
  if (assignedToId) {
    await prisma.projectMember.upsert({ where: { projectId_userId: { projectId, userId: assignedToId } }, create: { projectId, userId: assignedToId }, update: {} });
    if (assignedToId !== userId(req)) await notifyUsers([assignedToId], { title: 'New task assigned', message: `${task.title} — ${project.title}`, type: 'CREATIVE', actionUrl: `/creative/projects/${projectId}` });
  }
  return ok(res, task, 201);
}));

/** Reassign a task (managers). */
router.post('/creative-tasks/:id/assign', asyncHandler(async (req, res) => {
  const { row, businessId } = await findFor(req, 'creativeTask', req.params.id, 'write', { action: 'approve' });
  const assignedToId = Input.of(req).id('assignedToId') ?? null;
  await assertMember(assignedToId, businessId, 'assignedToId');
  const task = await prisma.creativeTask.update({ where: { id: row.id }, data: { assignedToId } });
  if (assignedToId) {
    await prisma.projectMember.upsert({ where: { projectId_userId: { projectId: row.projectId, userId: assignedToId } }, create: { projectId: row.projectId, userId: assignedToId }, update: {} });
    await notifyUsers([assignedToId], { title: 'Task assigned to you', message: row.title, type: 'CREATIVE', actionUrl: `/creative/projects/${row.projectId}` });
  }
  await audit(req, { action: 'creative_task.assign', entityType: 'CreativeTask', entityId: row.id, businessId, metadata: { from: row.assignedToId, to: assignedToId } });
  return ok(res, task);
}));

router.post('/creative-tasks/:id/status', asyncHandler(async (req, res) => {
  const { row, businessId } = await findFor(req, 'creativeTask', req.params.id, 'write');
  const status = Input.of(req).oneOf('status', ['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'CANCELLED'] as const, true)!;
  if (status === 'COMPLETED') {
    const open = await prisma.creativeTask.count({ where: { parentId: row.id, status: { notIn: ['COMPLETED', 'CANCELLED'] } } });
    if (open) throw new AppError('Finish or cancel the subtasks first', 409);
  }
  const task = await prisma.creativeTask.update({ where: { id: row.id }, data: { status, completedAt: status === 'COMPLETED' ? new Date() : null } });
  await audit(req, { action: 'creative_task.status', entityType: 'CreativeTask', entityId: row.id, businessId, metadata: { from: row.status, to: status } });
  return ok(res, task);
}));

/** Team workload: open / overdue tasks and hours per person. */
router.get('/creative/workload', asyncHandler(async (req, res) => {
  const { businessId } = await forBusiness(req, req.query.businessId, 'creativeTask', 'read');
  const tasks = await prisma.creativeTask.findMany({
    where: { project: { businessId }, status: { notIn: ['COMPLETED', 'CANCELLED'] } },
    select: { assignedToId: true, deadline: true, estimatedHours: true },
  });
  const users = await prisma.user.findMany({ where: { memberships: { some: { businessId, status: 'ACTIVE' } } }, select: { id: true, firstName: true, lastName: true } });
  const now = new Date();
  const rows = [...users, { id: null as any, firstName: 'Unassigned', lastName: null }].map((u) => {
    const mine = tasks.filter((t) => t.assignedToId === u.id);
    return {
      userId: u.id,
      name: [u.firstName, u.lastName].filter(Boolean).join(' ') || 'Member',
      openTasks: mine.length,
      overdueTasks: mine.filter((t) => t.deadline && t.deadline < now).length,
      estimatedHours: Math.round(mine.reduce((a, t) => a + Number(t.estimatedHours ?? 0), 0) * 10) / 10,
    };
  }).filter((r) => r.openTasks > 0 || r.userId);
  return ok(res, rows);
}));

/** Calendar of project and task deadlines in a range. */
router.get('/creative/calendar', asyncHandler(async (req, res) => {
  const { businessId } = await forBusiness(req, req.query.businessId, 'creativeProject', 'read');
  const { from, to } = rangeOf(req, 'month');
  const [projects, tasks] = await Promise.all([
    prisma.creativeProject.findMany({ where: { businessId, deadline: { gte: from, lte: to } }, select: { id: true, title: true, deadline: true, status: true } }),
    prisma.creativeTask.findMany({ where: { project: { businessId }, deadline: { gte: from, lte: to } }, select: { id: true, title: true, deadline: true, status: true, projectId: true, assignedToId: true } }),
  ]);
  return ok(res, [
    ...projects.map((p) => ({ type: 'project', ...p })),
    ...tasks.map((t) => ({ type: 'task', ...t })),
  ].sort((a, b) => a.deadline!.getTime() - b.deadline!.getTime()));
}));

// ---- deliverables, review, delivery

/** Upload a new deliverable version (draft). Same title = next version. */
router.post('/creative-deliverables', asyncHandler(async (req, res) => {
  const i = Input.of(req);
  const projectId = i.reqId('projectId');
  const { row: project, businessId } = await findFor(req, 'creativeProject', projectId, 'write');
  if (['COMPLETED', 'CANCELLED'].includes(project.status)) throw new AppError(`Project is ${project.status.toLowerCase()}`, 409);
  const fileId = i.id('fileId');
  await assertInBusiness('fileAsset', fileId, businessId, 'fileId');
  const url = i.str('url', { max: 1000 });
  if (url && !/^https:\/\//.test(url)) throw new AppError('url must be an https link', 400);
  if (!fileId && !url) throw new AppError('fileId or url is required', 400);
  const title = i.reqStr('title', 200);
  const last = await prisma.creativeDeliverable.findFirst({ where: { projectId, title }, orderBy: { version: 'desc' } });
  const d = await prisma.creativeDeliverable.create({
    data: { businessId, projectId, title, version: (last?.version ?? 0) + 1, fileId, url, notes: i.str('notes', { max: 5000 }), status: 'DRAFT' },
    omit: { reviewTokenHash: true },
  });
  if (fileId) await prisma.fileAsset.update({ where: { id: fileId }, data: { projectId } });
  return ok(res, d, 201);
}));

/**
 * Send a deliverable to client review: returns a review link (shown once) and records a pending
 * review. Earlier versions still in review are closed.
 */
router.post('/creative-deliverables/:id/submit', asyncHandler(async (req, res) => {
  const { row, businessId } = await findFor(req, 'creativeDeliverable', req.params.id, 'write');
  if (!['DRAFT', 'REVISION_REQUESTED'].includes(row.status)) throw new AppError(`A ${row.status.toLowerCase()} deliverable can't be submitted`, 409);
  const i = Input.of(req);
  const reviewDeadline = i.date('reviewDeadline') ?? new Date(Date.now() + 7 * 86_400_000);
  if (reviewDeadline < new Date()) throw new AppError('reviewDeadline must be in the future', 400);
  const token = randomToken();
  await prisma.$transaction(async (tx) => {
    await tx.creativeDeliverable.updateMany({ where: { projectId: row.projectId, title: row.title, status: 'IN_REVIEW', id: { not: row.id } }, data: { status: 'REVISION_REQUESTED', reviewTokenHash: null } });
    await tx.creativeDeliverable.update({ where: { id: row.id }, data: { status: 'IN_REVIEW', submittedAt: new Date(), reviewDeadline, reviewTokenHash: sha256(token) } });
    await tx.creativeReview.create({ data: { projectId: row.projectId, deliverableId: row.id, status: 'PENDING', version: row.version } });
    await tx.creativeProject.update({ where: { id: row.projectId }, data: { status: 'REVIEW', stage: 'CLIENT_REVIEW' } });
  });
  await audit(req, { action: 'deliverable.submit', entityType: 'CreativeDeliverable', entityId: row.id, businessId, metadata: { version: row.version, reviewDeadline } });
  const site = (process.env.SITE_URL ?? 'http://localhost:3001').replace(/\/$/, '');
  return ok(res, { status: 'IN_REVIEW', reviewUrl: `${site}/review/${token}`, token, reviewDeadline });
}));

/** Internal decision by a member with approve rights (e.g. the client approved by phone). */
router.post('/creative-deliverables/:id/decision', asyncHandler(async (req, res) => {
  const { row } = await findFor(req, 'creativeDeliverable', req.params.id, 'write', { action: 'approve' });
  const i = Input.of(req);
  const result = await decide(row.id, {
    decision: i.oneOf('decision', ['APPROVED', 'REVISION_REQUESTED'] as const, true)!,
    feedback: i.str('feedback', { max: 5000 }),
    reviewerName: null,
    reviewedById: userId(req),
    viaLink: false,
  });
  await audit(req, { action: `deliverable.${result.status.toLowerCase()}`, entityType: 'CreativeDeliverable', entityId: row.id, businessId: row.businessId });
  return ok(res, result);
}));

async function decide(
  deliverableId: string,
  d: { decision: 'APPROVED' | 'REVISION_REQUESTED'; feedback?: string; reviewerName: string | null; reviewedById: string | null; viaLink: boolean },
) {
  const result = await prisma.$transaction(async (tx) => {
    const cur = await tx.creativeDeliverable.findUniqueOrThrow({ where: { id: deliverableId }, include: { project: true } });
    if (cur.status !== 'IN_REVIEW') throw new AppError('This version is not waiting for review', 409);
    if (d.viaLink && cur.reviewDeadline && cur.reviewDeadline < new Date()) throw new AppError('The review deadline has passed; ask the team for a new link', 410);
    if (d.decision === 'REVISION_REQUESTED' && !d.feedback) throw new AppError('Please describe the changes you need (feedback)', 400);
    const claimed = await tx.creativeDeliverable.updateMany({
      where: { id: deliverableId, status: 'IN_REVIEW' },
      data: { status: d.decision, reviewTokenHash: null },
    });
    if (!claimed.count) throw new AppError('A decision was already made', 409);
    const pending = await tx.creativeReview.findFirst({ where: { deliverableId, status: 'PENDING' }, orderBy: { createdAt: 'desc' } });
    const reviewData = { status: d.decision, feedback: d.feedback, reviewerName: d.reviewerName, reviewedById: d.reviewedById, reviewedAt: new Date() };
    if (pending) await tx.creativeReview.update({ where: { id: pending.id }, data: reviewData });
    else await tx.creativeReview.create({ data: { projectId: cur.projectId, deliverableId, version: cur.version, ...reviewData } });
    if (d.feedback) await tx.projectComment.create({ data: { projectId: cur.projectId, deliverableId, body: d.feedback, authorId: d.reviewedById, authorName: d.reviewerName, isInternal: false } });
    await tx.creativeProject.update({
      where: { id: cur.projectId },
      data: d.decision === 'APPROVED'
        ? { stage: 'INTERNAL_REVIEW', status: 'IN_PROGRESS' }
        : { stage: 'REVISION', status: 'IN_PROGRESS', revisionCount: { increment: 1 } },
    });
    return cur;
  });
  const members = await prisma.projectMember.findMany({ where: { projectId: result.projectId }, select: { userId: true } });
  await notifyUsers([result.project.managerId, ...members.map((m) => m.userId)], {
    title: d.decision === 'APPROVED' ? 'Client approved a deliverable' : 'Client requested a revision',
    message: `${result.title} v${result.version}${d.feedback ? `: ${d.feedback.slice(0, 140)}` : ''}`,
    type: 'CREATIVE',
    actionUrl: `/creative/projects/${result.projectId}`,
  });
  if (d.decision === 'APPROVED') {
    await emitEvent(result.businessId, 'PROJECT_APPROVED', `deliverable:${deliverableId}`, { projectId: result.projectId, customerId: result.project.customerId ?? '', title: result.title });
  }
  return { status: d.decision, deliverableId };
}

/** Final delivery: only approved versions; returns a signed download link for the client. */
router.post('/creative-deliverables/:id/deliver', asyncHandler(async (req, res) => {
  const { row, businessId } = await findFor(req, 'creativeDeliverable', req.params.id, 'write', { action: 'approve' });
  if (row.status !== 'APPROVED') throw new AppError('Only approved deliverables can be delivered', 409);
  const updated = await prisma.$transaction(async (tx) => {
    await tx.creativeDeliverable.updateMany({ where: { projectId: row.projectId, title: row.title, isFinal: true }, data: { isFinal: false } });
    return tx.creativeDeliverable.update({ where: { id: row.id }, data: { status: 'DELIVERED', isFinal: true, deliveredAt: new Date() }, omit: { reviewTokenHash: true } });
  });
  await audit(req, { action: 'deliverable.deliver', entityType: 'CreativeDeliverable', entityId: row.id, businessId, metadata: { version: row.version } });
  const days = Input.of(req).int('linkDays', { min: 1, max: 30 }) ?? 14;
  return ok(res, { deliverable: updated, downloadPath: row.fileId ? `/files/shared/${signedFileToken(row.fileId, days * 86_400)}` : row.url });
}));

/** Version + review history of one deliverable title in a project. */
router.get('/creative-deliverables/:id/history', asyncHandler(async (req, res) => {
  const { row } = await findFor(req, 'creativeDeliverable', req.params.id);
  const versions = await prisma.creativeDeliverable.findMany({
    where: { projectId: row.projectId, title: row.title },
    orderBy: { version: 'asc' },
    omit: { reviewTokenHash: true },
    include: { reviews: { orderBy: { createdAt: 'asc' }, include: { reviewedBy: { select: { firstName: true, lastName: true } } } }, file: { select: { id: true, name: true, mimeType: true, size: true } } },
  });
  return ok(res, versions.map((v) => ({ ...v, file: v.file ? { ...v.file, size: Number(v.file.size) } : null })));
}));

export default router;
