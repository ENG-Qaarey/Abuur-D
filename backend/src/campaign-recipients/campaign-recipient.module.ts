import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { CampaignRecipientController } from './campaign-recipient.controller.js';
import { CampaignRecipientService } from './campaign-recipient.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [CampaignRecipientController],
  providers: [CampaignRecipientService],
  exports: [CampaignRecipientService],
})
export class CampaignRecipientModule {}
