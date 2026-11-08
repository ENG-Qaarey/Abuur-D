import { Injectable } from '@nestjs/common';
import { PrismaService, Prisma } from '../prisma/prisma.service.js';

@Injectable()
export class InvoiceItemService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.InvoiceItemCreateInput) {
    return this.prisma.invoiceItem.create({ data });
  }

  async findAll() {
    return this.prisma.invoiceItem.findMany();
  }

  async findOne(id: string) {
    return this.prisma.invoiceItem.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.InvoiceItemUpdateInput) {
    return this.prisma.invoiceItem.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.invoiceItem.delete({ where: { id } });
  }
}
