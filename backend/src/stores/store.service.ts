import { Injectable } from '@nestjs/common';
import { PrismaService, Prisma } from '../prisma/prisma.service.js';

@Injectable()
export class StoreService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.StoreCreateInput) {
    return this.prisma.store.create({ data });
  }

  async findAll() {
    return this.prisma.store.findMany();
  }

  async findOne(id: string) {
    return this.prisma.store.findUnique({ where: { id } });
  }

  async findBySlug(slug: string) {
    return this.prisma.store.findUnique({ where: { slug } });
  }

  async update(id: string, data: Prisma.StoreUpdateInput) {
    return this.prisma.store.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.store.delete({ where: { id } });
  }
}
