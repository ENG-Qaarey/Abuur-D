import { Router } from 'express';
import { prisma } from '../prisma';
import { authedRouter } from '../lib/router';
import { authenticate } from '../middleware/auth';
import { AppError, asyncHandler } from '../middleware/error';
import { ok, Input, userId, rangeOf, dec, money } from '../lib/http';
import { findFor, forBusiness, assertInBusiness, canRead } from '../lib/guard';
import { audit } from '../lib/audit';
import { accessOf, assertCan } from '../access/scope';
import { createCrudRouter } from '../lib/crud';
import { addPeriod } from './billing';
import { buildReport, financeTotals, financeTrend, outstandingBalance, REPORT_TYPES } from '../services/reports';
import { toCsv, toPdf, toXlsx } from '../services/documents';
import { rateLimit } from '../middleware/rate-limit';

/**
 * Business finance (the business's own money — never ABUUR platform billing), reports and the
 * business performance dashboard.
 */
const router = authedRouter();
const txCrud = createCrudRouter({ model: 'financeTransaction', searchableFields: ['category', 'description', 'reference'] });

// ---------------------------------------------------------------- transactions

router.post('/finance-transactions', asyncHandler(async (req, res) => {
  const i = Input.of(req);
  const { businessId } = await forBusiness(req, i.raw('businessId'), 'financeTransaction', 'create');
  const type = i.oneOf('type', ['INCOME', 'EXPENSE'] as const, true)!;
  let category = i.str('category', { max: 100 });
  const categoryId = i.id('categoryId');
  if (categoryId) {
    const c = await prisma.financialCategory.findFirst({ where: { id: categoryId, businessId } });
    if (!c) throw new AppError('categoryId was not found in this business', 404);
    if (c.type !== type) throw new AppError(`Category "${c.name}" is for ${c.type.toLowerCase()}`, 400);
    category = c.name;
  }
  if (!category) throw new AppError('category or categoryId is required', 400);
  const receiptFileId = i.id('receiptFileId');
  await assertInBusiness('fileAsset', receiptFileId, businessId, 'receiptFileId');
  const isRecurring = i.bool('isRecurring') ?? false;
  const recurrenceInterval = i.oneOf('recurrenceInterval', ['MONTHLY', 'QUARTERLY', 'YEARLY'] as const);
  if (isRecurring && !recurrenceInterval) throw new AppError('recurrenceInterval is required for recurring transactions', 400);
  const transactionDate = i.date('transactionDate') ?? new Date();
  const reference = i.str('reference', { max: 120 });
  if (reference) {
    const dup = await prisma.financeTransaction.findFirst({ where: { businessId, reference, type, status: 'POSTED' }, select: { id: true } });
    if (dup && i.bool('allowDuplicateReference') !== true) throw new AppError('A transaction with this reference already exists', 409);
  }
  const tx = await prisma.financeTransaction.create({
    data: {
      businessId, type, category, categoryId, receiptFileId, isRecurring, transactionDate, reference,
      recurrenceInterval: isRecurring ? recurrenceInterval : null,
      nextOccurrenceAt: isRecurring ? addPeriod(transactionDate, recurrenceInterval!) : null,
      amount: i.money('amount', { required: true })!,
      currency: i.str('currency', { max: 3 }) ?? 'USD',
      description: i.str('description', { max: 1000 }),
      paymentMethod: i.str('paymentMethod', { max: 50 }),
      createdById: userId(req),
    },
  });
  await audit(req, { action: 'finance.create', entityType: 'FinanceTransaction', entityId: tx.id, businessId, metadata: { type, amount: dec(tx.amount).toFixed(2), category } });
  return ok(res, tx, 201);
}));

async function editable(req: any) {
  const { row } = await findFor(req, 'financeTransaction', req.params.id, 'write');
  if (row.sourceType) throw new AppError(`This entry was created automatically (${row.sourceType}); correct the payment or order, or reverse it`, 409);
  if (row.reversalOfId) throw new AppError('Reversal entries cannot be edited', 409);
}
router.put('/finance-transactions/:id', asyncHandler(async (req, res, next) => { await editable(req); return txCrud.update(req, res, next); }));
router.patch('/finance-transactions/:id', asyncHandler(async (req, res, next) => { await editable(req); return txCrud.update(req, res, next); }));
router.delete('/finance-transactions/:id', asyncHandler(async (req, res, next) => {
  const { row } = await findFor(req, 'financeTransaction', req.params.id, 'remove');
  if (row.sourceType || row.reversalOfId) throw new AppError('Automatic and reversal entries cannot be deleted; reverse instead', 409);
  return txCrud.remove(req, res, next);
}));

