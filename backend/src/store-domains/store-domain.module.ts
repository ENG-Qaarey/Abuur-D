import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { StoreDomainController } from './store-domain.controller.js';
import { StoreDomainService } from './store-domain.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [StoreDomainController],
  providers: [StoreDomainService],
  exports: [StoreDomainService],
})
export class StoreDomainModule {}
