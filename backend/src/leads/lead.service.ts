import { Injectable } from '@nestjs/common';
import { PrismaService, Prisma } from '../prisma/prisma.service.js';

@Injectable()
export class LeadService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.LeadCreateInput) {
    return this.prisma.lead.create({ data });
  }

  async findAll() {
    return this.prisma.lead.findMany();
  }

  async findOne(id: string) {
    return this.prisma.lead.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.LeadUpdateInput) {
    return this.prisma.lead.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.lead.delete({ where: { id } });
  }
}
