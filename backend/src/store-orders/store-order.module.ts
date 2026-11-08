import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { StoreOrderController } from './store-order.controller.js';
import { StoreOrderService } from './store-order.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [StoreOrderController],
  providers: [StoreOrderService],
  exports: [StoreOrderService],
})
export class StoreOrderModule {}
