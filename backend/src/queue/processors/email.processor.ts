import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { EmailService } from '../../email/email.service.js';
import { QueueName, EmailJobData, throttledErrorLogger } from '../../queue/queue.service.js';

@Processor(QueueName.EMAIL)
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);
  private readonly logWorkerError = throttledErrorLogger(this.logger, 'Worker cannot reach Redis');

  constructor(private readonly emailService: EmailService) {
    super();
  }

  async process(job: Job<EmailJobData>): Promise<void> {
    this.logger.log(`Processing email job ${job.id}`);
    const { to, subject, html, text } = job.data;
    await this.emailService.sendEmail({ to, subject, html, text });
    this.logger.log(`Email job ${job.id} completed`);
  }

  /** Without this listener every reconnect attempt is printed as a raw stack trace. */
  @OnWorkerEvent('error')
  onError(error: Error) {
    this.logWorkerError(error);
  }
}
