import { Prisma } from '@prisma/client';
import { prisma } from '../prisma';
import { dec, money } from '../lib/http';
import type { Report, Column } from './documents';

type Period = { from: Date; to: Date; label: string };
type Ctx = { businessId: string; businessName: string; period: Period; canFinance: boolean };
export type ReportResult = Report & { extra?: Record<string, unknown> };

const pct = (a: number, b: number) => (b ? Math.round((a / b) * 1000) / 10 : null);
const name = (u?: { firstName: string | null; lastName: string | null } | null) => (u ? [u.firstName, u.lastName].filter(Boolean).join(' ') : '');
const PROFIT_NOTE = 'Net profit is calculated from the income and expenses recorded in ABUUR; it is not audited accounting profit.';
const MAX_ROWS = 50_000;

/** Report type → the model the caller must be able to read. */
export const REPORT_TYPES: Record<string, { title: string; delegate: string }> = {
  financial: { title: 'Financial report (income & expenses by category)', delegate: 'financeTransaction' },
  transactions: { title: 'Revenue and expense transactions', delegate: 'financeTransaction' },
  payments: { title: 'Customer payments', delegate: 'invoice' },
  customers: { title: 'Customer report', delegate: 'cRMCustomer' },
  sales: { title: 'Lead and sales report', delegate: 'deal' },
  leads: { title: 'Lead list', delegate: 'lead' },
  contacts: { title: 'Marketing contacts', delegate: 'marketingContact' },
  subscriptions: { title: 'Subscription report', delegate: 'clientSubscription' },
  marketing: { title: 'Marketing campaign report', delegate: 'campaign' },
  'store-sales': { title: 'Store sales report', delegate: 'storeOrder' },
  inventory: { title: 'Inventory report', delegate: 'product' },
  creative: { title: 'Creative project report', delegate: 'creativeProject' },
  performance: { title: 'Business performance report', delegate: 'cRMCustomer' },
};

function base(ctx: Ctx, type: string, columns: Column[], rows: Record<string, unknown>[], summary: Report['summary'], notes: string[] = []): ReportResult {
  return { title: REPORT_TYPES[type].title, businessName: ctx.businessName, period: ctx.period, generatedAt: new Date(), columns, rows: rows.slice(0, MAX_ROWS), summary, notes: rows.length > MAX_ROWS ? [...notes, `Only the first ${MAX_ROWS} rows are included; narrow the date range.`] : notes };
}

/** Totals from finance transactions only (payments & paid orders post there once — no double counting). */
export async function financeTotals(businessId: string, from: Date, to: Date) {
  const rows = await prisma.financeTransaction.groupBy({ by: ['type'], where: { businessId, status: 'POSTED', transactionDate: { gte: from, lte: to } }, _sum: { amount: true } });
  const income = dec(rows.find((r) => r.type === 'INCOME')?._sum.amount ?? 0);
  const expenses = dec(rows.find((r) => r.type === 'EXPENSE')?._sum.amount ?? 0);
  return { income: money(income), expenses: money(expenses), netProfit: money(income.sub(expenses)) };
}

export async function outstandingBalance(businessId: string) {
  const invoices = await prisma.invoice.findMany({ where: { businessId, status: { in: ['SENT', 'PARTIALLY_PAID', 'OVERDUE'] } }, select: { total: true, amountPaid: true, dueDate: true } });
  const now = new Date();
  const bal = (i: { total: Prisma.Decimal; amountPaid: Prisma.Decimal }) => dec(i.total).sub(i.amountPaid);
  return {
    outstanding: money(invoices.reduce((a, i) => a.add(bal(i)), dec(0))),
    overdue: money(invoices.filter((i) => i.dueDate && i.dueDate < now).reduce((a, i) => a.add(bal(i)), dec(0))),
    openInvoices: invoices.length,
  };
}

