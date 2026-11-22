import { Router, Request, Response } from 'express';
import { param, validationResult } from 'express-validator';
import { prisma } from './prisma';
import { authenticate, requireRole, AuthenticatedRequest } from './middleware/auth';
import { AppError, asyncHandler } from './middleware/error';
import { audit } from './lib/audit';

/**
 * User administration: SUPER_ADMIN only. (Any signed-in user could otherwise list password
 * hashes, promote themselves to SUPER_ADMIN, or change another user's email.)
 * Password hashes are never returned, and credentials/identity links can't be set through here.
 */
const router = Router();
router.use(authenticate, requireRole('SUPER_ADMIN'));

const OMIT = { passwordHash: true } as const;
const PROTECTED_FIELDS = ['id', 'passwordHash', 'supabaseId', 'createdAt', 'updatedAt', 'status'];
const SEARCHABLE = ['firstName', 'lastName', 'email', 'phone'];

function cleanBody(body: unknown): Record<string, unknown> {
  const data = { ...((body ?? {}) as Record<string, unknown>) };
  for (const key of PROTECTED_FIELDS) delete data[key];
  return data;
}

const ok = (res: Response, data: unknown, status = 200, extra: Record<string, unknown> = {}) =>
  res.status(status).json({ success: true, statusCode: status, timestamp: new Date().toISOString(), data, ...extra });

function invalid(req: Request, res: Response): boolean {
  const errors = validationResult(req);
  if (errors.isEmpty()) return false;
  res.status(400).json({ success: false, statusCode: 400, errors: errors.array() });
  return true;
}

function where(query: Record<string, unknown>) {
  const q = typeof query.q === 'string' ? query.q.trim() : '';
  return q ? { OR: SEARCHABLE.map((f) => ({ [f]: { contains: q, mode: 'insensitive' as const } })) } : {};
}

// List
router.get('/', asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(String(req.query.page ?? '1'), 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(String(req.query.limit ?? req.query.take ?? '20'), 10) || 20, 1), 100);
  const filter = where(req.query as Record<string, unknown>);
  const [data, total] = await Promise.all([
    prisma.user.findMany({ where: filter, omit: OMIT, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
    prisma.user.count({ where: filter }),
  ]);
  return ok(res, data, 200, { meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
}));

// Count
router.get('/count', asyncHandler(async (req, res) => {
  return ok(res, { count: await prisma.user.count({ where: where(req.query as Record<string, unknown>) }) });
}));

// Change status: suspend / reactivate (audited; admins can't lock themselves out)
const USER_STATUSES = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'];
router.patch('/:id/status', param('id').isUUID(), asyncHandler(async (req, res) => {
  if (invalid(req, res)) return;
  const id = String(req.params.id);
  const status = String((req.body ?? {}).status ?? '');
  if (!USER_STATUSES.includes(status)) throw new AppError(`status must be one of ${USER_STATUSES.join(', ')}`, 400);
  if (id === (req as AuthenticatedRequest).user!.id) throw new AppError("You can't change your own status", 400);
  const before = await prisma.user.findUnique({ where: { id }, select: { status: true } });
  if (!before) throw new AppError('User not found', 404);
  const user = await prisma.user.update({ where: { id }, data: { status: status as any }, omit: OMIT });
  await audit(req, { action: 'user.status', entityType: 'User', entityId: id, metadata: { from: before.status, to: status } });
  return ok(res, user);
}));

// Get one
router.get('/:id', param('id').isUUID(), asyncHandler(async (req, res) => {
  if (invalid(req, res)) return;
  const user = await prisma.user.findUnique({ where: { id: String(req.params.id) }, omit: OMIT });
  if (!user) throw new AppError('User not found', 404);
  return ok(res, user);
}));

// Create (no password: the person sets one through Supabase sign-up / password reset)
router.post('/', asyncHandler(async (req, res) => {
  const user = await prisma.user.create({ data: cleanBody(req.body) as any, omit: OMIT });
  return ok(res, user, 201);
}));

// Update
router.put('/:id', param('id').isUUID(), asyncHandler(async (req, res) => {
  if (invalid(req, res)) return;
  const id = String(req.params.id);
  if (!(await prisma.user.findUnique({ where: { id }, select: { id: true } }))) throw new AppError('User not found', 404);
  const user = await prisma.user.update({ where: { id }, data: cleanBody(req.body) as any, omit: OMIT });
  return ok(res, user);
}));

// Delete
router.delete('/:id', param('id').isUUID(), asyncHandler(async (req, res) => {
  if (invalid(req, res)) return;
  const id = String(req.params.id);
  if (!(await prisma.user.findUnique({ where: { id }, select: { id: true } }))) throw new AppError('User not found', 404);
  await prisma.user.delete({ where: { id } });
  return res.json({ success: true, statusCode: 200, timestamp: new Date().toISOString(), message: 'user deleted' });
}));

export default router;
