import { Router } from 'express';
import { CampaignChannel, ConsentSource, Prisma } from '@prisma/client';
import { prisma } from '../prisma';
import { authedRouter } from '../lib/router';
import { authenticate } from '../middleware/auth';
import { AppError, asyncHandler } from '../middleware/error';
import { ok, Input, userId, normalizePhone, rangeOf, money } from '../lib/http';
import { findFor, forBusiness, assertInBusiness } from '../lib/guard';
import { audit } from '../lib/audit';
import { encryptJson, decryptJson } from '../lib/crypto';
import { validateConnection, submitWhatsAppTemplate, fetchWhatsAppTemplates, renderTemplate } from '../integrations/messaging';
import { campaignPreview, segmentWhere, audienceWhere, validateRules, refreshCounts } from '../services/campaigns';
import { conditionsMatch } from '../services/automation';
import { rateLimit } from '../middleware/rate-limit';

/**
 * WhatsApp & SMS marketing: integrations, contacts (import, dedupe, consent), segments,
 * templates, campaigns (preview → schedule → batches → stats) and automation previews.
 */
const router = authedRouter();

// ---------------------------------------------------------------- integrations

const REQUIRED: Record<string, { credentials: string[]; settings: string[]; env: string[] }> = {
  WHATSAPP: {
    credentials: ['accessToken (permanent System User token with whatsapp_business_messaging)'],
    settings: ['phoneNumberId', 'wabaId', 'pricePerMessage (optional, for cost estimates)'],
    env: ['WHATSAPP_VERIFY_TOKEN', 'WHATSAPP_APP_SECRET', 'PUBLIC_API_URL'],
  },
  SMS: {
    credentials: ['accountSid', 'authToken (Twilio)'],
    settings: ['from (sender number) or messagingServiceSid', 'pricePerMessage (optional)'],
    env: ['PUBLIC_API_URL (for delivery reports)'],
  },
};

router.get('/integrations', asyncHandler(async (req, res) => {
  const { businessId } = await forBusiness(req, req.query.businessId, 'integrationConnection', 'read');
  const rows = await prisma.integrationConnection.findMany({ where: { businessId }, orderBy: { createdAt: 'desc' }, omit: { credentials: true } });
  return ok(res, { connections: rows, requirements: REQUIRED, webhookConfigured: { whatsapp: !!(process.env.WHATSAPP_VERIFY_TOKEN && process.env.WHATSAPP_APP_SECRET), publicUrl: !!process.env.PUBLIC_API_URL } });
}));

/**
 * Connect WhatsApp or SMS: credentials are checked with the provider first, then stored
 * encrypted. mode "sandbox" connects a test channel that never sends real messages.
 */
router.post('/integrations/connect', rateLimit({ windowMs: 60_000, max: 10 }), asyncHandler(async (req, res) => {
  const i = Input.of(req);
  const { businessId } = await forBusiness(req, i.raw('businessId'), 'integrationConnection', 'create');
  const provider = i.oneOf('provider', ['WHATSAPP', 'SMS'] as const, true)!;
  const mode = i.oneOf('mode', ['live', 'sandbox'] as const) ?? 'live';
  const credsIn = i.raw('credentials');
  const settingsIn = i.raw('settings');
  const credentials = (credsIn && typeof credsIn === 'object' ? credsIn : {}) as Record<string, string>;
  const settings: Record<string, unknown> = { ...((settingsIn && typeof settingsIn === 'object' ? settingsIn : {}) as Record<string, unknown>), mode };
  for (const [k, v] of Object.entries(credentials)) if (typeof v !== 'string' || v.length > 2000) throw new AppError(`credentials.${k} must be text`, 400);
  const check = await validateConnection(provider, credentials, settings);
  const name = i.str('name', { max: 100 }) ?? (provider === 'WHATSAPP' ? 'WhatsApp Business' : 'SMS');
  const existing = await prisma.integrationConnection.findFirst({ where: { businessId, provider } });
  const data = {
    businessId,
    provider,
    name,
    status: check.ok ? ('CONNECTED' as const) : ('ERROR' as const),
    externalAccountId: provider === 'WHATSAPP' ? String(settings.wabaId ?? '') || null : credentials.accountSid ?? null,
    credentials: mode === 'sandbox' ? Prisma.DbNull : (encryptJson(credentials) as Prisma.InputJsonValue),
    settings: { ...settings, ...(check.ok ? { providerDetails: check.details } : {}) } as Prisma.InputJsonValue,
    connectedAt: check.ok ? new Date() : null,
    lastError: check.ok ? null : check.error,
  };
  const conn = existing
    ? await prisma.integrationConnection.update({ where: { id: existing.id }, data, omit: { credentials: true } })
    : await prisma.integrationConnection.create({ data, omit: { credentials: true } });
  if (provider === 'WHATSAPP' && check.ok && mode === 'live') {
    const phone = String((check as any).details?.displayPhoneNumber ?? settings.displayPhoneNumber ?? '').replace(/[^\d+]/g, '');
    if (phone && settings.phoneNumberId) {
      await prisma.whatsAppAccount.upsert({
        where: { phoneNumberId: String(settings.phoneNumberId) },
        create: { businessId, integrationId: conn.id, displayName: String((check as any).details?.verifiedName ?? name), phoneNumber: phone.startsWith('+') ? phone : `+${phone}`, phoneNumberId: String(settings.phoneNumberId), wabaId: String(settings.wabaId ?? ''), status: 'CONNECTED', isDefault: true, connectedAt: new Date(), qualityRating: (check as any).details?.qualityRating },
        // Meta just confirmed this token controls the number, so it now belongs to this business.
        update: { businessId, integrationId: conn.id, status: 'CONNECTED', connectedAt: new Date() },
      });
    }
  }
  await audit(req, { action: 'integration.connect', entityType: 'IntegrationConnection', entityId: conn.id, businessId, metadata: { provider, mode, ok: check.ok } });
  if (!check.ok) return res.status(422).json({ success: false, statusCode: 422, timestamp: new Date().toISOString(), message: check.error, data: conn });
  return ok(res, conn, existing ? 200 : 201);
}));

