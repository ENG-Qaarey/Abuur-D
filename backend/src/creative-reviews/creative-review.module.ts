import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { CreativeReviewController } from './creative-review.controller.js';
import { CreativeReviewService } from './creative-review.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [CreativeReviewController],
  providers: [CreativeReviewService],
  exports: [CreativeReviewService],
})
export class CreativeReviewModule {}
