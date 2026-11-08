import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SendWhatsAppDTO {
  to: string;
  message: string;
  templateName?: string;
  templateParams?: Record<string, string>;
}

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private apiUrl: string;
  private accessToken: string;
  private phoneNumberId: string;

  constructor(private readonly configService: ConfigService) {
    const whatsappConfig = this.configService.get('app.whatsapp');
    this.apiUrl = whatsappConfig.apiUrl;
    this.accessToken = whatsappConfig.accessToken;
    this.phoneNumberId = whatsappConfig.phoneNumberId;
  }

  async sendMessage(dto: SendWhatsAppDTO) {
    if (!this.accessToken || !this.phoneNumberId) {
      this.logger.warn('WhatsApp credentials not configured. Skipping message.');
      return { success: false, error: 'WhatsApp not configured' };
    }

    try {
      const payload = {
        messaging_product: 'whatsapp',
        to: dto.to,
        type: 'text',
        text: { body: dto.message },
      };

      const response = await fetch(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();
      this.logger.log(`WhatsApp message sent to ${dto.to}`);
      return { success: true, data: result };
    } catch (error) {
      this.logger.error(`Failed to send WhatsApp to ${dto.to}`, error);
      throw error;
    }
  }

  async sendTemplate(dto: SendWhatsAppDTO) {
    if (!dto.templateName) {
      throw new Error('Template name is required for template messages');
    }

    const payload = {
      messaging_product: 'whatsapp',
      to: dto.to,
      type: 'template',
      template: {
        name: dto.templateName,
        language: { code: 'en_US' },
        components: dto.templateParams
          ? [
              {
                type: 'body',
                parameters: Object.values(dto.templateParams).map((v) => ({
                  type: 'text',
                  text: v,
                })),
              },
            ]
          : [],
      },
    };

    const response = await fetch(
      `${this.apiUrl}/${this.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
    );

    const result = await response.json();
    this.logger.log(`WhatsApp template sent to ${dto.to}`);
    return { success: true, data: result };
  }
}
