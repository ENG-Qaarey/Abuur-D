import { Injectable } from '@nestjs/common';
import { PrismaService, Prisma } from '../prisma/prisma.service.js';

@Injectable()
export class MarketingContactService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.MarketingContactCreateInput) {
    return this.prisma.marketingContact.create({ data });
  }

  async findAll() {
    return this.prisma.marketingContact.findMany();
  }

  async findOne(id: string) {
    return this.prisma.marketingContact.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.MarketingContactUpdateInput) {
    return this.prisma.marketingContact.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.marketingContact.delete({ where: { id } });
  }
}
