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
import { InvoiceItemService } from './invoice-item.service.js';
import type { Prisma } from '../prisma/prisma.service.js';

import { ApiBearerAuth } from '@nestjs/swagger';
@Controller('invoice-items')
@ApiBearerAuth()
export class InvoiceItemController {
  constructor(private readonly invoiceItemService: InvoiceItemService) {}

  @Post()
  create(@Body() dto: Prisma.InvoiceItemCreateInput) {
    return this.invoiceItemService.create(dto);
  }

  @Get()
  findAll() {
    return this.invoiceItemService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.invoiceItemService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Prisma.InvoiceItemUpdateInput,
  ) {
    return this.invoiceItemService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.invoiceItemService.remove(id);
  }
}
