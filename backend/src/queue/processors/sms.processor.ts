import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { SMSService } from '../../sms/sms.service.js';
import { QueueName, SMSJobData, throttledErrorLogger } from '../../queue/queue.service.js';

@Processor(QueueName.SMS)
export class SMSProcessor extends WorkerHost {
  private readonly logger = new Logger(SMSProcessor.name);
  private readonly logWorkerError = throttledErrorLogger(this.logger, 'Worker cannot reach Redis');

  constructor(private readonly smsService: SMSService) {
    super();
  }

  async process(job: Job<SMSJobData>): Promise<void> {
    this.logger.log(`Processing SMS job ${job.id}`);
    const { to, message } = job.data;
    await this.smsService.sendSMS({ to, message });
    this.logger.log(`SMS job ${job.id} completed`);
  }

  /** Without this listener every reconnect attempt is printed as a raw stack trace. */
  @OnWorkerEvent('error')
  onError(error: Error) {
    this.logWorkerError(error);
  }
}
