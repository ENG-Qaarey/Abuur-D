import { Router, Request, Response } from 'express';
import { prisma } from './prisma';
import { authenticate, requireRole } from './middleware/auth';
import { AppError, asyncHandler } from './middleware/error';
import { accessOf, roleIn } from './access/scope';
import { audit } from './lib/audit';

/**
 * Businesses. Anyone signed in can create one (they become its OWNER; it starts PENDING_APPROVAL
 * until the ABUUR team approves it). Members see their own businesses; OWNER/ADMIN edit the
 * profile; only SUPER_ADMIN changes status, lists all businesses or deletes one.
 */
const router = Router();
router.use(authenticate);

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const BUSINESS_STATUSES = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_APPROVAL'];
const PROFILE_FIELDS = ['name', 'description', 'logoUrl', 'email', 'phone', 'address', 'industry'] as const;

const ok = (res: Response, data: unknown, status = 200) =>
  res.status(status).json({ success: true, statusCode: status, timestamp: new Date().toISOString(), data });

const businessSelect = {
  id: true, name: true, slug: true, description: true, logoUrl: true, phone: true, email: true,
  address: true, industry: true, status: true, createdAt: true, updatedAt: true,
} as const;

function idParam(req: Request): string {
  const id = String(req.params.id);
  if (!UUID.test(id)) throw new AppError('Business not found', 404);
  return id;
}

function str(value: unknown, field: string, max: number): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  if (typeof value !== 'string') throw new AppError(`${field} must be text`, 400);
  const v = value.trim();
  if (v.length > max) throw new AppError(`${field} must be at most ${max} characters`, 400);
  return v || null;
}

function profileData(body: Record<string, unknown>): Record<string, string | null> {
  const limits: Record<(typeof PROFILE_FIELDS)[number], number> = {
    name: 120, description: 2000, logoUrl: 500, email: 254, phone: 40, address: 300, industry: 80,
  };
  const data: Record<string, string | null> = {};
  for (const f of PROFILE_FIELDS) {
    const v = str(body[f], f, limits[f]);
    if (v !== undefined) data[f] = v;
  }
  if ('name' in data && (!data.name || data.name.length < 2)) throw new AppError('name must be at least 2 characters', 400);
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) throw new AppError('email is not valid', 400);
  if (data.logoUrl && !/^https:\/\//.test(data.logoUrl)) throw new AppError('logoUrl must be an https:// link', 400);
  return data;
}

function slugOf(value: unknown): string {
  const slug = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (slug.length < 3 || slug.length > 60 || !SLUG.test(slug)) {
    throw new AppError('slug must be 3-60 lowercase letters, digits or single hyphens', 400);
  }
  return slug;
}

// ---------------------------------------------------------------- my businesses

/** GET /businesses: the caller's businesses with their role in each. */
router.get('/', asyncHandler(async (req, res) => {
  const access = await accessOf(req);
  const memberships = await prisma.businessMembership.findMany({
    where: { userId: access.userId, status: 'ACTIVE' },
    select: { role: true, business: { select: businessSelect } },
    orderBy: { createdAt: 'asc' },
  });
  return ok(res, memberships.map((m) => ({ ...m.business, myRole: m.role })));
}));

router.get('/count', asyncHandler(async (req, res) => {
  const access = await accessOf(req);
  return ok(res, { count: access.memberships.length });
}));

