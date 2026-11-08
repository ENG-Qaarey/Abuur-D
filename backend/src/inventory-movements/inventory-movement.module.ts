import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { InventoryMovementController } from './inventory-movement.controller.js';
import { InventoryMovementService } from './inventory-movement.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [InventoryMovementController],
  providers: [InventoryMovementService],
  exports: [InventoryMovementService],
})
export class InventoryMovementModule {}
