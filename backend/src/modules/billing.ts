import { Router } from 'express';
import { PackageBilling, Prisma } from '@prisma/client';
import { prisma } from '../prisma';
import { authedRouter } from '../lib/router';
import { authenticate } from '../middleware/auth';
import { AppError, asyncHandler } from '../middleware/error';
import { ok, Input, userId, dec, money, pageOf, pageMeta } from '../lib/http';
import { findFor, forBusiness, assertInBusiness } from '../lib/guard';
import { audit } from '../lib/audit';
import { emitEvent } from '../services/automation';

/**
 * Money the business's own customers owe and pay: customer subscriptions (packages sold by the
 * business — not ABUUR plans), invoices, payments, refunds and receipts.
 * Every PAID payment posts exactly one finance transaction (sourceType PAYMENT, unique), so
 * revenue is never counted twice.
 */
const router = authedRouter();

type Tx = Prisma.TransactionClient;

export function addPeriod(from: Date, billing: PackageBilling, durationDays?: number | null): Date | null {
  const d = new Date(from);
  switch (billing) {
    case 'MONTHLY':
      d.setMonth(d.getMonth() + 1);
      return d;
    case 'QUARTERLY':
      d.setMonth(d.getMonth() + 3);
      return d;
    case 'YEARLY':
      d.setFullYear(d.getFullYear() + 1);
      return d;
    default:
      return durationDays ? new Date(from.getTime() + durationDays * 86_400_000) : null;
  }
}

/** Retries a create when a generated number collides (two requests at once). */
async function withNumber<T>(make: (n: number) => Promise<T>, start: () => Promise<number>): Promise<T> {
  let n = await start();
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      return await make(n + attempt);
    } catch (e) {
      if ((e as { code?: string }).code !== 'P2002' || attempt === 5) throw e;
    }
  }
  throw new AppError('Could not allocate a number, try again', 503);
}

// ---------------------------------------------------------------- customer subscriptions

router.post('/client-subscriptions', asyncHandler(async (req, res) => {
  const i = Input.of(req);
  const { businessId } = await forBusiness(req, i.raw('businessId'), 'clientSubscription', 'create');
  const customerId = i.reqId('customerId');
  const packageId = i.reqId('packageId');
  await assertInBusiness('cRMCustomer', customerId, businessId, 'customerId');
  const pkg = await prisma.servicePackage.findFirst({ where: { id: packageId, businessId } });
  if (!pkg) throw new AppError('packageId was not found in this business', 404);
  if (!pkg.isActive) throw new AppError('This package is not active', 409);
  const startDate = i.date('startDate') ?? new Date();
  const status = i.oneOf('status', ['ACTIVE', 'PENDING'] as const) ?? 'ACTIVE';
  const renewalDate = addPeriod(startDate, pkg.billing, pkg.durationDays);
  const sub = await prisma.$transaction(async (tx) => {
    const s = await tx.clientSubscription.create({
      data: {
        businessId,
        customerId,
        packageId,
        status,
        price: i.money('price', { allowZero: true }) ?? pkg.price,
        currency: pkg.currency,
        startDate,
        renewalDate,
        endDate: pkg.billing === 'ONE_TIME' ? renewalDate : null,
        autoRenew: i.bool('autoRenew') ?? pkg.billing !== 'ONE_TIME',
        notes: i.str('notes', { max: 2000 }),
      },
    });
    await tx.clientSubscriptionEvent.create({ data: { subscriptionId: s.id, type: 'CREATED', toPackageId: packageId, price: s.price, createdById: userId(req) } });
    return s;
  });
  if (i.bool('createInvoice')) await invoiceForSubscription(sub.id, req);
  return ok(res, await prisma.clientSubscription.findUnique({ where: { id: sub.id }, include: { invoices: true } }), 201);
}));

