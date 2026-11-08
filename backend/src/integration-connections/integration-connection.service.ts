import { Injectable } from '@nestjs/common';
import { PrismaService, Prisma } from '../prisma/prisma.service.js';

@Injectable()
export class IntegrationConnectionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.IntegrationConnectionCreateInput) {
    return this.prisma.integrationConnection.create({ data });
  }

  async findAll() {
    return this.prisma.integrationConnection.findMany();
  }

  async findOne(id: string) {
    return this.prisma.integrationConnection.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.IntegrationConnectionUpdateInput) {
    return this.prisma.integrationConnection.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.integrationConnection.delete({ where: { id } });
  }
}
