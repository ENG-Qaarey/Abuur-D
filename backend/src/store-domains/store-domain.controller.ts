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
import { StoreDomainService } from './store-domain.service.js';
import type { Prisma } from '../prisma/prisma.service.js';

import { ApiBearerAuth } from '@nestjs/swagger';
@Controller('store-domains')
@ApiBearerAuth()
export class StoreDomainController {
  constructor(private readonly storeDomainService: StoreDomainService) {}

  @Post()
  create(@Body() dto: Prisma.StoreDomainCreateInput) {
    return this.storeDomainService.create(dto);
  }

  @Get()
  findAll() {
    return this.storeDomainService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.storeDomainService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Prisma.StoreDomainUpdateInput,
  ) {
    return this.storeDomainService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.storeDomainService.remove(id);
  }
}
