import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { WhatsAppService } from '../../whatsapp/whatsapp.service.js';
import { QueueName, WhatsAppJobData, throttledErrorLogger } from '../../queue/queue.service.js';

@Processor(QueueName.WHATSAPP)
export class WhatsAppProcessor extends WorkerHost {
  private readonly logger = new Logger(WhatsAppProcessor.name);
  private readonly logWorkerError = throttledErrorLogger(this.logger, 'Worker cannot reach Redis');

  constructor(private readonly whatsAppService: WhatsAppService) {
    super();
  }

  async process(job: Job<WhatsAppJobData>): Promise<void> {
    this.logger.log(`Processing WhatsApp job ${job.id}`);
    const { to, message, templateName, templateParams } = job.data;
    await this.whatsAppService.sendMessage({
      to,
      message,
      templateName,
      templateParams,
    });
    this.logger.log(`WhatsApp job ${job.id} completed`);
  }

  /** Without this listener every reconnect attempt is printed as a raw stack trace. */
  @OnWorkerEvent('error')
  onError(error: Error) {
    this.logWorkerError(error);
  }
}