/** Reverse a posted transaction: adds an opposite entry (the original stays for the audit trail). */
router.post('/finance-transactions/:id/reverse', asyncHandler(async (req, res) => {
  const { row, businessId } = await findFor(req, 'financeTransaction', req.params.id, 'write', { action: 'approve' });
  if (row.reversalOfId) throw new AppError('A reversal cannot be reversed', 409);
  const existing = await prisma.financeTransaction.findUnique({ where: { reversalOfId: row.id } });
  if (existing) throw new AppError('This transaction is already reversed', 409);
  const reason = Input.of(req).str('reason', { required: true, max: 500 })!;
  const rev = await prisma.financeTransaction.create({
    data: {
      businessId, type: row.type, category: row.category, categoryId: row.categoryId, amount: dec(row.amount).neg(), currency: row.currency,
      description: `Reversal: ${reason}`, reference: row.reference, paymentMethod: row.paymentMethod, reversalOfId: row.id, createdById: userId(req),
    },
  });
  if (row.isRecurring) await prisma.financeTransaction.update({ where: { id: row.id }, data: { isRecurring: false, nextOccurrenceAt: null } });
  await audit(req, { action: 'finance.reverse', entityType: 'FinanceTransaction', entityId: row.id, businessId, metadata: { reversalId: rev.id, reason } });
  return ok(res, rev, 201);
}));

router.post('/financial-categories/defaults', asyncHandler(async (req, res) => {
  const { businessId } = await forBusiness(req, Input.of(req).raw('businessId'), 'financialCategory', 'create');
  const defaults = [
    ...['Customer payments', 'Store sales', 'Services', 'Other income', 'Refunds'].map((name) => ({ name, type: 'INCOME' as const })),
    ...['Rent', 'Salaries', 'Marketing & ads', 'Inventory & supplies', 'Utilities', 'Transport & delivery', 'Software & subscriptions', 'Taxes & fees', 'Other expenses'].map((name) => ({ name, type: 'EXPENSE' as const })),
  ];
  const r = await prisma.financialCategory.createMany({ data: defaults.map((d) => ({ ...d, businessId })), skipDuplicates: true });
  return ok(res, { created: r.count, categories: await prisma.financialCategory.findMany({ where: { businessId }, orderBy: [{ type: 'asc' }, { name: 'asc' }] }) });
}));

/** Totals, trend, expense breakdown and outstanding balances for a period. */
router.get('/finance/summary', asyncHandler(async (req, res) => {
  const { businessId } = await forBusiness(req, req.query.businessId, 'financeTransaction', 'read');
  const { from, to, label } = rangeOf(req);
  const [totals, trend, byCategory, outstanding, recurring] = await Promise.all([
    financeTotals(businessId, from, to),
    financeTrend(businessId, from, to),
    prisma.financeTransaction.groupBy({ by: ['type', 'category'], where: { businessId, status: 'POSTED', transactionDate: { gte: from, lte: to } }, _sum: { amount: true } }),
    outstandingBalance(businessId),
    prisma.financeTransaction.findMany({ where: { businessId, isRecurring: true }, select: { id: true, type: true, category: true, amount: true, recurrenceInterval: true, nextOccurrenceAt: true } }),
  ]);
  return ok(res, {
    period: { from, to, label },
    ...totals,
    netProfitNote: 'Calculated from recorded income and expenses; not audited accounting profit.',
    outstanding,
    trend,
    revenueByCategory: byCategory.filter((r) => r.type === 'INCOME').map((r) => ({ category: r.category, amount: money(r._sum.amount) })),
    expenseBreakdown: byCategory.filter((r) => r.type === 'EXPENSE').map((r) => ({ category: r.category, amount: money(r._sum.amount) })),
    recurring,
  });
}));

// ---------------------------------------------------------------- reports

