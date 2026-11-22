import { Router } from 'express';
import dns from 'dns/promises';
import { OrderStatus, Prisma } from '@prisma/client';
import { prisma } from '../prisma';
import { authedRouter } from '../lib/router';
import { authenticate } from '../middleware/auth';
import { AppError, asyncHandler } from '../middleware/error';
import { ok, Input, userId, dec, money, isUuid, pageOf, pageMeta } from '../lib/http';
import { findFor, forBusiness, assertMember } from '../lib/guard';
import { audit } from '../lib/audit';
import { notifyBusiness } from '../lib/notify';
import { emitEvent } from '../services/automation';
import { randomToken } from '../lib/crypto';
import { rateLimit } from '../middleware/rate-limit';
import { accessOf, assertCan } from '../access/scope';

/**
 * Stores & e-commerce. Public storefront (/storefront/...) never returns cost prices, internal
 * notes or other businesses' data. Orders keep payment status separate from fulfillment status;
 * opening WhatsApp never marks an order paid.
 */
const router = authedRouter({ publicPrefixes: ['/storefront/'] });
type Tx = Prisma.TransactionClient;

// ---------------------------------------------------------------- shared order logic

const PUBLIC_PRODUCT = {
  id: true, name: true, slug: true, description: true, price: true, compareAtPrice: true, currency: true,
  images: true, tags: true, productType: true, specifications: true, categoryId: true, stock: true,
  trackInventory: true, allowBackorder: true, status: true,
} satisfies Prisma.ProductSelect;

const inStock = (p: { stock: number; trackInventory: boolean; allowBackorder: boolean }) => !p.trackInventory || p.allowBackorder || p.stock > 0;
const publicProduct = ({ stock, trackInventory, allowBackorder, status, ...p }: any) => ({ ...p, inStock: inStock({ stock, trackInventory, allowBackorder }) });

type ItemIn = { productId: string; variantId?: string; quantity: number };

function parseItems(raw: unknown): ItemIn[] {
  if (!Array.isArray(raw) || !raw.length || raw.length > 100) throw new AppError('items must be a list of 1-100 products', 400);
  const items = raw.map((it) => {
    const x = new Input(it as Record<string, unknown>);
    return { productId: x.reqId('productId'), variantId: x.id('variantId'), quantity: x.int('quantity', { required: true, min: 1, max: 1000 })! };
  });
  const keys = new Set(items.map((i) => `${i.productId}:${i.variantId ?? ''}`));
  if (keys.size !== items.length) throw new AppError('Each product/variant can appear only once; use quantity', 400);
  return items;
}

/** Moves stock atomically; refuses to go below zero unless backorders are allowed. */
async function moveStock(tx: Tx, p: { storeId: string; productId: string; variantId?: string | null; delta: number; reason: string; referenceId?: string; notes?: string; actorId?: string | null; allowNegative: boolean }) {
  const where = p.variantId ? { id: p.variantId } : { id: p.productId };
  const guard = !p.allowNegative && p.delta < 0 ? { stock: { gte: -p.delta } } : {};
  const r = p.variantId
    ? await tx.productVariant.updateMany({ where: { ...where, ...guard }, data: { stock: { increment: p.delta } } })
    : await tx.product.updateMany({ where: { ...where, ...guard }, data: { stock: { increment: p.delta } } });
  if (!r.count) return null;
  const after = p.variantId
    ? (await tx.productVariant.findUniqueOrThrow({ where: { id: p.variantId }, select: { stock: true } })).stock
    : (await tx.product.findUniqueOrThrow({ where: { id: p.productId }, select: { stock: true } })).stock;
  if (p.variantId) {
    // Keep the product total in step with its variants.
    await tx.product.update({ where: { id: p.productId }, data: { stock: { increment: p.delta } } });
  }
  await tx.inventoryMovement.create({
    data: { storeId: p.storeId, productId: p.productId, variantId: p.variantId ?? undefined, quantity: p.delta, reason: p.reason, referenceId: p.referenceId, notes: p.notes, createdById: p.actorId ?? undefined, stockAfter: after },
  });
  return after;
}

