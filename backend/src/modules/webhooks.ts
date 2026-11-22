import { Router, Request } from 'express';
import crypto from 'crypto';
import { MessageStatus, Prisma } from '@prisma/client';
import { prisma } from '../prisma';
import { AppError, asyncHandler } from '../middleware/error';
import { safeEqual, decryptJson } from '../lib/crypto';
import { STOP_WORDS, START_WORDS } from '../integrations/messaging';
import { refreshCounts } from '../services/campaigns';
import { emitEvent } from '../services/automation';

/**
 * Provider webhooks (no user auth — verified by signature):
 *   GET  /webhooks/whatsapp          Meta verification (hub.verify_token = WHATSAPP_VERIFY_TOKEN)
 *   POST /webhooks/whatsapp          X-Hub-Signature-256 = HMAC-SHA256(raw body, WHATSAPP_APP_SECRET)
 *   POST /webhooks/twilio/:id        X-Twilio-Signature (HMAC-SHA1 with the connection's authToken)
 * Every event is stored in webhook_events (unique per provider event id → processed once).
 */
const router = Router();
type RawReq = Request & { rawBody?: Buffer };

const RANK: Record<string, number> = { QUEUED: 0, SENT: 1, DELIVERED: 2, READ: 3, FAILED: 4, OPTED_OUT: 4 };

/** Applies a provider status to the message log and campaign recipient (never goes backwards). */
async function applyStatus(providerMessageId: string, status: MessageStatus, at: Date, error?: string | null, cost?: number | null) {
  const log = await prisma.messageLog.findFirst({ where: { providerMessageId } });
  if (!log) return false;
  if (RANK[status] < RANK[log.status] && status !== 'FAILED') return true;
  const stamp = status === 'DELIVERED' ? { deliveredAt: at } : status === 'READ' ? { readAt: at, deliveredAt: log.deliveredAt ?? at } : status === 'FAILED' ? { failedAt: at, error } : { sentAt: log.sentAt ?? at };
  await prisma.messageLog.update({ where: { id: log.id }, data: { status, ...stamp, ...(cost != null ? { cost } : {}) } });
  if (log.campaignId) {
    await prisma.campaignRecipient.updateMany({
      where: { campaignId: log.campaignId, providerMessageId },
      data: { status, ...(status === 'DELIVERED' ? { deliveredAt: at } : status === 'READ' ? { readAt: at } : status === 'FAILED' ? { failedAt: at, error } : {}) },
    });
    await refreshCounts(log.campaignId);
  }
  return true;
}

