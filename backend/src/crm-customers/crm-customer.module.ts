import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { CRMCustomerController } from './crm-customer.controller.js';
import { CRMCustomerService } from './crm-customer.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [CRMCustomerController],
  providers: [CRMCustomerService],
  exports: [CRMCustomerService],
})
export class CRMCustomerModule {}
