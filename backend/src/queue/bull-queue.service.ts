import { Injectable, Logger, type OnModuleDestroy } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import {
  QueueName,
  QueueService,
  throttledErrorLogger,
  type EmailJobData,
  type QueuedJob,
  type SMSJobData,
  type WhatsAppJobData,
} from './queue.service.js';

const JOB_OPTIONS = {
  attempts: 3,
  backoff: { type: 'exponential' as const, delay: 1000 },
  removeOnComplete: 1000,
  removeOnFail: 5000,
};

/** Redis-backed queues (REDIS_ENABLED=true). Workers live in ./processors. */
@Injectable()
export class BullQueueService extends QueueService implements OnModuleDestroy {
  private readonly logger = new Logger('Queue');

  constructor(
    @InjectQueue(QueueName.EMAIL) private readonly emailQueue: Queue,
    @InjectQueue(QueueName.WHATSAPP) private readonly whatsappQueue: Queue,
    @InjectQueue(QueueName.SMS) private readonly smsQueue: Queue,
  ) {
    super();
    const onError = throttledErrorLogger(this.logger, 'Redis queue connection error');
    for (const queue of [emailQueue, whatsappQueue, smsQueue]) {
      queue.on('error', onError);
    }
  }

  async addEmailJob(data: EmailJobData): Promise<QueuedJob> {
    const job = await this.emailQueue.add('send-email', data, JOB_OPTIONS);
    return { id: job.id };
  }

  async addWhatsAppJob(data: WhatsAppJobData): Promise<QueuedJob> {
    const job = await this.whatsappQueue.add('send-whatsapp', data, JOB_OPTIONS);
    return { id: job.id };
  }

  async addSMSJob(data: SMSJobData): Promise<QueuedJob> {
    const job = await this.smsQueue.add('send-sms', data, JOB_OPTIONS);
    return { id: job.id };
  }

  async onModuleDestroy() {
    await Promise.allSettled([
      this.emailQueue.close(),
      this.whatsappQueue.close(),
      this.smsQueue.close(),
    ]);
  }
}
