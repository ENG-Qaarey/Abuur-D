import { AutomationTrigger, Prisma } from '@prisma/client';
import { prisma } from '../prisma';
import { sendMessage } from './send-message';
import { notifyBusiness } from '../lib/notify';

/**
 * Event → automation rules. emitEvent() records one AutomationExecution per matching active rule
 * (unique per rule + dedupeKey, so the same event never runs a rule twice); the background worker
 * runs due executions with retries (runDueExecutions).
 *
 * Payload fields used by actions: contactId, customerId, phone, name, orderId, plus any values
 * for template variables.
 */
export async function emitEvent(
  businessId: string,
  trigger: AutomationTrigger,
  dedupeKey: string,
  payload: Record<string, unknown> = {},
): Promise<number> {
  try {
    const rules = await prisma.automationRule.findMany({ where: { businessId, trigger, isActive: true } });
    let created = 0;
    for (const rule of rules) {
      if (!conditionsMatch(rule.conditions, payload)) continue;
      const r = await prisma.automationExecution.createMany({
        data: [{
          businessId,
          ruleId: rule.id,
          dedupeKey,
          payload: payload as Prisma.InputJsonValue,
          runAt: new Date(Date.now() + rule.delayMinutes * 60_000),
        }],
        skipDuplicates: true,
      });
      created += r.count;
    }
    return created;
  } catch (error) {
    console.error('[automation] emitEvent failed', trigger, error);
    return 0;
  }
}

/** conditions: { "<payloadField>": value | [values] } — all must match. */
export function conditionsMatch(conditions: unknown, payload: Record<string, unknown>): boolean {
  if (!conditions || typeof conditions !== 'object' || Array.isArray(conditions)) return true;
  return Object.entries(conditions as Record<string, unknown>).every(([k, v]) =>
    Array.isArray(v) ? v.map(String).includes(String(payload[k])) : String(payload[k]) === String(v),
  );
}

const MAX_ATTEMPTS = 3;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Event payloads use '' for "none"; only real ids reach the database. */
const idOrUndef = (v: unknown) => (typeof v === 'string' && UUID.test(v) ? v : undefined);

