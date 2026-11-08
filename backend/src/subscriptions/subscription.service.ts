import { Injectable } from '@nestjs/common';
import { PrismaService, Prisma } from '../prisma/prisma.service.js';

@Injectable()
export class SubscriptionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.SubscriptionCreateInput) {
    return this.prisma.subscription.create({ data });
  }

  async findAll() {
    return this.prisma.subscription.findMany();
  }

  async findOne(id: string) {
    return this.prisma.subscription.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.SubscriptionUpdateInput) {
    return this.prisma.subscription.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.subscription.delete({ where: { id } });
  }
}