function whatsappLink(phone: string | null | undefined, text: string): string | null {
  const digits = (phone ?? '').replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}` : null;
}

function orderSummary(o: { orderNumber: string; currency: string; total: Prisma.Decimal; customerName: string | null; customerAddress: string | null; items: { productName: string; variantName: string | null; quantity: number; total: Prisma.Decimal }[] }, storeName: string) {
  return [
    `Salaam ${storeName}! Order ${o.orderNumber}`,
    ...o.items.map((it) => `• ${it.quantity} × ${it.productName}${it.variantName ? ` (${it.variantName})` : ''} = ${dec(it.total).toFixed(2)} ${o.currency}`),
    `Total: ${dec(o.total).toFixed(2)} ${o.currency}`,
    o.customerName ? `Name: ${o.customerName}` : '',
    o.customerAddress ? `Delivery: ${o.customerAddress}` : '',
  ].filter(Boolean).join('\n');
}

/**
 * Creates an order: prices come from the database (never from the client), stock is reserved
 * atomically, dropshipped items create supplier fulfillments. One transaction.
 */
async function createOrder(storeId: string, input: {
  items: ItemIn[];
  customer: { name: string; phone: string; email?: string; address?: string };
  notes?: string;
  source: 'STOREFRONT' | 'MANUAL';
  actorId?: string | null;
  referralCode?: string;
}) {
  const store = await prisma.store.findUniqueOrThrow({ where: { id: storeId } });
  const products = await prisma.product.findMany({
    where: { id: { in: input.items.map((i) => i.productId) }, storeId },
    include: { variants: true, resellerListing: { include: { supplierProduct: true } } },
  });
  const lines = input.items.map((it) => {
    const p = products.find((x) => x.id === it.productId);
    if (!p) throw new AppError('A product in the cart is not in this store', 400);
    if (input.source === 'STOREFRONT' && p.status !== 'ACTIVE') throw new AppError(`${p.name} is not available`, 409);
    const v = it.variantId ? p.variants.find((x) => x.id === it.variantId) : null;
    if (it.variantId && (!v || !v.isActive)) throw new AppError(`The selected option of ${p.name} is not available`, 409);
    if (!it.variantId && p.variants.some((x) => x.isActive)) throw new AppError(`Choose an option for ${p.name}`, 400);
    const unit = dec(v?.price ?? p.price);
    return { p, v, it, unit, total: unit.mul(it.quantity) };
  });
  const settings = (store.settings ?? {}) as Record<string, unknown>;
  const shipping = dec(Number(settings.deliveryFee ?? 0) || 0);
  const subtotal = lines.reduce((a, l) => a.add(l.total), dec(0));
  const link = input.referralCode ? await prisma.promotionLink.findFirst({ where: { code: input.referralCode, isActive: true, OR: [{ storeId }, { storeId: null }] } }) : null;

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await prisma.$transaction(async (tx) => {
        const count = await tx.storeOrder.count({ where: { storeId } });
        const orderNumber = `A${1001 + count + attempt}`;
        let customer = await tx.storeCustomer.findFirst({ where: { storeId, phone: input.customer.phone } });
        customer = customer
          ? await tx.storeCustomer.update({ where: { id: customer.id }, data: { name: input.customer.name, email: input.customer.email ?? customer.email, address: input.customer.address ?? customer.address } })
          : await tx.storeCustomer.create({ data: { storeId, name: input.customer.name, phone: input.customer.phone, email: input.customer.email, address: input.customer.address } });
        const order = await tx.storeOrder.create({
          data: {
            storeId,
            customerId: customer.id,
            orderNumber,
            status: 'NEW',
            paymentStatus: 'PENDING',
            subtotal,
            shippingCost: shipping,
            total: subtotal.add(shipping),
            currency: store.currency,
            customerName: input.customer.name,
            customerPhone: input.customer.phone,
            customerAddress: input.customer.address,
            notes: input.notes,
            promotionLinkId: link?.id,
            resellerId: link?.resellerId,
            referralCode: link?.code,
            metadata: { source: input.source },
            items: {
              create: lines.map((l) => ({
                productId: l.p.id,
                variantId: l.v?.id,
                productName: l.p.name,
                variantName: l.v?.name,
                sku: l.v?.sku ?? l.p.sku,
                quantity: l.it.quantity,
                unitPrice: l.unit,
                total: l.total,
                supplierProductId: l.p.resellerListing?.supplierProductId,
                wholesalePrice: l.p.resellerListing?.wholesalePrice,
              })),
            },
            statusEvents: { create: { toStatus: 'NEW', note: input.source === 'MANUAL' ? 'Created by staff' : 'Placed on the storefront', changedById: input.actorId ?? undefined } },
          },
          include: { items: true },
        });
        for (const l of lines) {
          if (!l.p.trackInventory) continue;
          const after = await moveStock(tx, { storeId, productId: l.p.id, variantId: l.v?.id, delta: -l.it.quantity, reason: 'ORDER', referenceId: order.id, actorId: input.actorId, allowNegative: l.p.allowBackorder });
          if (after === null) {
            const left = l.v ? l.v.stock : l.p.stock;
            throw new AppError(`${l.p.name}${l.v ? ` (${l.v.name})` : ''} has only ${Math.max(left, 0)} left`, 409);
          }
        }
        // Dropshipped items: one fulfillment request per supplier.
        const bySupplier = new Map<string, { items: string[]; total: Prisma.Decimal }>();
        for (const item of order.items) {
          const l = lines.find((x) => x.p.id === item.productId)!;
          const sp = l.p.resellerListing?.supplierProduct;
          if (!sp) continue;
          const cur = bySupplier.get(sp.supplierId) ?? { items: [], total: dec(0) };
          cur.items.push(item.id);
          cur.total = cur.total.add(dec(l.p.resellerListing!.wholesalePrice).mul(item.quantity));
          bySupplier.set(sp.supplierId, cur);
        }
        for (const [supplierId, f] of bySupplier) {
          const ful = await tx.orderFulfillment.create({ data: { orderId: order.id, supplierId, wholesaleTotal: f.total, currency: store.currency } });
          await tx.storeOrderItem.updateMany({ where: { id: { in: f.items } }, data: { fulfillmentId: ful.id } });
        }
        if (link) await tx.promotionLink.update({ where: { id: link.id }, data: { orderCount: { increment: 1 } } });
        return { order, store };
      }, { timeout: 15_000 });
    } catch (e) {
      if ((e as { code?: string }).code === 'P2002' && attempt < 4) continue; // order number taken: retry
      throw e;
    }
  }
  throw new AppError('Could not place the order, please try again', 503);
}

async function afterOrderCreated(order: any, store: any, marketingConsent: boolean) {
  await notifyBusiness(store.businessId, { title: `New order ${order.orderNumber}`, message: `${order.customerName} · ${dec(order.total).toFixed(2)} ${order.currency}`, type: 'ORDER', actionUrl: `/store/orders/${order.id}` }, ['OWNER', 'ADMIN', 'MANAGER', 'EMPLOYEE']);
  await emitEvent(store.businessId, 'ORDER_CREATED', `order:${order.id}:created`, { orderId: order.id, orderNumber: order.orderNumber, phone: order.customerPhone ?? '', name: order.customerName ?? '', total: dec(order.total).toFixed(2), currency: order.currency });
  if (marketingConsent && order.customerPhone) {
    const existing = await prisma.marketingContact.findFirst({ where: { businessId: store.businessId, phone: order.customerPhone } });
    const contact = existing ?? (await prisma.marketingContact.create({ data: { businessId: store.businessId, phone: order.customerPhone, name: order.customerName, source: 'STOREFRONT', tags: ['customer'] } }));
    if (!contact.optedOutAt) {
      await prisma.$transaction([
        prisma.contactConsentEvent.create({ data: { contactId: contact.id, channel: 'WHATSAPP', action: 'OPT_IN', source: 'STOREFRONT', evidence: { orderId: order.id, checkbox: 'Send me offers on WhatsApp', at: new Date().toISOString() } } }),
        prisma.marketingContact.update({ where: { id: contact.id }, data: { whatsappConsent: true, whatsappOptInAt: new Date() } }),
      ]);
    }
  }
}

// ---------------------------------------------------------------- public storefront

const storefrontLimit = rateLimit({ windowMs: 60_000, max: 120 });
const checkoutLimit = rateLimit({ windowMs: 10 * 60_000, max: 10 });

async function publicStore(slug: string) {
  const store = await prisma.store.findFirst({
    where: { slug, status: 'ACTIVE', business: { status: 'ACTIVE' } },
    select: { id: true, businessId: true, name: true, slug: true, description: true, logoUrl: true, coverImageUrl: true, whatsappNumber: true, phone: true, email: true, address: true, city: true, country: true, currency: true, socialLinks: true, policies: true, settings: true, business: { select: { name: true } } },
  });
  if (!store) throw new AppError('Store not found', 404);
  return store;
}

router.get('/storefront/by-domain/:domain', storefrontLimit, asyncHandler(async (req, res) => {
  const d = await prisma.storeDomain.findFirst({ where: { domain: String(req.params.domain).toLowerCase(), isVerified: true, store: { status: 'ACTIVE' } }, select: { store: { select: { slug: true } } } });
  if (!d) throw new AppError('Domain not found', 404);
  return ok(res, { slug: d.store.slug });
}));

router.get('/storefront/:slug', storefrontLimit, asyncHandler(async (req, res) => {
  const { businessId, settings, ...store } = await publicStore(String(req.params.slug));
  const categories = await prisma.productCategory.findMany({ where: { storeId: store.id }, orderBy: { sortOrder: 'asc' }, select: { id: true, name: true, slug: true, description: true } });
  const s = (settings ?? {}) as Record<string, unknown>;
  return ok(res, { ...store, deliveryFee: Number(s.deliveryFee ?? 0) || 0, categories });
}));

router.get('/storefront/:slug/products', storefrontLimit, asyncHandler(async (req, res) => {
  const store = await publicStore(String(req.params.slug));
  const { page, limit, skip } = pageOf(req);
  const where: Prisma.ProductWhereInput = { storeId: store.id, status: 'ACTIVE' };
  const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 100) : '';
  if (q) where.OR = [{ name: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }, { tags: { has: q.toLowerCase() } }];
  if (typeof req.query.category === 'string') {
    const cat = await prisma.productCategory.findFirst({ where: { storeId: store.id, slug: req.query.category } });
    where.categoryId = cat?.id ?? '00000000-0000-0000-0000-000000000000';
  }
  const minPrice = Number(req.query.minPrice);
  const maxPrice = Number(req.query.maxPrice);
  if (Number.isFinite(minPrice) || Number.isFinite(maxPrice)) where.price = { ...(Number.isFinite(minPrice) ? { gte: minPrice } : {}), ...(Number.isFinite(maxPrice) ? { lte: maxPrice } : {}) };
  const sort = String(req.query.sort ?? 'newest');
  const orderBy: Prisma.ProductOrderByWithRelationInput = sort === 'price_asc' ? { price: 'asc' } : sort === 'price_desc' ? { price: 'desc' } : sort === 'name' ? { name: 'asc' } : { createdAt: 'desc' };
  const [items, total] = await Promise.all([prisma.product.findMany({ where, orderBy, skip, take: limit, select: PUBLIC_PRODUCT }), prisma.product.count({ where })]);
  return ok(res, items.map(publicProduct), 200, { meta: pageMeta(page, limit, total) });
}));

router.get('/storefront/:slug/products/:productSlug', storefrontLimit, asyncHandler(async (req, res) => {
  const store = await publicStore(String(req.params.slug));
  const p = await prisma.product.findFirst({
    where: { storeId: store.id, slug: String(req.params.productSlug), status: 'ACTIVE' },
    select: { ...PUBLIC_PRODUCT, category: { select: { name: true, slug: true } }, variants: { where: { isActive: true }, orderBy: { sortOrder: 'asc' }, select: { id: true, name: true, options: true, price: true, stock: true } } },
  });
  if (!p) throw new AppError('Product not found', 404);
  const { variants, ...rest } = p as any;
  return ok(res, { ...publicProduct(rest), variants: variants.map(({ stock, ...v }: any) => ({ ...v, inStock: !p.trackInventory || p.allowBackorder || stock > 0 })) });
}));

/** Checkout: customer details + items. Returns the order reference and a WhatsApp handoff link. */
router.post('/storefront/:slug/orders', checkoutLimit, asyncHandler(async (req, res) => {
  const store = await publicStore(String(req.params.slug));
  const i = Input.of(req);
  if (i.str('website')) throw new AppError('Order rejected', 400); // honeypot
  const raw = i.raw('customer');
  const c = new Input((raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>);
  const { order } = await createOrder(store.id, {
    items: parseItems(i.raw('items')),
    customer: { name: c.str('name', { required: true, max: 120 })!, phone: c.phone('phone', true)!, email: c.email('email'), address: c.str('address', { required: true, max: 500 })! },
    notes: i.str('notes', { max: 1000 }),
    source: 'STOREFRONT',
    referralCode: i.str('referralCode', { max: 40 }),
  });
  await afterOrderCreated(order, store, i.bool('marketingConsent') === true);
  return ok(res, {
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    items: order.items.map((it) => ({ name: it.productName, variant: it.variantName, quantity: it.quantity, unitPrice: money(it.unitPrice), total: money(it.total) })),
    subtotal: money(order.subtotal),
    shippingCost: money(order.shippingCost),
    total: money(order.total),
    currency: order.currency,
    whatsappUrl: whatsappLink(store.whatsappNumber, orderSummary(order, store.name)),
  }, 201);
}));

/** Order tracking for the customer (needs the phone used at checkout). */
router.get('/storefront/:slug/orders/:orderNumber', storefrontLimit, asyncHandler(async (req, res) => {
  const store = await publicStore(String(req.params.slug));
  const phone = typeof req.query.phone === 'string' ? req.query.phone : '';
  const order = await prisma.storeOrder.findFirst({ where: { storeId: store.id, orderNumber: String(req.params.orderNumber) }, include: { items: true, statusEvents: { orderBy: { createdAt: 'asc' }, select: { toStatus: true, createdAt: true } } } });
  let normalized = '';
  try { normalized = phone ? (await import('../lib/http')).normalizePhone(phone) : ''; } catch { normalized = ''; }
  if (!order || !normalized || order.customerPhone !== normalized) throw new AppError('Order not found', 404);
  return ok(res, {
    orderNumber: order.orderNumber, status: order.status, paymentStatus: order.paymentStatus, total: money(order.total), currency: order.currency,
    items: order.items.map((it) => ({ name: it.productName, variant: it.variantName, quantity: it.quantity })),
    trackingNumber: order.trackingNumber, history: order.statusEvents,
  });
}));

/** The customer opened WhatsApp from the confirmation page: recorded, never treated as payment. */
router.post('/storefront/:slug/orders/:orderNumber/whatsapp', storefrontLimit, asyncHandler(async (req, res) => {
  const store = await publicStore(String(req.params.slug));
  const order = await prisma.storeOrder.findFirst({ where: { storeId: store.id, orderNumber: String(req.params.orderNumber) }, include: { items: true } });
  if (!order) throw new AppError('Order not found', 404);
  if (!order.whatsappHandoffAt) await prisma.storeOrder.update({ where: { id: order.id }, data: { whatsappHandoffAt: new Date() } });
  return ok(res, { whatsappUrl: whatsappLink(store.whatsappNumber, orderSummary(order, store.name)) });
}));

// ---------------------------------------------------------------- staff: orders


/** Manual order by staff (phone / walk-in). Same rules as checkout; inactive products allowed. */
router.post('/store-orders', asyncHandler(async (req, res) => {
  const i = Input.of(req);
  const storeId = i.reqId('storeId');
  const { row: store } = await findFor(req, 'store', storeId, 'read');
  const access = await accessOf(req);
  assertCan(access, store.businessId, 'storeOrder', 'create');
  const raw = i.raw('customer');
  const c = new Input((raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>);
  const { order } = await createOrder(storeId, {
    items: parseItems(i.raw('items')),
    customer: { name: c.str('name', { required: true, max: 120 })!, phone: c.phone('phone', true)!, email: c.email('email'), address: c.str('address', { max: 500 }) },
    notes: i.str('notes', { max: 1000 }),
    source: 'MANUAL',
    actorId: userId(req),
  });
  await afterOrderCreated(order, store, false);
  return ok(res, order, 201);
}));

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  NEW: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'READY', 'DISPATCHED', 'CANCELLED'],
  PREPARING: ['READY', 'DISPATCHED', 'CANCELLED'],
  READY: ['DISPATCHED', 'DELIVERED', 'CANCELLED'],
  DISPATCHED: ['DELIVERED', 'RETURNED'],
  DELIVERED: ['RETURNED'],
  CANCELLED: [],
  RETURNED: [],
};

/** Fulfillment status (Pending=NEW → Confirmed → Processing=PREPARING → Ready → Shipped=DISPATCHED → Delivered). */
router.post('/store-orders/:id/status', asyncHandler(async (req, res) => {
  const i = Input.of(req);
  const to = i.oneOf('status', ['CONFIRMED', 'PREPARING', 'READY', 'DISPATCHED', 'DELIVERED', 'CANCELLED', 'RETURNED'] as const, true)!;
  const needsApproval = to === 'CANCELLED' || to === 'RETURNED';
  const { row: order, businessId } = await findFor(req, 'storeOrder', req.params.id, 'write', needsApproval ? { action: 'approve' } : {});
  if (!TRANSITIONS[order.status as OrderStatus].includes(to)) throw new AppError(`An order can't go from ${order.status} to ${to}`, 409);
  const note = i.str('note', { max: 1000 });
  const restock = to === 'CANCELLED' ? i.bool('restock') !== false : to === 'RETURNED' ? i.bool('restock') === true : false;
  const updated = await prisma.$transaction(async (tx) => {
    const r = await tx.storeOrder.updateMany({
      where: { id: order.id, status: order.status },
      data: {
        status: to,
        ...(to === 'DELIVERED' ? { deliveredAt: new Date() } : {}),
        ...(to === 'CANCELLED' ? { cancelledAt: new Date(), cancelReason: note } : {}),
        ...(i.has('trackingNumber') ? { trackingNumber: i.str('trackingNumber', { max: 120 }) } : {}),
      },
    });
    if (!r.count) throw new AppError('The order changed meanwhile; reload', 409);
    await tx.storeOrderStatusEvent.create({ data: { orderId: order.id, fromStatus: order.status, toStatus: to, note, changedById: userId(req) } });
    if (restock) {
      const items = await tx.storeOrderItem.findMany({ where: { orderId: order.id } });
      for (const it of items) {
        if (!it.productId) continue;
        const p = await tx.product.findUnique({ where: { id: it.productId }, select: { trackInventory: true } });
        if (!p?.trackInventory) continue;
        await moveStock(tx, { storeId: order.storeId, productId: it.productId, variantId: it.variantId, delta: it.quantity, reason: to === 'CANCELLED' ? 'ORDER_CANCELLED' : 'ORDER_RETURNED', referenceId: order.id, actorId: userId(req), allowNegative: true });
      }
    }
    if (to === 'CANCELLED') await tx.orderFulfillment.updateMany({ where: { orderId: order.id, status: { notIn: ['DELIVERED', 'CANCELLED'] } }, data: { status: 'CANCELLED', cancelledAt: new Date() } });
    return tx.storeOrder.findUniqueOrThrow({ where: { id: order.id } });
  });
  if (needsApproval) await audit(req, { action: `order.${to.toLowerCase()}`, entityType: 'StoreOrder', entityId: order.id, businessId, metadata: { note, restock } });
  await emitEvent(businessId, 'ORDER_STATUS_CHANGED', `order:${order.id}:${to}`, { orderId: order.id, orderNumber: order.orderNumber, status: to, phone: order.customerPhone ?? '', name: order.customerName ?? '', trackingNumber: updated.trackingNumber ?? '' });
  return ok(res, updated);
}));