async function invoiceForSubscription(subscriptionId: string, req: any) {
  const s = await prisma.clientSubscription.findUniqueOrThrow({ where: { id: subscriptionId }, include: { package: true } });
  return createInvoice({
    businessId: s.businessId,
    customerId: s.customerId,
    clientSubscriptionId: s.id,
    items: [{ description: `${s.package.name} (${s.package.billing.toLowerCase().replace('_', '-')})`, quantity: 1, unitPrice: dec(s.price) }],
    currency: s.currency,
    dueDate: s.renewalDate ?? new Date(Date.now() + 7 * 86_400_000),
    status: 'SENT',
  });
}

async function changeStatus(req: any, res: any, to: 'PAUSED' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED', type: 'PAUSED' | 'RESUMED' | 'SUSPENDED' | 'CANCELLED', from: string[]) {
  const { row, businessId } = await findFor(req, 'clientSubscription', req.params.id, 'write');
  if (!from.includes(row.status)) throw new AppError(`A ${row.status.toLowerCase()} subscription cannot be ${type.toLowerCase()}`, 409);
  const reason = Input.of(req).str('reason', { max: 1000 });
  const updated = await prisma.$transaction(async (tx) => {
    const u = await tx.clientSubscription.update({
      where: { id: row.id },
      data: { status: to, ...(to === 'CANCELLED' ? { cancelledAt: new Date(), cancelReason: reason, autoRenew: false } : {}) },
    });
    await tx.clientSubscriptionEvent.create({ data: { subscriptionId: row.id, type, note: reason, createdById: userId(req) } });
    return u;
  });
  await audit(req, { action: `client_subscription.${type.toLowerCase()}`, entityType: 'ClientSubscription', entityId: row.id, businessId, metadata: { reason } });
  return ok(res, updated);
}

router.post('/client-subscriptions/:id/pause', asyncHandler((req, res) => changeStatus(req, res, 'PAUSED', 'PAUSED', ['ACTIVE'])));
router.post('/client-subscriptions/:id/resume', asyncHandler((req, res) => changeStatus(req, res, 'ACTIVE', 'RESUMED', ['PAUSED', 'SUSPENDED', 'PENDING'])));
router.post('/client-subscriptions/:id/suspend', asyncHandler((req, res) => changeStatus(req, res, 'SUSPENDED', 'SUSPENDED', ['ACTIVE', 'PAUSED'])));
router.post('/client-subscriptions/:id/cancel', asyncHandler((req, res) => changeStatus(req, res, 'CANCELLED', 'CANCELLED', ['ACTIVE', 'PAUSED', 'SUSPENDED', 'PENDING'])));

/** Renew for one more period (from the current renewal date, or today if expired). */
router.post('/client-subscriptions/:id/renew', asyncHandler(async (req, res) => {
  const { row, businessId } = await findFor(req, 'clientSubscription', req.params.id, 'write', { include: { package: true } });
  if (row.status === 'CANCELLED') throw new AppError('A cancelled subscription cannot be renewed; create a new one', 409);
  const base = row.renewalDate && row.renewalDate > new Date() ? row.renewalDate : new Date();
  const next = addPeriod(base, row.package.billing, row.package.durationDays);
  if (!next) throw new AppError('This one-time package has no renewal period', 409);
  const updated = await prisma.$transaction(async (tx) => {
    const u = await tx.clientSubscription.update({
      where: { id: row.id },
      data: { status: 'ACTIVE', renewalDate: next, endDate: row.package.billing === 'ONE_TIME' ? next : row.endDate, renewalCount: { increment: 1 }, lastRenewedAt: new Date(), remindedAt: null },
    });
    await tx.clientSubscriptionEvent.create({ data: { subscriptionId: row.id, type: 'RENEWED', price: row.price, note: `Renewed until ${next.toISOString().slice(0, 10)}`, createdById: userId(req) } });
    return u;
  });
  const invoice = Input.of(req).bool('createInvoice') ? await invoiceForSubscription(row.id, req) : null;
  await audit(req, { action: 'client_subscription.renew', entityType: 'ClientSubscription', entityId: row.id, businessId, metadata: { renewalDate: next } });
  return ok(res, { subscription: updated, invoice });
}));

