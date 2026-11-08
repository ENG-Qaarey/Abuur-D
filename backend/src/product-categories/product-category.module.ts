import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ProductCategoryController } from './product-category.controller.js';
import { ProductCategoryService } from './product-category.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [ProductCategoryController],
  providers: [ProductCategoryService],
  exports: [ProductCategoryService],
})
export class ProductCategoryModule {}
