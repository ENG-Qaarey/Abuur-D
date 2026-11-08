import { Module } from '@nestjs/common';
import { AuditLogModule } from '../audit-logs/audit-log.module.js';
import { BusinessMembershipController } from './business-membership.controller.js';
import { BusinessMembershipService } from './business-membership.service.js';

@Module({
  imports: [AuditLogModule],
  controllers: [BusinessMembershipController],
  providers: [BusinessMembershipService],
  exports: [BusinessMembershipService],
})
export class BusinessMembershipModule {}
