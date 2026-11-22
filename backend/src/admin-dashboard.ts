import { Router, Request, Response } from 'express';
import { prisma } from './prisma';
import { authenticate } from './middleware/auth';
import { asyncHandler, AppError } from './middleware/error';

/**
 * Platform Admin Dashboard API.
 * All routes require authentication + SUPER_ADMIN role.
 * Mounted at /api/admin/dashboard
 */
const router = Router();

/** Guard: only SUPER_ADMIN may access dashboard data. */
const requireSuperAdmin = (req: Request, res: Response, next: Function): void => {
  const user = (req as any).user;
  if (!user) {
    res.status(401).json({ success: false, statusCode: 401, message: 'Authentication required' });
    return;
  }
  if (user.platformRole !== 'SUPER_ADMIN') {
    res.status(403).json({ success: false, statusCode: 403, message: 'Super Admin access required' });
    return;
  }
  next();
};

router.use(authenticate, requireSuperAdmin);

/** Parse a date-range query (?days=30) into a start date. */
function rangeStart(days?: string): Date | null {
  if (!days) return null;
  const n = parseInt(days, 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

const ok = (res: Response, data: any) =>
  res.json({ success: true, statusCode: 200, timestamp: new Date().toISOString(), data });

// ============================================================
// 1. OVERVIEW — KPI totals + growth
// ============================================================
router.get('/overview', asyncHandler(async (req: Request, res: Response) => {
  const days = typeof req.query.days === 'string' ? req.query.days : '30';
  const since = rangeStart(days);

  const [
    totalBusinesses,
    activeBusinesses,
    suspendedBusinesses,
    newBusinesses,
    totalUsers,
    activeUsers,
    suspendedUsers,
    newUsers,
    totalStores,
    activeStores,
    suspendedStores,
    newStores,
    activeSubs,
    trialSubs,
    pastDueSubs,
    expiredSubs,
    cancelledSubs,
    successfulPayments,
    pendingPayments,
    failedPayments,
    collectedAmount,
  ] = await Promise.all([
    prisma.business.count(),
    prisma.business.count({ where: { status: 'ACTIVE' } }),
    prisma.business.count({ where: { status: 'SUSPENDED' } }),
    since ? prisma.business.count({ where: { createdAt: { gte: since } } }) : 0,
    prisma.user.count(),
    prisma.user.count({ where: { status: 'ACTIVE' } }),
    prisma.user.count({ where: { status: 'SUSPENDED' } }),
    since ? prisma.user.count({ where: { createdAt: { gte: since } } }) : 0,
    prisma.store.count(),
    prisma.store.count({ where: { status: 'ACTIVE' } }),
    prisma.store.count({ where: { status: 'SUSPENDED' } }),
    since ? prisma.store.count({ where: { createdAt: { gte: since } } }) : 0,
    prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    prisma.subscription.count({ where: { status: 'TRIALING' } }),
    prisma.subscription.count({ where: { status: 'PAST_DUE' } }),
    prisma.subscription.count({ where: { status: 'EXPIRED' } }),
    prisma.subscription.count({ where: { status: 'CANCELLED' } }),
    prisma.payment.count({ where: { status: 'PAID' } }),
    prisma.payment.count({ where: { status: 'PENDING' } }),
    prisma.payment.count({ where: { status: 'FAILED' } }),
    prisma.payment.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
  ]);

  // MRR: sum of active subscription plan prices normalized to monthly
  const activeSubscriptions = await prisma.subscription.findMany({
    where: { status: { in: ['ACTIVE', 'TRIALING', 'PAST_DUE'] } },
    select: { plan: { select: { price: true, interval: true } } },
  });
  const mrr = activeSubscriptions.reduce((sum, s) => {
    const price = Number(s.plan.price);
    const interval = s.plan.interval;
    const monthly = interval === 'YEARLY' ? price / 12 : interval === 'QUARTERLY' ? price / 3 : price;
    return sum + monthly;
  }, 0);

  ok(res, {
    businesses: {
      total: totalBusinesses,
      active: activeBusinesses,
      suspended: suspendedBusinesses,
      newThisPeriod: newBusinesses,
      growthPct: totalBusinesses ? Math.round((newBusinesses / Math.max(1, totalBusinesses)) * 100) : 0,
    },
    users: {
      total: totalUsers,
      active: activeUsers,
      suspended: suspendedUsers,
      newThisPeriod: newUsers,
      growthPct: totalUsers ? Math.round((newUsers / Math.max(1, totalUsers)) * 100) : 0,
    },
    revenue: {
      mrr: Math.round(mrr * 100) / 100,
      arr: Math.round(mrr * 12 * 100) / 100,
      currency: 'USD',
    },
    subscriptions: {
      active: activeSubs,
      trial: trialSubs,
      pastDue: pastDueSubs,
      expired: expiredSubs,
      cancelled: cancelledSubs,
    },
    payments: {
      successful: successfulPayments,
      pending: pendingPayments,
      failed: failedPayments,
      collected: Number(collectedAmount._sum.amount ?? 0),
    },
    stores: {
      total: totalStores,
      active: activeStores,
      suspended: suspendedStores,
      newThisPeriod: newStores,
    },
    periodDays: days,
  });
}));

// ============================================================
// 2. REVENUE — monthly trend from subscriptions + payments
// ============================================================
router.get('/revenue', asyncHandler(async (req: Request, res: Response) => {
  const months = Math.min(Math.max(parseInt(String(req.query.months ?? '12'), 10) || 12, 1), 24);
  const since = new Date();
  since.setMonth(since.getMonth() - months);
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const subscriptions = await prisma.subscription.findMany({
    where: { startDate: { gte: since } },
    select: { startDate: true, plan: { select: { price: true, interval: true } } },
  });
  const payments = await prisma.payment.findMany({
    where: { status: 'PAID', createdAt: { gte: since } },
    select: { amount: true, paidAt: true, createdAt: true },
  });

  const buckets: Record<string, { subscription: number; payments: number }> = {};
  for (let i = 0; i < months; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    buckets[d.toISOString().slice(0, 7)] = { subscription: 0, payments: 0 };
  }

  for (const s of subscriptions) {
    const key = s.startDate.toISOString().slice(0, 7);
    if (buckets[key]) {
      const price = Number(s.plan.price);
      buckets[key].subscription += s.plan.interval === 'YEARLY' ? price / 12 : s.plan.interval === 'QUARTERLY' ? price / 3 : price;
    }
  }
  for (const p of payments) {
    const key = (p.paidAt ?? p.createdAt).toISOString().slice(0, 7);
    if (buckets[key]) buckets[key].payments += Number(p.amount);
  }

  const trend = Object.entries(buckets)
    .map(([month, v]) => ({ month, subscription: Math.round(v.subscription * 100) / 100, payments: Math.round(v.payments * 100) / 100 }))
    .reverse();

  ok(res, { trend, currency: 'USD' });
}));

// ============================================================
// 3. BUSINESS GROWTH — registrations over time + breakdowns
// ============================================================
router.get('/business-growth', asyncHandler(async (req: Request, res: Response) => {
  const months = Math.min(Math.max(parseInt(String(req.query.months ?? '12'), 10) || 12, 1), 24);
  const since = new Date();
  since.setMonth(since.getMonth() - months);
  since.setDate(1);

  const businesses = await prisma.business.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true, status: true, industry: true },
  });

  const buckets: Record<string, number> = {};
  for (let i = 0; i < months; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    buckets[d.toISOString().slice(0, 7)] = 0;
  }
  for (const b of businesses) {
    const key = b.createdAt.toISOString().slice(0, 7);
    if (buckets[key] !== undefined) buckets[key] += 1;
  }
  const trend = Object.entries(buckets).map(([month, count]) => ({ month, count })).reverse();

  const byIndustry = await prisma.business.groupBy({ by: ['industry'], _count: { _all: true } });
  const byStatus = await prisma.business.groupBy({ by: ['status'], _count: { _all: true } });
  const byPlan = await prisma.subscription.groupBy({ by: ['planId'], _count: { _all: true } });
  const plans = await prisma.plan.findMany({ select: { id: true, name: true } });
  const planName = (id: string) => plans.find((p) => p.id === id)?.name ?? 'Unknown';

  ok(res, {
    trend,
    byIndustry: byIndustry.map((i) => ({ industry: i.industry ?? 'Uncategorized', count: i._count._all })),
    byStatus: byStatus.map((s) => ({ status: s.status, count: s._count._all })),
    byPlan: byPlan.map((p) => ({ plan: planName(p.planId), count: p._count._all })),
  });
}));

