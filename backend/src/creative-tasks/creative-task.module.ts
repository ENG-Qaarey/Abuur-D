import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { CreativeTaskController } from './creative-task.controller.js';
import { CreativeTaskService } from './creative-task.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [CreativeTaskController],
  providers: [CreativeTaskService],
  exports: [CreativeTaskService],
})
export class CreativeTaskModule {}