router.post('/integrations/:id/test', asyncHandler(async (req, res) => {
  const { row, businessId } = await findFor(req, 'integrationConnection', req.params.id, 'write');
  if (!['WHATSAPP', 'SMS'].includes(row.provider)) throw new AppError('Only WhatsApp and SMS connections can be tested here', 400);
  const conn = await prisma.integrationConnection.findUniqueOrThrow({ where: { id: row.id } });
  const settings = (conn.settings ?? {}) as Record<string, unknown>;
  const creds = settings.mode === 'sandbox' ? {} : decryptJson(conn.credentials);
  if (!creds) throw new AppError('Stored credentials are unreadable; reconnect', 409);
  const check = await validateConnection(row.provider as 'WHATSAPP' | 'SMS', creds, settings);
  const updated = await prisma.integrationConnection.update({
    where: { id: row.id },
    data: { status: check.ok ? 'CONNECTED' : 'ERROR', lastError: check.ok ? null : check.error },
    omit: { credentials: true },
  });
  await audit(req, { action: 'integration.test', entityType: 'IntegrationConnection', entityId: row.id, businessId, metadata: { ok: check.ok } });
  return ok(res, { connection: updated, ok: check.ok, error: check.ok ? null : check.error });
}));

/** Disconnect safely: credentials are erased; scheduled campaigns on this channel are paused. */
router.post('/integrations/:id/disconnect', asyncHandler(async (req, res) => {
  const { row, businessId } = await findFor(req, 'integrationConnection', req.params.id, 'write');
  const updated = await prisma.$transaction(async (tx) => {
    const u = await tx.integrationConnection.update({ where: { id: row.id }, data: { status: 'DISCONNECTED', credentials: Prisma.DbNull, connectedAt: null }, omit: { credentials: true } });
    if (row.provider === 'WHATSAPP' || row.provider === 'SMS') {
      await tx.campaign.updateMany({ where: { businessId, channel: row.provider as CampaignChannel, status: { in: ['SCHEDULED', 'RUNNING'] } }, data: { status: 'PAUSED' } });
      if (row.provider === 'WHATSAPP') await tx.whatsAppAccount.updateMany({ where: { integrationId: row.id }, data: { status: 'DISCONNECTED' } });
    }
    return u;
  });
  await audit(req, { action: 'integration.disconnect', entityType: 'IntegrationConnection', entityId: row.id, businessId });
  return ok(res, updated);
}));

// ---------------------------------------------------------------- contacts & consent

async function recordConsent(
  tx: Prisma.TransactionClient,
  contactId: string,
  channel: 'WHATSAPP' | 'SMS' | 'EMAIL',
  action: 'OPT_IN' | 'OPT_OUT',
  source: ConsentSource,
  evidence: Record<string, unknown>,
) {
  await tx.contactConsentEvent.create({ data: { contactId, channel, action, source, evidence: evidence as Prisma.InputJsonValue } });
  const field = channel === 'WHATSAPP' ? 'whatsappConsent' : channel === 'SMS' ? 'smsConsent' : 'emailConsent';
  const data: Prisma.MarketingContactUpdateInput = { [field]: action === 'OPT_IN' };
  if (action === 'OPT_IN') {
    data.optedOutAt = null;
    if (channel === 'WHATSAPP') data.whatsappOptInAt = new Date();
  }
  await tx.marketingContact.update({ where: { id: contactId }, data });
}

