import { Injectable } from '@nestjs/common';
import { PrismaService, Prisma } from '../prisma/prisma.service.js';

@Injectable()
export class StoreCustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.StoreCustomerCreateInput) {
    return this.prisma.storeCustomer.create({ data });
  }

  async findAll() {
    return this.prisma.storeCustomer.findMany();
  }

  async findOne(id: string) {
    return this.prisma.storeCustomer.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.StoreCustomerUpdateInput) {
    return this.prisma.storeCustomer.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.storeCustomer.delete({ where: { id } });
  }
}
