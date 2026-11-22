import { Router, Request, Response } from 'express';
import { authenticate, AuthenticatedRequest, requireRole } from './middleware/auth';
import { AppError, asyncHandler } from './middleware/error';
import { prisma } from './prisma';
import { audit } from './lib/audit';
import { Prisma } from '@prisma/client';

const router = Router();
router.use(authenticate, requireRole('SUPER_ADMIN'));

const ok = (res: Response, data: unknown, status = 200) =>
  res.status(status).json({ success: true, statusCode: status, timestamp: new Date().toISOString(), data });

function audienceWhere(audience: Record<string, unknown>) {
  const where: Record<string, unknown> = {};
  if (typeof audience.status === 'string' && audience.status) where.status = audience.status;
  if (typeof audience.role === 'string' && audience.role) where.platformRole = audience.role;
  if (Array.isArray(audience.businessIds) && audience.businessIds.length) {
    where.memberships = {
      some: {
        status: 'ACTIVE',
        businessId: { in: audience.businessIds as string[] },
      },
    };
  }
  if (typeof audience.subscriptionStatus === 'string' && audience.subscriptionStatus) {
    where.memberships = {
      some: {
        status: 'ACTIVE',
        business: {
          subscriptions: { some: { status: audience.subscriptionStatus } },
        },
      },
    };
  }
  return where;
}

async function recipientUsers(audience: Record<string, unknown>) {
  return prisma.user.findMany({
    where: audienceWhere(audience),
    select: { id: true, email: true, phone: true, platformRole: true, status: true },
  });
}

function channelsOf(body: Record<string, unknown>): string[] {
  const raw = Array.isArray(body.channels) ? body.channels : ['IN_APP'];
  const allowed = new Set(['IN_APP', 'EMAIL', 'SMS', 'WHATSAPP']);
  return [...new Set(raw.filter((item): item is string => typeof item === 'string' && allowed.has(item)))];
}

router.post('/audience-count', asyncHandler(async (req, res) => {
  const audience = (req.body?.audience ?? {}) as Record<string, unknown>;
  const users = await recipientUsers(audience);
  return ok(res, { eligible: users.length, unique: users.length });
}));

router.get('/overview', asyncHandler(async (_req, res) => {
  const campaigns = await prisma.notificationCampaign.findMany({ select: { status: true, recipientCount: true } });
  const recipients = await prisma.notificationRecipient.aggregate({ _count: { _all: true } });
  return ok(res, {
    total: campaigns.length,
    sent: campaigns.filter((item) => item.status === 'SENT').length,
    scheduled: campaigns.filter((item) => item.status === 'SCHEDULED').length,
    drafts: campaigns.filter((item) => item.status === 'DRAFT').length,
    failed: campaigns.filter((item) => item.status === 'FAILED').length,
    reached: recipients._count._all,
  });
}));

router.get('/templates/list', asyncHandler(async (_req, res) => {
  const templates = await prisma.notificationTemplate.findMany({ orderBy: { createdAt: 'desc' } });
  return ok(res, templates);
}));

