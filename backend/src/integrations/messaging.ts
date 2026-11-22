import { prisma } from '../prisma';
import { decryptJson } from '../lib/crypto';

/**
 * Messaging providers behind one interface.
 *
 * WhatsApp: Meta WhatsApp Business Platform (Cloud API). Credentials (encrypted on the
 *   IntegrationConnection, provider WHATSAPP): { accessToken }, settings: { phoneNumberId, wabaId }.
 *   Webhook: GET/POST /api/webhooks/whatsapp, needs env WHATSAPP_VERIFY_TOKEN + WHATSAPP_APP_SECRET.
 * SMS: Twilio. Credentials (provider SMS): { accountSid, authToken }, settings:
 *   { from | messagingServiceSid }. Status webhook: POST /api/webhooks/twilio/<connectionId>.
 * Sandbox: settings.mode = "sandbox" on either provider: nothing leaves the server; messages are
 *   recorded as SENT with metadata.sandbox = true and are never reported as delivered.
 */

export type Channel = 'WHATSAPP' | 'SMS';
export type SendInput = {
  to: string;
  text?: string;
  template?: { name: string; language: string; params: string[] };
  /** For delivery status callbacks. */
  logId?: string;
};
export type SendResult =
  | { ok: true; providerMessageId: string; sandbox: boolean; cost?: number | null }
  | { ok: false; error: string; retryable: boolean };

export interface Sender {
  channel: Channel;
  connectionId: string;
  sandbox: boolean;
  send(input: SendInput): Promise<SendResult>;
}

const graphBase = () => process.env.WHATSAPP_API_BASE ?? 'https://graph.facebook.com/v21.0';
const twilioBase = () => process.env.TWILIO_API_BASE ?? 'https://api.twilio.com/2010-04-01';

type Settings = Record<string, unknown>;

async function http(url: string, init: RequestInit, timeoutMs = 15_000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal });
    const text = await res.text();
    let body: any = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = { raw: text.slice(0, 500) };
    }
    return { status: res.status, body };
  } finally {
    clearTimeout(t);
  }
}

function sandboxSender(channel: Channel, connectionId: string): Sender {
  return {
    channel,
    connectionId,
    sandbox: true,
    async send() {
      return { ok: true, providerMessageId: `sandbox-${channel.toLowerCase()}-${crypto.randomUUID()}`, sandbox: true, cost: null };
    },
  };
}

function whatsappSender(connectionId: string, creds: Record<string, string>, settings: Settings): Sender {
  const phoneNumberId = String(settings.phoneNumberId ?? '');
  return {
    channel: 'WHATSAPP',
    connectionId,
    sandbox: false,
    async send(input) {
      const body = input.template
        ? {
            messaging_product: 'whatsapp',
            to: input.to.replace(/^\+/, ''),
            type: 'template',
            template: {
              name: input.template.name,
              language: { code: input.template.language },
              ...(input.template.params.length
                ? { components: [{ type: 'body', parameters: input.template.params.map((text) => ({ type: 'text', text })) }] }
                : {}),
            },
          }
        : { messaging_product: 'whatsapp', to: input.to.replace(/^\+/, ''), type: 'text', text: { body: input.text ?? '' } };
      try {
        const r = await http(`${graphBase()}/${encodeURIComponent(phoneNumberId)}/messages`, {
          method: 'POST',
          headers: { authorization: `Bearer ${creds.accessToken}`, 'content-type': 'application/json' },
          body: JSON.stringify(body),
        });
        const id = r.body?.messages?.[0]?.id;
        if (r.status >= 200 && r.status < 300 && id) return { ok: true, providerMessageId: String(id), sandbox: false };
        const err = r.body?.error;
        return { ok: false, error: `WhatsApp ${r.status}: ${err?.message ?? 'no message id returned'}`.slice(0, 500), retryable: r.status === 429 || r.status >= 500 };
      } catch (e) {
        return { ok: false, error: `WhatsApp request failed: ${(e as Error).message}`, retryable: true };
      }
    },
  };
}

function twilioSender(connectionId: string, creds: Record<string, string>, settings: Settings): Sender {
  return {
    channel: 'SMS',
    connectionId,
    sandbox: false,
    async send(input) {
      const form = new URLSearchParams({ To: input.to, Body: input.text ?? '' });
      if (settings.messagingServiceSid) form.set('MessagingServiceSid', String(settings.messagingServiceSid));
      else form.set('From', String(settings.from ?? ''));
      if (process.env.PUBLIC_API_URL) form.set('StatusCallback', `${process.env.PUBLIC_API_URL}/webhooks/twilio/${connectionId}`);
      try {
        const r = await http(`${twilioBase()}/Accounts/${encodeURIComponent(creds.accountSid)}/Messages.json`, {
          method: 'POST',
          headers: {
            authorization: 'Basic ' + Buffer.from(`${creds.accountSid}:${creds.authToken}`).toString('base64'),
            'content-type': 'application/x-www-form-urlencoded',
          },
          body: form.toString(),
        });
        if (r.status >= 200 && r.status < 300 && r.body?.sid) {
          const price = r.body.price != null ? Math.abs(Number(r.body.price)) : null;
          return { ok: true, providerMessageId: String(r.body.sid), sandbox: false, cost: Number.isFinite(price as number) ? price : null };
        }
        return { ok: false, error: `SMS ${r.status}: ${r.body?.message ?? 'rejected'}`.slice(0, 500), retryable: r.status === 429 || r.status >= 500 };
      } catch (e) {
        return { ok: false, error: `SMS request failed: ${(e as Error).message}`, retryable: true };
      }
    },
  };
}

