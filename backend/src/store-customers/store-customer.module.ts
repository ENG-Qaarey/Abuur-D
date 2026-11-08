import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { StoreCustomerController } from './store-customer.controller.js';
import { StoreCustomerService } from './store-customer.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [StoreCustomerController],
  providers: [StoreCustomerService],
  exports: [StoreCustomerService],
})
export class StoreCustomerModule {}