async function reportFor(req: any) {
  const type = String(req.params.type);
  const def = REPORT_TYPES[type];
  if (!def) throw new AppError(`Unknown report. Available: ${Object.keys(REPORT_TYPES).join(', ')}`, 404);
  const { access, businessId } = await forBusiness(req, req.query.businessId, def.delegate, 'read');
  const business = await prisma.business.findUniqueOrThrow({ where: { id: businessId }, select: { name: true } });
  const period = rangeOf(req);
  const report = await buildReport(type, { businessId, businessName: business.name, period, canFinance: canRead(access, businessId, 'financeTransaction') });
  return { type, report, access, businessId, period };
}

router.get('/reports/types', (_req, res) => ok(res, Object.entries(REPORT_TYPES).map(([type, d]) => ({ type, title: d.title }))));

/** Preview (JSON). */
router.get('/reports/:type', asyncHandler(async (req, res) => {
  const { report } = await reportFor(req);
  return ok(res, { ...report, rows: report.rows.slice(0, Number(req.query.previewRows ?? 200) || 200), totalRows: report.rows.length });
}));

/** Export as csv | xlsx | pdf (needs export permission). Every export is recorded. */
router.get('/reports/:type/export', rateLimit({ windowMs: 60_000, max: 20 }), asyncHandler(async (req, res) => {
  const format = String(req.query.format ?? 'csv').toUpperCase();
  if (!['CSV', 'XLSX', 'PDF'].includes(format)) throw new AppError('format must be csv, xlsx or pdf', 400);
  const def = REPORT_TYPES[String(req.params.type)];
  if (!def) throw new AppError('Unknown report', 404);
  const access = await accessOf(req);
  assertCan(access, String(req.query.businessId ?? ''), 'reportExport', 'read', 'export');
  const record = await prisma.reportExport.create({
    data: { businessId: String(req.query.businessId), createdById: userId(req), reportType: String(req.params.type), format: format as any, params: { ...req.query } as any, status: 'PROCESSING' },
  });
  try {
    const { type, report } = await reportFor(req);
    const file = format === 'CSV' ? toCsv(report) : format === 'XLSX' ? await toXlsx(report) : await toPdf(report);
    await prisma.reportExport.update({ where: { id: record.id }, data: { status: 'COMPLETED', rowCount: report.rows.length, completedAt: new Date() } });
    await audit(req, { action: 'report.export', entityType: 'ReportExport', entityId: record.id, businessId: record.businessId, metadata: { type, format, rows: report.rows.length } });
    const ext = format.toLowerCase();
    const mime = format === 'CSV' ? 'text/csv; charset=utf-8' : format === 'XLSX' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'application/pdf';
    res.setHeader('content-type', mime);
    res.setHeader('content-disposition', `attachment; filename="abuur-${type}-${report.period.from.toISOString().slice(0, 10)}-${report.period.to.toISOString().slice(0, 10)}.${ext}"`);
    res.setHeader('cache-control', 'private, no-store');
    return res.send(file);
  } catch (e) {
    await prisma.reportExport.update({ where: { id: record.id }, data: { status: 'FAILED', error: (e as Error).message.slice(0, 500), completedAt: new Date() } });
    throw e;
  }
}));

// ---------------------------------------------------------------- business performance dashboard

