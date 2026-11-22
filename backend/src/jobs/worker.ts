import { prisma } from '../prisma';
import { processCampaigns } from '../services/campaigns';
import { runDueExecutions, emitEvent } from '../services/automation';
import { notifyBusiness, notifyUsers } from '../lib/notify';
import { addPeriod } from '../modules/billing';

/**
 * Background jobs, run by the API process on timers (never by a browser). Every job is safe to run
 * twice or on several servers at once: work is claimed with conditional updates or unique keys.
 *   every 15s: campaigns (start due ones, send a batch), automation executions
 *   every 10m: overdue invoices, renewal reminders, subscription expiry, recurring transactions,
 *              CRM task reminders; daily: customer inactivity
 */

/** Invoices past due → OVERDUE + PAYMENT_OVERDUE event (once per invoice). */
export async function markOverdueInvoices() {
  const due = await prisma.invoice.findMany({ where: { status: { in: ['SENT', 'PARTIALLY_PAID'] }, dueDate: { lt: new Date() } }, include: { customer: { select: { name: true, phone: true } } } });
  for (const inv of due) {
    const r = await prisma.invoice.updateMany({ where: { id: inv.id, status: inv.status }, data: { status: 'OVERDUE' } });
    if (!r.count) continue;
    const balance = Number(inv.total) - Number(inv.amountPaid);
    await notifyBusiness(inv.businessId, { title: `Invoice ${inv.invoiceNumber} is overdue`, message: `${inv.customer?.name ?? 'Customer'} owes ${balance.toFixed(2)} ${inv.currency}`, type: 'PAYMENT', actionUrl: `/finance/invoices/${inv.id}` }, ['OWNER', 'ADMIN', 'MANAGER', 'ACCOUNTANT']);
    await emitEvent(inv.businessId, 'PAYMENT_OVERDUE', `invoice:${inv.id}:overdue`, { invoiceId: inv.id, invoiceNumber: inv.invoiceNumber, customerId: inv.customerId ?? '', name: inv.customer?.name ?? '', phone: inv.customer?.phone ?? '', amount: balance.toFixed(2), currency: inv.currency });
  }
  return due.length;
}

/** Renewal reminders 7 days ahead (once per period) and expiry after a 7-day grace period. */
export async function subscriptionJobs() {
  const now = Date.now();
  const soon = await prisma.clientSubscription.findMany({
    where: { status: 'ACTIVE', renewalDate: { gte: new Date(now), lte: new Date(now + 7 * 86_400_000) }, remindedAt: null },
    include: { customer: { select: { name: true, phone: true } }, package: { select: { name: true } } },
  });
  for (const s of soon) {
    const r = await prisma.clientSubscription.updateMany({ where: { id: s.id, remindedAt: null }, data: { remindedAt: new Date() } });
    if (!r.count) continue;
    await prisma.clientSubscriptionEvent.create({ data: { subscriptionId: s.id, type: 'REMINDER_SENT', note: `Renewal due ${s.renewalDate!.toISOString().slice(0, 10)}` } });
    await notifyBusiness(s.businessId, { title: 'Renewal coming up', message: `${s.customer.name} · ${s.package.name} renews on ${s.renewalDate!.toISOString().slice(0, 10)}`, type: 'SUBSCRIPTION' });
    await emitEvent(s.businessId, 'CLIENT_RENEWAL_DUE', `sub:${s.id}:${s.renewalDate!.toISOString().slice(0, 10)}`, { subscriptionId: s.id, customerId: s.customerId, name: s.customer.name, phone: s.customer.phone ?? '', package: s.package.name, renewalDate: s.renewalDate!.toISOString().slice(0, 10), price: String(s.price) });
  }
  const lapsed = await prisma.clientSubscription.findMany({ where: { status: { in: ['ACTIVE', 'PAUSED'] }, renewalDate: { lt: new Date(now - 7 * 86_400_000) } }, include: { customer: { select: { name: true, phone: true } }, package: { select: { name: true } } } });
  for (const s of lapsed) {
    const r = await prisma.clientSubscription.updateMany({ where: { id: s.id, status: s.status }, data: { status: 'EXPIRED', endDate: s.renewalDate } });
    if (!r.count) continue;
    await prisma.clientSubscriptionEvent.create({ data: { subscriptionId: s.id, type: 'EXPIRED', note: 'Not renewed within 7 days of the renewal date' } });
    await notifyBusiness(s.businessId, { title: 'Subscription expired', message: `${s.customer.name} · ${s.package.name}`, type: 'SUBSCRIPTION' });
    await emitEvent(s.businessId, 'SUBSCRIPTION_EXPIRED', `sub:${s.id}:expired:${s.renewalDate!.toISOString().slice(0, 10)}`, { subscriptionId: s.id, customerId: s.customerId, name: s.customer.name, phone: s.customer.phone ?? '', package: s.package.name });
  }
  return soon.length + lapsed.length;
}

