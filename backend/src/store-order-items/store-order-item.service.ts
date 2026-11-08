import { Injectable } from '@nestjs/common';
import { PrismaService, Prisma } from '../prisma/prisma.service.js';

@Injectable()
export class StoreOrderItemService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.StoreOrderItemCreateInput) {
    return this.prisma.storeOrderItem.create({ data });
  }

  async findAll() {
    return this.prisma.storeOrderItem.findMany();
  }

  async findOne(id: string) {
    return this.prisma.storeOrderItem.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.StoreOrderItemUpdateInput) {
    return this.prisma.storeOrderItem.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.storeOrderItem.delete({ where: { id } });
  }
}