/**
 * Payment status, recorded by staff after the money is confirmed (separate from fulfillment).
 * PAID posts the unpaid remainder to finance once (sourceType STORE_ORDER, unique per order).
 */
router.post('/store-orders/:id/payment', asyncHandler(async (req, res) => {
  const i = Input.of(req);
  const status = i.oneOf('paymentStatus', ['PAID', 'PARTIALLY_PAID', 'REFUNDED', 'PENDING'] as const, true)!;
  const { row: order, businessId } = await findFor(req, 'storeOrder', req.params.id, 'write', status === 'REFUNDED' ? { action: 'approve' } : {});
  if (order.status === 'CANCELLED' && status !== 'REFUNDED') throw new AppError('This order is cancelled', 409);
  const recorded = await prisma.financeTransaction.aggregate({ where: { businessId, sourceType: { startsWith: 'STORE_ORDER' }, sourceId: { startsWith: order.id } }, _sum: { amount: true } });
  const already = dec(recorded._sum.amount ?? 0);
  const method = i.str('method', { max: 50 }) ?? order.paymentMethod ?? undefined;
  const reference = i.str('reference', { max: 120 });
  const actor = userId(req);
  const updated = await prisma.$transaction(async (tx) => {
    let amount = dec(0);
    let sourceType = 'STORE_ORDER';
    let sourceId = order.id;
    if (status === 'PAID') amount = dec(order.total).sub(already);
    if (status === 'PARTIALLY_PAID') {
      amount = i.money('amount', { required: true })!;
      if (already.add(amount).gt(order.total)) throw new AppError('This is more than the order total', 400);
      sourceType = 'STORE_ORDER_PART';
      sourceId = `${order.id}:${reference ?? Date.now()}`;
    }
    if (status === 'REFUNDED') {
      if (already.lte(0)) throw new AppError('No recorded payment to refund', 409);
      amount = already.neg();
      sourceType = 'STORE_ORDER_REFUND';
      sourceId = `${order.id}:refund`;
    }
    if (!amount.eq(0)) {
      await tx.financeTransaction.create({
        data: { businessId, type: 'INCOME', category: status === 'REFUNDED' ? 'Refunds' : 'Store sales', description: `Order ${order.orderNumber}`, amount, currency: order.currency, reference, paymentMethod: method, sourceType, sourceId, createdById: actor },
      });
    }
    return tx.storeOrder.update({
      where: { id: order.id },
      data: { paymentStatus: status, paymentMethod: method, paymentNote: i.str('note', { max: 500 }) ?? order.paymentNote, ...(status === 'PAID' ? { paidAt: new Date() } : {}) },
    });
  });
  await audit(req, { action: `order.payment.${status.toLowerCase()}`, entityType: 'StoreOrder', entityId: order.id, businessId, metadata: { method, reference } });
  return ok(res, updated);
}));