/** Upgrade or downgrade to another package of the same business. */
router.post('/client-subscriptions/:id/change-package', asyncHandler(async (req, res) => {
  const { row, businessId } = await findFor(req, 'clientSubscription', req.params.id, 'write');
  if (['CANCELLED', 'EXPIRED'].includes(row.status)) throw new AppError(`A ${row.status.toLowerCase()} subscription cannot change package`, 409);
  const i = Input.of(req);
  const pkg = await prisma.servicePackage.findFirst({ where: { id: i.reqId('packageId'), businessId, isActive: true } });
  if (!pkg) throw new AppError('packageId was not found among active packages of this business', 404);
  if (pkg.id === row.packageId) throw new AppError('The subscription already uses this package', 409);
  const price = i.money('price', { allowZero: true }) ?? pkg.price;
  const type = dec(price).gte(row.price) ? 'UPGRADED' : 'DOWNGRADED';
  const updated = await prisma.$transaction(async (tx) => {
    const u = await tx.clientSubscription.update({ where: { id: row.id }, data: { packageId: pkg.id, price, currency: pkg.currency } });
    await tx.clientSubscriptionEvent.create({ data: { subscriptionId: row.id, type, fromPackageId: row.packageId, toPackageId: pkg.id, price, note: i.str('note', { max: 1000 }), createdById: userId(req) } });
    return u;
  });
  await audit(req, { action: `client_subscription.${type.toLowerCase()}`, entityType: 'ClientSubscription', entityId: row.id, businessId, metadata: { from: row.packageId, to: pkg.id } });
  return ok(res, updated);
}));

router.get('/client-subscriptions/:id/history', asyncHandler(async (req, res) => {
  const { row } = await findFor(req, 'clientSubscription', req.params.id);
  const events = await prisma.clientSubscriptionEvent.findMany({
    where: { subscriptionId: row.id },
    orderBy: { createdAt: 'asc' },
    include: { fromPackage: { select: { name: true } }, toPackage: { select: { name: true } }, createdBy: { select: { firstName: true, lastName: true } } },
  });
  return ok(res, events);
}));

// ---------------------------------------------------------------- invoices

type ItemIn = { description: string; quantity: number; unitPrice: Prisma.Decimal };

export async function createInvoice(p: {
  businessId: string;
  customerId?: string | null;
  clientSubscriptionId?: string | null;
  items: ItemIn[];
  tax?: Prisma.Decimal;
  discount?: Prisma.Decimal;
  currency?: string;
  dueDate?: Date | null;
  notes?: string;
  status?: 'DRAFT' | 'SENT';
}) {
  const subtotal = p.items.reduce((a, it) => a.add(it.unitPrice.mul(it.quantity)), dec(0));
  const total = subtotal.add(p.tax ?? 0).sub(p.discount ?? 0);
  if (total.lt(0)) throw new AppError('Invoice total cannot be negative', 400);
  return withNumber(
    (n) =>
      prisma.invoice.create({
        data: {
          businessId: p.businessId,
          customerId: p.customerId,
          clientSubscriptionId: p.clientSubscriptionId,
          invoiceNumber: `INV-${String(n).padStart(5, '0')}`,
          status: p.status ?? 'DRAFT',
          subtotal,
          tax: p.tax ?? 0,
          discount: p.discount ?? 0,
          total,
          currency: p.currency ?? 'USD',
          dueDate: p.dueDate,
          issuedAt: p.status === 'SENT' ? new Date() : null,
          notes: p.notes,
          items: { create: p.items.map((it) => ({ description: it.description, quantity: it.quantity, unitPrice: it.unitPrice, total: it.unitPrice.mul(it.quantity) })) },
        },
        include: { items: true },
      }),
    async () => (await prisma.invoice.count({ where: { businessId: p.businessId } })) + 1,
  );
}

