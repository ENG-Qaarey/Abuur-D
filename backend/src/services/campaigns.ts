import { Prisma } from '@prisma/client';
import { prisma } from '../prisma';
import { AppError } from '../middleware/error';
import { sendMessage } from './send-message';
import { notifyUsers } from '../lib/notify';

/**
 * Segment rules (dynamic segments), all optional and combined with AND:
 *   tags: string[] (any of), allTags: string[], city, source, consent: 'WHATSAPP' | 'SMS',
 *   customerStatus: LEAD|ONBOARDING|ACTIVE|AT_RISK|CHURNED, createdAfter, createdBefore,
 *   hasPendingPayments: true, inactiveDays: number (no message logged in N days).
 * Opted-out contacts are never in an audience.
 */
export function segmentWhere(businessId: string, rules: unknown): Prisma.MarketingContactWhereInput {
  const r = (rules && typeof rules === 'object' && !Array.isArray(rules) ? rules : {}) as Record<string, any>;
  const and: Prisma.MarketingContactWhereInput[] = [{ businessId }, { optedOutAt: null }];
  if (Array.isArray(r.tags) && r.tags.length) and.push({ tags: { hasSome: r.tags.map(String) } });
  if (Array.isArray(r.allTags) && r.allTags.length) and.push({ tags: { hasEvery: r.allTags.map(String) } });
  if (typeof r.city === 'string' && r.city) and.push({ city: { equals: r.city, mode: 'insensitive' } });
  if (typeof r.source === 'string' && r.source) and.push({ source: r.source });
  if (r.consent === 'WHATSAPP') and.push({ whatsappConsent: true });
  if (r.consent === 'SMS') and.push({ smsConsent: true });
  if (typeof r.customerStatus === 'string' && r.customerStatus) and.push({ customer: { status: r.customerStatus as any } });
  if (r.createdAfter) and.push({ createdAt: { gte: new Date(r.createdAfter) } });
  if (r.createdBefore) and.push({ createdAt: { lte: new Date(r.createdBefore) } });
  if (r.hasPendingPayments === true) and.push({ customer: { invoices: { some: { status: { in: ['SENT', 'PARTIALLY_PAID', 'OVERDUE'] } } } } });
  if (Number(r.inactiveDays) > 0) and.push({ messageLogs: { none: { createdAt: { gte: new Date(Date.now() - Number(r.inactiveDays) * 86_400_000) } } } });
  return { AND: and };
}

export function validateRules(rules: unknown) {
  if (rules === undefined || rules === null) return;
  if (typeof rules !== 'object' || Array.isArray(rules)) throw new AppError('rules must be an object', 400);
  const allowed = new Set(['tags', 'allTags', 'city', 'source', 'consent', 'customerStatus', 'createdAfter', 'createdBefore', 'hasPendingPayments', 'inactiveDays']);
  for (const k of Object.keys(rules)) if (!allowed.has(k)) throw new AppError(`Unknown segment rule "${k}"`, 400);
  const r = rules as Record<string, unknown>;
  for (const k of ['createdAfter', 'createdBefore']) if (r[k] && Number.isNaN(new Date(String(r[k])).getTime())) throw new AppError(`${k} must be a date`, 400);
}

/** Contacts in a segment (static: its members; dynamic: its rules). */
export function audienceWhere(segment: { id: string; businessId: string; isDynamic: boolean; rules: unknown }): Prisma.MarketingContactWhereInput {
  if (!segment.isDynamic) return { businessId: segment.businessId, optedOutAt: null, segmentMembers: { some: { segmentId: segment.id } } };
  return segmentWhere(segment.businessId, segment.rules);
}

/** Audience of a campaign: its segment, or (no segment) every contact of the business. */
async function campaignAudience(c: { businessId: string; segmentId: string | null }): Promise<Prisma.MarketingContactWhereInput> {
  if (!c.segmentId) return { businessId: c.businessId, optedOutAt: null };
  const seg = await prisma.contactSegment.findUniqueOrThrow({ where: { id: c.segmentId } });
  return audienceWhere(seg);
}

