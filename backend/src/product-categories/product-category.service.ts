import { Injectable } from '@nestjs/common';
import { PrismaService, Prisma } from '../prisma/prisma.service.js';

@Injectable()
export class ProductCategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.ProductCategoryCreateInput) {
    return this.prisma.productCategory.create({ data });
  }

  async findAll() {
    return this.prisma.productCategory.findMany();
  }

  async findOne(id: string) {
    return this.prisma.productCategory.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.ProductCategoryUpdateInput) {
    return this.prisma.productCategory.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.productCategory.delete({ where: { id } });
  }
}