async function runOne(id: string): Promise<void> {
  // Claim atomically: only one worker can move PENDING → RUNNING.
  const claimed = await prisma.automationExecution.updateMany({
    where: { id, status: 'PENDING' },
    data: { status: 'RUNNING', attempts: { increment: 1 } },
  });
  if (!claimed.count) return;
  const exec = await prisma.automationExecution.findUniqueOrThrow({ where: { id }, include: { rule: true } });
  const rule = exec.rule;
  const p = (exec.payload ?? {}) as Record<string, any>;
  const cfg = (rule.actionConfig ?? {}) as Record<string, any>;
  const finish = (status: 'SUCCEEDED' | 'SKIPPED' | 'FAILED', result: Record<string, unknown> = {}, error?: string) =>
    prisma.automationExecution.update({ where: { id }, data: { status, result: result as Prisma.InputJsonValue, error, finishedAt: new Date() } });

  try {
    if (!rule.isActive) return void (await finish('SKIPPED', { reason: 'Rule disabled' }));
    switch (rule.action) {
      case 'SEND_WHATSAPP':
      case 'SEND_SMS': {
        const channel = rule.action === 'SEND_WHATSAPP' ? 'WHATSAPP' : 'SMS';
        let contactId: string | null = p.contactId ?? null;
        if (!contactId && p.phone) {
          const c = await prisma.marketingContact.findFirst({ where: { businessId: rule.businessId, phone: String(p.phone) } });
          contactId = c?.id ?? null;
        }
        const values = Object.fromEntries(Object.entries(p).filter(([, v]) => ['string', 'number'].includes(typeof v)).map(([k, v]) => [k, String(v)]));
        const out = await sendMessage({
          businessId: rule.businessId,
          channel,
          contactId,
          to: contactId ? null : p.phone ?? null,
          text: rule.message,
          templateId: rule.templateId,
          values,
          // Order/payment/renewal updates are transactional; everything else is marketing.
          marketing: !['ORDER_CREATED', 'ORDER_STATUS_CHANGED', 'PAYMENT_RECEIVED', 'PAYMENT_OVERDUE', 'CLIENT_RENEWAL_DUE', 'SUBSCRIPTION_EXPIRED'].includes(rule.trigger),
          automationRuleId: rule.id,
          orderId: p.orderId ?? null,
          testMode: rule.testMode,
        });
        if (out.status === 'SENT') await finish('SUCCEEDED', { logId: out.logId, sandbox: out.sandbox });
        else if (out.status === 'SKIPPED') await finish('SKIPPED', { reason: out.reason });
        else throw Object.assign(new Error(out.error), { retryable: out.retryable });
        break;
      }
      case 'CREATE_TASK': {
        if (rule.testMode) return void (await finish('SKIPPED', { reason: 'Test mode', wouldCreate: cfg.title }));
        const task = await prisma.crmTask.create({
          data: {
            businessId: rule.businessId,
            title: String(cfg.title ?? `Follow up: ${rule.name}`).slice(0, 200),
            description: cfg.description ? String(cfg.description) : undefined,
            customerId: idOrUndef(p.customerId),
            leadId: idOrUndef(p.leadId),
            assignedToId: idOrUndef(cfg.assignedToId) ?? idOrUndef(p.assignedToId),
            dueAt: new Date(Date.now() + Number(cfg.dueInHours ?? 24) * 3_600_000),
            type: 'AUTOMATION',
          },
        });
        await finish('SUCCEEDED', { taskId: task.id });
        break;
      }
      case 'NOTIFY_STAFF': {
        if (rule.testMode) return void (await finish('SKIPPED', { reason: 'Test mode' }));
        await notifyBusiness(rule.businessId, {
          title: String(cfg.title ?? rule.name),
          message: String(cfg.message ?? `Automation "${rule.name}" was triggered (${rule.trigger}).`),
          type: 'INFO',
          metadata: { automationRuleId: rule.id, payload: p },
        }, cfg.roles ?? undefined);
        await finish('SUCCEEDED');
        break;
      }
      case 'UPDATE_CUSTOMER_STATUS': {
        const status = String(cfg.status ?? '');
        if (!['LEAD', 'ONBOARDING', 'ACTIVE', 'AT_RISK', 'CHURNED'].includes(status)) throw Object.assign(new Error(`Invalid status "${status}" in actionConfig`), { retryable: false });
        if (!p.customerId) return void (await finish('SKIPPED', { reason: 'Event has no customer' }));
        if (rule.testMode) return void (await finish('SKIPPED', { reason: 'Test mode', wouldSet: status }));
        if (!idOrUndef(p.customerId)) return void (await finish('SKIPPED', { reason: 'Event has no customer' }));
        const r = await prisma.cRMCustomer.updateMany({ where: { id: p.customerId, businessId: rule.businessId }, data: { status: status as any } });
        await finish(r.count ? 'SUCCEEDED' : 'SKIPPED', { updated: r.count });
        break;
      }
    }
    await prisma.automationRule.update({ where: { id: rule.id }, data: { lastRunAt: new Date(), runCount: { increment: 1 } } });
  } catch (e) {
    const err = e as Error & { retryable?: boolean };
    const retry = err.retryable !== false && exec.attempts < MAX_ATTEMPTS;
    await prisma.automationExecution.update({
      where: { id },
      data: retry
        ? { status: 'PENDING', error: err.message, runAt: new Date(Date.now() + 2 ** exec.attempts * 60_000) }
        : { status: 'FAILED', error: err.message, finishedAt: new Date() },
    });
  }
}

/** Runs executions that are due (called by the worker). */
export async function runDueExecutions(limit = 50): Promise<number> {
  const due = await prisma.automationExecution.findMany({
    where: { status: 'PENDING', runAt: { lte: new Date() } },
    orderBy: { runAt: 'asc' },
    take: limit,
    select: { id: true },
  });
  for (const d of due) await runOne(d.id);
  return due.length;
}
