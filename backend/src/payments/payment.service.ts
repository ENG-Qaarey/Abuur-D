import { Injectable } from '@nestjs/common';
import { PrismaService, Prisma } from '../prisma/prisma.service.js';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.PaymentCreateInput) {
    return this.prisma.payment.create({ data });
  }

  async findAll() {
    return this.prisma.payment.findMany();
  }

  async findOne(id: string) {
    return this.prisma.payment.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.PaymentUpdateInput) {
    return this.prisma.payment.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.payment.delete({ where: { id } });
  }
}