/** Inbound message: opens the 24h window, records replies, handles STOP/START keywords. */
async function inbound(businessId: string, from: string, text: string, channel: 'WHATSAPP' | 'SMS', providerMessageId: string, whatsappAccountId?: string | null) {
  const phone = from.startsWith('+') ? from : `+${from}`;
  let contact = await prisma.marketingContact.findFirst({ where: { businessId, phone } });
  if (!contact) contact = await prisma.marketingContact.create({ data: { businessId, phone, source: channel === 'WHATSAPP' ? 'WHATSAPP' : 'SMS', tags: [] } });
  await prisma.messageLog.create({
    data: { businessId, channel, direction: 'INBOUND', contactId: contact.id, fromAddress: phone, toAddress: 'business', body: text.slice(0, 4096), providerMessageId, status: 'DELIVERED', deliveredAt: new Date(), whatsappAccountId: whatsappAccountId ?? undefined },
  }).catch((e) => { if ((e as { code?: string }).code !== 'P2002') throw e; });
  await prisma.marketingContact.update({ where: { id: contact.id }, data: { lastInboundAt: new Date() } });
  // Reply attribution: the latest campaign message to this contact in the last 7 days.
  const last = await prisma.campaignRecipient.findFirst({ where: { contactId: contact.id, sentAt: { gte: new Date(Date.now() - 7 * 86_400_000) }, repliedAt: null }, orderBy: { sentAt: 'desc' } });
  if (last) {
    await prisma.campaignRecipient.update({ where: { id: last.id }, data: { repliedAt: new Date() } });
    await refreshCounts(last.campaignId);
  }
  const word = text.trim().toUpperCase();
  if (STOP_WORDS.has(word)) {
    const field = channel === 'WHATSAPP' ? 'whatsappConsent' : 'smsConsent';
    await prisma.$transaction([
      prisma.contactConsentEvent.create({ data: { contactId: contact.id, channel, action: 'OPT_OUT', source: channel === 'WHATSAPP' ? 'WHATSAPP_REPLY' : 'SMS_REPLY', evidence: { keyword: word, providerMessageId } } }),
      prisma.marketingContact.update({ where: { id: contact.id }, data: { [field]: false, optedOutAt: new Date() } }),
    ]);
  } else if (START_WORDS.has(word)) {
    const field = channel === 'WHATSAPP' ? 'whatsappConsent' : 'smsConsent';
    await prisma.$transaction([
      prisma.contactConsentEvent.create({ data: { contactId: contact.id, channel, action: 'OPT_IN', source: channel === 'WHATSAPP' ? 'WHATSAPP_REPLY' : 'SMS_REPLY', evidence: { keyword: word, providerMessageId } } }),
      prisma.marketingContact.update({ where: { id: contact.id }, data: { [field]: true, optedOutAt: null, ...(channel === 'WHATSAPP' ? { whatsappOptInAt: new Date() } : {}) } }),
    ]);
    await emitEvent(businessId, 'CONTACT_OPTED_IN', `optin:${providerMessageId}`, { contactId: contact.id, phone });
  } else {
    await emitEvent(businessId, 'KEYWORD_RECEIVED', `inbound:${providerMessageId}`, { contactId: contact.id, phone, text: text.slice(0, 500), keyword: word.split(/\s+/)[0] ?? '' });
  }
}

async function storeEvent(provider: string, externalEventId: string, eventType: string, payload: unknown, integrationId?: string | null) {
  try {
    return await prisma.webhookEvent.create({ data: { provider, externalEventId, eventType, payload: payload as Prisma.InputJsonValue, integrationId: integrationId ?? undefined } });
  } catch (e) {
    if ((e as { code?: string }).code === 'P2002') return null; // already received → processed once
    throw e;
  }
}

// ---------------------------------------------------------------- WhatsApp (Meta Cloud API)

router.get('/whatsapp', (req, res) => {
  const token = process.env.WHATSAPP_VERIFY_TOKEN;
  if (token && req.query['hub.mode'] === 'subscribe' && typeof req.query['hub.verify_token'] === 'string' && safeEqual(req.query['hub.verify_token'], token)) {
    return res.status(200).type('text/plain').send(String(req.query['hub.challenge'] ?? ''));
  }
  return res.sendStatus(403);
});

