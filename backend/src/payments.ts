import { Router, Request, Response, NextFunction } from 'express';
import { param, validationResult } from 'express-validator';
import { prisma } from './prisma';
import { authenticate, requireRole } from './middleware/auth';
import { AppError, asyncHandler } from './middleware/error';
import { createCrudRouter } from './lib/crud';
import { accessOf, accessWhere } from './access/scope';

const router = Router();
const crud = createCrudRouter({ model: 'payment', searchableFields: ['status','method','provider','reference'] });
// Business users reach their own rows: src/access/policy.ts scopes every query (SUPER_ADMIN sees all).
router.use(authenticate);

// List
router.get('/', asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(String(req.query.page ?? '1'), 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(String(req.query.limit ?? req.query.take ?? '20'), 10) || 20, 1), 100);
  const status = typeof req.query.status === 'string' ? req.query.status : '';
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  // Only rows of the caller's businesses (all rows for SUPER_ADMIN).
  const scope = accessWhere('payment', await accessOf(req), 'read');
  const where: Record<string, unknown> = scope ? { AND: [scope] } : {};
  if (['PENDING','PAID','FAILED','PARTIALLY_PAID','REFUNDED','CANCELLED'].includes(status)) where.status = status;
  if (q) {
    where.OR = [
      { reference: { contains: q, mode: 'insensitive' } },
      { provider: { contains: q, mode: 'insensitive' } },
      { business: { name: { contains: q, mode: 'insensitive' } } },
    ];
  }
  const [items, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        business: { select: { id: true, name: true, slug: true } },
        invoice: { select: { id: true, invoiceNumber: true, status: true } },
      },
    }),
    prisma.payment.count({ where }),
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
