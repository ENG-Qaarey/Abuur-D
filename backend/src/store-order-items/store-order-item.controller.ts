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
import { StoreOrderItemService } from './store-order-item.service.js';
import type { Prisma } from '../prisma/prisma.service.js';

import { ApiBearerAuth } from '@nestjs/swagger';
@Controller('store-order-items')
@ApiBearerAuth()
export class StoreOrderItemController {
  constructor(private readonly storeOrderItemService: StoreOrderItemService) {}

  @Post()
  create(@Body() dto: Prisma.StoreOrderItemCreateInput) {
    return this.storeOrderItemService.create(dto);
  }

  @Get()
  findAll() {
    return this.storeOrderItemService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.storeOrderItemService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Prisma.StoreOrderItemUpdateInput,
  ) {
    return this.storeOrderItemService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.storeOrderItemService.remove(id);
  }
}
