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
import { WebhookEventService } from './webhook-event.service.js';
import type { Prisma } from '../prisma/prisma.service.js';

import { ApiBearerAuth } from '@nestjs/swagger';
@Controller('webhook-events')
@ApiBearerAuth()
export class WebhookEventController {
  constructor(private readonly webhookEventService: WebhookEventService) {}

  @Post()
  create(@Body() dto: Prisma.WebhookEventCreateInput) {
    return this.webhookEventService.create(dto);
  }

  @Get()
  findAll() {
    return this.webhookEventService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.webhookEventService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Prisma.WebhookEventUpdateInput,
  ) {
    return this.webhookEventService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.webhookEventService.remove(id);
  }
}
