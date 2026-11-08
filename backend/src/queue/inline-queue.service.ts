import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { EmailService } from '../email/email.service.js';
import { SMSService } from '../sms/sms.service.js';
import { WhatsAppService } from '../whatsapp/whatsapp.service.js';
import {
  QueueService,
  type EmailJobData,
  type QueuedJob,
  type SMSJobData,
  type WhatsAppJobData,
} from './queue.service.js';

/**
 * No-Redis mode (REDIS_ENABLED=false), meant for local development.
 * Jobs run right away in the background of the same process: no retries and
 * no persistence, so a crash or restart loses pending sends.
 */
@Injectable()
export class InlineQueueService extends QueueService implements OnModuleInit {
  private readonly logger = new Logger('Queue');

  constructor(
    private readonly emailService: EmailService,
    private readonly whatsAppService: WhatsAppService,
    private readonly smsService: SMSService,
  ) {
    super();
  }

  onModuleInit() {
    this.logger.warn(
      'REDIS_ENABLED=false: email/WhatsApp/SMS jobs run inline without retries. Use Redis in production.',
    );
  }

  addEmailJob(data: EmailJobData) {
    return this.run('email', () => this.emailService.sendEmail(data));
  }

  addWhatsAppJob(data: WhatsAppJobData) {
    return this.run('whatsapp', () => this.whatsAppService.sendMessage(data));
  }

  addSMSJob(data: SMSJobData) {
    return this.run('sms', () => this.smsService.sendSMS(data));
  }

  private async run(kind: string, send: () => Promise<unknown>): Promise<QueuedJob> {
    const id = `inline-${randomUUID()}`;
    // Like a real queue, don't make the caller wait for the provider.
    setImmediate(() => {
      send().catch((error: Error) =>
        this.logger.error(`Inline ${kind} job ${id} failed: ${error.message}`),
      );
    });
    return { id };
  }
}
