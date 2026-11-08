import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SendSMSDTO {
  to: string;
  message: string;
}

@Injectable()
export class SMSService {
  private readonly logger = new Logger(SMSService.name);
  private apiKey: string;
  private apiUrl: string;

  constructor(private readonly configService: ConfigService) {
    const smsConfig = this.configService.get('app.sms');
    this.apiKey = smsConfig.apiKey;
    this.apiUrl = smsConfig.apiUrl;
  }

  async sendSMS(dto: SendSMSDTO) {
    if (!this.apiKey) {
      this.logger.warn('SMS API key not configured. Skipping SMS send.');
      return { success: false, error: 'SMS not configured' };
    }

    try {
      const response = await fetch(`${this.apiUrl}/send`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: dto.to,
          message: dto.message,
        }),
      });

      const result = await response.json();
      this.logger.log(`SMS sent to ${dto.to}`);
      return { success: true, data: result };
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${dto.to}`, error);
      throw error;
    }
  }
}
