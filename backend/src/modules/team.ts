import { Router } from 'express';
import { prisma } from '../prisma';
import { authedRouter } from '../lib/router';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { AppError, asyncHandler } from '../middleware/error';
import { ok, Input, userId, isUuid } from '../lib/http';
import { accessOf, roleIn } from '../access/scope';
import { parsePermissions, MODULES, ACTIONS, ROLE_PERMISSIONS } from '../access/policy';
import { audit } from '../lib/audit';
import { sha256, randomToken } from '../lib/crypto';
import { notifyUsers } from '../lib/notify';
import { rateLimit } from '../middleware/rate-limit';

/**
 * Team & permissions: custom roles with module/action permissions, and invitations for people
 * who may not have an ABUUR account yet. Only the business OWNER and ADMINs manage these.
 */
const router = authedRouter();

const ROLES = ['ADMIN', 'MANAGER', 'EMPLOYEE', 'VIEWER', 'ACCOUNTANT', 'SALES_REP'] as const;

async function asTeamAdmin(req: any, businessId: unknown) {
  if (!isUuid(businessId)) throw new AppError('Business not found', 404);
  const access = await accessOf(req);
  if (access.isAdmin) return { access, role: 'OWNER' as const };
  const role = roleIn(access, businessId);
  if (!role) throw new AppError('Business not found', 404);
  if (role !== 'OWNER' && role !== 'ADMIN') throw new AppError('Only the owner or an admin can manage the team', 403);
  return { access, role };
}

/** What can be granted: modules, actions and the built-in role defaults. */
router.get('/permissions/catalog', (_req, res) => ok(res, { modules: MODULES, actions: ACTIONS, builtInRoles: ROLE_PERMISSIONS }));

// ---------------------------------------------------------------- custom roles

router.get('/businesses/:businessId/roles', asyncHandler(async (req, res) => {
  await asTeamAdmin(req, req.params.businessId);
  const roles = await prisma.businessRole.findMany({
    where: { businessId: String(req.params.businessId) },
    orderBy: { name: 'asc' },
    include: { _count: { select: { memberships: true } } },
  });
  return ok(res, roles);
}));

router.post('/businesses/:businessId/roles', asyncHandler(async (req, res) => {
  await asTeamAdmin(req, req.params.businessId);
  const i = Input.of(req);
  let permissions;
  try {
    permissions = parsePermissions(i.raw('permissions'));
  } catch (e) {
    throw new AppError((e as Error).message, 400);
  }
  const role = await prisma.businessRole.create({
    data: { businessId: String(req.params.businessId), name: i.reqStr('name', 60), description: i.str('description', { max: 500 }), permissions },
  });
  await audit(req, { action: 'role.create', entityType: 'BusinessRole', entityId: role.id, businessId: role.businessId, metadata: { permissions } });
  return ok(res, role, 201);
}));

router.patch('/businesses/:businessId/roles/:roleId', asyncHandler(async (req, res) => {
  await asTeamAdmin(req, req.params.businessId);
  const role = await prisma.businessRole.findFirst({ where: { id: String(req.params.roleId), businessId: String(req.params.businessId) } });
  if (!role) throw new AppError('Role not found', 404);
  const i = Input.of(req);
  let permissions;
  if (i.has('permissions')) {
    try {
      permissions = parsePermissions(i.raw('permissions'));
    } catch (e) {
      throw new AppError((e as Error).message, 400);
    }
  }
  const updated = await prisma.businessRole.update({
    where: { id: role.id },
    data: { name: i.str('name', { max: 60 }), description: i.str('description', { max: 500 }), ...(permissions ? { permissions } : {}) },
  });
  await audit(req, { action: 'role.update', entityType: 'BusinessRole', entityId: role.id, businessId: role.businessId, metadata: { before: role.permissions, after: updated.permissions } });
  return ok(res, updated);
}));

router.delete('/businesses/:businessId/roles/:roleId', asyncHandler(async (req, res) => {
  await asTeamAdmin(req, req.params.businessId);
  const role = await prisma.businessRole.findFirst({ where: { id: String(req.params.roleId), businessId: String(req.params.businessId) } });
  if (!role) throw new AppError('Role not found', 404);
  await prisma.businessRole.delete({ where: { id: role.id } }); // memberships fall back to their built-in role
  await audit(req, { action: 'role.delete', entityType: 'BusinessRole', entityId: role.id, businessId: role.businessId, metadata: { name: role.name } });
  return ok(res, { deleted: true });
}));

