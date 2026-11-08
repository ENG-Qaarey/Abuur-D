import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { FinanceTransactionController } from './finance-transaction.controller.js';
import { FinanceTransactionService } from './finance-transaction.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [FinanceTransactionController],
  providers: [FinanceTransactionService],
  exports: [FinanceTransactionService],
})
export class FinanceTransactionModule {}
