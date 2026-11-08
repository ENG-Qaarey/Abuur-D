import { Logger } from '@nestjs/common';

export enum QueueName {
  EMAIL = 'email',
  WHATSAPP = 'whatsapp',
  SMS = 'sms',
}

export interface EmailJobData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface WhatsAppJobData {
  to: string;
  message: string;
  templateName?: string;
  templateParams?: Record<string, string>;
}

export interface SMSJobData {
  to: string;
  message: string;
}

export interface QueuedJob {
  id: string | undefined;
}

/**
 * Sends email / WhatsApp / SMS in the background.
 *
 * Inject this class everywhere. QueueModule binds it to either the Redis
 * (BullMQ) implementation or the inline one, depending on REDIS_ENABLED.
 */
export abstract class QueueService {
  abstract addEmailJob(data: EmailJobData): Promise<QueuedJob>;
  abstract addWhatsAppJob(data: WhatsAppJobData): Promise<QueuedJob>;
  abstract addSMSJob(data: SMSJobData): Promise<QueuedJob>;
}

/**
 * Logs a repeating error at most once per interval, so an unreachable
 * dependency produces one line a minute instead of thousands.
 */
export function throttledErrorLogger(logger: Logger, what: string, intervalMs = 60_000) {
  let last = 0;
  let suppressed = 0;
  return (error: Error) => {
    const now = Date.now();
    if (now - last < intervalMs) {
      suppressed++;
      return;
    }
    const extra = suppressed ? ` (${suppressed} similar errors suppressed)` : '';
    // Node reports a failed IPv6+IPv4 connect as an AggregateError with an empty message.
    const inner = (error as Error & { errors?: Error[] }).errors?.[0];
    const detail = error.message || inner?.message || error.name;
    logger.error(`${what}: ${detail}${extra}`);
    last = now;
    suppressed = 0;
  };
}

/** Exponential reconnect backoff for ioredis, capped at 30 seconds. */
export const redisRetryStrategy = (times: number) => Math.min(times * 1000, 30_000);
