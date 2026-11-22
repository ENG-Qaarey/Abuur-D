import { CampaignChannel } from '@prisma/client';
import { prisma } from '../prisma';
import { senderFor, renderTemplate, Channel } from '../integrations/messaging';

export type SendRequest = {
  businessId: string;
  channel: Channel;
  contactId?: string | null;
  /** Phone to send to when there is no contact (transactional messages). */
  to?: string | null;
  text?: string | null;
  templateId?: string | null;
  /** Values for template variables, by variable name. */
  values?: Record<string, string>;
  /** Marketing messages need consent and are blocked for opted-out contacts. */
  marketing: boolean;
  campaignId?: string | null;
  automationRuleId?: string | null;
  orderId?: string | null;
  whatsappAccountId?: string | null;
  testMode?: boolean;
};

export type SendOutcome =
  | { status: 'SENT'; logId: string; providerMessageId: string; sandbox: boolean; cost: number | null }
  | { status: 'SKIPPED'; reason: string }
  | { status: 'FAILED'; logId?: string; error: string; retryable: boolean };

const WINDOW_MS = 24 * 60 * 60 * 1000;

/**
 * The only way messages leave ABUUR. Consent, opt-out, template approval and the WhatsApp 24h
 * customer-service window are checked here, immediately before sending.
 */
export async function sendMessage(req: SendRequest): Promise<SendOutcome> {
  const contact = req.contactId
    ? await prisma.marketingContact.findFirst({ where: { id: req.contactId, businessId: req.businessId } })
    : null;
  if (req.contactId && !contact) return { status: 'SKIPPED', reason: 'Contact not found' };
  const to = contact?.phone ?? req.to ?? null;
  if (!to) return { status: 'SKIPPED', reason: 'No phone number' };

  if (contact) {
    if (contact.optedOutAt) return { status: 'SKIPPED', reason: 'Contact opted out' };
    if (req.marketing) {
      const consent = req.channel === 'WHATSAPP' ? contact.whatsappConsent : contact.smsConsent;
      if (!consent) return { status: 'SKIPPED', reason: `No ${req.channel} marketing consent` };
    }
  } else if (req.marketing) {
    return { status: 'SKIPPED', reason: 'Marketing messages need a contact with consent' };
  }
  // A phone number on the business-wide suppression list (any contact with this number opted out).
  const suppressed = await prisma.marketingContact.count({ where: { businessId: req.businessId, phone: to, optedOutAt: { not: null } } });
  if (suppressed) return { status: 'SKIPPED', reason: 'Number is on the opt-out list' };

  const template = req.templateId
    ? await prisma.messageTemplate.findFirst({ where: { id: req.templateId, businessId: req.businessId } })
    : null;
  if (req.templateId && !template) return { status: 'SKIPPED', reason: 'Template not found' };
  if (template && template.channel !== req.channel) return { status: 'SKIPPED', reason: `Template is for ${template.channel}` };

  const values: Record<string, string> = {
    name: contact?.name ?? '',
    phone: to,
    ...(req.values ?? {}),
  };

  if (req.channel === 'WHATSAPP') {
    if (template && template.status !== 'APPROVED') return { status: 'SKIPPED', reason: `WhatsApp template is ${template.status}, not APPROVED` };
    if (!template) {
      const inWindow = contact?.lastInboundAt && Date.now() - contact.lastInboundAt.getTime() < WINDOW_MS;
      if (!inWindow) return { status: 'SKIPPED', reason: 'Outside the 24h WhatsApp window: an approved template is required' };
      if (!req.text) return { status: 'SKIPPED', reason: 'Message text is empty' };
    }
  } else if (template && ['REJECTED', 'PAUSED'].includes(template.status)) {
    return { status: 'SKIPPED', reason: `Template is ${template.status}` };
  }

  const body = template ? renderTemplate(template.body, values) : req.text ?? '';
  if (!body.trim()) return { status: 'SKIPPED', reason: 'Message text is empty' };

  if (req.testMode) return { status: 'SKIPPED', reason: 'Test mode: not sent' };

  const sender = await senderFor(req.businessId, req.channel);
  if ('error' in sender) return { status: 'FAILED', error: sender.error, retryable: false };

  const log = await prisma.messageLog.create({
    data: {
      businessId: req.businessId,
      channel: req.channel as CampaignChannel,
      direction: 'OUTBOUND',
      contactId: contact?.id,
      campaignId: req.campaignId ?? undefined,
      automationRuleId: req.automationRuleId ?? undefined,
      templateId: template?.id,
      orderId: req.orderId ?? undefined,
      whatsappAccountId: req.whatsappAccountId ?? undefined,
      toAddress: to,
      body,
      status: 'QUEUED',
    },
  });

  const result = await sender.send({
    to,
    text: body,
    template: template && req.channel === 'WHATSAPP'
      ? { name: template.name, language: template.language, params: template.variables.map((v) => values[v] ?? '') }
      : undefined,
    logId: log.id,
  });

  if (!result.ok) {
    await prisma.messageLog.update({ where: { id: log.id }, data: { status: 'FAILED', failedAt: new Date(), error: result.error } });
    return { status: 'FAILED', logId: log.id, error: result.error, retryable: result.retryable };
  }
  await prisma.messageLog.update({
    where: { id: log.id },
    data: {
      // SENT = accepted by the provider. DELIVERED/READ only come from provider webhooks.
      status: 'SENT',
      sentAt: new Date(),
      providerMessageId: result.providerMessageId,
      cost: result.cost ?? undefined,
      metadata: result.sandbox ? { sandbox: true } : undefined,
    },
  });
  return { status: 'SENT', logId: log.id, providerMessageId: result.providerMessageId, sandbox: result.sandbox, cost: result.cost ?? null };
}