router.post('/store-orders/:id/assign', asyncHandler(async (req, res) => {
  const { row, businessId } = await findFor(req, 'storeOrder', req.params.id, 'write');
  const assignedToId = Input.of(req).id('assignedToId') ?? null;
  await assertMember(assignedToId, businessId, 'assignedToId');
  return ok(res, await prisma.storeOrder.update({ where: { id: row.id }, data: { assignedToId } }));
}));

router.get('/store-orders/:id/details', asyncHandler(async (req, res) => {
  const { row } = await findFor(req, 'storeOrder', req.params.id, 'read', {
    include: { items: true, customer: true, fulfillments: true, assignedTo: { select: { id: true, firstName: true, lastName: true } }, statusEvents: { orderBy: { createdAt: 'asc' }, include: { changedBy: { select: { firstName: true, lastName: true } } } }, store: { select: { name: true, whatsappNumber: true } } },
  });
  return ok(res, { ...row, whatsappCustomerUrl: whatsappLink(row.customerPhone, `Salaam ${row.customerName ?? ''}, this is ${row.store.name} about your order ${row.orderNumber}.`) });
}));

// ---------------------------------------------------------------- inventory

router.post('/products/:id/inventory', asyncHandler(async (req, res) => {
  const { row: product, businessId } = await findFor(req, 'product', req.params.id, 'write');
  const i = Input.of(req);
  const quantity = i.int('quantity', { required: true, min: -100000, max: 100000 })!;
  if (quantity === 0) throw new AppError('quantity must not be 0', 400);
  const reason = i.oneOf('reason', ['RESTOCK', 'ADJUSTMENT', 'DAMAGE', 'RETURN', 'CORRECTION', 'COUNT'] as const, true)!;
  const variantId = i.id('variantId');
  if (variantId && !(await prisma.productVariant.count({ where: { id: variantId, productId: product.id } }))) throw new AppError('variantId is not an option of this product', 400);
  const stockAfter = await prisma.$transaction((tx) => moveStock(tx, { storeId: product.storeId, productId: product.id, variantId, delta: quantity, reason, notes: i.str('notes', { max: 500 }), actorId: userId(req), allowNegative: false }));
  if (stockAfter === null) throw new AppError('Stock cannot go below zero', 409);
  await audit(req, { action: 'inventory.adjust', entityType: 'Product', entityId: product.id, businessId, metadata: { quantity, reason, variantId, stockAfter } });
  if (stockAfter <= product.lowStockThreshold) await notifyBusiness(businessId, { title: 'Low stock', message: `${product.name}: ${stockAfter} left`, type: 'WARNING', actionUrl: `/store/products/${product.id}` });
  return ok(res, { productId: product.id, variantId, stock: stockAfter });
}));