router.post('/whatsapp', asyncHandler(async (req: RawReq, res) => {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret) throw new AppError('WhatsApp webhook is not configured', 503);
  const sig = String(req.get('x-hub-signature-256') ?? '');
  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(req.rawBody ?? Buffer.alloc(0)).digest('hex');
  if (!req.rawBody || !safeEqual(sig, expected)) return res.sendStatus(401);
  const body = req.body as any;
  for (const entry of body?.entry ?? []) {
    for (const change of entry?.changes ?? []) {
      const v = change?.value ?? {};
      const phoneNumberId = v?.metadata?.phone_number_id;
      const account = phoneNumberId ? await prisma.whatsAppAccount.findUnique({ where: { phoneNumberId: String(phoneNumberId) } }) : null;
      for (const s of v.statuses ?? []) {
        const ev = await storeEvent('whatsapp', `status:${s.id}:${s.status}`, 'message.status', s, account?.integrationId);
        if (!ev) continue;
        const map: Record<string, MessageStatus> = { sent: 'SENT', delivered: 'DELIVERED', read: 'READ', failed: 'FAILED' };
        const st = map[s.status];
        const okApplied = st ? await applyStatus(String(s.id), st, new Date(Number(s.timestamp) * 1000 || Date.now()), s.errors?.[0]?.title ?? null, null) : false;
        await prisma.webhookEvent.update({ where: { id: ev.id }, data: { status: okApplied ? 'PROCESSED' : 'FAILED', processedAt: new Date(), attempts: 1, error: okApplied ? null : 'Unknown message id or status' } });
      }
      for (const m of v.messages ?? []) {
        const ev = await storeEvent('whatsapp', `message:${m.id}`, 'message.inbound', m, account?.integrationId);
        if (!ev) continue;
        if (!account) {
          await prisma.webhookEvent.update({ where: { id: ev.id }, data: { status: 'FAILED', error: 'Unknown phone number id' } });
          continue;
        }
        const text = m.text?.body ?? m.button?.text ?? m.interactive?.button_reply?.title ?? '';
        await inbound(account.businessId, String(m.from), String(text), 'WHATSAPP', String(m.id), account.id);
        await prisma.webhookEvent.update({ where: { id: ev.id }, data: { status: 'PROCESSED', processedAt: new Date(), attempts: 1 } });
      }
    }
  }
  return res.sendStatus(200);
}));

// ---------------------------------------------------------------- Twilio SMS

function twilioSignature(authToken: string, url: string, params: Record<string, string>) {
  const data = url + Object.keys(params).sort().map((k) => k + params[k]).join('');
  return crypto.createHmac('sha1', authToken).update(data).digest('base64');
}

router.post('/twilio/:connectionId', asyncHandler(async (req, res) => {
  const conn = await prisma.integrationConnection.findFirst({ where: { id: String(req.params.connectionId), provider: 'SMS' } });
  if (!conn) return res.sendStatus(404);
  const creds = decryptJson<Record<string, string>>(conn.credentials);
  const base = process.env.PUBLIC_API_URL;
  if (!creds?.authToken || !base) return res.sendStatus(503);
  const params = Object.fromEntries(Object.entries(req.body ?? {}).map(([k, v]) => [k, String(v)]));
  const expected = twilioSignature(creds.authToken, `${base}/webhooks/twilio/${conn.id}`, params);
  if (!safeEqual(String(req.get('x-twilio-signature') ?? ''), expected)) return res.sendStatus(401);
  const sid = params.MessageSid ?? params.SmsSid;
  if (params.MessageStatus) {
    const ev = await storeEvent('twilio', `status:${sid}:${params.MessageStatus}`, 'message.status', params, conn.id);
    if (ev) {
      const map: Record<string, MessageStatus> = { sent: 'SENT', delivered: 'DELIVERED', undelivered: 'FAILED', failed: 'FAILED', read: 'READ' };
      const st = map[params.MessageStatus];
      const price = params.Price ? Math.abs(Number(params.Price)) : null;
      const applied = st ? await applyStatus(sid, st, new Date(), params.ErrorCode ? `Error ${params.ErrorCode}` : null, Number.isFinite(price as number) ? price : null) : false;
      await prisma.webhookEvent.update({ where: { id: ev.id }, data: { status: applied ? 'PROCESSED' : 'FAILED', processedAt: new Date(), attempts: 1 } });
    }
  } else if (params.Body !== undefined && params.From) {
    const ev = await storeEvent('twilio', `message:${sid}`, 'message.inbound', params, conn.id);
    if (ev) {
      await inbound(conn.businessId, params.From, params.Body, 'SMS', sid);
      await prisma.webhookEvent.update({ where: { id: ev.id }, data: { status: 'PROCESSED', processedAt: new Date(), attempts: 1 } });
    }
  }
  return res.type('text/xml').send('<Response></Response>');
}));

export default router;