router.post('/invoices', asyncHandler(async (req, res) => {
  const i = Input.of(req);
  const { businessId } = await forBusiness(req, i.raw('businessId'), 'invoice', 'create');
  const customerId = i.id('customerId');
  const clientSubscriptionId = i.id('clientSubscriptionId');
  await assertInBusiness('cRMCustomer', customerId, businessId, 'customerId');
  await assertInBusiness('clientSubscription', clientSubscriptionId, businessId, 'clientSubscriptionId');
  const rawItems = i.raw('items');
  if (!Array.isArray(rawItems) || !rawItems.length || rawItems.length > 100) throw new AppError('items must be a list of 1-100 lines', 400);
  const items = rawItems.map((it, n) => {
    const x = new Input(it as Record<string, unknown>);
    return {
      description: x.str('description', { required: true, max: 500 })!,
      quantity: x.int('quantity', { min: 1, max: 100000 }) ?? 1,
      unitPrice: x.money('unitPrice', { required: true, allowZero: true })!,
    };
  });
  const invoice = await createInvoice({
    businessId,
    customerId,
    clientSubscriptionId,
    items,
    tax: i.money('tax', { allowZero: true }),
    discount: i.money('discount', { allowZero: true }),
    currency: i.str('currency', { max: 3 }) ?? 'USD',
    dueDate: i.date('dueDate'),
    notes: i.str('notes', { max: 5000 }),
    status: i.oneOf('status', ['DRAFT', 'SENT'] as const) ?? 'DRAFT',
  });
  return ok(res, invoice, 201);
}));

router.post('/invoices/:id/send', asyncHandler(async (req, res) => {
  const { row } = await findFor(req, 'invoice', req.params.id, 'write');
  if (row.status !== 'DRAFT') throw new AppError('Only draft invoices can be sent', 409);
  return ok(res, await prisma.invoice.update({ where: { id: row.id }, data: { status: 'SENT', issuedAt: new Date() } }));
}));

router.post('/invoices/:id/cancel', asyncHandler(async (req, res) => {
  const { row, businessId } = await findFor(req, 'invoice', req.params.id, 'write');
  if (dec(row.amountPaid).gt(0)) throw new AppError('This invoice has payments; refund them before cancelling', 409);
  if (row.status === 'CANCELLED') return ok(res, row);
  const updated = await prisma.invoice.update({ where: { id: row.id }, data: { status: 'CANCELLED' } });
  await audit(req, { action: 'invoice.cancel', entityType: 'Invoice', entityId: row.id, businessId });
  return ok(res, updated);
}));

/** Unpaid invoices with their balances (paid, partial, pending, overdue) and upcoming deadlines. */
router.get('/invoices-outstanding', asyncHandler(async (req, res) => {
  const { businessId } = await forBusiness(req, req.query.businessId, 'invoice', 'read');
  const rows = await prisma.invoice.findMany({
    where: { businessId, status: { in: ['SENT', 'PARTIALLY_PAID', 'OVERDUE'] } },
    orderBy: { dueDate: 'asc' },
    include: { customer: { select: { id: true, name: true, phone: true } } },
  });
  const now = new Date();
  const items = rows.map((r) => ({ ...r, balance: money(dec(r.total).sub(r.amountPaid)), overdue: !!r.dueDate && r.dueDate < now }));
  return ok(res, {
    items,
    totalOutstanding: money(items.reduce((a, r) => a + r.balance, 0)),
    overdueCount: items.filter((r) => r.overdue).length,
    overdueAmount: money(items.filter((r) => r.overdue).reduce((a, r) => a + r.balance, 0)),
  });
}));

// ---------------------------------------------------------------- payments

