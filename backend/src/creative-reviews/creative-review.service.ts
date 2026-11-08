import { Injectable } from '@nestjs/common';
import { PrismaService, Prisma } from '../prisma/prisma.service.js';

@Injectable()
export class CreativeReviewService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.CreativeReviewCreateInput) {
    return this.prisma.creativeReview.create({ data });
  }

  async findAll() {
    return this.prisma.creativeReview.findMany();
  }

  async findOne(id: string) {
    return this.prisma.creativeReview.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.CreativeReviewUpdateInput) {
    return this.prisma.creativeReview.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.creativeReview.delete({ where: { id } });
  }
}
