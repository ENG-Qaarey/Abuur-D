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
import { StoreService } from './store.service.js';
import type { Prisma } from '../prisma/prisma.service.js';

import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Public } from '../auth/decorators/auth.decorators.js';
@Controller('stores')
@ApiBearerAuth()
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post()
  create(@Body() dto: Prisma.StoreCreateInput) {
    return this.storeService.create(dto);
  }

  /** Declared before ':id' so "public" is not parsed as a store id. */
  @Get('public')
  @Public()
  @ApiOperation({ summary: 'Public directory of live stores (safe fields only)' })
  findPublic() {
    return this.storeService.findPublic();
  }

  @Get()
  findAll() {
    return this.storeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.storeService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Prisma.StoreUpdateInput) {
    return this.storeService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.storeService.remove(id);
  }
}