// ============================================================
// 4. SUBSCRIPTIONS — distribution + renewals + expiring
// ============================================================
router.get('/subscriptions', asyncHandler(async (_req: Request, res: Response) => {
  const plans = await prisma.plan.findMany({ select: { id: true, name: true } });
  const groups = await prisma.subscription.groupBy({ by: ['planId', 'status'], _count: { _all: true } });
  const planName = (id: string) => plans.find((p) => p.id === id)?.name ?? 'Unknown';

  const distribution: Record<string, { plan: string; count: number }> = {};
  for (const g of groups) {
    const name = planName(g.planId);
    distribution[name] = distribution[name] ?? { plan: name, count: 0 };
    distribution[name].count += g._count._all;
  }

  const soon = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  const expiringSoon = await prisma.subscription.findMany({
    where: { status: 'ACTIVE', OR: [{ endDate: { lte: soon } }, { nextBillingAt: { lte: soon } }] },
    select: { id: true, endDate: true, nextBillingAt: true, business: { select: { name: true } }, plan: { select: { name: true } } },
    take: 10,
  });

  const recentUpgrades = await prisma.subscription.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { updatedAt: 'desc' },
    take: 5,
    select: { id: true, business: { select: { name: true } }, plan: { select: { name: true } }, updatedAt: true },
  });

  ok(res, {
    distribution: Object.values(distribution),
    expiringSoon: expiringSoon.map((s) => ({ id: s.id, business: s.business.name, plan: s.plan.name, date: s.endDate ?? s.nextBillingAt })),
    recentUpgrades: recentUpgrades.map((s) => ({ id: s.id, business: s.business.name, plan: s.plan.name, updatedAt: s.updatedAt })),
  });
}));

