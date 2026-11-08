import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { InvoiceItemController } from './invoice-item.controller.js';
import { InvoiceItemService } from './invoice-item.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [InvoiceItemController],
  providers: [InvoiceItemService],
  exports: [InvoiceItemService],
})
export class InvoiceItemModule {}
