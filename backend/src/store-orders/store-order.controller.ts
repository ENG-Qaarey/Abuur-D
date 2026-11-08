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
import { StoreOrderService } from './store-order.service.js';
import type { Prisma } from '../prisma/prisma.service.js';

import { ApiBearerAuth } from '@nestjs/swagger';
@Controller('store-orders')
@ApiBearerAuth()
export class StoreOrderController {
  constructor(private readonly storeOrderService: StoreOrderService) {}

  @Post()
  create(@Body() dto: Prisma.StoreOrderCreateInput) {
    return this.storeOrderService.create(dto);
  }

  @Get()
  findAll() {
    return this.storeOrderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.storeOrderService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Prisma.StoreOrderUpdateInput) {
    return this.storeOrderService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.storeOrderService.remove(id);
  }
}
