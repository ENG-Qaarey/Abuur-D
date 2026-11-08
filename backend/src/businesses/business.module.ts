import { Module } from '@nestjs/common';
import { AuditLogModule } from '../audit-logs/audit-log.module.js';
import { BusinessController } from './business.controller.js';
import { BusinessService } from './business.service.js';

@Module({
  imports: [AuditLogModule],
  controllers: [BusinessController],
  providers: [BusinessService],
  exports: [BusinessService],
})
export class BusinessModule {}
