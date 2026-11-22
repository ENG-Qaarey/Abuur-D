import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../prisma';
import { authedRouter } from '../lib/router';
import { authenticate } from '../middleware/auth';
import { AppError, asyncHandler } from '../middleware/error';
import { ok, Input, userId, rangeOf, money, dec } from '../lib/http';
import { findFor, forBusiness, assertInBusiness, assertMember, canRead } from '../lib/guard';
import { audit } from '../lib/audit';
import { notifyUsers } from '../lib/notify';
import { emitEvent } from '../services/automation';

/**
 * CRM workflows. Plain record editing stays on the generic routes (/crm-customers, /leads,
 * /deals, /crm-tasks ...); these endpoints run the steps that must happen together.
 */
const router = authedRouter();

const LEAD_STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'LOST'] as const;

// ---------------------------------------------------------------- customers

/** Existing customer with the same phone or email in this business. */
async function findDuplicate(businessId: string, phone?: string | null, email?: string | null, exceptId?: string) {
  const ors: Prisma.CRMCustomerWhereInput[] = [];
  if (phone) ors.push({ phone }, { whatsappNumber: phone });
  if (email) ors.push({ email: { equals: email, mode: 'insensitive' } });
  if (!ors.length) return null;
  return prisma.cRMCustomer.findFirst({ where: { businessId, OR: ors, ...(exceptId ? { id: { not: exceptId } } : {}) }, select: { id: true, name: true, phone: true, email: true } });
}

function customerData(i: Input) {
  return {
    name: i.str('name', { max: 200 }),
    email: i.email('email'),
    phone: i.phone('phone'),
    whatsappNumber: i.phone('whatsappNumber'),
    company: i.str('company', { max: 200 }),
    address: i.str('address', { max: 500 }),
    city: i.str('city', { max: 100 }),
    country: i.str('country', { max: 100 }),
    industry: i.str('industry', { max: 100 }),
    website: i.str('website', { max: 300 }),
    contactPerson: i.str('contactPerson', { max: 200 }),
    notes: i.str('notes', { max: 5000 }),
    tags: i.list('tags', 50),
    status: i.oneOf('status', ['LEAD', 'ONBOARDING', 'ACTIVE', 'AT_RISK', 'CHURNED'] as const),
  };
}

/** POST /crm-customers — create with duplicate detection (pass allowDuplicate: true to override). */
router.post('/crm-customers', asyncHandler(async (req, res) => {
  const i = Input.of(req);
  const { businessId } = await forBusiness(req, i.raw('businessId'), 'cRMCustomer', 'create');
  const data = customerData(i);
  if (!data.name) throw new AppError('name is required', 400);
  const accountManagerId = i.id('accountManagerId');
  await assertMember(accountManagerId, businessId, 'accountManagerId');
  const dup = await findDuplicate(businessId, data.phone, data.email);
  if (dup && i.bool('allowDuplicate') !== true) {
    return res.status(409).json({ success: false, statusCode: 409, timestamp: new Date().toISOString(), message: `A customer with this phone or email already exists: ${dup.name}`, data: { duplicate: dup } });
  }
  const customer = await prisma.cRMCustomer.create({ data: { ...data, name: data.name, tags: data.tags ?? [], businessId, accountManagerId } });
  await emitEvent(businessId, 'CUSTOMER_CREATED', `customer:${customer.id}`, { customerId: customer.id, name: customer.name, phone: customer.phone ?? '' });
  return ok(res, customer, 201);
}));

router.post('/crm-customers/:id/archive', asyncHandler(async (req, res) => {
  const { row, businessId } = await findFor(req, 'cRMCustomer', req.params.id, 'write');
  const customer = await prisma.cRMCustomer.update({ where: { id: row.id }, data: { archivedAt: new Date() } });
  await audit(req, { action: 'customer.archive', entityType: 'CRMCustomer', entityId: row.id, businessId });
  return ok(res, customer);
}));

router.post('/crm-customers/:id/unarchive', asyncHandler(async (req, res) => {
  const { row } = await findFor(req, 'cRMCustomer', req.params.id, 'write');
  return ok(res, await prisma.cRMCustomer.update({ where: { id: row.id }, data: { archivedAt: null } }));
}));