export { recordConsent };

const CONSENT_SOURCES = ['STOREFRONT', 'FORM', 'WHATSAPP_REPLY', 'SMS_REPLY', 'IMPORT', 'MANUAL'] as const;

/** POST /marketing-contacts — create (dedupe by phone/email) with optional consent + evidence. */
router.post('/marketing-contacts', asyncHandler(async (req, res) => {
  const i = Input.of(req);
  const { businessId } = await forBusiness(req, i.raw('businessId'), 'marketingContact', 'create');
  const phone = i.phone('phone');
  const email = i.email('email');
  if (!phone && !email) throw new AppError('phone or email is required', 400);
  const dup = await prisma.marketingContact.findFirst({ where: { businessId, OR: [...(phone ? [{ phone }] : []), ...(email ? [{ email }] : [])] }, select: { id: true, name: true } });
  if (dup) return res.status(409).json({ success: false, statusCode: 409, timestamp: new Date().toISOString(), message: 'A contact with this phone or email already exists', data: { duplicate: dup } });
  const customerId = i.id('customerId');
  await assertInBusiness('cRMCustomer', customerId, businessId, 'customerId');
  const consent = i.list('consentChannels', 3) ?? [];
  for (const ch of consent) if (!['WHATSAPP', 'SMS', 'EMAIL'].includes(ch)) throw new AppError('consentChannels can contain WHATSAPP, SMS, EMAIL', 400);
  const source = i.oneOf('consentSource', CONSENT_SOURCES);
  if (consent.length && !source) throw new AppError('consentSource is required when recording consent', 400);
  const contact = await prisma.$transaction(async (tx) => {
    const c = await tx.marketingContact.create({
      data: { businessId, name: i.str('name', { max: 200 }), phone, email, city: i.str('city', { max: 100 }), source: i.str('source', { max: 50 }) ?? 'MANUAL', tags: i.list('tags', 50) ?? [], customerId },
    });
    for (const ch of consent) await recordConsent(tx, c.id, ch as any, 'OPT_IN', source as ConsentSource, { recordedBy: userId(req), note: i.str('consentNote', { max: 500 }) ?? null, at: new Date().toISOString() });
    return tx.marketingContact.findUniqueOrThrow({ where: { id: c.id } });
  });
  return ok(res, contact, 201);
}));

/**
 * CSV import (columns: name, phone, email, city, tags — tags separated by ;). Rows are validated;
 * duplicates (in the file or already saved) are skipped. Consent is only recorded when the
 * uploader confirms it (hasConsent + consentChannels), with the import as evidence.
 */
