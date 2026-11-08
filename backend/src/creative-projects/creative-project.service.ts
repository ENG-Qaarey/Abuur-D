import { Injectable } from '@nestjs/common';
import { PrismaService, Prisma } from '../prisma/prisma.service.js';

@Injectable()
export class CreativeProjectService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.CreativeProjectCreateInput) {
    return this.prisma.creativeProject.create({ data });
  }

  async findAll() {
    return this.prisma.creativeProject.findMany();
  }

  async findOne(id: string) {
    return this.prisma.creativeProject.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.CreativeProjectUpdateInput) {
    return this.prisma.creativeProject.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.creativeProject.delete({ where: { id } });
  }
}
