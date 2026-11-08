import { Injectable } from '@nestjs/common';
import { PrismaService, Prisma } from '../prisma/prisma.service.js';

@Injectable()
export class CreativeTaskService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.CreativeTaskCreateInput) {
    return this.prisma.creativeTask.create({ data });
  }

  async findAll() {
    return this.prisma.creativeTask.findMany();
  }

  async findOne(id: string) {
    return this.prisma.creativeTask.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.CreativeTaskUpdateInput) {
    return this.prisma.creativeTask.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.creativeTask.delete({ where: { id } });
  }
}