/** Eligible = in the audience, has a phone and has consent for the channel. */
export async function campaignPreview(campaignId: string) {
  const c = await prisma.campaign.findUniqueOrThrow({ where: { id: campaignId }, include: { template: true } });
  const where = await campaignAudience(c);
  const consentField = c.channel === 'WHATSAPP' ? 'whatsappConsent' : 'smsConsent';
  const [audience, noPhone, noConsent, eligible, sample] = await Promise.all([
    prisma.marketingContact.count({ where }),
    prisma.marketingContact.count({ where: { AND: [where, { phone: null }] } }),
    prisma.marketingContact.count({ where: { AND: [where, { phone: { not: null } }, { [consentField]: false }] } }),
    prisma.marketingContact.count({ where: { AND: [where, { phone: { not: null } }, { [consentField]: true }] } }),
    prisma.marketingContact.findMany({ where: { AND: [where, { phone: { not: null } }, { [consentField]: true }] }, take: 5, select: { id: true, name: true, phone: true } }),
  ]);
  const optedOut = await prisma.marketingContact.count({ where: { businessId: c.businessId, optedOutAt: { not: null } } });
  const connection = await prisma.integrationConnection.findFirst({ where: { businessId: c.businessId, provider: c.channel === 'EMAIL' ? 'EMAIL' : c.channel, status: 'CONNECTED' } });
  const price = Number((connection?.settings as any)?.pricePerMessage);
  const body = c.template?.body ?? c.message ?? '';
  return {
    audience,
    eligible,
    skipped: { noPhone, noConsent, optedOutInBusiness: optedOut },
    estimatedCost: Number.isFinite(price) && price > 0 ? { amount: Math.round(price * eligible * 10000) / 10000, basis: 'pricePerMessage set on the integration (estimate)' } : null,
    channelConnected: !!connection,
    sandbox: (connection?.settings as any)?.mode === 'sandbox',
    template: c.template ? { name: c.template.name, status: c.template.status } : null,
    sample: sample.map((s) => ({ ...s, message: body.replace(/{{\s*name\s*}}/g, s.name ?? '').replace(/{{\s*phone\s*}}/g, s.phone ?? '') })),
  };
}

const BATCH = Number(process.env.CAMPAIGN_BATCH_SIZE ?? 50);

/** Worker step: start due campaigns and send one batch for each running campaign. */
export async function processCampaigns(): Promise<void> {
  const due = await prisma.campaign.findMany({ where: { status: 'SCHEDULED', scheduledAt: { lte: new Date() } }, select: { id: true } });
  for (const { id } of due) {
    // Atomic claim: only one worker starts a campaign (prevents duplicate execution).
    const claimed = await prisma.campaign.updateMany({ where: { id, status: 'SCHEDULED' }, data: { status: 'RUNNING', startedAt: new Date() } });
    if (claimed.count) await materialize(id);
  }
  const running = await prisma.campaign.findMany({ where: { status: 'RUNNING' }, select: { id: true } });
  for (const { id } of running) await sendBatch(id);
}

/** Creates one recipient row per eligible contact (unique per campaign+contact). */
async function materialize(campaignId: string) {
  const c = await prisma.campaign.findUniqueOrThrow({ where: { id: campaignId } });
  if ((c.metadata as any)?.materializedAt) return;
  const where = await campaignAudience(c);
  const contacts = await prisma.marketingContact.findMany({ where: { AND: [where, { phone: { not: null } }] }, select: { id: true } });
  for (let n = 0; n < contacts.length; n += 1000) {
    await prisma.campaignRecipient.createMany({ data: contacts.slice(n, n + 1000).map((x) => ({ campaignId, contactId: x.id })), skipDuplicates: true });
  }
  const total = await prisma.campaignRecipient.count({ where: { campaignId } });
  await prisma.campaign.update({ where: { id: campaignId }, data: { totalRecipients: total, metadata: { ...((c.metadata as object) ?? {}), materializedAt: new Date().toISOString() } } });
}

