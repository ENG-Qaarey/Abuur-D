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
import { CreativeTaskService } from './creative-task.service.js';
import type { Prisma } from '../prisma/prisma.service.js';

import { ApiBearerAuth } from '@nestjs/swagger';
@Controller('creative-tasks')
@ApiBearerAuth()
export class CreativeTaskController {
  constructor(private readonly creativeTaskService: CreativeTaskService) {}

  @Post()
  create(@Body() dto: Prisma.CreativeTaskCreateInput) {
    return this.creativeTaskService.create(dto);
  }

  @Get()
  findAll() {
    return this.creativeTaskService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.creativeTaskService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Prisma.CreativeTaskUpdateInput,
  ) {
    return this.creativeTaskService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.creativeTaskService.remove(id);
  }
}
