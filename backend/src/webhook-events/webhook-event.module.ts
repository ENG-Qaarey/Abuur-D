import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { WebhookEventController } from './webhook-event.controller.js';
import { WebhookEventService } from './webhook-event.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [WebhookEventController],
  providers: [WebhookEventService],
  exports: [WebhookEventService],
})
export class WebhookEventModule {}