router.get('/products/:id/inventory-history', asyncHandler(async (req, res) => {
  const { row } = await findFor(req, 'product', req.params.id);
  return ok(res, await prisma.inventoryMovement.findMany({ where: { productId: row.id }, orderBy: { createdAt: 'desc' }, take: 500, include: { createdBy: { select: { firstName: true, lastName: true } }, variant: { select: { name: true } } } }));
}));

router.get('/store/low-stock', asyncHandler(async (req, res) => {
  const { row: store } = await findFor(req, 'store', req.query.storeId);
  const products = await prisma.product.findMany({ where: { storeId: store.id, trackInventory: true, status: { in: ['ACTIVE', 'OUT_OF_STOCK'] } }, select: { id: true, name: true, sku: true, stock: true, lowStockThreshold: true } });
  return ok(res, products.filter((p) => p.stock <= p.lowStockThreshold).sort((a, b) => a.stock - b.stock));
}));

/** Bulk import products (JSON rows from a CSV in the browser). Existing SKUs are updated (not stock). */
router.post('/products/import', asyncHandler(async (req, res) => {
  const i = Input.of(req);
  const storeId = i.reqId('storeId');
  const { row: store, businessId } = await findFor(req, 'store', storeId);
  assertCan(await accessOf(req), businessId, 'product', 'create');
  const rows = i.raw('rows');
  if (!Array.isArray(rows) || !rows.length || rows.length > 2000) throw new AppError('rows must be a list of 1-2000 products', 400);
  const errors: { row: number; error: string }[] = [];
  let created = 0;
  let updated = 0;
  for (const [n, raw] of rows.entries()) {
    try {
      const x = new Input(raw as Record<string, unknown>);
      const name = x.reqStr('name', 200);
      const slug = (x.str('slug', { max: 120 }) ?? name).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 120);
      const sku = x.str('sku', { max: 60 });
      const data = { name, description: x.str('description', { max: 5000 }), price: x.money('price', { required: true, allowZero: true })!, compareAtPrice: x.money('compareAtPrice', { allowZero: true }), costPrice: x.money('costPrice', { allowZero: true }), tags: (x.list('tags', 30) ?? []).map((t) => t.toLowerCase()), lowStockThreshold: x.int('lowStockThreshold', { min: 0, max: 100000 }) ?? 5 };
      const existing = sku ? await prisma.product.findFirst({ where: { storeId, sku } }) : null;
      if (existing) {
        await prisma.product.update({ where: { id: existing.id }, data });
        updated++;
      } else {
        await prisma.product.create({ data: { ...data, storeId, slug, sku, currency: store.currency, status: 'DRAFT', stock: x.int('stock', { min: 0, max: 1_000_000 }) ?? 0 } });
        created++;
      }
    } catch (e) {
      errors.push({ row: n + 1, error: (e as { code?: string }).code === 'P2002' ? 'slug or SKU already used' : (e as Error).message });
    }
  }
  await audit(req, { action: 'products.import', entityType: 'Product', businessId, metadata: { created, updated, errors: errors.length } });
  return ok(res, { created, updated, errors });
}));

