import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { MarketingContactController } from './marketing-contact.controller.js';
import { MarketingContactService } from './marketing-contact.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [MarketingContactController],
  providers: [MarketingContactService],
  exports: [MarketingContactService],
})
export class MarketingContactModule {}
