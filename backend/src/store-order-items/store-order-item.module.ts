import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { StoreOrderItemController } from './store-order-item.controller.js';
import { StoreOrderItemService } from './store-order-item.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [StoreOrderItemController],
  providers: [StoreOrderItemService],
  exports: [StoreOrderItemService],
})
export class StoreOrderItemModule {}