// ---------------------------------------------------------------- custom domains

const DOMAIN = /^(?=.{4,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

router.post('/store-domains', asyncHandler(async (req, res) => {
  const i = Input.of(req);
  const { row: store, businessId } = await findFor(req, 'store', i.reqId('storeId'));
  assertCan(await accessOf(req), businessId, 'storeDomain', 'create');
  const domain = i.reqStr('domain', 253).toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  if (!DOMAIN.test(domain) || /abuur/i.test(domain)) throw new AppError('Enter a domain you own, like shop.example.com', 400);
  const token = `abuur-verify=${randomToken(16)}`;
  const d = await prisma.storeDomain.create({ data: { storeId: store.id, domain, verificationToken: token, status: 'PENDING' } });
  return ok(res, { domain: d, instructions: dnsInstructions(domain, token) }, 201);
}));

function dnsInstructions(domain: string, token: string) {
  const target = process.env.STORE_DOMAIN_TARGET ?? null;
  return {
    txt: { type: 'TXT', name: `_abuur-verify.${domain}`, value: token },
    cname: target ? { type: 'CNAME', name: domain, value: target } : null,
    note: target
      ? 'Add both records at your domain provider, then press Verify. DNS changes can take up to 48 hours.'
      : 'Add the TXT record, then press Verify. Pointing the domain at your store also needs STORE_DOMAIN_TARGET to be configured by ABUUR.',
  };
}

router.get('/store-domains/:id/instructions', asyncHandler(async (req, res) => {
  const { row } = await findFor(req, 'storeDomain', req.params.id);
  return ok(res, dnsInstructions(row.domain, row.verificationToken ?? ''));
}));

/**
 * Checks the TXT record (ownership) and, if configured, the CNAME. A verified domain is not
 * "live" until HTTPS is set up on the hosting side (httpsActive stays false until then).
 */
router.post('/store-domains/:id/verify', rateLimit({ windowMs: 60_000, max: 10 }), asyncHandler(async (req, res) => {
  const { row, businessId } = await findFor(req, 'storeDomain', req.params.id, 'write');
  let txtOk = false;
  let cnameOk: boolean | null = null;
  let error: string | null = null;
  try {
    const records = await dns.resolveTxt(`_abuur-verify.${row.domain}`);
    txtOk = records.some((r) => r.join('') === row.verificationToken);
    if (!txtOk) error = 'The TXT record was found but its value does not match';
  } catch (e) {
    error = `No TXT record at _abuur-verify.${row.domain} yet (${(e as { code?: string }).code ?? 'lookup failed'})`;
  }
  const target = process.env.STORE_DOMAIN_TARGET;
  if (txtOk && target) {
    try {
      const c = await dns.resolveCname(row.domain);
      cnameOk = c.some((x) => x.replace(/\.$/, '') === target.replace(/\.$/, ''));
    } catch {
      cnameOk = false;
    }
  }
  const updated = await prisma.storeDomain.update({
    where: { id: row.id },
    data: { status: txtOk ? 'VERIFIED' : 'FAILED', isVerified: txtOk, verifiedAt: txtOk ? row.verifiedAt ?? new Date() : null, lastCheckedAt: new Date(), lastError: error },
  });
  if (txtOk) await audit(req, { action: 'domain.verified', entityType: 'StoreDomain', entityId: row.id, businessId, metadata: { domain: row.domain } });
  return ok(res, { domain: updated, ownershipVerified: txtOk, pointsToStore: cnameOk, httpsActive: false, nextStep: txtOk ? 'Ownership verified. HTTPS for this domain must be enabled in the hosting dashboard (e.g. Cloudflare custom hostname) before it serves the store.' : error });
}));

// ---------------------------------------------------------------- dropshipping

/** Add a verified supplier's product to my store (as a reseller). */
router.post('/dropshipping/import', asyncHandler(async (req, res) => {
  const i = Input.of(req);
  const { row: store, businessId } = await findFor(req, 'store', i.reqId('storeId'));
  assertCan(await accessOf(req), businessId, 'product', 'create');
  const reseller = await prisma.resellerProfile.findFirst({ where: { businessId, status: 'ACTIVE' } });
  if (!reseller) throw new AppError('Your business needs an active reseller profile to sell supplier products', 409);
  const sp = await prisma.supplierProduct.findFirst({ where: { id: i.reqId('supplierProductId'), status: 'ACTIVE', supplier: { status: 'VERIFIED' } } });
  if (!sp) throw new AppError('Supplier product not found or not available', 404);
  const sellingPrice = i.money('sellingPrice') ?? dec(sp.suggestedRetailPrice ?? dec(sp.wholesalePrice).mul(1.3).toDecimalPlaces(2));
  if (sp.minRetailPrice && sellingPrice.lt(sp.minRetailPrice)) throw new AppError(`The supplier's minimum price is ${dec(sp.minRetailPrice).toFixed(2)}`, 400);
  if (sellingPrice.lt(sp.wholesalePrice)) throw new AppError('Selling price is below the wholesale cost', 400);
  const slug = `${sp.name}-${sp.sku}`.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 120);
  const result = await prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: { storeId: store.id, name: sp.name, slug, description: sp.description, sku: `DS-${sp.sku}`.slice(0, 60), price: sellingPrice, costPrice: sp.wholesalePrice, currency: sp.currency, stock: sp.stock, images: sp.images ?? undefined, status: 'DRAFT', tags: sp.category ? [sp.category.toLowerCase()] : [], categoryId: i.id('categoryId') },
    });
    const listing = await tx.resellerProduct.create({ data: { resellerId: reseller.id, storeId: store.id, supplierProductId: sp.id, productId: product.id, sellingPrice, wholesalePrice: sp.wholesalePrice } });
    return { product, listing };
  });
  return ok(res, result, 201);
}));

