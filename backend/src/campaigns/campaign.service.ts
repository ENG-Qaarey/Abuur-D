import { Injectable } from '@nestjs/common';
import { PrismaService, Prisma } from '../prisma/prisma.service.js';

@Injectable()
export class CampaignService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.CampaignCreateInput) {
    return this.prisma.campaign.create({ data });
  }

  async findAll() {
    return this.prisma.campaign.findMany();
  }

  async findOne(id: string) {
    return this.prisma.campaign.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.CampaignUpdateInput) {
    return this.prisma.campaign.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.campaign.delete({ where: { id } });
  }
}
