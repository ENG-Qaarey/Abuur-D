import { Injectable } from '@nestjs/common';
import { PrismaService, Prisma } from '../prisma/prisma.service.js';

@Injectable()
export class CreativeRequestService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.CreativeRequestCreateInput) {
    return this.prisma.creativeRequest.create({ data });
  }

  async findAll() {
    return this.prisma.creativeRequest.findMany();
  }

  async findOne(id: string) {
    return this.prisma.creativeRequest.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.CreativeRequestUpdateInput) {
    return this.prisma.creativeRequest.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.creativeRequest.delete({ where: { id } });
  }
}
