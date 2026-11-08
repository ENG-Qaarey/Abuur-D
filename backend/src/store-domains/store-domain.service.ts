import { Injectable } from '@nestjs/common';
import { PrismaService, Prisma } from '../prisma/prisma.service.js';

@Injectable()
export class StoreDomainService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.StoreDomainCreateInput) {
    return this.prisma.storeDomain.create({ data });
  }

  async findAll() {
    return this.prisma.storeDomain.findMany();
  }

  async findOne(id: string) {
    return this.prisma.storeDomain.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.StoreDomainUpdateInput) {
    return this.prisma.storeDomain.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.storeDomain.delete({ where: { id } });
  }
}
