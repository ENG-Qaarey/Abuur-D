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
import { IntegrationConnectionService } from './integration-connection.service.js';
import type { Prisma } from '../prisma/prisma.service.js';

import { ApiBearerAuth } from '@nestjs/swagger';
@Controller('integration-connections')
@ApiBearerAuth()
export class IntegrationConnectionController {
  constructor(private readonly integrationConnectionService: IntegrationConnectionService) {}

  @Post()
  create(@Body() dto: Prisma.IntegrationConnectionCreateInput) {
    return this.integrationConnectionService.create(dto);
  }

  @Get()
  findAll() {
    return this.integrationConnectionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.integrationConnectionService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Prisma.IntegrationConnectionUpdateInput,
  ) {
    return this.integrationConnectionService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.integrationConnectionService.remove(id);
  }
}
