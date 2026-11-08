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
import { CRMCustomerService } from './crm-customer.service.js';
import type { Prisma } from '../prisma/prisma.service.js';

import { ApiBearerAuth } from '@nestjs/swagger';
@Controller('crm-customers')
@ApiBearerAuth()
export class CRMCustomerController {
  constructor(private readonly crmCustomerService: CRMCustomerService) {}

  @Post()
  create(@Body() dto: Prisma.CRMCustomerCreateInput) {
    return this.crmCustomerService.create(dto);
  }

  @Get()
  findAll() {
    return this.crmCustomerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.crmCustomerService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Prisma.CRMCustomerUpdateInput) {
    return this.crmCustomerService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.crmCustomerService.remove(id);
  }
}
