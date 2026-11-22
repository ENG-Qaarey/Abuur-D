import { Router } from 'express';
import { prisma } from './prisma';
import { authenticate, requireRole } from './middleware/auth';
import { asyncHandler } from './middleware/error';
import { createCrudRouter } from './lib/crud';

/** Subscription plans: public price list; managing plans is SUPER_ADMIN only (policy: admin). */
const router = Router();
const crud = createCrudRouter({ model: 'plan', orderBy: { price: 'asc' }, searchableFields: ['name', 'slug', 'description'] });

/** GET /plans/public: active plans for the pricing page (no sign-in). */
router.get('/public', asyncHandler(async (_req, res) => {
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { price: 'asc' },
    select: { id: true, name: true, slug: true, description: true, price: true, currency: true, interval: true, features: true, limits: true },
  });
  res.set('Cache-Control', 'public, max-age=60');
  return res.json({ success: true, statusCode: 200, timestamp: new Date().toISOString(), data: plans });
}));

router.use(authenticate, requireRole('SUPER_ADMIN'));
router.get('/', asyncHandler(crud.list));
router.get('/count', asyncHandler(crud.count));
router.get('/:id', asyncHandler(crud.getOne));
router.post('/', asyncHandler(crud.create));
router.put('/:id', asyncHandler(crud.update));
router.patch('/:id', asyncHandler(crud.update));
router.delete('/:id', asyncHandler(crud.remove));

export default router;