router.get('/', asyncHandler(async (req, res) => {
  const status = typeof req.query.status === 'string' ? req.query.status : '';
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  const page = Math.max(parseInt(String(req.query.page ?? '1'), 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(String(req.query.limit ?? '20'), 10) || 20, 1), 100);
  const where: Record<string, unknown> = {};
  if (['DRAFT','SCHEDULED','SENDING','SENT','FAILED','CANCELLED'].includes(status)) where.status = status;
  if (q) where.OR = [{ title: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }, { internalName: { contains: q, mode: 'insensitive' } }];
  const [items, total] = await Promise.all([
    prisma.notificationCampaign.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { creator: { select: { firstName: true, lastName: true, email: true } }, recipients: { select: { status: true } } },
    }),
    prisma.notificationCampaign.count({ where }),
  ]);
  return ok(res, { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const campaign = await prisma.notificationCampaign.findUnique({
    where: { id: String(req.params.id) },
    include: {
      creator: { select: { firstName: true, lastName: true, email: true } },
      recipients: {
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  if (!campaign) throw new AppError('Notification not found', 404);
  return ok(res, campaign);
}));

router.post('/', asyncHandler(async (req, res) => {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const internalName = typeof body.internalName === 'string' ? body.internalName.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (title.length < 3 || title.length > 160) throw new AppError('Title must be between 3 and 160 characters', 400);
  if (message.length < 10 || message.length > 5000) throw new AppError('Message must be between 10 and 5,000 characters', 400);
  if (description.length > 500) throw new AppError('Description must be at most 500 characters', 400);
  if (internalName.length > 100) throw new AppError('Internal campaign name must be at most 100 characters', 400);

  const categories = new Set(['GENERAL_ANNOUNCEMENT','PLATFORM_UPDATE','MAINTENANCE','SUBSCRIPTION_BILLING','SECURITY_ALERT','ACCOUNT_VERIFICATION','NEW_FEATURE','MARKETING_PROMOTION','IMPORTANT_INFORMATION']);
  const priorities = new Set(['LOW','NORMAL','HIGH','CRITICAL']);
  const languages = new Set(['en','so']);
  const category = typeof body.category === 'string' ? body.category : 'GENERAL_ANNOUNCEMENT';
  const priority = typeof body.priority === 'string' ? body.priority : 'NORMAL';
  const language = typeof body.language === 'string' ? body.language : 'en';
  if (!categories.has(category)) throw new AppError('Invalid notification category', 400);
  if (!priorities.has(priority)) throw new AppError('Invalid notification priority', 400);
  if (!languages.has(language)) throw new AppError('Invalid notification language', 400);

  const variables = [...message.matchAll(/{{([^{}]+)}}/g)].map((match) => match[1].trim());
  const allowedVariables = new Set(['user_name','business_name','subscription_plan','renewal_date']);
  const invalidVariables = [...new Set(variables.filter((name) => !allowedVariables.has(name)))];
  if (invalidVariables.length) throw new AppError(`Unsupported notification variable: ${invalidVariables.join(', ')}`, 400);

  const actionText = typeof body.actionText === 'string' ? body.actionText.trim() : '';
  const actionUrl = typeof body.actionUrl === 'string' ? body.actionUrl.trim() : '';
  if (actionText.length > 40) throw new AppError('Action text must be at most 40 characters', 400);
  if ((actionText && !actionUrl) || (!actionText && actionUrl)) throw new AppError('Action text and destination URL must be provided together', 400);
  if (actionUrl) {
    const safeInternal = actionUrl.startsWith('/') && !actionUrl.startsWith('//');
    let safeExternal = false;
    try {
      const parsed = new URL(actionUrl);
      safeExternal = parsed.protocol === 'https:' && !!parsed.hostname;
    } catch {
      safeExternal = false;
    }
    if (!safeInternal && !safeExternal) throw new AppError('Destination URL must be a safe internal route or HTTPS URL', 400);
  }

  const audience = (body.audience ?? {}) as Record<string, unknown>;
  if (!audience || typeof audience !== 'object' || Array.isArray(audience)) throw new AppError('Invalid audience', 400);
  const audienceRoles = new Set(['OWNER','STAFF','DESIGNER','MARKETING_MANAGER','STORE_MANAGER','FINANCE_MANAGER','SUPER_ADMIN']);
  const audienceStatuses = new Set(['ACTIVE','PENDING_VERIFICATION','INACTIVE','SUSPENDED']);
  const subscriptionStatuses = new Set(['TRIALING','ACTIVE','PAST_DUE','EXPIRED','CANCELLED','SUSPENDED']);
  if (audience.role !== undefined && !audienceRoles.has(String(audience.role))) throw new AppError('Invalid audience role', 400);
  if (audience.status !== undefined && !audienceStatuses.has(String(audience.status))) throw new AppError('Invalid audience account status', 400);
  if (audience.subscriptionStatus !== undefined && !subscriptionStatuses.has(String(audience.subscriptionStatus))) throw new AppError('Invalid audience subscription status', 400);
  const channels = channelsOf(body);
  if (!channels.length) throw new AppError('Select at least one delivery channel', 400);
  if (channels.some((channel) => ['EMAIL','SMS','WHATSAPP'].includes(channel))) {
    throw new AppError(`${channels.join(', ')} delivery is not configured. Select IN_APP or configure the provider first.`, 400);
  }
  const users = await recipientUsers(audience);
  const delivery = typeof body.delivery === 'string' ? body.delivery : 'draft';
  if (!['immediate', 'scheduled', 'draft'].includes(delivery)) throw new AppError('Invalid delivery mode', 400);
  const scheduledAt = delivery === 'scheduled' && typeof body.scheduledAt === 'string' ? new Date(body.scheduledAt) : null;
  if (delivery === 'scheduled' && (!scheduledAt || Number.isNaN(scheduledAt.getTime()) || scheduledAt.getTime() <= Date.now())) {
    throw new AppError('Scheduled delivery must be in the future', 400);
  }
  const status = delivery === 'scheduled' ? 'SCHEDULED' : delivery === 'draft' ? 'DRAFT' : 'SENDING';
  const campaign = await prisma.notificationCampaign.create({
    data: {
      creatorId: (req as AuthenticatedRequest).user!.id,
      title,
      description: description || null,
      internalName: internalName || null,
      category,
      priority,
      language,
      message,
      actionText: actionText || null,
      actionUrl: actionUrl || null,
      imageUrl: typeof body.imageUrl === 'string' ? body.imageUrl : null,
      audience: audience as Prisma.InputJsonValue,
      channels: channels as Prisma.InputJsonValue,
      status,
      scheduledAt,
      recipientCount: users.length,
    },
  });
  await audit(req, { action: 'notification.create', entityType: 'NotificationCampaign', entityId: campaign.id, metadata: { status, channels, recipientCount: users.length } });
  if (status === 'SENDING') {
    await sendCampaign(campaign.id, req);
  }
  return ok(res, await prisma.notificationCampaign.findUnique({ where: { id: campaign.id }, include: { recipients: true } }), 201);
}));

async function sendCampaign(campaignId: string, req?: Request) {
  const campaign = await prisma.notificationCampaign.findUnique({ where: { id: campaignId } });
  if (!campaign) throw new AppError('Notification not found', 404);
  if (campaign.status === 'SENT' || campaign.status === 'CANCELLED') return;
  const channels = Array.isArray(campaign.channels) ? campaign.channels as string[] : ['IN_APP'];
  const users = await recipientUsers(campaign.audience as Record<string, unknown>);

  await prisma.notificationCampaign.update({ where: { id: campaignId }, data: { status: 'SENDING' } });
  for (const channel of channels) {
    for (const user of users) {
      const existing = await prisma.notificationRecipient.findUnique({
        where: { campaignId_userId_channel: { campaignId, userId: user.id, channel } },
      });
      if (existing) continue;
      if (channel === 'IN_APP') {
        await prisma.notification.create({
          data: {
            userId: user.id,
            title: campaign.title,
            message: campaign.message,
            type: 'INFO',
            actionUrl: campaign.actionUrl,
            metadata: { campaignId, category: campaign.category, priority: campaign.priority },
          },
        });
        await prisma.notificationRecipient.create({
          data: { campaignId, userId: user.id, channel, status: 'DELIVERED', sentAt: new Date(), deliveredAt: new Date() },
        });
      } else {
        await prisma.notificationRecipient.create({
          data: {
            campaignId,
            userId: user.id,
            channel,
            status: 'FAILED',
            failureReason: 'Provider is not configured. This channel was not sent.',
          },
        });
      }
    }
  }
  const recipients = await prisma.notificationRecipient.findMany({ where: { campaignId }, select: { status: true } });
  const failedExternal = recipients.some((item) => item.status === 'FAILED');
  await prisma.notificationCampaign.update({
    where: { id: campaignId },
    data: { status: channels.includes('IN_APP') && !failedExternal ? 'SENT' : failedExternal && channels.length === 1 ? 'FAILED' : 'SENT', sentAt: new Date(), recipientCount: users.length },
  });
  if (req) await audit(req, { action: 'notification.send', entityType: 'NotificationCampaign', entityId: campaignId, metadata: { recipientCount: users.length, channels } });
}

router.post('/:id/send', asyncHandler(async (req, res) => {
  const campaign = await prisma.notificationCampaign.findUnique({ where: { id: String(req.params.id) } });
  if (!campaign) throw new AppError('Notification not found', 404);
  if (campaign.status === 'SENT') throw new AppError('Notification has already been sent', 409);
  await sendCampaign(campaign.id, req);
  await audit(req, { action: 'notification.send', entityType: 'NotificationCampaign', entityId: campaign.id });
  return ok(res, await prisma.notificationCampaign.findUnique({ where: { id: campaign.id }, include: { recipients: true } }));
}));

router.post('/:id/cancel', asyncHandler(async (req, res) => {
  const campaign = await prisma.notificationCampaign.findUnique({ where: { id: String(req.params.id) } });
  if (!campaign) throw new AppError('Notification not found', 404);
  if (campaign.status !== 'SCHEDULED') throw new AppError('Only scheduled notifications can be cancelled', 409);
  const updated = await prisma.notificationCampaign.update({ where: { id: campaign.id }, data: { status: 'CANCELLED' } });
  await audit(req, { action: 'notification.cancel', entityType: 'NotificationCampaign', entityId: campaign.id });
  return ok(res, updated);
}));

router.patch('/:id', asyncHandler(async (req, res) => {
  const campaign = await prisma.notificationCampaign.findUnique({ where: { id: String(req.params.id) } });
  if (!campaign) throw new AppError('Notification not found', 404);
  if (!['DRAFT', 'SCHEDULED'].includes(campaign.status)) throw new AppError('Only drafts and scheduled notifications can be edited', 409);
  const body = req.body ?? {};
  const updated = await prisma.notificationCampaign.update({
    where: { id: campaign.id },
    data: {
      ...(typeof body.title === 'string' ? { title: body.title.trim() } : {}),
      ...(typeof body.message === 'string' ? { message: body.message.trim() } : {}),
      ...(typeof body.description === 'string' ? { description: body.description } : {}),
      ...(typeof body.category === 'string' ? { category: body.category } : {}),
      ...(typeof body.priority === 'string' ? { priority: body.priority } : {}),
      ...(typeof body.actionText === 'string' ? { actionText: body.actionText } : {}),
      ...(typeof body.actionUrl === 'string' ? { actionUrl: body.actionUrl } : {}),
    },
  });
  await audit(req, { action: 'notification.edit', entityType: 'NotificationCampaign', entityId: campaign.id });
  return ok(res, updated);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const campaign = await prisma.notificationCampaign.findUnique({ where: { id: String(req.params.id) } });
  if (!campaign) throw new AppError('Notification not found', 404);
  if (campaign.status !== 'DRAFT') throw new AppError('Only drafts can be deleted', 409);
  await prisma.notificationCampaign.delete({ where: { id: campaign.id } });
  await audit(req, { action: 'notification.delete', entityType: 'NotificationCampaign', entityId: campaign.id });
  return ok(res, { deleted: true });
}));

router.post('/templates', asyncHandler(async (req, res) => {
  const body = req.body ?? {};
  if (!body.name || !body.title || !body.message) throw new AppError('Name, title and message are required', 400);
  const template = await prisma.notificationTemplate.create({
    data: {
      creatorId: (req as AuthenticatedRequest).user!.id,
      name: String(body.name).trim(),
      category: String(body.category ?? 'GENERAL_ANNOUNCEMENT'),
      title: String(body.title).trim(),
      message: String(body.message).trim(),
      channels: Array.isArray(body.channels) ? body.channels : ['IN_APP'],
      variables: Array.isArray(body.variables) ? body.variables : [],
      language: String(body.language ?? 'en'),
    },
  });
  await audit(req, { action: 'notification.template.create', entityType: 'NotificationTemplate', entityId: template.id });
  return ok(res, template, 201);
}));

export async function processScheduledNotifications() {
  const due = await prisma.notificationCampaign.findMany({
    where: { status: 'SCHEDULED', scheduledAt: { lte: new Date() } },
    select: { id: true },
  });
  for (const campaign of due) {
    await sendCampaign(campaign.id);
  }
}

export default router;