/** Income/expense per month (or per day for ranges up to 62 days). */
export async function financeTrend(businessId: string, from: Date, to: Date) {
  const daily = to.getTime() - from.getTime() <= 62 * 86_400_000;
  const tx = await prisma.financeTransaction.findMany({ where: { businessId, status: 'POSTED', transactionDate: { gte: from, lte: to } }, select: { type: true, amount: true, transactionDate: true } });
  const buckets = new Map<string, { period: string; income: number; expenses: number }>();
  for (const t of tx) {
    const key = t.transactionDate.toISOString().slice(0, daily ? 10 : 7);
    const b = buckets.get(key) ?? { period: key, income: 0, expenses: 0 };
    if (t.type === 'INCOME') b.income += Number(t.amount);
    else b.expenses += Number(t.amount);
    buckets.set(key, b);
  }
  return [...buckets.values()].sort((a, b) => a.period.localeCompare(b.period)).map((b) => ({ ...b, income: money(b.income), expenses: money(b.expenses), net: money(b.income - b.expenses) }));
}

export async function buildReport(type: string, ctx: Ctx): Promise<ReportResult> {
  const { businessId, period } = ctx;
  const range = { gte: period.from, lte: period.to };
  switch (type) {
    case 'financial': {
      const totals = await financeTotals(businessId, period.from, period.to);
      const byCat = await prisma.financeTransaction.groupBy({ by: ['type', 'category'], where: { businessId, status: 'POSTED', transactionDate: range }, _sum: { amount: true }, _count: true, orderBy: { category: 'asc' } });
      const bal = await outstandingBalance(businessId);
      const trend = await financeTrend(businessId, period.from, period.to);
      return {
        ...base(ctx, type, [
          { key: 'type', label: 'Type' }, { key: 'category', label: 'Category' }, { key: 'count', label: 'Transactions', type: 'number' }, { key: 'amount', label: 'Amount', type: 'money' },
        ], byCat.map((r) => ({ type: r.type, category: r.category, count: r._count, amount: money(r._sum.amount) })), [
          { label: 'Total revenue', value: totals.income.toFixed(2) },
          { label: 'Total expenses', value: totals.expenses.toFixed(2) },
          { label: 'Net profit (calculated)', value: totals.netProfit.toFixed(2) },
          { label: 'Outstanding customer balances', value: bal.outstanding.toFixed(2) },
          { label: 'Overdue', value: bal.overdue.toFixed(2) },
        ], [PROFIT_NOTE, 'Business finance only — ABUUR platform subscription fees are not included.']),
        extra: { totals, trend, expenseBreakdown: byCat.filter((r) => r.type === 'EXPENSE').map((r) => ({ category: r.category, amount: money(r._sum.amount) })), outstanding: bal },
      };
    }
    case 'transactions': {
      const rows = await prisma.financeTransaction.findMany({ where: { businessId, transactionDate: range }, orderBy: { transactionDate: 'desc' }, take: MAX_ROWS + 1, include: { createdBy: { select: { firstName: true, lastName: true } } } });
      const totals = await financeTotals(businessId, period.from, period.to);
      return base(ctx, type, [
        { key: 'date', label: 'Date', type: 'date' }, { key: 'type', label: 'Type' }, { key: 'category', label: 'Category' }, { key: 'description', label: 'Description' },
        { key: 'amount', label: 'Amount', type: 'money' }, { key: 'currency', label: 'Currency' }, { key: 'method', label: 'Method' }, { key: 'reference', label: 'Reference' }, { key: 'status', label: 'Status' }, { key: 'source', label: 'Source' }, { key: 'by', label: 'Recorded by' },
      ], rows.map((t) => ({ date: t.transactionDate, type: t.type, category: t.category, description: t.description, amount: money(t.amount), currency: t.currency, method: t.paymentMethod, reference: t.reference, status: t.status, source: t.sourceType ?? 'MANUAL', by: name(t.createdBy) })), [
        { label: 'Total revenue', value: totals.income.toFixed(2) }, { label: 'Total expenses', value: totals.expenses.toFixed(2) }, { label: 'Net profit (calculated)', value: totals.netProfit.toFixed(2) },
      ], [PROFIT_NOTE]);
    }
    case 'payments': {
      const rows = await prisma.payment.findMany({ where: { businessId, createdAt: range }, orderBy: { createdAt: 'desc' }, take: MAX_ROWS + 1, include: { customer: { select: { name: true } }, invoice: { select: { invoiceNumber: true } } } });
      const paid = rows.filter((p) => p.kind === 'PAYMENT' && p.status !== 'CANCELLED' && p.status !== 'PENDING').reduce((a, p) => a + Number(p.amount), 0);
      const refunds = rows.filter((p) => p.kind === 'REFUND').reduce((a, p) => a + Number(p.amount), 0);
      const bal = await outstandingBalance(businessId);
      return base(ctx, type, [
        { key: 'date', label: 'Date', type: 'date' }, { key: 'receipt', label: 'Receipt' }, { key: 'customer', label: 'Customer' }, { key: 'invoice', label: 'Invoice' }, { key: 'kind', label: 'Kind' },
        { key: 'amount', label: 'Amount', type: 'money' }, { key: 'status', label: 'Status' }, { key: 'method', label: 'Method' }, { key: 'reference', label: 'Reference' },
      ], rows.map((p) => ({ date: p.paidAt ?? p.createdAt, receipt: p.receiptNumber, customer: p.customer?.name, invoice: p.invoice?.invoiceNumber, kind: p.kind, amount: money(p.amount), status: p.status, method: p.method, reference: p.reference })), [
        { label: 'Payments received', value: money(paid).toFixed(2) }, { label: 'Refunds', value: money(refunds).toFixed(2) }, { label: 'Pending payments', value: rows.filter((p) => p.status === 'PENDING').length },
        { label: 'Outstanding balances', value: bal.outstanding.toFixed(2) }, { label: 'Overdue', value: bal.overdue.toFixed(2) },
      ]);
    }
    case 'customers': {
      const rows = await prisma.cRMCustomer.findMany({ where: { businessId }, orderBy: { createdAt: 'desc' }, take: MAX_ROWS + 1, include: { accountManager: { select: { firstName: true, lastName: true } }, ...(ctx.canFinance ? { payments: { where: { status: 'PAID' }, select: { amount: true, kind: true } } } : {}) } });
      const newInRange = rows.filter((c) => c.createdAt >= period.from && c.createdAt <= period.to).length;
      return base(ctx, type, [
        { key: 'name', label: 'Name' }, { key: 'company', label: 'Company' }, { key: 'phone', label: 'Phone' }, { key: 'email', label: 'Email' }, { key: 'city', label: 'City' }, { key: 'status', label: 'Status' },
        { key: 'manager', label: 'Account manager' }, { key: 'created', label: 'Created', type: 'date' }, { key: 'archived', label: 'Archived' }, ...(ctx.canFinance ? [{ key: 'paid', label: 'Total paid', type: 'money' as const }] : []),
      ], rows.map((c: any) => ({ name: c.name, company: c.company, phone: c.phone, email: c.email, city: c.city, status: c.status, manager: name(c.accountManager), created: c.createdAt, archived: c.archivedAt ? 'yes' : '', paid: c.payments ? money(c.payments.reduce((a: number, p: any) => a + (p.kind === 'REFUND' ? -1 : 1) * Number(p.amount), 0)) : undefined })), [
        { label: 'Customers', value: rows.length }, { label: 'New in period', value: newInRange }, { label: 'Active', value: rows.filter((c) => c.status === 'ACTIVE').length },
      ]);
    }
    case 'sales': {
      const [leads, deals] = await Promise.all([
        prisma.lead.findMany({ where: { businessId, createdAt: range }, select: { status: true, source: true, convertedAt: true } }),
        prisma.deal.findMany({ where: { businessId, OR: [{ createdAt: range }, { closedAt: range }] }, orderBy: { createdAt: 'desc' }, include: { stage: { select: { name: true } }, owner: { select: { firstName: true, lastName: true } }, customer: { select: { name: true } } } }),
      ]);
      const converted = leads.filter((l) => l.status === 'WON').length;
      const won = deals.filter((d) => d.status === 'WON' && d.closedAt && d.closedAt >= period.from);
      const lost = deals.filter((d) => d.status === 'LOST' && d.closedAt && d.closedAt >= period.from);
      const bySource = Object.entries(leads.reduce<Record<string, number>>((a, l) => ((a[l.source ?? 'unknown'] = (a[l.source ?? 'unknown'] ?? 0) + 1), a), {}));
      return {
        ...base(ctx, type, [
          { key: 'title', label: 'Deal' }, { key: 'customer', label: 'Customer' }, { key: 'stage', label: 'Stage' }, { key: 'status', label: 'Status' }, { key: 'value', label: 'Value', type: 'money' },
          { key: 'owner', label: 'Owner' }, { key: 'expectedClose', label: 'Expected close', type: 'date' }, { key: 'closed', label: 'Closed', type: 'date' },
        ], deals.map((d) => ({ title: d.title, customer: d.customer?.name, stage: d.stage.name, status: d.status, value: money(d.value), owner: name(d.owner), expectedClose: d.expectedCloseDate, closed: d.closedAt })), [
          { label: 'New leads', value: leads.length }, { label: 'Converted leads', value: converted }, { label: 'Lead conversion rate', value: pct(converted, leads.filter((l) => ['WON', 'LOST'].includes(l.status)).length) !== null ? `${pct(converted, leads.filter((l) => ['WON', 'LOST'].includes(l.status)).length)}%` : 'n/a' },
          { label: 'Deals won', value: won.length }, { label: 'Won value', value: money(won.reduce((a, d) => a + Number(d.value), 0)).toFixed(2) }, { label: 'Deals lost', value: lost.length },
          { label: 'Win rate', value: won.length + lost.length ? `${pct(won.length, won.length + lost.length)}%` : 'n/a' },
        ]),
        extra: { leadsBySource: bySource.map(([source, count]) => ({ source, count })) },
      };
    }
    case 'subscriptions': {
      const [subs, events, payments] = await Promise.all([
        prisma.clientSubscription.findMany({ where: { businessId }, include: { customer: { select: { name: true } }, package: { select: { name: true, billing: true } } } }),
        prisma.clientSubscriptionEvent.findMany({ where: { subscription: { businessId }, createdAt: range }, select: { type: true } }),
        ctx.canFinance ? prisma.payment.findMany({ where: { businessId, status: { in: ['PAID', 'REFUNDED'] }, clientSubscriptionId: { not: null }, paidAt: range }, select: { amount: true, kind: true, clientSubscription: { select: { package: { select: { name: true } } } } } }) : Promise.resolve([]),
      ]);
      const count = (t: string) => events.filter((e) => e.type === t).length;
      const soon = new Date(Date.now() + 30 * 86_400_000);
      const mrr = subs.filter((s) => s.status === 'ACTIVE').reduce((a, s) => a + (s.package.billing === 'MONTHLY' ? Number(s.price) : s.package.billing === 'QUARTERLY' ? Number(s.price) / 3 : s.package.billing === 'YEARLY' ? Number(s.price) / 12 : 0), 0);
      const byPackage = Object.entries(payments.reduce<Record<string, number>>((a, p: any) => { const k = p.clientSubscription?.package?.name ?? 'Unknown'; a[k] = (a[k] ?? 0) + (p.kind === 'REFUND' ? -1 : 1) * Number(p.amount); return a; }, {})).map(([pkg, amount]) => ({ package: pkg, revenue: money(amount) }));
      return {
        ...base(ctx, type, [
          { key: 'customer', label: 'Customer' }, { key: 'package', label: 'Package' }, { key: 'billing', label: 'Billing' }, { key: 'status', label: 'Status' }, { key: 'price', label: 'Price', type: 'money' },
          { key: 'start', label: 'Start', type: 'date' }, { key: 'renewal', label: 'Renewal date', type: 'date' }, { key: 'renewals', label: 'Renewals', type: 'number' },
        ], subs.map((s) => ({ customer: s.customer.name, package: s.package.name, billing: s.package.billing, status: s.status, price: money(s.price), start: s.startDate, renewal: s.renewalDate, renewals: s.renewalCount })), [
          { label: 'Active subscriptions', value: subs.filter((s) => s.status === 'ACTIVE').length }, { label: 'New in period', value: count('CREATED') },
          { label: 'Expired in period', value: count('EXPIRED') }, { label: 'Cancelled in period', value: count('CANCELLED') },
          { label: 'Upcoming renewals (30 days)', value: subs.filter((s) => s.status === 'ACTIVE' && s.renewalDate && s.renewalDate <= soon).length },
          { label: 'Renewal success rate', value: count('RENEWED') + count('EXPIRED') ? `${pct(count('RENEWED'), count('RENEWED') + count('EXPIRED'))}%` : 'n/a' },
          { label: 'Monthly recurring revenue (active)', value: money(mrr).toFixed(2) },
        ], ['Subscriptions sold by this business to its customers — separate from ABUUR platform plans.']),
        extra: { revenueByPackage: ctx.canFinance ? byPackage : null },
      };
    }
    case 'marketing': {
      const campaigns = await prisma.campaign.findMany({ where: { businessId, createdAt: range }, orderBy: { createdAt: 'desc' }, include: { segment: { select: { name: true } } } });
      const sum = (k: 'totalRecipients' | 'sentCount' | 'deliveredCount' | 'readCount' | 'failedCount' | 'skippedCount') => campaigns.reduce((a, c) => a + c[k], 0);
      const sent = sum('sentCount');
      return base(ctx, type, [
        { key: 'name', label: 'Campaign' }, { key: 'channel', label: 'Channel' }, { key: 'segment', label: 'Segment' }, { key: 'status', label: 'Status' }, { key: 'recipients', label: 'Recipients', type: 'number' },
        { key: 'sent', label: 'Accepted by provider', type: 'number' }, { key: 'delivered', label: 'Delivered', type: 'number' }, { key: 'read', label: 'Read', type: 'number' }, { key: 'failed', label: 'Failed', type: 'number' },
        { key: 'skipped', label: 'Skipped (consent/opt-out)', type: 'number' }, { key: 'deliveryRate', label: 'Delivery rate', type: 'percent' }, { key: 'cost', label: 'Cost', type: 'money' }, { key: 'started', label: 'Started', type: 'date' },
      ], campaigns.map((c) => ({ name: c.name, channel: c.channel, segment: c.segment?.name ?? 'All contacts', status: c.status, recipients: c.totalRecipients, sent: c.sentCount, delivered: c.deliveredCount, read: c.readCount, failed: c.failedCount, skipped: c.skippedCount, deliveryRate: pct(c.deliveredCount, c.sentCount), cost: c.totalCost === null ? null : Number(c.totalCost), started: c.startedAt })), [
        { label: 'Campaigns', value: campaigns.length }, { label: 'Recipients', value: sum('totalRecipients') }, { label: 'Attempted', value: sent + sum('failedCount') },
        { label: 'Delivered (provider-confirmed)', value: sum('deliveredCount') }, { label: 'Failed', value: sum('failedCount') }, { label: 'Read (where supported)', value: sum('readCount') },
        { label: 'Delivery rate', value: sent ? `${pct(sum('deliveredCount'), sent)}%` : 'n/a' },
      ], ['Delivered/read come only from provider status events. No sales attribution is calculated: ABUUR has no reliable conversion tracking for messages.']);
    }
    case 'store-sales': {
      const orders = await prisma.storeOrder.findMany({ where: { store: { businessId }, createdAt: range }, include: { items: { include: { product: { select: { categoryId: true, costPrice: true, category: { select: { name: true } } } } } }, store: { select: { name: true } } } });
      const valid = orders.filter((o) => o.status !== 'CANCELLED');
      const gross = valid.reduce((a, o) => a + Number(o.total), 0);
      const returned = orders.filter((o) => o.status === 'RETURNED' || o.paymentStatus === 'REFUNDED');
      const net = gross - returned.reduce((a, o) => a + Number(o.total), 0);
      const products = new Map<string, { product: string; quantity: number; revenue: number; cost: number | null; category: string }>();
      const byDate = new Map<string, { date: string; orders: number; sales: number }>();
      for (const o of valid) {
        const d = o.createdAt.toISOString().slice(0, 10);
        const b = byDate.get(d) ?? { date: d, orders: 0, sales: 0 };
        b.orders++;
        b.sales += Number(o.total);
        byDate.set(d, b);
        for (const it of o.items) {
          const key = it.productId ?? it.productName;
          const p = products.get(key) ?? { product: it.productName, quantity: 0, revenue: 0, cost: 0, category: it.product?.category?.name ?? 'Uncategorised' };
          p.quantity += it.quantity;
          p.revenue += Number(it.total);
          const unitCost = it.wholesalePrice ?? it.product?.costPrice;
          p.cost = p.cost === null || unitCost == null ? null : p.cost + Number(unitCost) * it.quantity;
          products.set(key, p);
        }
      }
      const rows = [...products.values()].sort((a, b) => b.revenue - a.revenue).map((p) => ({ ...p, revenue: money(p.revenue), cost: ctx.canFinance && p.cost !== null ? money(p.cost) : null, margin: ctx.canFinance && p.cost !== null ? money(p.revenue - p.cost) : null }));
      const byCategory = Object.values(rows.reduce<Record<string, { category: string; revenue: number; quantity: number }>>((a, r) => { a[r.category] = a[r.category] ?? { category: r.category, revenue: 0, quantity: 0 }; a[r.category].revenue = money(a[r.category].revenue + r.revenue); a[r.category].quantity += r.quantity; return a; }, {}));
      const dropship = valid.flatMap((o) => o.items.filter((i) => i.supplierProductId));
      return {
        ...base(ctx, type, [
          { key: 'product', label: 'Product' }, { key: 'category', label: 'Category' }, { key: 'quantity', label: 'Units sold', type: 'number' }, { key: 'revenue', label: 'Revenue', type: 'money' },
          ...(ctx.canFinance ? [{ key: 'cost', label: 'Cost', type: 'money' as const }, { key: 'margin', label: 'Margin', type: 'money' as const }] : []),
        ], rows, [
          { label: 'Total orders', value: orders.length }, { label: 'Gross sales', value: money(gross).toFixed(2) }, { label: 'Net sales (minus returns/refunds)', value: money(net).toFixed(2) },
          { label: 'Paid orders', value: valid.filter((o) => o.paymentStatus === 'PAID').length }, { label: 'Unpaid orders', value: valid.filter((o) => ['PENDING', 'PARTIALLY_PAID'].includes(o.paymentStatus)).length },
          { label: 'Cancelled orders', value: orders.length - valid.length }, { label: 'Returned orders', value: orders.filter((o) => o.status === 'RETURNED').length },
          { label: 'Average order value', value: valid.length ? money(gross / valid.length).toFixed(2) : 'n/a' },
          { label: 'Dropshipped units', value: dropship.reduce((a, i) => a + i.quantity, 0) },
        ], ['Store sales are order values. Finance revenue counts only payments recorded on orders, once per order, so the two can differ.']),
        extra: { byDate: [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date)).map((b) => ({ ...b, sales: money(b.sales) })), byCategory, dropshipping: ctx.canFinance ? { units: dropship.reduce((a, i) => a + i.quantity, 0), revenue: money(dropship.reduce((a, i) => a + Number(i.total), 0)), wholesaleCost: money(dropship.reduce((a, i) => a + Number(i.wholesalePrice ?? 0) * i.quantity, 0)) } : null },
      };
    }
    case 'inventory': {
      const products = await prisma.product.findMany({ where: { store: { businessId } }, orderBy: { name: 'asc' }, include: { store: { select: { name: true } } } });
      const sold = await prisma.storeOrderItem.groupBy({ by: ['productId'], where: { order: { store: { businessId }, createdAt: range, status: { not: 'CANCELLED' } } }, _sum: { quantity: true } });
      const soldOf = (id: string) => sold.find((s) => s.productId === id)?._sum.quantity ?? 0;
      const rows = products.map((p) => ({
        product: p.name, sku: p.sku, store: p.store.name, status: p.status, stock: p.trackInventory ? p.stock : null, lowStockThreshold: p.lowStockThreshold,
        low: p.trackInventory && p.stock <= p.lowStockThreshold ? 'LOW' : '', soldInPeriod: soldOf(p.id), price: money(p.price),
        costPrice: ctx.canFinance && p.costPrice ? money(p.costPrice) : null, stockValueAtCost: ctx.canFinance && p.costPrice && p.trackInventory ? money(Number(p.costPrice) * Math.max(p.stock, 0)) : null,
      }));
      return base(ctx, type, [
        { key: 'product', label: 'Product' }, { key: 'sku', label: 'SKU' }, { key: 'store', label: 'Store' }, { key: 'status', label: 'Status' }, { key: 'stock', label: 'Stock', type: 'number' },
        { key: 'lowStockThreshold', label: 'Low-stock at', type: 'number' }, { key: 'low', label: 'Low stock' }, { key: 'soldInPeriod', label: 'Sold in period', type: 'number' }, { key: 'price', label: 'Price', type: 'money' },
        ...(ctx.canFinance ? [{ key: 'costPrice', label: 'Cost', type: 'money' as const }, { key: 'stockValueAtCost', label: 'Stock value (cost)', type: 'money' as const }] : []),
      ], rows, [
        { label: 'Products', value: products.length }, { label: 'Low-stock products', value: rows.filter((r) => r.low).length }, { label: 'Out of stock', value: products.filter((p) => p.trackInventory && p.stock <= 0).length },
        ...(ctx.canFinance ? [{ label: 'Stock value at cost', value: money(rows.reduce((a, r) => a + (r.stockValueAtCost ?? 0), 0)).toFixed(2) }] : []),
      ]);
    }
    case 'creative': {
      const projects = await prisma.creativeProject.findMany({ where: { businessId, OR: [{ createdAt: range }, { status: { notIn: ['COMPLETED', 'CANCELLED'] } }, { completedAt: range }] }, include: { tasks: { select: { status: true } }, deliverables: { select: { status: true } }, manager: { select: { firstName: true, lastName: true } }, customer: { select: { name: true } } } });
      const now = new Date();
      const rows = projects.map((p) => ({
        title: p.title, customer: p.customer?.name, manager: name(p.manager), status: p.status, stage: p.stage, deadline: p.deadline,
        overdue: p.deadline && p.deadline < now && !['COMPLETED', 'CANCELLED'].includes(p.status) ? 'yes' : '',
        tasks: `${p.tasks.filter((t) => t.status === 'COMPLETED').length}/${p.tasks.length}`, revisions: p.revisionCount, delivered: p.deliverables.filter((d) => d.status === 'DELIVERED').length, completed: p.completedAt,
      }));
      return base(ctx, type, [
        { key: 'title', label: 'Project' }, { key: 'customer', label: 'Customer' }, { key: 'manager', label: 'Manager' }, { key: 'status', label: 'Status' }, { key: 'stage', label: 'Stage' },
        { key: 'deadline', label: 'Deadline', type: 'date' }, { key: 'overdue', label: 'Overdue' }, { key: 'tasks', label: 'Tasks done' }, { key: 'revisions', label: 'Revisions', type: 'number' }, { key: 'delivered', label: 'Delivered files', type: 'number' }, { key: 'completed', label: 'Completed', type: 'date' },
      ], rows, [
        { label: 'Projects', value: projects.length }, { label: 'Completed in period', value: projects.filter((p) => p.completedAt && p.completedAt >= period.from && p.completedAt <= period.to).length },
        { label: 'In progress', value: projects.filter((p) => !['COMPLETED', 'CANCELLED'].includes(p.status)).length }, { label: 'Overdue', value: rows.filter((r) => r.overdue).length },
        { label: 'Average revisions', value: projects.length ? Math.round((projects.reduce((a, p) => a + p.revisionCount, 0) / projects.length) * 10) / 10 : 0 },
      ]);
    }
    case 'leads': {
      const rows = await prisma.lead.findMany({ where: { businessId, createdAt: range }, orderBy: { createdAt: 'desc' }, take: MAX_ROWS + 1, include: { assignedTo: { select: { firstName: true, lastName: true } }, customer: { select: { name: true } } } });
      return base(ctx, type, [
        { key: 'title', label: 'Lead' }, { key: 'contact', label: 'Contact' }, { key: 'phone', label: 'Phone' }, { key: 'email', label: 'Email' }, { key: 'source', label: 'Source' },
        { key: 'interest', label: 'Interest' }, { key: 'status', label: 'Status' }, { key: 'priority', label: 'Priority', type: 'number' }, { key: 'value', label: 'Value', type: 'money' },
        { key: 'assigned', label: 'Assigned to' }, { key: 'customer', label: 'Customer' }, { key: 'created', label: 'Created', type: 'date' }, { key: 'converted', label: 'Converted', type: 'date' },
      ], rows.map((l) => ({ title: l.title, contact: l.contactName, phone: l.contactPhone, email: l.contactEmail, source: l.source, interest: l.interest, status: l.status, priority: l.priority, value: l.value === null ? null : money(l.value), assigned: name(l.assignedTo), customer: l.customer?.name, created: l.createdAt, converted: l.convertedAt })), [
        { label: 'Leads', value: rows.length }, { label: 'Converted', value: rows.filter((l) => l.status === 'WON').length }, { label: 'Lost', value: rows.filter((l) => l.status === 'LOST').length },
      ]);
    }
    case 'contacts': {
      const rows = await prisma.marketingContact.findMany({ where: { businessId }, orderBy: { createdAt: 'desc' }, take: MAX_ROWS + 1 });
      return base(ctx, type, [
        { key: 'name', label: 'Name' }, { key: 'phone', label: 'Phone' }, { key: 'email', label: 'Email' }, { key: 'city', label: 'City' }, { key: 'tags', label: 'Tags' }, { key: 'source', label: 'Source' },
        { key: 'whatsapp', label: 'WhatsApp consent' }, { key: 'sms', label: 'SMS consent' }, { key: 'optedOut', label: 'Opted out', type: 'date' }, { key: 'created', label: 'Added', type: 'date' },
      ], rows.map((c) => ({ name: c.name, phone: c.phone, email: c.email, city: c.city, tags: c.tags.join('; '), source: c.source, whatsapp: c.whatsappConsent ? 'yes' : 'no', sms: c.smsConsent ? 'yes' : 'no', optedOut: c.optedOutAt, created: c.createdAt })), [
        { label: 'Contacts', value: rows.length }, { label: 'WhatsApp consent', value: rows.filter((c) => c.whatsappConsent).length }, { label: 'Opted out', value: rows.filter((c) => c.optedOutAt).length },
      ], ['Consent evidence for each contact is kept in the consent history.']);
    }
    case 'performance': {
      // One row per metric, each from the module's own records (finance only when permitted).
      const rows: { area: string; metric: string; value: string | number | null }[] = [];
      const add = (area: string, metric: string, value: string | number | null) => rows.push({ area, metric, value });
      if (ctx.canFinance) {
        const t = await financeTotals(businessId, period.from, period.to);
        const o = await outstandingBalance(businessId);
        add('Finance', 'Total revenue', t.income.toFixed(2));
        add('Finance', 'Total expenses', t.expenses.toFixed(2));
        add('Finance', 'Net profit (calculated)', t.netProfit.toFixed(2));
        add('Finance', 'Outstanding payments', o.outstanding.toFixed(2));
      }
      const [customers, newCustomers, leads, converted, activeSubs, projectsDone, projectsOpen, campaigns, orders] = await Promise.all([
        prisma.cRMCustomer.count({ where: { businessId, archivedAt: null } }),
        prisma.cRMCustomer.count({ where: { businessId, createdAt: range } }),
        prisma.lead.count({ where: { businessId, createdAt: range } }),
        prisma.lead.count({ where: { businessId, convertedAt: range } }),
        prisma.clientSubscription.count({ where: { businessId, status: 'ACTIVE' } }),
        prisma.creativeProject.count({ where: { businessId, completedAt: range } }),
        prisma.creativeProject.count({ where: { businessId, status: { notIn: ['COMPLETED', 'CANCELLED'] } } }),
        prisma.campaign.aggregate({ where: { businessId, createdAt: range }, _count: true, _sum: { sentCount: true, deliveredCount: true } }),
        prisma.storeOrder.findMany({ where: { store: { businessId }, createdAt: range, status: { not: 'CANCELLED' } }, select: { total: true } }),
      ]);
      add('Customers', 'Total customers', customers);
      add('Customers', 'New customers', newCustomers);
      add('Sales', 'New leads', leads);
      add('Sales', 'Converted leads', converted);
      add('Subscriptions', 'Active subscriptions', activeSubs);
      add('Creative', 'Projects completed', projectsDone);
      add('Creative', 'Projects in progress', projectsOpen);
      add('Marketing', 'Campaigns', campaigns._count);
      add('Marketing', 'Delivery rate', campaigns._sum.sentCount ? `${pct(campaigns._sum.deliveredCount ?? 0, campaigns._sum.sentCount)}%` : 'n/a');
      add('Store', 'Orders (not cancelled)', orders.length);
      add('Store', 'Gross sales', money(orders.reduce((a, o) => a + Number(o.total), 0)).toFixed(2));
      return base(ctx, type, [{ key: 'area', label: 'Area' }, { key: 'metric', label: 'Metric' }, { key: 'value', label: 'Value' }], rows,
        rows.slice(0, 6).map((r) => ({ label: r.metric, value: r.value })), ctx.canFinance ? [PROFIT_NOTE] : ['Finance figures are hidden for your role.']);
    }
    default:
      throw new Error(`Unknown report ${type}`);
  }
}
