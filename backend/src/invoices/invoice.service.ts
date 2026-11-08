import { Injectable } from '@nestjs/common';
import { PrismaService, Prisma } from '../prisma/prisma.service.js';

@Injectable()
export class InvoiceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.InvoiceCreateInput) {
    return this.prisma.invoice.create({ data });
  }

  async findAll() {
    return this.prisma.invoice.findMany();
  }

  async findOne(id: string) {
    return this.prisma.invoice.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.InvoiceUpdateInput) {
    return this.prisma.invoice.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.invoice.delete({ where: { id } });
  }
}