/** POST /businesses: create a business; the caller becomes its OWNER. */
router.post('/', asyncHandler(async (req, res) => {
  const access = await accessOf(req);
  const body = (req.body ?? {}) as Record<string, unknown>;
  const data = profileData(body);
  if (!data.name) throw new AppError('name is required', 400);
  if (!data.industry) throw new AppError('Category is required', 400);
  if (!data.email) throw new AppError('Business email is required', 400);
  if (!data.phone) throw new AppError('Business phone is required', 400);
  if (!data.description) throw new AppError('Description is required', 400);
  if (!data.address) throw new AppError('Address is required', 400);
  if (!['ACTIVE', 'PENDING_APPROVAL'].includes(String(body.status))) {
    throw new AppError('Initial status is required', 400);
  }
  if (access.isAdmin && (!body.planId || typeof body.planId !== 'string' || !UUID.test(body.planId))) {
    throw new AppError('Subscription plan is required', 400);
  }
  const slug = slugOf(body.slug);
  if (await prisma.business.findUnique({ where: { slug } })) throw new AppError('A business with this slug already exists', 409);
  if (access.isAdmin && body.ownerId !== undefined) {
    const ownerId = String(body.ownerId);
    if (!UUID.test(ownerId)) throw new AppError('ownerId must be a valid user ID', 400);
    const owner = await prisma.user.findUnique({ where: { id: ownerId }, select: { id: true, status: true } });
    if (!owner) throw new AppError('Owner user not found', 404);
    if (owner.status === 'SUSPENDED') throw new AppError('Suspended users cannot be assigned as business owners', 400);
  }
  const ownerId = access.isAdmin && typeof body.ownerId === 'string' ? String(body.ownerId) : access.userId;
  const owned = access.memberships.filter((m) => m.role === 'OWNER').length;
  if (!access.isAdmin && owned >= 10) throw new AppError('You can own at most 10 businesses', 400);

  const business = await prisma.business.create({
    data: {
      ...data,
      name: data.name,
      slug,
      status: access.isAdmin && body.status === 'ACTIVE' ? 'ACTIVE' : 'PENDING_APPROVAL',
      memberships: { create: { userId: ownerId, role: 'OWNER', status: 'ACTIVE', joinedAt: new Date() } },
    },
    select: businessSelect,
  });
  if (access.isAdmin && typeof body.planId === 'string' && UUID.test(body.planId)) {
    const plan = await prisma.plan.findUnique({ where: { id: body.planId, isActive: true }, select: { id: true } });
    if (plan) {
      await prisma.subscription.create({
        data: { planId: plan.id, businessId: business.id, status: body.trial === true ? 'TRIALING' : 'ACTIVE' },
      });
    }
  }
  await audit(req, { action: 'business.create', entityType: 'Business', entityId: business.id, businessId: business.id });
  return ok(res, { ...business, myRole: 'OWNER' }, 201);
}));

// ---------------------------------------------------------------- platform admin

/** GET /businesses/admin/list: every business with owners and counts (SUPER_ADMIN). */
router.get('/admin/list', requireRole('SUPER_ADMIN'), asyncHandler(async (req, res) => {
  const take = Math.min(Math.max(parseInt(String(req.query.take ?? '50'), 10) || 50, 1), 200);
  const skip = Math.max(parseInt(String(req.query.skip ?? '0'), 10) || 0, 0);
  const status = String(req.query.status ?? '');
  const q = String(req.query.q ?? '').trim();
  const industry = String(req.query.industry ?? '').trim();
  const from = String(req.query.from ?? '').trim();
  const to = String(req.query.to ?? '').trim();
  const parseDate = (value: string) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };
  const fromDate = parseDate(from);
  const toDate = parseDate(to);
  const where = {
    ...(BUSINESS_STATUSES.includes(status) ? { status: status as any } : {}),
    ...(industry ? { industry } : {}),
    ...((fromDate || toDate) ? { createdAt: { ...(fromDate ? { gte: fromDate } : {}), ...(toDate ? { lte: toDate } : {}) } } : {}),
    ...(q ? {
      OR: [
        { name: { contains: q, mode: 'insensitive' as const } },
        { slug: { contains: q, mode: 'insensitive' as const } },
        { email: { contains: q, mode: 'insensitive' as const } },
        { phone: { contains: q, mode: 'insensitive' as const } },
        {
          memberships: {
            some: {
              role: 'OWNER',
              status: 'ACTIVE',
              user: {
                OR: [
                  { firstName: { contains: q, mode: 'insensitive' as const } },
                  { lastName: { contains: q, mode: 'insensitive' as const } },
                  { email: { contains: q, mode: 'insensitive' as const } },
                  { phone: { contains: q, mode: 'insensitive' as const } },
                ],
              },
            },
          },
        },
      ],
    } : {}),
  };
  const [total, rows] = await Promise.all([
    prisma.business.count({ where: where as any }),
    prisma.business.findMany({
      where: where as any,
      take,
      skip,
      orderBy: { createdAt: 'desc' },
      select: {
        ...businessSelect,
        memberships: {
          where: { role: 'OWNER', status: 'ACTIVE' },
          select: { user: { select: { id: true, email: true, phone: true, firstName: true, lastName: true } } },
        },
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { id: true, status: true, endDate: true, trialEndsAt: true, plan: { select: { id: true, name: true, interval: true, price: true } } },
        },
        _count: { select: { memberships: { where: { status: 'ACTIVE' } }, stores: true } },
      },
    }),
  ]);
  const items = (rows as any[]).map(({ memberships, subscriptions, _count, ...b }) => ({
    ...b,
    owners: (memberships as any[]).map((m: any) => m.user),
    subscription: subscriptions[0] ?? null,
    memberCount: _count.memberships,
    storeCount: _count.stores,
  }));
  return ok(res, { total, items });
}));