// ============================================================
// 5. MODULE ACTIVITY — real usage counts
// ============================================================
router.get('/module-activity', asyncHandler(async (_req: Request, res: Response) => {
  const [
    crmBusinesses,
    customers,
    leads,
    activeProjects,
    projectsAwaiting,
    completedProjects,
    whatsappAccounts,
    campaigns,
    marketingContacts,
    smsCampaigns,
    stores,
    products,
    orders,
    invoices,
    transactions,
  ] = await Promise.all([
    prisma.business.count({ where: { status: 'ACTIVE' } }),
    prisma.cRMCustomer.count(),
    prisma.lead.count(),
    prisma.creativeProject.count({ where: { status: { in: ['PLANNING', 'IN_PROGRESS', 'REVIEW'] } } }),
    prisma.creativeReview.count({ where: { status: 'PENDING' } }),
    prisma.creativeProject.count({ where: { status: 'COMPLETED' } }),
    prisma.whatsAppAccount.count({ where: { status: 'CONNECTED' } }),
    prisma.campaign.count(),
    prisma.marketingContact.count(),
    prisma.campaign.count({ where: { channel: 'SMS' } }),
    prisma.store.count({ where: { status: 'ACTIVE' } }),
    prisma.product.count({ where: { status: 'ACTIVE' } }),
    prisma.storeOrder.count(),
    prisma.invoice.count(),
    prisma.financeTransaction.count(),
  ]);

  ok(res, {
    crm: { activeBusinesses: crmBusinesses, customers, leads },
    creative: { activeProjects, awaitingApproval: projectsAwaiting, completedProjects },
    whatsapp: { connectedAccounts: whatsappAccounts, campaigns, contacts: marketingContacts },
    sms: { campaigns: smsCampaigns, contacts: marketingContacts },
    store: { activeStores: stores, products, orders },
    finance: { invoices, transactions },
  });
}));

