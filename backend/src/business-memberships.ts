import { Router, Request, Response } from 'express';
import { prisma } from './prisma';
import { authenticate } from './middleware/auth';
import { AppError, asyncHandler } from './middleware/error';
import { accessOf, roleIn, businessIds, Access } from './access/scope';
import { ALL_ROLES, MembershipRole } from './access/policy';
import { audit } from './lib/audit';

/**
 * Business team management.
 *  - Any member can see the team of their businesses.
 *  - OWNER and ADMIN add, change and remove members.
 *  - Only an OWNER can grant or touch OWNER/ADMIN memberships.
 *  - Nobody changes their own role, and a business always keeps at least one active OWNER.
 *  - Anyone may leave a business (delete their own membership) unless they are its last OWNER.
 */
const router = Router();
router.use(authenticate);

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MEMBER_STATUSES = ['ACTIVE', 'INVITED', 'SUSPENDED', 'REMOVED'];
const PRIVILEGED: MembershipRole[] = ['OWNER', 'ADMIN'];

const ok = (res: Response, data: unknown, status = 200, extra: Record<string, unknown> = {}) =>
  res.status(status).json({ success: true, statusCode: status, timestamp: new Date().toISOString(), data, ...extra });

const memberSelect = {
  id: true, businessId: true, role: true, status: true, invitedAt: true, joinedAt: true, createdAt: true, updatedAt: true,
  user: { select: { id: true, email: true, firstName: true, lastName: true, avatarUrl: true } },
} as const;

function parseRole(value: unknown): MembershipRole {
  const role = String(value ?? '');
  if (!ALL_ROLES.includes(role as MembershipRole)) throw new AppError(`role must be one of ${ALL_ROLES.join(', ')}`, 400);
  return role as MembershipRole;
}

/** The caller may manage memberships with `targetRole` in `businessId`. */
function assertCanManage(access: Access, businessId: string, targetRole: MembershipRole) {
  if (access.isAdmin) return;
  const mine = roleIn(access, businessId);
  if (mine !== 'OWNER' && mine !== 'ADMIN') throw new AppError('Only the owner or an admin can manage the team', 403);
  if (PRIVILEGED.includes(targetRole) && mine !== 'OWNER') throw new AppError('Only the owner can manage owners and admins', 403);
  const status = access.memberships.find((m) => m.businessId === businessId)?.businessStatus;
  if (status && !['ACTIVE', 'PENDING_APPROVAL'].includes(status)) throw new AppError('This business is suspended', 403);
}

async function assertKeepsAnOwner(businessId: string, membershipId: string) {
  const owners = await prisma.businessMembership.count({
    where: { businessId, role: 'OWNER', status: 'ACTIVE', id: { not: membershipId } },
  });
  if (!owners) throw new AppError('A business needs at least one active owner', 400);
}

async function loadVisible(req: Request) {
  const id = String(req.params.id);
  if (!UUID.test(id)) throw new AppError('Membership not found', 404);
  const access = await accessOf(req);
  const membership = await prisma.businessMembership.findUnique({ where: { id }, select: { ...memberSelect, userId: true } });
  if (!membership || (!access.isAdmin && !roleIn(access, membership.businessId))) throw new AppError('Membership not found', 404);
  return { access, membership };
}

router.get('/', asyncHandler(async (req, res) => {
  const access = await accessOf(req);
  const businessId = String(req.query.businessId ?? '');
  if (businessId && !UUID.test(businessId)) throw new AppError('businessId is not valid', 400);
  const visible = access.isAdmin ? null : businessIds(access, ALL_ROLES);
  const allowed = businessId ? (visible && !visible.includes(businessId) ? [] : [businessId]) : visible;
  const where = allowed ? { businessId: { in: allowed } } : {};
  const take = Math.min(Math.max(parseInt(String(req.query.limit ?? req.query.take ?? '50'), 10) || 50, 1), 100);
  const [data, total] = await Promise.all([
    prisma.businessMembership.findMany({ where, take, orderBy: { createdAt: 'asc' }, select: memberSelect }),
    prisma.businessMembership.count({ where }),
  ]);
  return ok(res, data, 200, { meta: { page: 1, limit: take, total, totalPages: Math.ceil(total / take) } });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const { membership } = await loadVisible(req);
  const { userId: _userId, ...rest } = membership;
  return ok(res, rest);
}));