async function sendBatch(campaignId: string) {
  const c = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (!c || c.status !== 'RUNNING') return;
  const batch = await prisma.campaignRecipient.findMany({ where: { campaignId, status: 'QUEUED', attempts: { lt: 3 } }, take: BATCH, orderBy: { createdAt: 'asc' } });
  for (const r of batch) {
    // Stop between messages if the campaign was paused/cancelled meanwhile.
    const now = await prisma.campaign.findUnique({ where: { id: campaignId }, select: { status: true } });
    if (now?.status !== 'RUNNING') return;
    // Claim this recipient (no double send if two workers overlap).
    const claim = await prisma.campaignRecipient.updateMany({ where: { id: r.id, status: 'QUEUED', attempts: r.attempts }, data: { attempts: { increment: 1 } } });
    if (!claim.count) continue;
    const out = await sendMessage({
      businessId: c.businessId,
      channel: c.channel as 'WHATSAPP' | 'SMS',
      contactId: r.contactId,
      text: c.message,
      templateId: c.templateId,
      values: Object.fromEntries(Object.entries((c.templateParams as Record<string, unknown>) ?? {}).map(([k, v]) => [k, String(v)])),
      marketing: true,
      campaignId,
      whatsappAccountId: c.whatsappAccountId,
    });
    if (out.status === 'SENT') {
      await prisma.campaignRecipient.update({ where: { id: r.id }, data: { status: 'SENT', sentAt: new Date(), providerMessageId: out.providerMessageId, error: null } });
    } else if (out.status === 'SKIPPED') {
      await prisma.campaignRecipient.update({ where: { id: r.id }, data: { status: out.reason.includes('opted out') || out.reason.includes('opt-out') ? 'OPTED_OUT' : 'FAILED', failedAt: new Date(), error: `Skipped: ${out.reason}` } });
    } else {
      const final = !out.retryable || r.attempts + 1 >= 3;
      await prisma.campaignRecipient.update({ where: { id: r.id }, data: final ? { status: 'FAILED', failedAt: new Date(), error: out.error } : { error: out.error } });
      if (!out.retryable && /not connected|credentials/i.test(out.error)) {
        // The channel is unusable: pause instead of failing every recipient.
        await prisma.campaign.update({ where: { id: campaignId }, data: { status: 'PAUSED', metadata: { ...((c.metadata as object) ?? {}), pausedReason: out.error } } });
        await notifyCreator(c, 'Campaign paused', out.error);
        return;
      }
    }
  }
  await refreshCounts(campaignId);
  const left = await prisma.campaignRecipient.count({ where: { campaignId, status: 'QUEUED', attempts: { lt: 3 } } });
  if (!left) {
    const done = await prisma.campaign.updateMany({ where: { id: campaignId, status: 'RUNNING' }, data: { status: 'COMPLETED', completedAt: new Date() } });
    if (done.count) await notifyCreator(c, 'Campaign finished', `${c.name} has been sent.`);
  }
}

async function notifyCreator(c: { createdById: string | null; name: string; id: string }, title: string, message: string) {
  await notifyUsers([c.createdById], { title, message: `${c.name}: ${message}`, type: 'MARKETING', actionUrl: `/marketing/campaigns/${c.id}` });
}

/** Recomputes campaign counters from recipients/logs (provider-confirmed statuses only). */
export async function refreshCounts(campaignId: string) {
  const groups = await prisma.campaignRecipient.groupBy({ by: ['status'], where: { campaignId }, _count: true });
  const n = (s: string) => groups.find((g) => g.status === s)?._count ?? 0;
  const skipped = await prisma.campaignRecipient.count({ where: { campaignId, error: { startsWith: 'Skipped:' } } });
  const replies = await prisma.campaignRecipient.count({ where: { campaignId, repliedAt: { not: null } } });
  const cost = await prisma.messageLog.aggregate({ where: { campaignId }, _sum: { cost: true } });
  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      sentCount: n('SENT') + n('DELIVERED') + n('READ'),
      deliveredCount: n('DELIVERED') + n('READ'),
      readCount: n('READ'),
      failedCount: n('FAILED') - skipped,
      skippedCount: skipped + n('OPTED_OUT'),
      replyCount: replies,
      totalCost: cost._sum.cost,
    },
  });
}
