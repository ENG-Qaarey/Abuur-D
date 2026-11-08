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
import { CreativeReviewService } from './creative-review.service.js';
import type { Prisma } from '../prisma/prisma.service.js';

import { ApiBearerAuth } from '@nestjs/swagger';
@Controller('creative-reviews')
@ApiBearerAuth()
export class CreativeReviewController {
  constructor(private readonly creativeReviewService: CreativeReviewService) {}

  @Post()
  create(@Body() dto: Prisma.CreativeReviewCreateInput) {
    return this.creativeReviewService.create(dto);
  }

  @Get()
  findAll() {
    return this.creativeReviewService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.creativeReviewService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Prisma.CreativeReviewUpdateInput,
  ) {
    return this.creativeReviewService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.creativeReviewService.remove(id);
  }
}