/** One overview across all modules; sections the caller's role can't read are null. */
router.get('/dashboard/overview', asyncHandler(async (req, res) => {
  const { access, businessId } = await forBusiness(req, req.query.businessId, 'cRMCustomer', 'read').catch(async (e) => {
    // Members without CRM access still get the sections they are allowed to see.
    if ((e as AppError).statusCode !== 403) throw e;
    const a = await accessOf(req);
    return { access: a, businessId: String(req.query.businessId) };
  });
  const { from, to, label } = rangeOf(req);
  const range = { gte: from, lte: to };
  const can = (d: string) => canRead(access, businessId, d);
  const prevFrom = new Date(from.getTime() - (to.getTime() - from.getTime()));
  const soon = new Date(Date.now() + 14 * 86_400_000);

  const [finance, customers, leads, subs, creative, marketing, store, tasks, renewals, activity] = await Promise.all([
    can('financeTransaction') ? Promise.all([financeTotals(businessId, from, to), outstandingBalance(businessId)]).then(([t, o]) => ({ ...t, outstanding: o.outstanding, overdue: o.overdue, note: 'Calculated from recorded transactions; not audited accounting profit.' })) : null,
    can('cRMCustomer') ? Promise.all([
      prisma.cRMCustomer.count({ where: { businessId, archivedAt: null } }),
      prisma.cRMCustomer.count({ where: { businessId, createdAt: range } }),
      prisma.cRMCustomer.count({ where: { businessId, createdAt: { gte: prevFrom, lt: from } } }),
    ]).then(([total, added, prev]) => ({ total, new: added, previousPeriodNew: prev, growthPercent: prev ? Math.round(((added - prev) / prev) * 1000) / 10 : null })) : null,
    can('lead') ? Promise.all([
      prisma.lead.count({ where: { businessId, createdAt: range } }),
      prisma.lead.count({ where: { businessId, convertedAt: range } }),
      prisma.lead.count({ where: { businessId, createdAt: range, status: { in: ['WON', 'LOST'] } } }),
    ]).then(([created, converted, decided]) => ({ new: created, converted, conversionRate: decided ? Math.round((converted / decided) * 1000) / 10 : null })) : null,
    can('clientSubscription') ? prisma.clientSubscription.count({ where: { businessId, status: 'ACTIVE' } }).then((active) => ({ active })) : null,
    can('creativeProject') ? prisma.creativeProject.groupBy({ by: ['status'], where: { businessId }, _count: true }).then(async (g) => ({
      byStatus: Object.fromEntries(g.map((x) => [x.status, x._count])),
      overdue: await prisma.creativeProject.count({ where: { businessId, deadline: { lt: new Date() }, status: { notIn: ['COMPLETED', 'CANCELLED'] } } }),
      completedInPeriod: await prisma.creativeProject.count({ where: { businessId, completedAt: range } }),
    })) : null,
    can('campaign') ? prisma.campaign.aggregate({ where: { businessId, createdAt: range }, _count: true, _sum: { sentCount: true, deliveredCount: true, failedCount: true, readCount: true } }).then((a) => ({
      campaigns: a._count, accepted: a._sum.sentCount ?? 0, delivered: a._sum.deliveredCount ?? 0, failed: a._sum.failedCount ?? 0, read: a._sum.readCount ?? 0,
      deliveryRate: a._sum.sentCount ? Math.round(((a._sum.deliveredCount ?? 0) / a._sum.sentCount) * 1000) / 10 : null,
    })) : null,
    can('storeOrder') ? prisma.storeOrder.findMany({ where: { store: { businessId }, createdAt: range }, select: { total: true, status: true, paymentStatus: true } }).then((orders) => {
      const valid = orders.filter((o) => o.status !== 'CANCELLED');
      const gross = valid.reduce((a, o) => a + Number(o.total), 0);
      return { orders: orders.length, grossSales: money(gross), paidOrders: valid.filter((o) => o.paymentStatus === 'PAID').length, averageOrderValue: valid.length ? money(gross / valid.length) : null };
    }) : null,
    can('crmTask') ? prisma.crmTask.findMany({ where: { businessId, status: { in: ['TODO', 'IN_PROGRESS'] }, dueAt: { lte: soon } }, orderBy: { dueAt: 'asc' }, take: 10, select: { id: true, title: true, dueAt: true, assignedToId: true } }) : null,
    can('clientSubscription') ? prisma.clientSubscription.findMany({ where: { businessId, status: 'ACTIVE', renewalDate: { lte: soon } }, orderBy: { renewalDate: 'asc' }, take: 10, include: { customer: { select: { name: true } }, package: { select: { name: true } } } }) : null,
    prisma.auditLog.findMany({ where: { businessId, createdAt: range }, orderBy: { createdAt: 'desc' }, take: 15, select: { action: true, entityType: true, createdAt: true, user: { select: { firstName: true, lastName: true } } } }),
  ]);
  const finTrend = can('financeTransaction') ? await financeTrend(businessId, from, to) : null;
  return ok(res, { period: { from, to, label }, finance, revenueTrend: finTrend, customers, leads, subscriptions: subs, creative, marketing, store, upcomingTasks: tasks, upcomingRenewals: renewals, recentActivity: activity });
}));

export default router;