router.post('/marketing-contacts/import', rateLimit({ windowMs: 60_000, max: 10 }), asyncHandler(async (req, res) => {
  const i = Input.of(req);
  const { businessId } = await forBusiness(req, i.raw('businessId'), 'marketingContact', 'create');
  const csv = i.str('csv', { required: true, max: 5_000_000 })!;
  const rows = parseCsv(csv);
  if (rows.length < 2) throw new AppError('The CSV needs a header row and at least one contact', 400);
  if (rows.length > 20_001) throw new AppError('At most 20,000 contacts per import', 400);
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const col = (n: string) => header.indexOf(n);
  if (col('phone') < 0 && col('email') < 0) throw new AppError('The CSV needs a "phone" or "email" column', 400);
  const consentChannels = (i.list('consentChannels', 3) ?? []).filter((c) => ['WHATSAPP', 'SMS', 'EMAIL'].includes(c));
  const hasConsent = i.bool('hasConsent') === true && consentChannels.length > 0;
  const tagsAll = i.list('tags', 20) ?? [];
  const existing = await prisma.marketingContact.findMany({ where: { businessId }, select: { phone: true, email: true } });
  const seenPhones = new Set(existing.map((e) => e.phone).filter(Boolean));
  const seenEmails = new Set(existing.map((e) => e.email?.toLowerCase()).filter(Boolean));
  const invalid: { row: number; error: string }[] = [];
  const good: Prisma.MarketingContactCreateManyInput[] = [];
  let duplicates = 0;
  rows.slice(1).forEach((r, n) => {
    if (r.every((x) => !x.trim())) return;
    const get = (name: string) => (col(name) >= 0 ? (r[col(name)] ?? '').trim() : '');
    let phone: string | null = null;
    let email: string | null = null;
    try {
      if (get('phone')) phone = normalizePhone(get('phone'));
      if (get('email')) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(get('email'))) throw new Error('invalid email');
        email = get('email').toLowerCase();
      }
      if (!phone && !email) throw new Error('no phone or email');
    } catch (e) {
      invalid.push({ row: n + 2, error: (e as Error).message });
      return;
    }
    if ((phone && seenPhones.has(phone)) || (email && seenEmails.has(email))) {
      duplicates++;
      return;
    }
    if (phone) seenPhones.add(phone);
    if (email) seenEmails.add(email);
    good.push({
      businessId,
      name: get('name').slice(0, 200) || null,
      phone,
      email,
      city: get('city').slice(0, 100) || null,
      tags: [...new Set([...tagsAll, ...get('tags').split(';').map((t) => t.trim()).filter(Boolean)])].slice(0, 50),
      source: 'IMPORT',
      ...(hasConsent ? { whatsappConsent: consentChannels.includes('WHATSAPP'), smsConsent: consentChannels.includes('SMS'), emailConsent: consentChannels.includes('EMAIL'), whatsappOptInAt: consentChannels.includes('WHATSAPP') ? new Date() : null } : {}),
    });
  });
  let created = 0;
  for (let n = 0; n < good.length; n += 1000) created += (await prisma.marketingContact.createMany({ data: good.slice(n, n + 1000) })).count;
  if (hasConsent && good.length) {
    const ids = await prisma.marketingContact.findMany({ where: { businessId, source: 'IMPORT', OR: [{ phone: { in: good.map((g) => g.phone!).filter(Boolean) } }, { email: { in: good.map((g) => g.email!).filter(Boolean) } }] }, select: { id: true } });
    const evidence = { importedBy: userId(req), at: new Date().toISOString(), statement: i.str('consentStatement', { max: 500 }) ?? 'Uploader confirmed these contacts gave consent' };
    await prisma.contactConsentEvent.createMany({ data: ids.flatMap((c) => consentChannels.map((ch) => ({ contactId: c.id, channel: ch as CampaignChannel, action: 'OPT_IN' as const, source: 'IMPORT' as const, evidence }))) });
  }
  await audit(req, { action: 'contacts.import', entityType: 'MarketingContact', businessId, metadata: { created, duplicates, invalid: invalid.length, consent: hasConsent ? consentChannels : [] } });
  return ok(res, { created, duplicates, invalid: invalid.slice(0, 200), invalidCount: invalid.length });
}));

