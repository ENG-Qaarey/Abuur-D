import { Injectable } from '@nestjs/common';
import { PrismaService, Prisma } from '../prisma/prisma.service.js';

@Injectable()
export class PlanService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.PlanCreateInput) {
    return this.prisma.plan.create({ data });
  }

  async findAll() {
    return this.prisma.plan.findMany();
  }

  async findActive() {
    return this.prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        currency: true,
        interval: true,
        features: true,
        limits: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.plan.findUnique({ where: { id } });
  }

  async findBySlug(slug: string) {
    return this.prisma.plan.findUnique({ where: { slug } });
  }

  async update(id: string, data: Prisma.PlanUpdateInput) {
    return this.prisma.plan.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.plan.delete({ where: { id } });
  }
}
