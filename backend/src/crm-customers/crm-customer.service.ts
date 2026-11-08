import { Injectable } from '@nestjs/common';
import { PrismaService, Prisma } from '../prisma/prisma.service.js';

@Injectable()
export class CRMCustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.CRMCustomerCreateInput) {
    return this.prisma.cRMCustomer.create({ data });
  }

  async findAll() {
    return this.prisma.cRMCustomer.findMany();
  }

  async findOne(id: string) {
    return this.prisma.cRMCustomer.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.CRMCustomerUpdateInput) {
    return this.prisma.cRMCustomer.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.cRMCustomer.delete({ where: { id } });
  }
}