/** Minimal RFC-4180 CSV parser (quotes, commas and newlines inside quotes). */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  const s = text.replace(/^﻿/, '');
  for (let n = 0; n < s.length; n++) {
    const ch = s[n];
    if (quoted) {
      if (ch === '"' && s[n + 1] === '"') { field += '"'; n++; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && s[n + 1] === '\n') n++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += ch;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

/** Record consent or opt-out for a contact (with source and evidence). */
router.post('/marketing-contacts/:id/consent', asyncHandler(async (req, res) => {
  const { row, businessId } = await findFor(req, 'marketingContact', req.params.id, 'write');
  const i = Input.of(req);
  const channel = i.oneOf('channel', ['WHATSAPP', 'SMS', 'EMAIL'] as const, true)!;
  const action = i.oneOf('action', ['OPT_IN', 'OPT_OUT'] as const, true)!;
  const source = i.oneOf('source', CONSENT_SOURCES, true)!;
  const updated = await prisma.$transaction(async (tx) => {
    await recordConsent(tx, row.id, channel, action, source as ConsentSource, { recordedBy: userId(req), note: i.str('note', { max: 500 }) ?? null, at: new Date().toISOString() });
    return tx.marketingContact.findUniqueOrThrow({ where: { id: row.id } });
  });
  await audit(req, { action: `consent.${action.toLowerCase()}`, entityType: 'MarketingContact', entityId: row.id, businessId, metadata: { channel, source } });
  return ok(res, updated);
}));

/** Full opt-out (all channels) — e.g. the person asked by phone. Adds the number to the suppression list. */
router.post('/marketing-contacts/:id/opt-out', asyncHandler(async (req, res) => {
  const { row, businessId } = await findFor(req, 'marketingContact', req.params.id, 'write');
  const reason = Input.of(req).str('reason', { max: 500 });
  const updated = await prisma.$transaction(async (tx) => {
    for (const ch of ['WHATSAPP', 'SMS', 'EMAIL'] as const) await recordConsent(tx, row.id, ch, 'OPT_OUT', 'MANUAL', { recordedBy: userId(req), reason: reason ?? null });
    return tx.marketingContact.update({ where: { id: row.id }, data: { optedOutAt: new Date() } });
  });
  await audit(req, { action: 'consent.opt_out_all', entityType: 'MarketingContact', entityId: row.id, businessId, metadata: { reason } });
  return ok(res, updated);
}));

router.get('/marketing-contacts/:id/consent-history', asyncHandler(async (req, res) => {
  const { row } = await findFor(req, 'marketingContact', req.params.id);
  return ok(res, await prisma.contactConsentEvent.findMany({ where: { contactId: row.id }, orderBy: { occurredAt: 'desc' } }));
}));

/** Suppression list: everyone who opted out. */
router.get('/marketing/suppression-list', asyncHandler(async (req, res) => {
  const { businessId } = await forBusiness(req, req.query.businessId, 'marketingContact', 'read');
  return ok(res, await prisma.marketingContact.findMany({ where: { businessId, optedOutAt: { not: null } }, orderBy: { optedOutAt: 'desc' }, select: { id: true, name: true, phone: true, email: true, optedOutAt: true } }));
}));

// ---------------------------------------------------------------- segments

router.post('/contact-segments', asyncHandler(async (req, res) => {
  const i = Input.of(req);
  const { businessId } = await forBusiness(req, i.raw('businessId'), 'contactSegment', 'create');
  const rules = i.raw('rules');
  validateRules(rules);
  const seg = await prisma.contactSegment.create({
    data: { businessId, name: i.reqStr('name', 100), description: i.str('description', { max: 500 }), isDynamic: i.bool('isDynamic') ?? true, rules: (rules ?? undefined) as Prisma.InputJsonValue },
  });
  return ok(res, seg, 201);
}));

/** Contacts currently in a segment (paginated) + count. */
router.get('/contact-segments/:id/contacts', asyncHandler(async (req, res) => {
  const { row } = await findFor(req, 'contactSegment', req.params.id);
  const where = audienceWhere(row);
  const limit = Math.min(Number(req.query.limit ?? 50) || 50, 200);
  const [items, total] = await Promise.all([
    prisma.marketingContact.findMany({ where, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.marketingContact.count({ where }),
  ]);
  return ok(res, { items, total });
}));

/** Preview a rule set before saving it. */
router.post('/contact-segments/preview', asyncHandler(async (req, res) => {
  const i = Input.of(req);
  const { businessId } = await forBusiness(req, i.raw('businessId'), 'contactSegment', 'read');
  validateRules(i.raw('rules'));
  const where = segmentWhere(businessId, i.raw('rules'));
  const [total, sample] = await Promise.all([prisma.marketingContact.count({ where }), prisma.marketingContact.findMany({ where, take: 10, select: { id: true, name: true, phone: true, tags: true } })]);
  return ok(res, { total, sample });
}));

/** Static segments: add / remove members. */
router.post('/contact-segments/:id/members', asyncHandler(async (req, res) => {
  const { row, businessId } = await findFor(req, 'contactSegment', req.params.id, 'write');
  if (row.isDynamic) throw new AppError('Dynamic segments are defined by rules; members are not added by hand', 409);
  const ids = Input.of(req).list('contactIds', 5000) ?? [];
  const valid = await prisma.marketingContact.findMany({ where: { id: { in: ids }, businessId }, select: { id: true } });
  const r = await prisma.contactSegmentMember.createMany({ data: valid.map((c) => ({ segmentId: row.id, contactId: c.id })), skipDuplicates: true });
  return ok(res, { added: r.count, ignored: ids.length - valid.length });
}));

router.delete('/contact-segments/:id/members', asyncHandler(async (req, res) => {
  const { row } = await findFor(req, 'contactSegment', req.params.id, 'write');
  const ids = Input.of(req).list('contactIds', 5000) ?? [];
  const r = await prisma.contactSegmentMember.deleteMany({ where: { segmentId: row.id, contactId: { in: ids } } });
  return ok(res, { removed: r.count });
}));

// ---------------------------------------------------------------- templates

/** Preview a template with sample values. */
router.post('/message-templates/:id/preview', asyncHandler(async (req, res) => {
  const { row } = await findFor(req, 'messageTemplate', req.params.id);
  const values = (Input.of(req).raw('values') ?? {}) as Record<string, string>;
  return ok(res, { text: renderTemplate(row.body, Object.fromEntries(Object.entries(values).map(([k, v]) => [k, String(v)]))), status: row.status, usable: row.channel === 'WHATSAPP' ? row.status === 'APPROVED' : !['REJECTED', 'PAUSED'].includes(row.status) });
}));

/** SMS templates need no provider approval: a manager marks them ready to use. */
router.post('/message-templates/:id/activate', asyncHandler(async (req, res) => {
  const { row, businessId } = await findFor(req, 'messageTemplate', req.params.id, 'write', { action: 'approve' });
  if (row.channel === 'WHATSAPP') throw new AppError('WhatsApp templates are approved by Meta: use submit', 409);
  const updated = await prisma.messageTemplate.update({ where: { id: row.id }, data: { status: 'APPROVED', rejectionReason: null } });
  await audit(req, { action: 'template.activate', entityType: 'MessageTemplate', entityId: row.id, businessId });
  return ok(res, updated);
}));

async function whatsappCreds(businessId: string) {
  const conn = await prisma.integrationConnection.findFirst({ where: { businessId, provider: 'WHATSAPP', status: 'CONNECTED' } });
  if (!conn) throw new AppError('Connect WhatsApp first', 409);
  const settings = (conn.settings ?? {}) as Record<string, unknown>;
  if (settings.mode === 'sandbox') return { sandbox: true as const, settings };
  const creds = decryptJson<Record<string, string>>(conn.credentials);
  if (!creds || !settings.wabaId) throw new AppError('WhatsApp connection is missing credentials or wabaId', 409);
  return { sandbox: false as const, creds, wabaId: String(settings.wabaId) };
}

/** Submit a WhatsApp template to Meta for approval. Sandbox: approved locally (test only). */
router.post('/message-templates/:id/submit', asyncHandler(async (req, res) => {
  const { row, businessId } = await findFor(req, 'messageTemplate', req.params.id, 'write');
  if (row.channel !== 'WHATSAPP') throw new AppError('Only WhatsApp templates are submitted to Meta', 409);
  if (!['DRAFT', 'REJECTED'].includes(row.status)) throw new AppError(`Template is already ${row.status}`, 409);
  if (!/^[a-z0-9_]{1,512}$/.test(row.name)) throw new AppError('WhatsApp template names must be lowercase letters, numbers and _', 400);
  const wa = await whatsappCreds(businessId);
  let data: Prisma.MessageTemplateUpdateInput;
  if (wa.sandbox) data = { status: 'APPROVED', providerTemplateId: `sandbox-${row.id}`, rejectionReason: null };
  else {
    const r = await submitWhatsAppTemplate(wa.creds, wa.wabaId, { name: row.name, language: row.language, category: row.category, body: row.body, footer: row.footer });
    if (!r.ok) throw new AppError(r.error, 422);
    data = { status: r.status === 'APPROVED' ? 'APPROVED' : 'PENDING', providerTemplateId: r.id, rejectionReason: null };
  }
  const updated = await prisma.messageTemplate.update({ where: { id: row.id }, data });
  await audit(req, { action: 'template.submit', entityType: 'MessageTemplate', entityId: row.id, businessId, metadata: { sandbox: wa.sandbox } });
  return ok(res, updated);
}));

/** Pull approval/rejection status of WhatsApp templates from Meta. */
router.post('/message-templates/sync', asyncHandler(async (req, res) => {
  const { businessId } = await forBusiness(req, Input.of(req).raw('businessId'), 'messageTemplate', 'write');
  const wa = await whatsappCreds(businessId);
  if (wa.sandbox) return ok(res, { updated: 0, sandbox: true });
  const remote = await fetchWhatsAppTemplates(wa.creds, wa.wabaId).catch((e) => { throw new AppError((e as Error).message, 502); });
  const local = await prisma.messageTemplate.findMany({ where: { businessId, channel: 'WHATSAPP' } });
  let updated = 0;
  for (const t of local) {
    const r = remote.find((x) => x.name === t.name && x.language === t.language);
    if (!r) continue;
    const status = ['APPROVED', 'PENDING', 'REJECTED', 'PAUSED'].includes(r.status) ? r.status : t.status;
    if (status !== t.status) {
      await prisma.messageTemplate.update({ where: { id: t.id }, data: { status: status as any, providerTemplateId: r.id, rejectionReason: r.rejected_reason && r.rejected_reason !== 'NONE' ? r.rejected_reason : null } });
      updated++;
    }
  }
  return ok(res, { updated });
}));

// ---------------------------------------------------------------- campaigns

router.post('/campaigns', asyncHandler(async (req, res) => {
  const i = Input.of(req);
  const { businessId } = await forBusiness(req, i.raw('businessId'), 'campaign', 'create');
  const channel = i.oneOf('channel', ['WHATSAPP', 'SMS'] as const, true)!;
  const segmentId = i.id('segmentId');
  const templateId = i.id('templateId');
  await assertInBusiness('contactSegment', segmentId, businessId, 'segmentId');
  if (templateId) {
    const t = await prisma.messageTemplate.findFirst({ where: { id: templateId, businessId } });
    if (!t) throw new AppError('templateId was not found in this business', 404);
    if (t.channel !== channel) throw new AppError(`This template is for ${t.channel}`, 400);
  }
  const message = i.str('message', { max: channel === 'SMS' ? 1600 : 4096 });
  if (channel === 'WHATSAPP' && !templateId) throw new AppError('WhatsApp marketing campaigns must use an approved template', 400);
  if (!templateId && !message) throw new AppError('message or templateId is required', 400);
  const params = i.raw('templateParams');
  const c = await prisma.campaign.create({
    data: {
      businessId, channel, segmentId, templateId, message,
      name: i.reqStr('name', 150),
      description: i.str('description', { max: 1000 }),
      templateParams: params && typeof params === 'object' ? (params as Prisma.InputJsonValue) : undefined,
      createdById: userId(req),
    },
  });
  return ok(res, c, 201);
}));

router.post('/campaigns/:id/preview', asyncHandler(async (req, res) => {
  const { row } = await findFor(req, 'campaign', req.params.id);
  return ok(res, await campaignPreview(row.id));
}));

/** Schedule (scheduledAt) or send now (sendNow: true). Checks channel, template and audience. */
router.post('/campaigns/:id/schedule', asyncHandler(async (req, res) => {
  const { row, businessId } = await findFor(req, 'campaign', req.params.id, 'write', { action: 'approve' });
  if (!['DRAFT', 'PAUSED'].includes(row.status)) throw new AppError(`A ${row.status.toLowerCase()} campaign can't be scheduled`, 409);
  const i = Input.of(req);
  const scheduledAt = i.bool('sendNow') ? new Date() : i.date('scheduledAt', true)!;
  if (!i.bool('sendNow') && scheduledAt.getTime() < Date.now() - 60_000) throw new AppError('scheduledAt must be in the future', 400);
  const preview = await campaignPreview(row.id);
  if (!preview.channelConnected) throw new AppError(`${row.channel} is not connected for this business`, 409);
  if (row.templateId) {
    const t = await prisma.messageTemplate.findUniqueOrThrow({ where: { id: row.templateId } });
    if (row.channel === 'WHATSAPP' && t.status !== 'APPROVED') throw new AppError(`Template "${t.name}" is ${t.status}, not APPROVED`, 409);
    if (['REJECTED', 'PAUSED'].includes(t.status)) throw new AppError(`Template "${t.name}" is ${t.status}`, 409);
  }
  if (!preview.eligible && row.status === 'DRAFT') throw new AppError('No contacts in this audience have consent for this channel', 409);
  const r = await prisma.campaign.updateMany({ where: { id: row.id, status: row.status }, data: { status: 'SCHEDULED', scheduledAt } });
  if (!r.count) throw new AppError('The campaign changed meanwhile; reload', 409);
  await audit(req, { action: 'campaign.schedule', entityType: 'Campaign', entityId: row.id, businessId, metadata: { scheduledAt, eligible: preview.eligible } });
  return ok(res, { ...(await prisma.campaign.findUnique({ where: { id: row.id } })), preview });
}));

router.post('/campaigns/:id/pause', asyncHandler(async (req, res) => {
  const { row, businessId } = await findFor(req, 'campaign', req.params.id, 'write');
  const r = await prisma.campaign.updateMany({ where: { id: row.id, status: { in: ['SCHEDULED', 'RUNNING'] } }, data: { status: 'PAUSED' } });
  if (!r.count) throw new AppError('Only scheduled or running campaigns can be paused', 409);
  await audit(req, { action: 'campaign.pause', entityType: 'Campaign', entityId: row.id, businessId });
  return ok(res, await prisma.campaign.findUnique({ where: { id: row.id } }));
}));

router.post('/campaigns/:id/resume', asyncHandler(async (req, res) => {
  const { row, businessId } = await findFor(req, 'campaign', req.params.id, 'write', { action: 'approve' });
  if (row.status !== 'PAUSED') throw new AppError('Only paused campaigns can be resumed', 409);
  // Started campaigns continue where they stopped; never-started ones go back to their schedule.
  const next = row.startedAt ? 'RUNNING' : 'SCHEDULED';
  await prisma.campaign.updateMany({ where: { id: row.id, status: 'PAUSED' }, data: { status: next, scheduledAt: row.scheduledAt ?? new Date() } });
  await audit(req, { action: 'campaign.resume', entityType: 'Campaign', entityId: row.id, businessId });
  return ok(res, await prisma.campaign.findUnique({ where: { id: row.id } }));
}));

router.post('/campaigns/:id/cancel', asyncHandler(async (req, res) => {
  const { row, businessId } = await findFor(req, 'campaign', req.params.id, 'write');
  const r = await prisma.campaign.updateMany({ where: { id: row.id, status: { in: ['DRAFT', 'SCHEDULED', 'PAUSED', 'RUNNING'] } }, data: { status: 'CANCELLED', completedAt: new Date() } });
  if (!r.count) throw new AppError(`A ${row.status.toLowerCase()} campaign can't be cancelled`, 409);
  await audit(req, { action: 'campaign.cancel', entityType: 'Campaign', entityId: row.id, businessId });
  return ok(res, await prisma.campaign.findUnique({ where: { id: row.id } }));
}));

/** Delivery report: provider-confirmed statuses (delivered/read come only from webhooks). */
router.get('/campaigns/:id/stats', asyncHandler(async (req, res) => {
  const { row } = await findFor(req, 'campaign', req.params.id);
  await refreshCounts(row.id);
  const c = await prisma.campaign.findUniqueOrThrow({ where: { id: row.id } });
  const sandbox = await prisma.messageLog.count({ where: { campaignId: row.id, metadata: { path: ['sandbox'], equals: true } } });
  const pending = await prisma.campaignRecipient.count({ where: { campaignId: row.id, status: 'QUEUED' } });
  const attempted = c.sentCount + c.failedCount;
  const pct = (a: number, b: number) => (b ? Math.round((a / b) * 1000) / 10 : null);
  return ok(res, {
    campaign: c,
    totals: { recipients: c.totalRecipients, attempted, acceptedByProvider: c.sentCount, delivered: c.deliveredCount, read: c.readCount, failed: c.failedCount, skipped: c.skippedCount, pending, replied: c.replyCount },
    rates: { deliveryRate: pct(c.deliveredCount, c.sentCount), failureRate: pct(c.failedCount, attempted), readRate: pct(c.readCount, c.deliveredCount) },
    cost: c.totalCost === null ? null : { amount: Number(c.totalCost), source: 'provider-reported' },
    notes: [
      'acceptedByProvider = the provider accepted the message (not yet delivered).',
      'delivered and read are only counted from provider status webhooks.',
      ...(sandbox ? [`${sandbox} message(s) were sent through a sandbox connection and never left ABUUR.`] : []),
    ],
  });
}));

/** Channel comparison and campaign performance over a period. */
router.get('/marketing/summary', asyncHandler(async (req, res) => {
  const { businessId } = await forBusiness(req, req.query.businessId, 'campaign', 'read');
  const { from, to, label } = rangeOf(req);
  const campaigns = await prisma.campaign.findMany({ where: { businessId, createdAt: { gte: from, lte: to } }, orderBy: { createdAt: 'desc' } });
  const byChannel = ['WHATSAPP', 'SMS'].map((ch) => {
    const list = campaigns.filter((c) => c.channel === ch);
    const sum = (k: 'sentCount' | 'deliveredCount' | 'readCount' | 'failedCount' | 'totalRecipients' | 'skippedCount') => list.reduce((a, c) => a + c[k], 0);
    return { channel: ch, campaigns: list.length, recipients: sum('totalRecipients'), sent: sum('sentCount'), delivered: sum('deliveredCount'), read: sum('readCount'), failed: sum('failedCount'), skipped: sum('skippedCount'), cost: money(list.reduce((a, c) => a + Number(c.totalCost ?? 0), 0)) };
  });
  const [contacts, optedOut, newContacts] = await Promise.all([
    prisma.marketingContact.count({ where: { businessId } }),
    prisma.marketingContact.count({ where: { businessId, optedOutAt: { not: null } } }),
    prisma.marketingContact.count({ where: { businessId, createdAt: { gte: from, lte: to } } }),
  ]);
  return ok(res, { period: { from, to, label }, contacts, optedOut, newContacts, byChannel, campaigns: campaigns.slice(0, 50) });
}));

// ---------------------------------------------------------------- automation

/** Dry run: does the rule match this sample event, and what would it send/do? */
router.post('/automation-rules/:id/test', asyncHandler(async (req, res) => {
  const { row } = await findFor(req, 'automationRule', req.params.id);
  const payload = (Input.of(req).raw('payload') ?? {}) as Record<string, unknown>;
  const matches = conditionsMatch(row.conditions, payload);
  const template = row.templateId ? await prisma.messageTemplate.findUnique({ where: { id: row.templateId } }) : null;
  const values = Object.fromEntries(Object.entries(payload).map(([k, v]) => [k, String(v)]));
  return ok(res, {
    matches,
    action: row.action,
    wouldSend: ['SEND_WHATSAPP', 'SEND_SMS'].includes(row.action) ? renderTemplate(template?.body ?? row.message ?? '', values) : null,
    templateUsable: template ? (template.channel === 'WHATSAPP' ? template.status === 'APPROVED' : !['REJECTED', 'PAUSED'].includes(template.status)) : null,
    delayMinutes: row.delayMinutes,
  });
}));

router.get('/automation-rules/:id/executions', asyncHandler(async (req, res) => {
  const { row } = await findFor(req, 'automationRule', req.params.id);
  return ok(res, await prisma.automationExecution.findMany({ where: { ruleId: row.id }, orderBy: { createdAt: 'desc' }, take: 200 }));
}));

export default router;
