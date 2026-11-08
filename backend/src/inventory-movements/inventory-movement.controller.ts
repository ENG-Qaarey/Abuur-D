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
import { InventoryMovementService } from './inventory-movement.service.js';
import type { Prisma } from '../prisma/prisma.service.js';

import { ApiBearerAuth } from '@nestjs/swagger';
@Controller('inventory-movements')
@ApiBearerAuth()
export class InventoryMovementController {
  constructor(private readonly inventoryMovementService: InventoryMovementService) {}

  @Post()
  create(@Body() dto: Prisma.InventoryMovementCreateInput) {
    return this.inventoryMovementService.create(dto);
  }

  @Get()
  findAll() {
    return this.inventoryMovementService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.inventoryMovementService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Prisma.InventoryMovementUpdateInput,
  ) {
    return this.inventoryMovementService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.inventoryMovementService.remove(id);
  }
}
