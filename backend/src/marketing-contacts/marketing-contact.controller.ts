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
import { MarketingContactService } from './marketing-contact.service.js';
import type { Prisma } from '../prisma/prisma.service.js';

import { ApiBearerAuth } from '@nestjs/swagger';
@Controller('marketing-contacts')
@ApiBearerAuth()
export class MarketingContactController {
  constructor(private readonly marketingContactService: MarketingContactService) {}

  @Post()
  create(@Body() dto: Prisma.MarketingContactCreateInput) {
    return this.marketingContactService.create(dto);
  }

  @Get()
  findAll() {
    return this.marketingContactService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.marketingContactService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Prisma.MarketingContactUpdateInput,
  ) {
    return this.marketingContactService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.marketingContactService.remove(id);
  }
}