/** POST /business-memberships { businessId, email | userId, role }: add an existing ABUUR user. */
router.post('/', asyncHandler(async (req, res) => {
  const access = await accessOf(req);
  const body = (req.body ?? {}) as Record<string, unknown>;
  const businessId = String(body.businessId ?? '');
  if (!UUID.test(businessId)) throw new AppError('businessId is required', 400);
  const role = parseRole(body.role ?? 'EMPLOYEE');
  assertCanManage(access, businessId, role);
  if (!access.isAdmin && !roleIn(access, businessId)) throw new AppError('Business not found', 404);

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const userId = typeof body.userId === 'string' ? body.userId : '';
  const user = email
    ? await prisma.user.findUnique({ where: { email }, select: { id: true, status: true } })
    : UUID.test(userId)
      ? await prisma.user.findUnique({ where: { id: userId }, select: { id: true, status: true } })
      : null;
  if (!user) throw new AppError('No ABUUR account was found for that person. Ask them to sign up first.', 404);
  if (user.status === 'SUSPENDED') throw new AppError('That account is suspended', 400);

  const existing = await prisma.businessMembership.findFirst({ where: { businessId, userId: user.id }, select: { id: true, status: true } });
  if (existing && existing.status !== 'REMOVED') throw new AppError('This person is already on the team', 409);

  const data = { role, status: 'ACTIVE' as const, invitedAt: new Date(), joinedAt: new Date() };
  const membership = existing
    ? await prisma.businessMembership.update({ where: { id: existing.id }, data, select: memberSelect })
    : await prisma.businessMembership.create({ data: { ...data, businessId, userId: user.id }, select: memberSelect });
  await audit(req, { action: 'membership.add', entityType: 'BusinessMembership', entityId: membership.id, businessId, metadata: { role } });
  return ok(res, membership, 201);
}));

/** PUT/PATCH /business-memberships/:id { role?, status? } */
const update = asyncHandler(async (req: Request, res: Response) => {
  const { access, membership } = await loadVisible(req);
  if (!access.isAdmin && membership.userId === access.userId) throw new AppError("You can't change your own role or status", 403);
  const body = (req.body ?? {}) as Record<string, unknown>;
  const role = body.role === undefined ? undefined : parseRole(body.role);
  const status = body.status === undefined ? undefined : String(body.status);
  if (status !== undefined && !MEMBER_STATUSES.includes(status)) throw new AppError(`status must be one of ${MEMBER_STATUSES.join(', ')}`, 400);

  // Must be allowed to manage both the current and the new role.
  assertCanManage(access, membership.businessId, membership.role as MembershipRole);
  if (role) assertCanManage(access, membership.businessId, role);

  const losesOwner = membership.role === 'OWNER' && membership.status === 'ACTIVE' && ((role && role !== 'OWNER') || (status && status !== 'ACTIVE'));
  if (losesOwner) await assertKeepsAnOwner(membership.businessId, membership.id);

  const updated = await prisma.businessMembership.update({
    where: { id: membership.id },
    data: { ...(role ? { role } : {}), ...(status ? { status: status as any } : {}) },
    select: memberSelect,
  });
  await audit(req, {
    action: 'membership.update', entityType: 'BusinessMembership', entityId: membership.id, businessId: membership.businessId,
    metadata: { from: { role: membership.role, status: membership.status }, to: { role: updated.role, status: updated.status } },
  });
  return ok(res, updated);
});
router.put('/:id', update);
router.patch('/:id', update);

router.delete('/:id', asyncHandler(async (req, res) => {
  const { access, membership } = await loadVisible(req);
  const leaving = membership.userId === access.userId;
  if (!leaving) assertCanManage(access, membership.businessId, membership.role as MembershipRole);
  if (membership.role === 'OWNER' && membership.status === 'ACTIVE') await assertKeepsAnOwner(membership.businessId, membership.id);
  await prisma.businessMembership.delete({ where: { id: membership.id } });
  await audit(req, { action: leaving ? 'membership.leave' : 'membership.remove', entityType: 'BusinessMembership', entityId: membership.id, businessId: membership.businessId });
  return res.json({ success: true, statusCode: 200, timestamp: new Date().toISOString(), message: 'Membership removed' });
}));

export default router;