/** Give a member a custom role (or null to go back to the built-in role's defaults). */
router.patch('/businesses/:businessId/members/:membershipId/custom-role', asyncHandler(async (req, res) => {
  const { access } = await asTeamAdmin(req, req.params.businessId);
  const businessId = String(req.params.businessId);
  const m = await prisma.businessMembership.findFirst({ where: { id: String(req.params.membershipId), businessId } });
  if (!m) throw new AppError('Member not found', 404);
  if (m.role === 'OWNER') throw new AppError('Owners always have full access', 409);
  if (m.userId === access.userId) throw new AppError('You cannot change your own permissions', 403);
  const customRoleId = Input.of(req).id('customRoleId') ?? null;
  if (customRoleId) {
    const exists = await prisma.businessRole.count({ where: { id: customRoleId, businessId } });
    if (!exists) throw new AppError('customRoleId was not found in this business', 404);
  }
  const updated = await prisma.businessMembership.update({ where: { id: m.id }, data: { customRoleId } });
  await audit(req, { action: 'membership.custom_role', entityType: 'BusinessMembership', entityId: m.id, businessId, metadata: { from: m.customRoleId, to: customRoleId } });
  return ok(res, updated);
}));

/** Membership & permission change history. */
router.get('/businesses/:businessId/team-history', asyncHandler(async (req, res) => {
  await asTeamAdmin(req, req.params.businessId);
  const logs = await prisma.auditLog.findMany({
    where: { businessId: String(req.params.businessId), OR: [{ entityType: { in: ['BusinessMembership', 'BusinessRole', 'BusinessInvitation'] } }, { action: { startsWith: 'membership.' } }] },
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: { user: { select: { firstName: true, lastName: true, email: true } } },
  });
  return ok(res, logs);
}));

// ---------------------------------------------------------------- invitations