/** Margin and markup of every dropshipped product in a store. */
router.get('/dropshipping/margins', asyncHandler(async (req, res) => {
  const { row: store } = await findFor(req, 'store', req.query.storeId);
  const listings = await prisma.resellerProduct.findMany({ where: { storeId: store.id }, include: { product: { select: { name: true, status: true, stock: true } }, supplierProduct: { select: { name: true, stock: true, status: true, supplier: { select: { displayName: true } } } } } });
  return ok(res, listings.map((l) => {
    const profit = dec(l.sellingPrice).sub(l.wholesalePrice);
    return {
      id: l.id, productId: l.productId, product: l.product.name, supplier: l.supplierProduct.supplier.displayName,
      sellingPrice: money(l.sellingPrice), wholesalePrice: money(l.wholesalePrice), profitPerUnit: money(profit),
      marginPercent: dec(l.sellingPrice).gt(0) ? Number(profit.div(l.sellingPrice).mul(100).toFixed(1)) : null,
      markupPercent: dec(l.wholesalePrice).gt(0) ? Number(profit.div(l.wholesalePrice).mul(100).toFixed(1)) : null,
      supplierStock: l.supplierProduct.stock, supplierStatus: l.supplierProduct.status, isActive: l.isActive,
    };
  }));
}));