function invoiceStatusFor(total: Prisma.Decimal, paid: Prisma.Decimal, dueDate: Date | null, current: string) {
  if (paid.gte(total) && total.gt(0)) return 'PAID' as const;
  if (paid.gt(0)) return 'PARTIALLY_PAID' as const;
  if (current === 'DRAFT') return 'DRAFT' as const;
  return dueDate && dueDate < new Date() ? ('OVERDUE' as const) : ('SENT' as const);
}

/** Applies a confirmed (PAID) payment or refund: invoice balance + one finance transaction. */
async function postPayment(tx: Tx, paymentId: string, actorId: string) {
  const p = await tx.payment.findUniqueOrThrow({ where: { id: paymentId } });
  const signed = p.kind === 'REFUND' ? dec(p.amount).neg() : dec(p.amount);
  if (p.invoiceId) {
    const inv = await tx.invoice.findUniqueOrThrow({ where: { id: p.invoiceId } });
    const paid = dec(inv.amountPaid).add(signed);
    if (paid.lt(0)) throw new AppError('Refund is more than was paid on this invoice', 400);
    await tx.invoice.update({ where: { id: inv.id }, data: { amountPaid: paid, status: invoiceStatusFor(dec(inv.total), paid, inv.dueDate, inv.status) } });
  }
  await tx.financeTransaction.create({
    data: {
      businessId: p.businessId,
      type: 'INCOME',
      category: p.kind === 'REFUND' ? 'Refunds' : 'Customer payments',
      description: p.kind === 'REFUND' ? `Refund ${p.reference ?? ''}`.trim() : `Payment ${p.receiptNumber ?? ''}`.trim(),
      amount: signed,
      currency: p.currency,
      reference: p.reference,
      paymentMethod: p.method,
      transactionDate: p.paidAt ?? new Date(),
      sourceType: p.kind === 'REFUND' ? 'REFUND' : 'PAYMENT',
      sourceId: p.id,
      createdById: actorId,
    },
  });
}

async function nextReceipt(businessId: string) {
  return (await prisma.payment.count({ where: { businessId, receiptNumber: { not: null } } })) + 1;
}

/**
 * Record a customer payment (manual: cash, EVC Plus, bank...). status PAID = confirmed by staff;
 * PENDING = expected but not yet confirmed (confirm later). Never auto-confirmed.
 */
router.post('/payments', asyncHandler(async (req, res) => {
  const i = Input.of(req);
  const { businessId } = await forBusiness(req, i.raw('businessId'), 'invoice', 'create');
  const amount = i.money('amount', { required: true })!;
  const invoiceId = i.id('invoiceId');
  let customerId = i.id('customerId');
  const clientSubscriptionId = i.id('clientSubscriptionId');
  await assertInBusiness('cRMCustomer', customerId, businessId, 'customerId');
  await assertInBusiness('clientSubscription', clientSubscriptionId, businessId, 'clientSubscriptionId');
  let currency = i.str('currency', { max: 3 }) ?? 'USD';
  if (invoiceId) {
    const inv = await prisma.invoice.findFirst({ where: { id: invoiceId, businessId } });
    if (!inv) throw new AppError('invoiceId was not found in this business', 404);
    if (['CANCELLED', 'DRAFT'].includes(inv.status)) throw new AppError(`Payments can't be recorded on a ${inv.status.toLowerCase()} invoice`, 409);
    const balance = dec(inv.total).sub(inv.amountPaid);
    if (amount.gt(balance) && i.bool('allowOverpayment') !== true) throw new AppError(`Amount is more than the outstanding balance (${balance.toFixed(2)})`, 400);
    customerId = customerId ?? inv.customerId ?? undefined;
    currency = inv.currency;
  }
  const status = i.oneOf('status', ['PAID', 'PENDING'] as const) ?? 'PAID';
  const reference = i.str('reference', { max: 120 });
  const actor = userId(req);
  try {
    const payment = await withNumber(
      (n) =>
        prisma.$transaction(async (tx) => {
          const p = await tx.payment.create({
            data: {
              businessId,
              invoiceId,
              customerId,
              clientSubscriptionId,
              amount,
              currency,
              status,
              method: i.str('method', { max: 50 }),
              reference,
              dueDate: i.date('dueDate'),
              notes: i.str('notes', { max: 2000 }),
              paidAt: status === 'PAID' ? i.date('paidAt') ?? new Date() : null,
              receiptNumber: status === 'PAID' ? `R-${String(n).padStart(6, '0')}` : null,
              recordedById: actor,
            },
          });
          if (status === 'PAID') await postPayment(tx, p.id, actor);
          return p;
        }),
      () => nextReceipt(businessId),
    );
    await audit(req, { action: 'payment.record', entityType: 'Payment', entityId: payment.id, businessId, metadata: { amount: amount.toFixed(2), status, invoiceId, reference } });
    if (status === 'PAID') await emitEvent(businessId, 'PAYMENT_RECEIVED', `payment:${payment.id}`, { paymentId: payment.id, customerId: customerId ?? '', amount: amount.toFixed(2), currency });
    return ok(res, payment, 201);
  } catch (e) {
    if ((e as { code?: string; meta?: any }).code === 'P2002' && String((e as any).meta?.target ?? '').includes('reference')) {
      throw new AppError('A payment with this transaction reference is already recorded', 409);
    }
    throw e;
  }
}));