/** PATCH /businesses/:id/status: approve, suspend or reactivate (SUPER_ADMIN, audited). */
router.patch('/:id/status', requireRole('SUPER_ADMIN'), asyncHandler(async (req, res) => {
  const id = idParam(req);
  const status = String((req.body ?? {}).status ?? '');
  const reason = typeof (req.body ?? {}).reason === 'string' ? String((req.body as any).reason).trim() : '';
  if (['SUSPENDED', 'INACTIVE'].includes(status) && reason.length < 5) {
    throw new AppError('A reason of at least 5 characters is required', 400);
  }
  if (!BUSINESS_STATUSES.includes(status)) throw new AppError(`status must be one of ${BUSINESS_STATUSES.join(', ')}`, 400);
  const before = await prisma.business.findUnique({ where: { id }, select: { status: true } });
  if (!before) throw new AppError('Business not found', 404);
  const business = await prisma.business.update({ where: { id }, data: { status: status as any }, select: businessSelect });
  await audit(req, { action: 'business.status', entityType: 'Business', entityId: id, businessId: id, metadata: { from: before.status, to: status, reason: reason || null } });
  return ok(res, business);
}));

// ---------------------------------------------------------------- one business

/** GET /businesses/:id/members: the team (members of the business, or SUPER_ADMIN). */
router.get('/:id/members', asyncHandler(async (req, res) => {
  const id = idParam(req);
  const access = await accessOf(req);
  if (!access.isAdmin && !roleIn(access, id)) throw new AppError('Business not found', 404);
  const members = await prisma.businessMembership.findMany({
    where: { businessId: id, status: { in: ['ACTIVE', 'INVITED'] } },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true, role: true, status: true, joinedAt: true, createdAt: true,
      user: { select: { id: true, email: true, firstName: true, lastName: true, avatarUrl: true } },
    },
  });
  return ok(res, members);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const id = idParam(req);
  const access = await accessOf(req);
  const myRole = roleIn(access, id);
  if (!access.isAdmin && !myRole) throw new AppError('Business not found', 404);
  const business = await prisma.business.findUnique({ where: { id }, select: businessSelect });
  if (!business) throw new AppError('Business not found', 404);
  return ok(res, { ...business, myRole });
}));

/** PUT/PATCH /businesses/:id: edit the profile (OWNER/ADMIN; only OWNER changes the store link). */
const update = asyncHandler(async (req: Request, res: Response) => {
  const id = idParam(req);
  const access = await accessOf(req);
  const myRole = roleIn(access, id);
  if (!access.isAdmin && !myRole) throw new AppError('Business not found', 404);
  if (!access.isAdmin && myRole !== 'OWNER' && myRole !== 'ADMIN') throw new AppError('Only the owner or an admin can edit the business', 403);
  const membership = access.memberships.find((m) => m.businessId === id);
  if (!access.isAdmin && membership && !['ACTIVE', 'PENDING_APPROVAL'].includes(membership.businessStatus)) {
    throw new AppError('This business is suspended. Contact the ABUUR team.', 403);
  }
  const body = (req.body ?? {}) as Record<string, unknown>;
  const data: Record<string, unknown> = profileData(body);
  if (body.slug !== undefined) {
    if (!access.isAdmin && myRole !== 'OWNER') throw new AppError('Only the owner can change the store link', 403);
    data.slug = slugOf(body.slug);
  }
  if (body.settings !== undefined) {
    if (body.settings !== null && typeof body.settings !== 'object') throw new AppError('settings must be an object', 400);
    data.settings = body.settings;
  }
  const business = await prisma.business.update({ where: { id }, data, select: businessSelect });
  return ok(res, { ...business, myRole });
});
router.put('/:id', update);
router.patch('/:id', update);

/** DELETE /businesses/:id: SUPER_ADMIN only (removes all of the business's data). */
router.delete('/:id', requireRole('SUPER_ADMIN'), asyncHandler(async (req, res) => {
  const id = idParam(req);
  const existing = await prisma.business.findUnique({ where: { id }, select: { id: true, name: true } });
  if (!existing) throw new AppError('Business not found', 404);
  await prisma.business.delete({ where: { id } });
  await audit(req, { action: 'business.delete', entityType: 'Business', entityId: id, metadata: { name: existing.name } });
  return res.json({ success: true, statusCode: 200, timestamp: new Date().toISOString(), message: 'Business deleted' });
}));

export default router;
