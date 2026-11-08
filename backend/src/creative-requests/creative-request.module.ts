import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { CreativeRequestController } from './creative-request.controller.js';
import { CreativeRequestService } from './creative-request.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [CreativeRequestController],
  providers: [CreativeRequestService],
  exports: [CreativeRequestService],
})
export class CreativeRequestModule {}
