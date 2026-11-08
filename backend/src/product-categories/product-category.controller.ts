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
import { ProductCategoryService } from './product-category.service.js';
import type { Prisma } from '../prisma/prisma.service.js';

import { ApiBearerAuth } from '@nestjs/swagger';
@Controller('product-categories')
@ApiBearerAuth()
export class ProductCategoryController {
  constructor(private readonly productCategoryService: ProductCategoryService) {}

  @Post()
  create(@Body() dto: Prisma.ProductCategoryCreateInput) {
    return this.productCategoryService.create(dto);
  }

  @Get()
  findAll() {
    return this.productCategoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productCategoryService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Prisma.ProductCategoryUpdateInput,
  ) {
    return this.productCategoryService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productCategoryService.remove(id);
  }
}
