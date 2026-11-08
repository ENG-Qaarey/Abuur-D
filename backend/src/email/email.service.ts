import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export interface SendEmailDTO {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;
  private from: string;

  constructor(private readonly configService: ConfigService) {
    const resendConfig = this.configService.get('app.resend');
    this.from = resendConfig.from;
  }

  onModuleInit() {
    const resendConfig = this.configService.get('app.resend');
    if (resendConfig.apiKey) {
      this.resend = new Resend(resendConfig.apiKey);
      this.logger.log('Resend initialized');
    } else {
      this.logger.warn('Resend API key not configured');
    }
  }

  async sendEmail(dto: SendEmailDTO) {
    if (!this.resend) {
      this.logger.warn('Resend not configured. Skipping email send.');
      return { success: false, error: 'Resend not configured' };
    }

    try {
      const result = await this.resend.emails.send({
        from: this.from,
        to: dto.to,
        subject: dto.subject,
        html: dto.html,
        text: dto.text,
      });
      this.logger.log(`Email sent to ${dto.to}: ${result.data?.id}`);
      return { success: true, data: result.data };
    } catch (error) {
      this.logger.error(`Failed to send email to ${dto.to}`, error);
      throw error;
    }
  }

  async sendWelcomeEmail(to: string, name: string) {
    return this.sendEmail({
      to,
      subject: 'Welcome to ABUUR',
      html: `<h1>Welcome ${name}!</h1><p>Thank you for joining ABUUR.</p>`,
      text: `Welcome ${name}! Thank you for joining ABUUR.`,
    });
  }
}
