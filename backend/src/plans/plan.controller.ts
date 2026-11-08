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
import { PlanService } from './plan.service.js';
import type { Prisma } from '../prisma/prisma.service.js';
import { Public } from '../auth/decorators/auth.decorators.js';

import { ApiBearerAuth } from '@nestjs/swagger';
@Controller('plans')
@ApiBearerAuth()
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Post()
  create(@Body() dto: Prisma.PlanCreateInput) {
    return this.planService.create(dto);
  }

  /** Public pricing page: active plans only, cheapest first. */
  @Get('public')
  @Public()
  findPublic() {
    return this.planService.findActive();
  }

  @Get()
  findAll() {
    return this.planService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.planService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Prisma.PlanUpdateInput) {
    return this.planService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.planService.remove(id);
  }
}