/** Everything that happened with a customer, newest first. */
router.get('/crm-customers/:id/timeline', asyncHandler(async (req, res) => {
  const { row, access, businessId } = await findFor(req, 'cRMCustomer', req.params.id);
  const id = row.id;
  const finance = canRead(access, businessId, 'payment');
  const [communications, tasks, leads, deals, subscriptions, payments, invoices, projects] = await Promise.all([
    prisma.clientCommunication.findMany({ where: { customerId: id }, orderBy: { occurredAt: 'desc' }, take: 100, include: { user: { select: { firstName: true, lastName: true } } } }),
    prisma.crmTask.findMany({ where: { customerId: id }, orderBy: { createdAt: 'desc' }, take: 100 }),
    prisma.lead.findMany({ where: { customerId: id }, orderBy: { createdAt: 'desc' } }),
    prisma.deal.findMany({ where: { customerId: id }, orderBy: { createdAt: 'desc' }, include: { stage: { select: { name: true } } } }),
    prisma.clientSubscription.findMany({ where: { customerId: id }, include: { package: { select: { name: true } }, events: { orderBy: { createdAt: 'desc' }, take: 20 } } }),
    finance ? prisma.payment.findMany({ where: { customerId: id }, orderBy: { createdAt: 'desc' }, take: 100 }) : Promise.resolve(null),
    finance ? prisma.invoice.findMany({ where: { customerId: id }, orderBy: { createdAt: 'desc' }, take: 100 }) : Promise.resolve(null),
    prisma.creativeProject.findMany({ where: { customerId: id }, orderBy: { createdAt: 'desc' }, select: { id: true, title: true, status: true, deadline: true } }),
  ]);
  const events = [
    ...communications.map((c) => ({ at: c.occurredAt, kind: 'communication', id: c.id, title: `${c.channel} ${c.direction.toLowerCase()}`, detail: c.subject ?? c.content.slice(0, 140) })),
    ...tasks.map((t) => ({ at: t.createdAt, kind: 'task', id: t.id, title: t.title, detail: `${t.status}${t.dueAt ? ` · due ${t.dueAt.toISOString().slice(0, 10)}` : ''}` })),
    ...leads.map((l) => ({ at: l.createdAt, kind: 'lead', id: l.id, title: l.title, detail: l.status })),
    ...deals.map((d) => ({ at: d.createdAt, kind: 'deal', id: d.id, title: d.title, detail: `${d.status} · ${d.stage.name} · ${d.value} ${d.currency}` })),
    ...subscriptions.flatMap((s) => s.events.map((e) => ({ at: e.createdAt, kind: 'subscription', id: s.id, title: `${s.package.name}: ${e.type}`, detail: e.note ?? '' }))),
    ...(payments ?? []).map((p) => ({ at: p.paidAt ?? p.createdAt, kind: 'payment', id: p.id, title: `${p.kind} ${p.amount} ${p.currency}`, detail: p.status })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime());
  return ok(res, { customer: row, events, leads, deals, tasks, subscriptions, payments, invoices, projects, financeHidden: !finance });
}));

// ---------------------------------------------------------------- leads

/** POST /leads — create a lead (contact details on the lead until it is converted). */
router.post('/leads', asyncHandler(async (req, res) => {
  const i = Input.of(req);
  const { businessId } = await forBusiness(req, i.raw('businessId'), 'lead', 'create');
  const assignedToId = i.id('assignedToId');
  await assertMember(assignedToId, businessId, 'assignedToId');
  const customerId = i.id('customerId');
  await assertInBusiness('cRMCustomer', customerId, businessId, 'customerId');
  const lead = await prisma.lead.create({
    data: {
      businessId,
      title: i.reqStr('title', 200),
      description: i.str('description', { max: 5000 }),
      source: i.str('source', { max: 100 }),
      interest: i.str('interest', { max: 300 }),
      contactName: i.str('contactName', { max: 200 }),
      contactPhone: i.phone('contactPhone'),
      contactEmail: i.email('contactEmail'),
      priority: i.int('priority', { min: 1, max: 5 }) ?? 3,
      status: i.oneOf('status', LEAD_STATUSES) ?? 'NEW',
      value: i.money('value', { allowZero: true }),
      currency: i.str('currency', { max: 3 }) ?? 'USD',
      expectedCloseDate: i.date('expectedCloseDate'),
      notes: i.str('notes', { max: 5000 }),
      assignedToId,
      customerId,
      createdById: userId(req),
    },
  });
  if (assignedToId && assignedToId !== userId(req)) {
    await notifyUsers([assignedToId], { title: 'New lead assigned to you', message: lead.title, type: 'INFO', actionUrl: `/dashboard/crm/leads/${lead.id}` });
  }
  await emitEvent(businessId, 'LEAD_CREATED', `lead:${lead.id}`, { leadId: lead.id, name: lead.contactName ?? lead.title, phone: lead.contactPhone ?? '', assignedToId: assignedToId ?? '' });
  return ok(res, lead, 201);
}));

/**
 * Convert a lead into a customer: links an existing customer (customerId) or creates one from the
 * lead's contact details (refusing a duplicate unless allowDuplicate). Open deals of the lead get
 * the customer too. All in one transaction.
 */
router.post('/leads/:id/convert', asyncHandler(async (req, res) => {
  const { row: lead, businessId } = await findFor(req, 'lead', req.params.id, 'write');
  if (lead.status === 'WON' || lead.convertedAt) throw new AppError('This lead is already converted', 409);
  if (lead.status === 'LOST') throw new AppError('A lost lead cannot be converted; reopen it first', 409);
  const i = Input.of(req);
  let customerId = i.id('customerId') ?? lead.customerId ?? undefined;
  await assertInBusiness('cRMCustomer', customerId, businessId, 'customerId');
  const name = i.str('name', { max: 200 }) ?? lead.contactName ?? lead.title;
  const phone = i.phone('phone') ?? lead.contactPhone;
  const email = i.email('email') ?? lead.contactEmail;
  let created = false;
  if (!customerId) {
    const dup = await findDuplicate(businessId, phone, email);
    if (dup && i.bool('allowDuplicate') !== true) {
      return res.status(409).json({ success: false, statusCode: 409, timestamp: new Date().toISOString(), message: `A customer with this phone or email already exists: ${dup.name}. Pass customerId to link it.`, data: { duplicate: dup } });
    }
  }
  const result = await prisma.$transaction(async (tx) => {
    if (!customerId) {
      const c = await tx.cRMCustomer.create({
        data: { businessId, name, phone, email, status: 'ACTIVE', tags: [], accountManagerId: lead.assignedToId, notes: lead.notes ?? undefined },
      });
      customerId = c.id;
      created = true;
    } else {
      await tx.cRMCustomer.update({ where: { id: customerId }, data: { status: 'ACTIVE' } });
    }
    const updated = await tx.lead.update({ where: { id: lead.id }, data: { status: 'WON', convertedAt: new Date(), customerId } });
    await tx.deal.updateMany({ where: { leadId: lead.id, customerId: null }, data: { customerId } });
    return updated;
  });
  await audit(req, { action: 'lead.convert', entityType: 'Lead', entityId: lead.id, businessId, metadata: { customerId, createdCustomer: created } });
  if (created) await emitEvent(businessId, 'CUSTOMER_CREATED', `customer:${customerId}`, { customerId, name, phone: phone ?? '' });
  return ok(res, { lead: result, customerId, createdCustomer: created });
}));

router.post('/leads/:id/lose', asyncHandler(async (req, res) => {
  const { row: lead, businessId } = await findFor(req, 'lead', req.params.id, 'write');
  if (lead.status === 'WON') throw new AppError('A converted lead cannot be marked lost', 409);
  const reason = Input.of(req).str('reason', { max: 1000 });
  const updated = await prisma.lead.update({ where: { id: lead.id }, data: { status: 'LOST', lostReason: reason } });
  await audit(req, { action: 'lead.lose', entityType: 'Lead', entityId: lead.id, businessId, metadata: { reason } });
  return ok(res, updated);
}));

router.post('/leads/:id/reopen', asyncHandler(async (req, res) => {
  const { row: lead } = await findFor(req, 'lead', req.params.id, 'write');
  if (lead.status !== 'LOST') throw new AppError('Only lost leads can be reopened', 409);
  return ok(res, await prisma.lead.update({ where: { id: lead.id }, data: { status: 'CONTACTED', lostReason: null } }));
}));

// ---------------------------------------------------------------- pipeline & deals

const DEFAULT_STAGES = [
  { name: 'New', probability: 10 },
  { name: 'Contacted', probability: 20 },
  { name: 'Qualified', probability: 40 },
  { name: 'Proposal Sent', probability: 60 },
  { name: 'Negotiation', probability: 80 },
  { name: 'Won', probability: 100, isWon: true },
  { name: 'Lost', probability: 0, isLost: true },
];

/** Creates the default sales pipeline for a business if it has none. */
router.post('/pipelines/default', asyncHandler(async (req, res) => {
  const { businessId } = await forBusiness(req, Input.of(req).raw('businessId'), 'pipeline', 'create');
  const existing = await prisma.pipeline.findFirst({ where: { businessId, isDefault: true }, include: { stages: { orderBy: { sortOrder: 'asc' } } } });
  if (existing) return ok(res, existing);
  const pipeline = await prisma.pipeline.create({
    data: { businessId, name: 'Sales', isDefault: true, stages: { create: DEFAULT_STAGES.map((s, n) => ({ ...s, sortOrder: n })) } },
    include: { stages: { orderBy: { sortOrder: 'asc' } } },
  });
  return ok(res, pipeline, 201);
}));

/** Kanban board: stages with their open deals and totals. */
router.get('/pipelines/:id/board', asyncHandler(async (req, res) => {
  const { row } = await findFor(req, 'pipeline', req.params.id);
  const stages = await prisma.pipelineStage.findMany({
    where: { pipelineId: row.id },
    orderBy: { sortOrder: 'asc' },
    include: {
      deals: {
        orderBy: { updatedAt: 'desc' },
        include: { customer: { select: { id: true, name: true } }, owner: { select: { id: true, firstName: true, lastName: true } } },
      },
    },
  });
  const columns = stages.map((s) => {
    const total = s.deals.reduce((a, d) => a.add(d.value), dec(0));
    return { ...s, dealCount: s.deals.length, totalValue: money(total), weightedValue: money(total.mul(s.probability).div(100)) };
  });
  const open = columns.filter((c) => !c.isWon && !c.isLost);
  return ok(res, {
    pipeline: row,
    columns,
    totals: {
      openValue: money(open.reduce((a, c) => a + c.totalValue, 0)),
      weightedValue: money(open.reduce((a, c) => a + c.weightedValue, 0)),
      openDeals: open.reduce((a, c) => a + c.dealCount, 0),
    },
  });
}));

/** POST /deals — a deal starts in a stage of one of the business's pipelines. */
router.post('/deals', asyncHandler(async (req, res) => {
  const i = Input.of(req);
  const { businessId } = await forBusiness(req, i.raw('businessId'), 'deal', 'create');
  const stageId = i.reqId('stageId');
  const stage = await prisma.pipelineStage.findFirst({ where: { id: stageId, pipeline: { businessId } }, include: { pipeline: true } });
  if (!stage) throw new AppError('stageId was not found in this business', 404);
  const customerId = i.id('customerId');
  const leadId = i.id('leadId');
  const ownerId = i.id('ownerId') ?? userId(req);
  await assertInBusiness('cRMCustomer', customerId, businessId, 'customerId');
  await assertInBusiness('lead', leadId, businessId, 'leadId');
  await assertMember(ownerId, businessId, 'ownerId');
  const status = stage.isWon ? 'WON' : stage.isLost ? 'LOST' : 'OPEN';
  const deal = await prisma.$transaction(async (tx) => {
    const d = await tx.deal.create({
      data: {
        businessId,
        pipelineId: stage.pipelineId,
        stageId,
        customerId,
        leadId,
        ownerId,
        createdById: userId(req),
        title: i.reqStr('title', 200),
        value: i.money('value', { allowZero: true }) ?? 0,
        currency: i.str('currency', { max: 3 }) ?? 'USD',
        expectedCloseDate: i.date('expectedCloseDate'),
        notes: i.str('notes', { max: 5000 }),
        status,
        closedAt: status === 'OPEN' ? null : new Date(),
      },
    });
    await tx.dealStageChange.create({ data: { dealId: d.id, toStageId: stageId, changedById: userId(req), note: 'Created' } });
    return d;
  });
  if (ownerId !== userId(req)) await notifyUsers([ownerId], { title: 'Deal assigned to you', message: deal.title, actionUrl: `/dashboard/crm/deals/${deal.id}` });
  return ok(res, deal, 201);
}));

/** Move a deal to another stage of its pipeline; Won/Lost stages close it. History is kept. */
router.post('/deals/:id/move', asyncHandler(async (req, res) => {
  const { row: deal, businessId } = await findFor(req, 'deal', req.params.id, 'write');
  const i = Input.of(req);
  const stageId = i.reqId('stageId');
  const stage = await prisma.pipelineStage.findFirst({ where: { id: stageId, pipelineId: deal.pipelineId } });
  if (!stage) throw new AppError('stageId is not a stage of this deal’s pipeline', 400);
  if (stage.id === deal.stageId) return ok(res, deal);
  const status = stage.isWon ? 'WON' : stage.isLost ? 'LOST' : 'OPEN';
  const lostReason = status === 'LOST' ? i.str('lostReason', { max: 1000 }) ?? null : null;
  const updated = await prisma.$transaction(async (tx) => {
    // Only move if nobody moved it meanwhile (no lost updates on a busy board).
    const r = await tx.deal.updateMany({
      where: { id: deal.id, stageId: deal.stageId },
      data: { stageId, status, closedAt: status === 'OPEN' ? null : new Date(), lostReason },
    });
    if (!r.count) throw new AppError('This deal was moved by someone else; reload the board', 409);
    await tx.dealStageChange.create({ data: { dealId: deal.id, fromStageId: deal.stageId, toStageId: stageId, changedById: userId(req), note: i.str('note', { max: 1000 }) } });
    if (status === 'WON' && deal.leadId) await tx.lead.updateMany({ where: { id: deal.leadId, status: { notIn: ['WON', 'LOST'] } }, data: { status: 'NEGOTIATION' } });
    return tx.deal.findUniqueOrThrow({ where: { id: deal.id } });
  });
  if (status !== 'OPEN') await audit(req, { action: `deal.${status.toLowerCase()}`, entityType: 'Deal', entityId: deal.id, businessId, metadata: { value: String(deal.value), lostReason } });
  return ok(res, updated);
}));

router.get('/deals/:id/history', asyncHandler(async (req, res) => {
  const { row } = await findFor(req, 'deal', req.params.id);
  const history = await prisma.dealStageChange.findMany({
    where: { dealId: row.id },
    orderBy: { createdAt: 'asc' },
    include: { fromStage: { select: { name: true } }, toStage: { select: { name: true } }, changedBy: { select: { firstName: true, lastName: true } } },
  });
  return ok(res, history);
}));

// ---------------------------------------------------------------- tasks / follow-ups

router.post('/crm-tasks/:id/complete', asyncHandler(async (req, res) => {
  const { row } = await findFor(req, 'crmTask', req.params.id, 'write');
  if (row.status === 'COMPLETED') return ok(res, row);
  return ok(res, await prisma.crmTask.update({ where: { id: row.id }, data: { status: 'COMPLETED', completedAt: new Date() } }));
}));

router.post('/crm-tasks/:id/reopen', asyncHandler(async (req, res) => {
  const { row } = await findFor(req, 'crmTask', req.params.id, 'write');
  return ok(res, await prisma.crmTask.update({ where: { id: row.id }, data: { status: 'TODO', completedAt: null, remindedAt: null } }));
}));

// ---------------------------------------------------------------- CRM dashboard

router.get('/crm/summary', asyncHandler(async (req, res) => {
  const { access, businessId } = await forBusiness(req, req.query.businessId, 'cRMCustomer', 'read');
  const { from, to, label } = rangeOf(req);
  const inRange = { gte: from, lte: to };
  const soon = new Date(Date.now() + 14 * 86_400_000);
  const finance = canRead(access, businessId, 'payment');
  const [
    totalCustomers, newCustomers, newLeads, convertedLeads, leadsInRange, openDeals, wonDeals, lostDeals,
    activeSubs, upcomingRenewals, tasks, recentComms, invoices, stageRows, repRows,
  ] = await Promise.all([
    prisma.cRMCustomer.count({ where: { businessId, archivedAt: null } }),
    prisma.cRMCustomer.count({ where: { businessId, createdAt: inRange } }),
    prisma.lead.count({ where: { businessId, createdAt: inRange } }),
    prisma.lead.count({ where: { businessId, convertedAt: inRange } }),
    prisma.lead.count({ where: { businessId, createdAt: inRange, status: { in: ['WON', 'LOST'] } } }),
    prisma.deal.aggregate({ where: { businessId, status: 'OPEN' }, _sum: { value: true }, _count: true }),
    prisma.deal.aggregate({ where: { businessId, status: 'WON', closedAt: inRange }, _sum: { value: true }, _count: true }),
    prisma.deal.count({ where: { businessId, status: 'LOST', closedAt: inRange } }),
    prisma.clientSubscription.aggregate({ where: { businessId, status: 'ACTIVE' }, _count: true, _sum: { price: true } }),
    prisma.clientSubscription.findMany({
      where: { businessId, status: 'ACTIVE', renewalDate: { lte: soon } },
      orderBy: { renewalDate: 'asc' },
      take: 20,
      include: { customer: { select: { id: true, name: true } }, package: { select: { name: true, billing: true } } },
    }),
    prisma.crmTask.findMany({
      where: { businessId, status: { in: ['TODO', 'IN_PROGRESS'] } },
      orderBy: [{ dueAt: 'asc' }],
      take: 20,
      include: { assignedTo: { select: { id: true, firstName: true, lastName: true } }, customer: { select: { id: true, name: true } } },
    }),
    prisma.clientCommunication.findMany({ where: { businessId }, orderBy: { occurredAt: 'desc' }, take: 10, include: { customer: { select: { id: true, name: true } } } }),
    finance ? prisma.invoice.findMany({ where: { businessId, status: { in: ['SENT', 'PARTIALLY_PAID', 'OVERDUE'] } }, select: { total: true, amountPaid: true, status: true } }) : Promise.resolve(null),
    prisma.deal.groupBy({ by: ['stageId'], where: { businessId, status: 'OPEN' }, _sum: { value: true }, _count: true }),
    prisma.deal.groupBy({ by: ['ownerId'], where: { businessId, status: 'WON', closedAt: inRange }, _sum: { value: true }, _count: true }),
  ]);
  const stages = await prisma.pipelineStage.findMany({ where: { id: { in: stageRows.map((s) => s.stageId) } }, select: { id: true, name: true, probability: true } });
  const owners = await prisma.user.findMany({ where: { id: { in: repRows.map((r) => r.ownerId).filter(Boolean) as string[] } }, select: { id: true, firstName: true, lastName: true } });
  const outstanding = invoices?.reduce((a, inv) => a.add(dec(inv.total).sub(inv.amountPaid)), dec(0));
  const decided = wonDeals._count + lostDeals;
  // MRR estimate from active subscriptions (yearly/quarterly normalised to a month).
  const subs = await prisma.clientSubscription.findMany({ where: { businessId, status: 'ACTIVE' }, select: { price: true, package: { select: { billing: true } } } });
  const monthly = subs.reduce((a, s) => {
    const p = Number(s.price);
    return a + (s.package.billing === 'MONTHLY' ? p : s.package.billing === 'QUARTERLY' ? p / 3 : s.package.billing === 'YEARLY' ? p / 12 : 0);
  }, 0);
  return ok(res, {
    period: { from, to, label },
    totalCustomers,
    newCustomers,
    newLeads,
    convertedLeads,
    leadConversionRate: leadsInRange ? Math.round((convertedLeads / leadsInRange) * 1000) / 10 : null,
    activeDeals: openDeals._count,
    pipelineValue: money(openDeals._sum.value),
    pipelineByStage: stageRows.map((s) => ({ stage: stages.find((x) => x.id === s.stageId)?.name, deals: s._count, value: money(s._sum.value) })),
    wonDeals: wonDeals._count,
    wonValue: money(wonDeals._sum.value),
    lostDeals,
    winRate: decided ? Math.round((wonDeals._count / decided) * 1000) / 10 : null,
    activeSubscriptions: activeSubs._count,
    monthlyRecurringRevenue: Math.round(monthly * 100) / 100,
    upcomingRenewals,
    outstandingPayments: outstanding ? money(outstanding) : null,
    financeHidden: !finance,
    upcomingTasks: tasks,
    overdueTasks: tasks.filter((t) => t.dueAt && t.dueAt < new Date()).length,
    recentActivities: recentComms,
    salesPerformance: repRows.map((r) => {
      const u = owners.find((o) => o.id === r.ownerId);
      return { userId: r.ownerId, name: u ? [u.firstName, u.lastName].filter(Boolean).join(' ') : 'Unassigned', wonDeals: r._count, wonValue: money(r._sum.value) };
    }),
  });
}));

export default router;