/** Confirm a PENDING payment once the money has actually arrived. */
router.post('/payments/:id/confirm', asyncHandler(async (req, res) => {
  const { row, businessId, access } = await findFor(req, 'payment', req.params.id);
  const { assertCan } = await import('../access/scope');
  assertCan(access, businessId, 'invoice', 'write');
  if (row.status !== 'PENDING' || row.kind !== 'PAYMENT') throw new AppError('Only pending payments can be confirmed', 409);
  const actor = userId(req);
  const payment = await withNumber(
    (n) =>
      prisma.$transaction(async (tx) => {
        const r = await tx.payment.updateMany({ where: { id: row.id, status: 'PENDING' }, data: { status: 'PAID', paidAt: Input.of(req).date('paidAt') ?? new Date(), receiptNumber: `R-${String(n).padStart(6, '0')}` } });
        if (!r.count) throw new AppError('This payment was already confirmed', 409);
        await postPayment(tx, row.id, actor);
        return tx.payment.findUniqueOrThrow({ where: { id: row.id } });
      }),
    () => nextReceipt(businessId),
  );
  await audit(req, { action: 'payment.confirm', entityType: 'Payment', entityId: row.id, businessId });
  await emitEvent(businessId, 'PAYMENT_RECEIVED', `payment:${row.id}`, { paymentId: row.id, customerId: row.customerId ?? '', amount: dec(row.amount).toFixed(2), currency: row.currency });
  return ok(res, payment);
}));

router.post('/payments/:id/void', asyncHandler(async (req, res) => {
  const { row, businessId, access } = await findFor(req, 'payment', req.params.id);
  const { assertCan } = await import('../access/scope');
  assertCan(access, businessId, 'invoice', 'write');
  if (row.status !== 'PENDING') throw new AppError('Only pending payments can be voided; refund a paid payment instead', 409);
  const updated = await prisma.payment.update({ where: { id: row.id }, data: { status: 'CANCELLED' } });
  await audit(req, { action: 'payment.void', entityType: 'Payment', entityId: row.id, businessId, metadata: { reason: Input.of(req).str('reason', { max: 500 }) } });
  return ok(res, updated);
}));

