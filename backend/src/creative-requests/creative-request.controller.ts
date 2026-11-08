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
import { CreativeRequestService } from './creative-request.service.js';
import type { Prisma } from '../prisma/prisma.service.js';

import { ApiBearerAuth } from '@nestjs/swagger';
@Controller('creative-requests')
@ApiBearerAuth()
export class CreativeRequestController {
  constructor(private readonly creativeRequestService: CreativeRequestService) {}

  @Post()
  create(@Body() dto: Prisma.CreativeRequestCreateInput) {
    return this.creativeRequestService.create(dto);
  }

  @Get()
  findAll() {
    return this.creativeRequestService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.creativeRequestService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Prisma.CreativeRequestUpdateInput,
  ) {
    return this.creativeRequestService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.creativeRequestService.remove(id);
  }
}