/** Recurring expenses/income: posts each occurrence once (unique RECURRING source key). */
export async function recurringTransactions() {
  const due = await prisma.financeTransaction.findMany({ where: { isRecurring: true, status: 'POSTED', nextOccurrenceAt: { lte: new Date() } } });
  for (const t of due) {
    let next = t.nextOccurrenceAt!;
    for (let guard = 0; next <= new Date() && guard < 24; guard++) {
      try {
        await prisma.financeTransaction.create({
          data: { businessId: t.businessId, type: t.type, category: t.category, categoryId: t.categoryId, amount: t.amount, currency: t.currency, description: t.description, paymentMethod: t.paymentMethod, transactionDate: next, sourceType: 'RECURRING', sourceId: `${t.id}:${next.toISOString().slice(0, 10)}`, createdById: t.createdById },
        });
      } catch (e) {
        if ((e as { code?: string }).code !== 'P2002') throw e; // already posted by another run
      }
      next = addPeriod(next, t.recurrenceInterval!)!;
    }
    await prisma.financeTransaction.update({ where: { id: t.id }, data: { nextOccurrenceAt: next } });
  }
  return due.length;
}

/** Tells assignees about CRM follow-ups that are due (once per task). */
export async function taskReminders() {
  const due = await prisma.crmTask.findMany({ where: { status: { in: ['TODO', 'IN_PROGRESS'] }, dueAt: { lte: new Date(Date.now() + 60 * 60_000) }, remindedAt: null }, take: 500 });
  for (const t of due) {
    const r = await prisma.crmTask.updateMany({ where: { id: t.id, remindedAt: null }, data: { remindedAt: new Date() } });
    if (!r.count) continue;
    if (t.assignedToId) await notifyUsers([t.assignedToId], { title: 'Follow-up due', message: t.title, type: 'WARNING', actionUrl: `/dashboard/crm/tasks/${t.id}` });
    else await notifyBusiness(t.businessId, { title: 'Unassigned follow-up due', message: t.title, type: 'WARNING' });
  }
  return due.length;
}

/** CUSTOMER_INACTIVE for customers with no communication, order link or payment in N days (rule condition inactiveDays, default 60). */
export async function inactivity() {
  const rules = await prisma.automationRule.findMany({ where: { trigger: 'CUSTOMER_INACTIVE', isActive: true } });
  const month = new Date().toISOString().slice(0, 7);
  for (const rule of rules) {
    const days = Number((rule.actionConfig as any)?.inactiveDays ?? 60);
    const since = new Date(Date.now() - days * 86_400_000);
    const customers = await prisma.cRMCustomer.findMany({
      where: { businessId: rule.businessId, archivedAt: null, createdAt: { lt: since }, communications: { none: { occurredAt: { gte: since } } }, payments: { none: { createdAt: { gte: since } } } },
      select: { id: true, name: true, phone: true },
      take: 1000,
    });
    for (const c of customers) await emitEvent(rule.businessId, 'CUSTOMER_INACTIVE', `inactive:${c.id}:${month}`, { customerId: c.id, name: c.name, phone: c.phone ?? '', inactiveDays: String(days) });
  }
}

let running = false;
async function guarded(name: string, fn: () => Promise<unknown>) {
  try {
    await fn();
  } catch (e) {
    console.error(`[worker] ${name} failed`, e);
  }
}

export function startWorker() {
  if (process.env.WORKER_DISABLED === 'true') {
    console.log('[worker] disabled (WORKER_DISABLED=true)');
    return;
  }
  const fast = Number(process.env.WORKER_FAST_MS ?? 15_000);
  const slow = Number(process.env.WORKER_SLOW_MS ?? 10 * 60_000);
  setInterval(async () => {
    if (running) return;
    running = true;
    await guarded('campaigns', processCampaigns);
    await guarded('automations', () => runDueExecutions());
    running = false;
  }, fast).unref();
  const slowJobs = async () => {
    await guarded('overdue invoices', markOverdueInvoices);
    await guarded('subscriptions', subscriptionJobs);
    await guarded('recurring', recurringTransactions);
    await guarded('task reminders', taskReminders);
  };
  setInterval(slowJobs, slow).unref();
  setInterval(() => guarded('inactivity', inactivity), 24 * 60 * 60_000).unref();
  setTimeout(slowJobs, 5_000).unref();
  console.log(`[worker] started (fast ${fast}ms, slow ${slow}ms)`);
}

/** Runs every job once (used by tests and the admin "run jobs now" endpoint). */
export async function runAllJobsOnce() {
  await processCampaigns();
  await runDueExecutions();
  await markOverdueInvoices();
  await subscriptionJobs();
  await recurringTransactions();
  await taskReminders();
  await inactivity();
}
