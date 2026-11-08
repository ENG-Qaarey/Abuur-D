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
import { CreativeProjectService } from './creative-project.service.js';
import type { Prisma } from '../prisma/prisma.service.js';

import { ApiBearerAuth } from '@nestjs/swagger';
@Controller('creative-projects')
@ApiBearerAuth()
export class CreativeProjectController {
  constructor(private readonly creativeProjectService: CreativeProjectService) {}

  @Post()
  create(@Body() dto: Prisma.CreativeProjectCreateInput) {
    return this.creativeProjectService.create(dto);
  }

  @Get()
  findAll() {
    return this.creativeProjectService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.creativeProjectService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Prisma.CreativeProjectUpdateInput,
  ) {
    return this.creativeProjectService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.creativeProjectService.remove(id);
  }
}
