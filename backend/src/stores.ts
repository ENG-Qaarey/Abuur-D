import { Router } from 'express';
import { prisma } from './prisma';
import { authenticate } from './middleware/auth';
import { asyncHandler } from './middleware/error';
import { createCrudRouter } from './lib/crud';

/**
 * Stores. Public directory of live stores; everything else is scoped to the business's team
 * (see src/access/policy.ts: managers create/edit, the owner deletes, only ABUUR suspends).
 */
const router = Router();
const crud = createCrudRouter({ model: 'store', searchableFields: ['name', 'slug', 'description', 'city'] });

/** GET /stores/public: live stores of approved businesses (no sign-in). */
router.get('/public', asyncHandler(async (req, res) => {
  const take = Math.min(Math.max(parseInt(String(req.query.take ?? '60'), 10) || 60, 1), 100);
  const stores = await prisma.store.findMany({
    where: { status: 'ACTIVE', business: { status: 'ACTIVE' } },
    orderBy: { createdAt: 'desc' },
    take,
    select: {
      id: true, name: true, slug: true, description: true, logoUrl: true, city: true,
      business: { select: { industry: true } },
      _count: { select: { products: { where: { status: 'ACTIVE' } } } },
    },
  });
  res.set('Cache-Control', 'public, max-age=60');
  return res.json({
    success: true,
    statusCode: 200,
    timestamp: new Date().toISOString(),
    data: stores.map(({ business, _count, ...s }) => ({ ...s, industry: business.industry, productCount: _count.products })),
  });
}));

/** GET /stores/public/slug/:slug: single live store by slug (no sign-in). */
router.get('/public/slug/:slug', asyncHandler(async (req, res) => {
  const slug = String(req.params.slug);
  const store = await prisma.store.findFirst({
    where: { slug, status: 'ACTIVE', business: { status: 'ACTIVE' } },
    select: {
      id: true, name: true, slug: true, description: true, logoUrl: true, city: true,
      whatsappNumber: true, phone: true, address: true, status: true, currency: true,
      business: { select: { industry: true } },
      _count: { select: { products: { where: { status: 'ACTIVE' } } } },
    },
  });
  if (!store) {
    return res.status(404).json({
      success: false,
      statusCode: 404,
      timestamp: new Date().toISOString(),
      message: 'Store not found',
    });
  }
  const data = {
    id: store.id,
    name: store.name,
    slug: store.slug,
    description: store.description,
    logoUrl: store.logoUrl,
    city: store.city,
    whatsappNumber: store.whatsappNumber,
    phone: store.phone,
    address: store.address,
    status: store.status,
    currency: store.currency,
    industry: store.business.industry,
    productCount: store._count.products,
  };
  return res.json({
    success: true,
    statusCode: 200,
    timestamp: new Date().toISOString(),
    data,
  });
}));

router.get('/', authenticate, asyncHandler(crud.list));
router.get('/count', authenticate, asyncHandler(crud.count));
router.get('/:id', authenticate, asyncHandler(crud.getOne));
router.post('/', authenticate, asyncHandler(crud.create));
router.put('/:id', authenticate, asyncHandler(crud.update));
router.patch('/:id', authenticate, asyncHandler(crud.update));
router.patch('/:id', authenticate, asyncHandler(crud.update));
router.delete('/:id', authenticate, asyncHandler(crud.remove));

export default router;
