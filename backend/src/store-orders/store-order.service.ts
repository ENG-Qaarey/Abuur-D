import { Injectable } from '@nestjs/common';
import { PrismaService, Prisma } from '../prisma/prisma.service.js';

@Injectable()
export class StoreOrderService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.StoreOrderCreateInput) {
    return this.prisma.storeOrder.create({ data });
  }

  async findAll() {
    return this.prisma.storeOrder.findMany();
  }

  async findOne(id: string) {
    return this.prisma.storeOrder.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.StoreOrderUpdateInput) {
    return this.prisma.storeOrder.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.storeOrder.delete({ where: { id } });
  }
}
