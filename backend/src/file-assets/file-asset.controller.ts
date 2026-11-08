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
import { FileAssetService } from './file-asset.service.js';
import type { Prisma } from '../prisma/prisma.service.js';

import { ApiBearerAuth } from '@nestjs/swagger';
@Controller('file-assets')
@ApiBearerAuth()
export class FileAssetController {
  constructor(private readonly fileAssetService: FileAssetService) {}

  @Post()
  create(@Body() dto: Prisma.FileAssetCreateInput) {
    return this.fileAssetService.create(dto);
  }

  @Get()
  findAll() {
    return this.fileAssetService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.fileAssetService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Prisma.FileAssetUpdateInput) {
    return this.fileAssetService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.fileAssetService.remove(id);
  }
}