/** Refund (full or partial) — needs approval rights (owner/admin/manager or finance approve). */
router.post('/payments/:id/refund', asyncHandler(async (req, res) => {
  const { row, businessId, access } = await findFor(req, 'payment', req.params.id);
  const { assertCan } = await import('../access/scope');
  assertCan(access, businessId, 'invoice', 'write', 'approve');
  if (row.kind !== 'PAYMENT' || !['PAID', 'PARTIALLY_PAID'].includes(row.status)) throw new AppError('Only paid payments can be refunded', 409);
  const i = Input.of(req);
  const refunded = await prisma.payment.aggregate({ where: { refundOfId: row.id, kind: 'REFUND', status: 'PAID' }, _sum: { amount: true } });
  const remaining = dec(row.amount).sub(refunded._sum.amount ?? 0);
  const amount = i.money('amount') ?? remaining;
  if (amount.gt(remaining)) throw new AppError(`At most ${remaining.toFixed(2)} can still be refunded`, 400);
  const reason = i.str('reason', { required: true, max: 1000 })!;
  const actor = userId(req);
  const refund = await prisma.$transaction(async (tx) => {
    const r = await tx.payment.create({
      data: {
        businessId,
        kind: 'REFUND',
        refundOfId: row.id,
        invoiceId: row.invoiceId,
        customerId: row.customerId,
        clientSubscriptionId: row.clientSubscriptionId,
        amount,
        currency: row.currency,
        status: 'PAID',
        method: i.str('method', { max: 50 }) ?? row.method,
        reference: i.str('reference', { max: 120 }),
        paidAt: new Date(),
        notes: reason,
        recordedById: actor,
      },
    });
    await postPayment(tx, r.id, actor);
    if (amount.eq(remaining)) await tx.payment.update({ where: { id: row.id }, data: { status: 'REFUNDED' } });
    return r;
  });
  await audit(req, { action: 'payment.refund', entityType: 'Payment', entityId: row.id, businessId, metadata: { refundId: refund.id, amount: amount.toFixed(2), reason } });
  return ok(res, refund, 201);
}));

/** Receipt data (the web app prints it; ?format=pdf returns a PDF). */
router.get('/payments/:id/receipt', asyncHandler(async (req, res) => {
  const { row } = await findFor(req, 'payment', req.params.id, 'read', {
    include: { business: { select: { name: true, phone: true, email: true, address: true } }, customer: { select: { name: true, phone: true, email: true } }, invoice: { select: { invoiceNumber: true, total: true, amountPaid: true } } },
  });
  if (row.status !== 'PAID' || !row.receiptNumber) throw new AppError('Receipts exist only for confirmed payments', 409);
  const receipt = {
    receiptNumber: row.receiptNumber,
    business: row.business,
    customer: row.customer,
    amount: money(row.amount),
    currency: row.currency,
    method: row.method,
    reference: row.reference,
    paidAt: row.paidAt,
    invoice: row.invoice ? { number: row.invoice.invoiceNumber, total: money(row.invoice.total), paid: money(row.invoice.amountPaid), balance: money(dec(row.invoice.total).sub(row.invoice.amountPaid)) } : null,
  };
  if (req.query.format === 'pdf') {
    const { receiptPdf } = await import('../services/documents');
    const pdf = await receiptPdf(receipt);
    res.setHeader('content-type', 'application/pdf');
    res.setHeader('content-disposition', `attachment; filename="${row.receiptNumber}.pdf"`);
    return res.send(pdf);
  }
  return ok(res, receipt);
}));

router.get('/payments-history', asyncHandler(async (req, res) => {
  const { businessId } = await forBusiness(req, req.query.businessId, 'payment', 'read');
  const { page, limit, skip } = pageOf(req);
  const where: Prisma.PaymentWhereInput = { businessId };
  if (typeof req.query.customerId === 'string') where.customerId = req.query.customerId;
  if (typeof req.query.status === 'string') where.status = req.query.status as any;
  const [items, total] = await Promise.all([
    prisma.payment.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit, include: { customer: { select: { id: true, name: true } }, invoice: { select: { invoiceNumber: true } } } }),
    prisma.payment.count({ where }),
  ]);
  return ok(res, items, 200, { meta: pageMeta(page, limit, total) });
}));

export default router;
