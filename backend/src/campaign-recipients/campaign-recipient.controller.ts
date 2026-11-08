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
import { CampaignRecipientService } from './campaign-recipient.service.js';
import type { Prisma } from '../prisma/prisma.service.js';

import { ApiBearerAuth } from '@nestjs/swagger';
@Controller('campaign-recipients')
@ApiBearerAuth()
export class CampaignRecipientController {
  constructor(private readonly campaignRecipientService: CampaignRecipientService) {}

  @Post()
  create(@Body() dto: Prisma.CampaignRecipientCreateInput) {
    return this.campaignRecipientService.create(dto);
  }

  @Get()
  findAll() {
    return this.campaignRecipientService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.campaignRecipientService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Prisma.CampaignRecipientUpdateInput,
  ) {
    return this.campaignRecipientService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.campaignRecipientService.remove(id);
  }
}
