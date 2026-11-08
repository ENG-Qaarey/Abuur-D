import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { CreativeProjectController } from './creative-project.controller.js';
import { CreativeProjectService } from './creative-project.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [CreativeProjectController],
  providers: [CreativeProjectService],
  exports: [CreativeProjectService],
})
export class CreativeProjectModule {}