// ============================================================
// 6. RECENT ACTIVITY — real events from audit logs + records
// ============================================================
router.get('/recent-activity', asyncHandler(async (req: Request, res: Response) => {
  const take = Math.min(Math.max(parseInt(String(req.query.take ?? '20'), 10) || 20, 1), 50);
  const category = typeof req.query.category === 'string' ? req.query.category : null;

  const auditLogs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take,
    select: {
      id: true, action: true, entityType: true, entityId: true, createdAt: true,
      user: { select: { firstName: true, lastName: true, email: true } },
      business: { select: { name: true } },
    },
  });

  const recentBusinesses = await prisma.business.findMany({
    orderBy: { createdAt: 'desc' },
    take,
    select: { id: true, name: true, createdAt: true, status: true },
  });

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take,
    select: { id: true, firstName: true, lastName: true, email: true, createdAt: true },
  });

  const recentPayments = await prisma.payment.findMany({
    orderBy: { createdAt: 'desc' },
    take,
    select: { id: true, amount: true, status: true, createdAt: true, business: { select: { name: true } } },
  });

  const events: any[] = [
    ...recentBusinesses.map((b) => ({
      id: `biz-${b.id}`, type: 'business', description: `New business registered: ${b.name}`,
      entity: b.name, status: b.status, createdAt: b.createdAt, link: `/admin/businesses/${b.id}`,
    })),
    ...recentUsers.map((u) => ({
      id: `usr-${u.id}`, type: 'user', description: `New user registered: ${u.firstName} ${u.lastName}`.trim(),
      entity: u.email, status: 'ACTIVE', createdAt: u.createdAt, link: `/admin/users`,
    })),
    ...recentPayments.map((p) => ({
      id: `pay-${p.id}`, type: 'payment', description: `Payment ${p.status.toLowerCase()}: $${Number(p.amount).toFixed(2)}`,
      entity: p.business.name, status: p.status, createdAt: p.createdAt, link: `/admin/payments`,
    })),
    ...auditLogs.map((a) => ({
      id: `log-${a.id}`, type: 'audit', description: a.action,
      entity: a.business?.name ?? a.user?.email ?? a.entityType, status: 'INFO',
      createdAt: a.createdAt, link: `/admin/audit-logs`,
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, take);

  const filtered = category ? events.filter((e) => e.type === category) : events;

  ok(res, { events: filtered, categories: ['business', 'user', 'payment', 'audit'] });
}));

// ============================================================
// 7. ALERTS — computed from real conditions
// ============================================================
router.get('/alerts', asyncHandler(async (_req: Request, res: Response) => {
  const alerts: { severity: 'critical' | 'warning' | 'info'; title: string; description: string; link: string }[] = [];

  const pendingBusinesses = await prisma.business.count({ where: { status: 'PENDING_APPROVAL' } });
  if (pendingBusinesses > 0) {
    alerts.push({ severity: 'warning', title: 'Businesses awaiting verification', description: `${pendingBusinesses} business(es) waiting for approval.`, link: '/admin/businesses/verification' });
  }

  const soon = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  const expiringSubs = await prisma.subscription.count({ where: { status: 'ACTIVE', OR: [{ endDate: { lte: soon } }, { nextBillingAt: { lte: soon } }] } });
  if (expiringSubs > 0) {
    alerts.push({ severity: 'warning', title: 'Subscriptions expiring soon', description: `${expiringSubs} subscription(s) expire within 14 days.`, link: '/admin/subscriptions' });
  }

  const pastDueSubs = await prisma.subscription.count({ where: { status: 'PAST_DUE' } });
  if (pastDueSubs > 0) {
    alerts.push({ severity: 'critical', title: 'Past-due subscriptions', description: `${pastDueSubs} subscription(s) are past due.`, link: '/admin/subscriptions' });
  }

  const failedPayments = await prisma.payment.count({ where: { status: 'FAILED' } });
  if (failedPayments > 0) {
    alerts.push({ severity: 'warning', title: 'Failed payments', description: `${failedPayments} payment(s) failed.`, link: '/admin/payments' });
  }

  const openTickets = await prisma.contactMessage.count({ where: { status: 'NEW' } });
  if (openTickets > 0) {
    alerts.push({ severity: 'info', title: 'Open support tickets', description: `${openTickets} new support message(s) awaiting response.`, link: '/admin/support' });
  }

  const suspendedBusinesses = await prisma.business.count({ where: { status: 'SUSPENDED' } });
  if (suspendedBusinesses > 0) {
    alerts.push({ severity: 'info', title: 'Suspended businesses', description: `${suspendedBusinesses} business(es) currently suspended.`, link: '/admin/businesses' });
  }

  ok(res, { alerts });
}));

// ============================================================
// 8. SUPPORT SUMMARY — from contact messages
// ============================================================
router.get('/support-summary', asyncHandler(async (_req: Request, res: Response) => {
  const [newTickets, handledTickets, archivedTickets] = await Promise.all([
    prisma.contactMessage.count({ where: { status: 'NEW' } }),
    prisma.contactMessage.count({ where: { status: 'HANDLED' } }),
    prisma.contactMessage.count({ where: { status: 'ARCHIVED' } }),
  ]);

  ok(res, {
    open: newTickets,
    handled: handledTickets,
    archived: archivedTickets,
    total: newTickets + handledTickets + archivedTickets,
  });
}));

export default router;
