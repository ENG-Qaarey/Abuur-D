import { Router, Request, Response, NextFunction } from 'express';
import { param, validationResult } from 'express-validator';
import { prisma } from './prisma';
import { authenticate, requireRole } from './middleware/auth';
import { AppError, asyncHandler } from './middleware/error';
import { createCrudRouter } from './lib/crud';
import { accessOf, accessWhere } from './access/scope';

const router = Router();
const crud = createCrudRouter({ model: 'subscription', searchableFields: ['status','externalSubscriptionId'] });
// Business users reach their own rows: src/access/policy.ts scopes every query (SUPER_ADMIN sees all).
router.use(authenticate);

// List
router.get('/', asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(String(req.query.page ?? '1'), 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(String(req.query.limit ?? req.query.take ?? '20'), 10) || 20, 1), 100);
  const status = typeof req.query.status === 'string' ? req.query.status : '';
  const businessId = typeof req.query.businessId === 'string' ? req.query.businessId : '';
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  // Only rows of the caller's businesses (all rows for SUPER_ADMIN).
  const scope = accessWhere('subscription', await accessOf(req), 'read');
  const where: Record<string, unknown> = scope ? { AND: [scope] } : {};
  if (['TRIALING','ACTIVE','PAST_DUE','CANCELLED','EXPIRED','SUSPENDED'].includes(status)) where.status = status;
  if (businessId) where.businessId = businessId;
  if (q) {
    where.OR = [
      { externalSubscriptionId: { contains: q, mode: 'insensitive' } },
      { business: { name: { contains: q, mode: 'insensitive' } } },
      { plan: { name: { contains: q, mode: 'insensitive' } } },
    ];
  }
  const [items, total] = await Promise.all([
    prisma.subscription.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        plan: { select: { id: true, name: true, slug: true, price: true, currency: true, interval: true } },
        business: { select: { id: true, name: true, slug: true, status: true } },
      },
    }),
    prisma.subscription.count({ where }),
  ]);
  res.json({ success: true, statusCode: 200, timestamp: new Date().toISOString(), data: items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
}));
// Count
router.get('/count', asyncHandler(crud.count));
// Get one
router.get('/:id', param('id').notEmpty(), asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, statusCode: 400, errors: errors.array() });
  return crud.getOne(req, res, next);
}));
// Create
router.post('/', asyncHandler(crud.create));
// Update
router.put('/:id', param('id').notEmpty(), asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, statusCode: 400, errors: errors.array() });
  return crud.update(req, res, next);
}));
// Delete
router.delete('/:id', param('id').notEmpty(), asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, statusCode: 400, errors: errors.array() });
  return crud.remove(req, res, next);
}));

export default router;