const siteUrl = () => (process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001').replace(/\/$/, '');

router.get('/businesses/:businessId/invitations', asyncHandler(async (req, res) => {
  await asTeamAdmin(req, req.params.businessId);
  const rows = await prisma.businessInvitation.findMany({
    where: { businessId: String(req.params.businessId) },
    orderBy: { createdAt: 'desc' },
    omit: { tokenHash: true },
    include: { invitedBy: { select: { firstName: true, lastName: true } }, customRole: { select: { name: true } } },
  });
  return ok(res, rows);
}));

/**
 * Invite by email. The link (with a one-time token) is returned once so the owner can share it
 * (WhatsApp, email) — ABUUR has no email sender configured yet.
 */
router.post('/businesses/:businessId/invitations', rateLimit({ windowMs: 60_000, max: 30 }), asyncHandler(async (req, res) => {
  const { role: myRole } = await asTeamAdmin(req, req.params.businessId);
  const businessId = String(req.params.businessId);
  const i = Input.of(req);
  const email = i.email('email', true)!;
  const role = i.oneOf('role', ROLES) ?? 'EMPLOYEE';
  if (role === 'ADMIN' && myRole !== 'OWNER') throw new AppError('Only the owner can invite admins', 403);
  const customRoleId = i.id('customRoleId');
  if (customRoleId && !(await prisma.businessRole.count({ where: { id: customRoleId, businessId } }))) throw new AppError('customRoleId was not found in this business', 404);
  const existing = await prisma.businessMembership.findFirst({ where: { businessId, status: 'ACTIVE', user: { email: { equals: email, mode: 'insensitive' } } } });
  if (existing) throw new AppError('This person is already a member', 409);
  await prisma.businessInvitation.updateMany({ where: { businessId, email, status: 'PENDING' }, data: { status: 'REVOKED' } });
  const token = randomToken();
  const inv = await prisma.businessInvitation.create({
    data: { businessId, email, role, customRoleId, tokenHash: sha256(token), expiresAt: new Date(Date.now() + 7 * 86_400_000), invitedById: userId(req) },
    omit: { tokenHash: true },
  });
  await audit(req, { action: 'invitation.create', entityType: 'BusinessInvitation', entityId: inv.id, businessId, metadata: { email, role } });
  // If the person already has an account, tell them in the app too.
  const invitee = await prisma.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' } }, select: { id: true } });
  const business = await prisma.business.findUnique({ where: { id: businessId }, select: { name: true } });
  if (invitee) await notifyUsers([invitee.id], { title: `Invitation to join ${business?.name}`, message: `You were invited as ${role.toLowerCase()}.`, actionUrl: `/invite/${token}` });
  return ok(res, { invitation: inv, inviteUrl: `${siteUrl()}/invite/${token}`, token }, 201);
}));

router.post('/businesses/:businessId/invitations/:id/revoke', asyncHandler(async (req, res) => {
  await asTeamAdmin(req, req.params.businessId);
  const r = await prisma.businessInvitation.updateMany({ where: { id: String(req.params.id), businessId: String(req.params.businessId), status: 'PENDING' }, data: { status: 'REVOKED' } });
  if (!r.count) throw new AppError('No pending invitation with this id', 404);
  await audit(req, { action: 'invitation.revoke', entityType: 'BusinessInvitation', entityId: String(req.params.id), businessId: String(req.params.businessId) });
  return ok(res, { revoked: true });
}));

/** Preview an invitation (signed-in user, before accepting). */
router.get('/invitations/:token', asyncHandler(async (req, res) => {
  const inv = await prisma.businessInvitation.findUnique({ where: { tokenHash: sha256(String(req.params.token)) }, include: { business: { select: { name: true, logoUrl: true } } } });
  if (!inv || inv.status !== 'PENDING' || inv.expiresAt < new Date()) throw new AppError('This invitation is invalid or has expired', 404);
  return ok(res, { business: inv.business, role: inv.role, email: inv.email, expiresAt: inv.expiresAt });
}));

/** Accept: the signed-in user's email must match the invited email. */
router.post('/invitations/:token/accept', rateLimit({ windowMs: 60_000, max: 20 }), asyncHandler(async (req, res) => {
  const me = (req as AuthenticatedRequest).user!;
  const inv = await prisma.businessInvitation.findUnique({ where: { tokenHash: sha256(String(req.params.token)) } });
  if (!inv || inv.status !== 'PENDING') throw new AppError('This invitation is invalid or was already used', 404);
  if (inv.expiresAt < new Date()) {
    await prisma.businessInvitation.update({ where: { id: inv.id }, data: { status: 'EXPIRED' } });
    throw new AppError('This invitation has expired; ask for a new one', 410);
  }
  if (!me.email || me.email.toLowerCase() !== inv.email.toLowerCase()) throw new AppError('This invitation was sent to a different email address', 403);
  const membership = await prisma.$transaction(async (tx) => {
    const claimed = await tx.businessInvitation.updateMany({ where: { id: inv.id, status: 'PENDING' }, data: { status: 'ACCEPTED', acceptedAt: new Date(), acceptedById: me.id } });
    if (!claimed.count) throw new AppError('This invitation was already used', 409);
    const existing = await tx.businessMembership.findUnique({ where: { userId_businessId: { userId: me.id, businessId: inv.businessId } } });
    if (existing?.role === 'OWNER') return existing;
    return tx.businessMembership.upsert({
      where: { userId_businessId: { userId: me.id, businessId: inv.businessId } },
      create: { userId: me.id, businessId: inv.businessId, role: inv.role, customRoleId: inv.customRoleId, status: 'ACTIVE', invitedAt: inv.createdAt, joinedAt: new Date() },
      update: { role: inv.role, customRoleId: inv.customRoleId, status: 'ACTIVE', joinedAt: new Date() },
    });
  });
  await audit(req, { action: 'membership.join', entityType: 'BusinessMembership', entityId: membership.id, businessId: inv.businessId, metadata: { invitationId: inv.id, role: membership.role } });
  if (inv.invitedById) await notifyUsers([inv.invitedById], { title: 'Invitation accepted', message: `${me.email} joined your team.` });
  return ok(res, membership);
}));

export default router;