/** The connected sender for a business + channel, or a reason why there is none. */
export async function senderFor(businessId: string, channel: Channel): Promise<Sender | { error: string }> {
  const connection = await prisma.integrationConnection.findFirst({
    where: { businessId, provider: channel, status: 'CONNECTED' },
    orderBy: { connectedAt: 'desc' },
  });
  if (!connection) return { error: `${channel === 'WHATSAPP' ? 'WhatsApp' : 'SMS'} is not connected for this business` };
  const settings = (connection.settings ?? {}) as Settings;
  if (settings.mode === 'sandbox') return sandboxSender(channel, connection.id);
  const creds = decryptJson<Record<string, string>>(connection.credentials);
  if (!creds) return { error: 'Integration credentials are missing or unreadable; reconnect the integration' };
  return channel === 'WHATSAPP' ? whatsappSender(connection.id, creds, settings) : twilioSender(connection.id, creds, settings);
}

/** Checks credentials against the provider without sending anything. */
export async function validateConnection(
  provider: Channel,
  creds: Record<string, string>,
  settings: Settings,
): Promise<{ ok: true; details: Record<string, unknown> } | { ok: false; error: string }> {
  if (settings.mode === 'sandbox') return { ok: true, details: { sandbox: true } };
  try {
    if (provider === 'WHATSAPP') {
      if (!creds.accessToken || !settings.phoneNumberId) return { ok: false, error: 'accessToken and phoneNumberId are required' };
      const r = await http(`${graphBase()}/${encodeURIComponent(String(settings.phoneNumberId))}?fields=display_phone_number,verified_name,quality_rating`, {
        headers: { authorization: `Bearer ${creds.accessToken}` },
      });
      if (r.status !== 200) return { ok: false, error: `WhatsApp ${r.status}: ${r.body?.error?.message ?? 'credentials rejected'}` };
      return { ok: true, details: { displayPhoneNumber: r.body.display_phone_number, verifiedName: r.body.verified_name, qualityRating: r.body.quality_rating } };
    }
    if (!creds.accountSid || !creds.authToken) return { ok: false, error: 'accountSid and authToken are required' };
    if (!settings.from && !settings.messagingServiceSid) return { ok: false, error: 'settings.from or settings.messagingServiceSid is required' };
    const r = await http(`${twilioBase()}/Accounts/${encodeURIComponent(creds.accountSid)}.json`, {
      headers: { authorization: 'Basic ' + Buffer.from(`${creds.accountSid}:${creds.authToken}`).toString('base64') },
    });
    if (r.status !== 200) return { ok: false, error: `SMS provider ${r.status}: ${r.body?.message ?? 'credentials rejected'}` };
    return { ok: true, details: { accountStatus: r.body.status, friendlyName: r.body.friendly_name } };
  } catch (e) {
    return { ok: false, error: `Could not reach the provider: ${(e as Error).message}` };
  }
}

/** Submits a WhatsApp template to Meta for approval. */
export async function submitWhatsAppTemplate(
  creds: Record<string, string>,
  wabaId: string,
  t: { name: string; language: string; category: string; body: string; footer?: string | null },
): Promise<{ ok: true; id: string; status: string } | { ok: false; error: string }> {
  const components: unknown[] = [{ type: 'BODY', text: t.body }];
  if (t.footer) components.push({ type: 'FOOTER', text: t.footer });
  const r = await http(`${graphBase()}/${encodeURIComponent(wabaId)}/message_templates`, {
    method: 'POST',
    headers: { authorization: `Bearer ${creds.accessToken}`, 'content-type': 'application/json' },
    body: JSON.stringify({ name: t.name, language: t.language, category: t.category, components }),
  });
  if (r.status >= 200 && r.status < 300 && r.body?.id) return { ok: true, id: String(r.body.id), status: String(r.body.status ?? 'PENDING') };
  return { ok: false, error: `WhatsApp ${r.status}: ${r.body?.error?.message ?? 'template rejected'}` };
}

/** Reads template statuses from Meta (name+language → status, reason). */
export async function fetchWhatsAppTemplates(creds: Record<string, string>, wabaId: string) {
  const r = await http(`${graphBase()}/${encodeURIComponent(wabaId)}/message_templates?fields=name,language,status,rejected_reason,id&limit=200`, {
    headers: { authorization: `Bearer ${creds.accessToken}` },
  });
  if (r.status !== 200) throw new Error(`WhatsApp ${r.status}: ${r.body?.error?.message ?? 'could not list templates'}`);
  return (r.body?.data ?? []) as { id: string; name: string; language: string; status: string; rejected_reason?: string }[];
}

/** Fills {{1}} / {{name}} placeholders. */
export function renderTemplate(body: string, values: Record<string, string>): string {
  return body.replace(/{{\s*([\w.]+)\s*}}/g, (_m, k: string) => values[k] ?? '');
}

/** Opt-out keywords (English + Somali). */
export const STOP_WORDS = new Set(['STOP', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT', 'JOOJI', 'BAX']);
export const START_WORDS = new Set(['START', 'SUBSCRIBE', 'UNSTOP', 'BILOW']);