/** Supplier updates price/stock/status; linked reseller listings follow their sync settings. */
router.post('/supplier-products/:id/update-stock-price', asyncHandler(async (req, res) => {
  const { row: sp, businessId } = await findFor(req, 'supplierProduct', req.params.id, 'write');
  const i = Input.of(req);
  const price = i.money('wholesalePrice');
  const stock = i.int('stock', { min: 0, max: 10_000_000 });
  const status = i.oneOf('status', ['ACTIVE', 'OUT_OF_STOCK', 'DISCONTINUED'] as const);
  const changes: { field: 'PRICE' | 'STOCK' | 'STATUS'; old: unknown; new: unknown }[] = [];
  if (price && !price.eq(sp.wholesalePrice)) changes.push({ field: 'PRICE', old: String(sp.wholesalePrice), new: price.toFixed(2) });
  if (stock !== undefined && stock !== sp.stock) changes.push({ field: 'STOCK', old: sp.stock, new: stock });
  if (status && status !== sp.status) changes.push({ field: 'STATUS', old: sp.status, new: status });
  const affected = await prisma.$transaction(async (tx) => {
    await tx.supplierProduct.update({ where: { id: sp.id }, data: { ...(price ? { wholesalePrice: price } : {}), ...(stock !== undefined ? { stock } : {}), ...(status ? { status } : {}), lastSyncedAt: new Date() } });
    const listings = await tx.resellerProduct.findMany({ where: { supplierProductId: sp.id } });
    for (const l of listings) {
      for (const c of changes) await tx.productSyncEvent.create({ data: { supplierProductId: sp.id, resellerProductId: l.id, field: c.field, oldValue: c.old as any, newValue: c.new as any } });
      const productData: Prisma.ProductUpdateInput = {};
      if (price && l.syncPrice) {
        await tx.resellerProduct.update({ where: { id: l.id }, data: { wholesalePrice: price, lastSyncedAt: new Date() } });
        productData.costPrice = price;
      }
      if (stock !== undefined && l.syncStock) productData.stock = stock;
      if (status === 'DISCONTINUED' || status === 'OUT_OF_STOCK') productData.status = status === 'DISCONTINUED' ? 'ARCHIVED' : 'OUT_OF_STOCK';
      if (Object.keys(productData).length) await tx.product.update({ where: { id: l.productId }, data: productData });
    }
    return listings;
  });
  const resellerBusinesses = await prisma.resellerProfile.findMany({ where: { id: { in: affected.map((l) => l.resellerId) } }, select: { businessId: true } });
  for (const r of resellerBusinesses) {
    await notifyBusiness(r.businessId, { title: 'Supplier product changed', message: `${sp.name}: ${changes.map((c) => `${c.field.toLowerCase()} ${c.old} → ${c.new}`).join(', ')}`, type: 'WARNING' });
  }
  await audit(req, { action: 'supplier_product.sync', entityType: 'SupplierProduct', entityId: sp.id, businessId, metadata: { changes, listings: affected.length } });
  return ok(res, { changes, listingsUpdated: affected.length });
}));

/** Supplier-side fulfillment progress with tracking. */
router.post('/order-fulfillments/:id/status', asyncHandler(async (req, res) => {
  const { row, access } = await findFor(req, 'orderFulfillment', req.params.id);
  const supplier = await prisma.supplierProfile.findUniqueOrThrow({ where: { id: row.supplierId } });
  assertCan(access, supplier.businessId, 'orderFulfillment', 'write');
  const i = Input.of(req);
  const status = i.oneOf('status', ['ACCEPTED', 'PREPARING', 'DISPATCHED', 'DELIVERED', 'CANCELLED', 'RETURNED'] as const, true)!;
  const stamp = status === 'ACCEPTED' ? { acceptedAt: new Date() } : status === 'DISPATCHED' ? { dispatchedAt: new Date() } : status === 'DELIVERED' ? { deliveredAt: new Date() } : status === 'CANCELLED' ? { cancelledAt: new Date() } : {};
  const updated = await prisma.orderFulfillment.update({ where: { id: row.id }, data: { status, ...stamp, carrier: i.str('carrier', { max: 100 }) ?? row.carrier, trackingNumber: i.str('trackingNumber', { max: 120 }) ?? row.trackingNumber, notes: i.str('notes', { max: 1000 }) ?? row.notes } });
  const order = await prisma.storeOrder.findUniqueOrThrow({ where: { id: row.orderId }, include: { store: { select: { businessId: true } } } });
  await notifyBusiness(order.store.businessId, { title: `Supplier update for ${order.orderNumber}`, message: `${supplier.displayName}: ${status.toLowerCase()}${updated.trackingNumber ? ` (tracking ${updated.trackingNumber})` : ''}`, type: 'ORDER', actionUrl: `/store/orders/${order.id}` });
  await audit(req, { action: 'fulfillment.status', entityType: 'OrderFulfillment', entityId: row.id, businessId: supplier.businessId, metadata: { status } });
  return ok(res, updated);
}));

export default router;
