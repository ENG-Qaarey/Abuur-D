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
import { StoreCustomerService } from './store-customer.service.js';
import type { Prisma } from '../prisma/prisma.service.js';

import { ApiBearerAuth } from '@nestjs/swagger';
@Controller('store-customers')
@ApiBearerAuth()
export class StoreCustomerController {
  constructor(private readonly storeCustomerService: StoreCustomerService) {}

  @Post()
  create(@Body() dto: Prisma.StoreCustomerCreateInput) {
    return this.storeCustomerService.create(dto);
  }

  @Get()
  findAll() {
    return this.storeCustomerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.storeCustomerService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Prisma.StoreCustomerUpdateInput,
  ) {
    return this.storeCustomerService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.storeCustomerService.remove(id);
  }
}
