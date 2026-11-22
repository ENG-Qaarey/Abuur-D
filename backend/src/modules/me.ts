import { Router } from 'express';
import { prisma } from '../prisma';
import { authedRouter } from '../lib/router';
import { authenticate, requireRole } from '../middleware/auth';
import { asyncHandler } from '../middleware/error';
import { ok, userId, pageOf, pageMeta } from '../lib/http';
import { accessOf } from '../access/scope';
import { ROLE_PERMISSIONS } from '../access/policy';
import { runAllJobsOnce } from '../jobs/worker';

/** The signed-in user's own data: notifications, workspaces and effective permissions. */
const router = authedRouter();

router.get('/me/notifications', asyncHandler(async (req, res) => {
  const { page, limit, skip } = pageOf(req);
  const where = { userId: userId(req), ...(req.query.unread === 'true' ? { isRead: false } : {}) };
  const [items, total, unread] = await Promise.all([
    prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId: userId(req), isRead: false } }),
  ]);
  return ok(res, items, 200, { meta: { ...pageMeta(page, limit, total), unread } });
}));

router.post('/me/notifications/read', asyncHandler(async (req, res) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids.map(String).slice(0, 500) : null;
  const r = await prisma.notification.updateMany({ where: { userId: userId(req), isRead: false, ...(ids ? { id: { in: ids } } : {}) }, data: { isRead: true, readAt: new Date() } });
  return ok(res, { updated: r.count });
}));

/** Businesses the user works in, their role and effective module permissions (for the workspace switcher). */
router.get('/me/workspaces', asyncHandler(async (req, res) => {
  const access = await accessOf(req);
  const memberships = await prisma.businessMembership.findMany({
    where: { userId: userId(req), status: 'ACTIVE' },
    include: { business: { select: { id: true, name: true, slug: true, logoUrl: true, status: true } }, customRole: { select: { id: true, name: true, permissions: true } } },
    orderBy: { createdAt: 'asc' },
  });
  return ok(res, {
    isPlatformAdmin: access.isAdmin,
    workspaces: memberships.map((m) => ({
      business: m.business,
      role: m.role,
      customRole: m.customRole ? { id: m.customRole.id, name: m.customRole.name } : null,
      permissions: m.role === 'OWNER' ? 'ALL' : m.customRole?.permissions ?? ROLE_PERMISSIONS[m.role as keyof typeof ROLE_PERMISSIONS] ?? `ROLE:${m.role}`,
    })),
  });
}));

/** Platform admin: run every background job once now (support/diagnostics). */
router.post('/admin/jobs/run', requireRole('SUPER_ADMIN'), asyncHandler(async (_req, res) => {
  await runAllJobsOnce();
  return ok(res, { ran: true });
}));

export default router;
