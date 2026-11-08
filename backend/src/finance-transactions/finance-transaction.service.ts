import { Injectable } from '@nestjs/common';
import { PrismaService, Prisma } from '../prisma/prisma.service.js';

@Injectable()
export class FinanceTransactionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.FinanceTransactionCreateInput) {
    return this.prisma.financeTransaction.create({ data });
  }

  async findAll() {
    return this.prisma.financeTransaction.findMany();
  }

  async findOne(id: string) {
    return this.prisma.financeTransaction.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.FinanceTransactionUpdateInput) {
    return this.prisma.financeTransaction.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.financeTransaction.delete({ where: { id } });
  }
}
