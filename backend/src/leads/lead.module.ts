import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { LeadController } from './lead.controller.js';
import { LeadService } from './lead.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [LeadController],
  providers: [LeadService],
  exports: [LeadService],
})
export class LeadModule {}
