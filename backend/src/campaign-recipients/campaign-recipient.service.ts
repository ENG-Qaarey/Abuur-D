import { Injectable } from '@nestjs/common';
import { PrismaService, Prisma } from '../prisma/prisma.service.js';

@Injectable()
export class CampaignRecipientService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.CampaignRecipientCreateInput) {
    return this.prisma.campaignRecipient.create({ data });
  }

  async findAll() {
    return this.prisma.campaignRecipient.findMany();
  }

  async findOne(id: string) {
    return this.prisma.campaignRecipient.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.CampaignRecipientUpdateInput) {
    return this.prisma.campaignRecipient.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.campaignRecipient.delete({ where: { id } });
  }
}
