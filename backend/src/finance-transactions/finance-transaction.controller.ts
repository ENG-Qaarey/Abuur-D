import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FinanceTransactionService } from './finance-transaction.service.js';
import type { Prisma } from '../prisma/prisma.service.js';

import { ApiBearerAuth } from '@nestjs/swagger';
@Controller('finance-transactions')
@ApiBearerAuth()
export class FinanceTransactionController {
  constructor(private readonly financeTransactionService: FinanceTransactionService) {}

  @Post()
  create(@Body() dto: Prisma.FinanceTransactionCreateInput) {
    return this.financeTransactionService.create(dto);
  }

  @Get()
  findAll() {
    return this.financeTransactionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeTransactionService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Prisma.FinanceTransactionUpdateInput,
  ) {
    return this.financeTransactionService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.financeTransactionService.remove(id);
  }
}
