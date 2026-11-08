import { Injectable } from '@nestjs/common';
import { PrismaService, Prisma } from '../prisma/prisma.service.js';

@Injectable()
export class WebhookEventService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.WebhookEventCreateInput) {
    return this.prisma.webhookEvent.create({ data });
  }

  async findAll() {
    return this.prisma.webhookEvent.findMany();
  }

  async findOne(id: string) {
    return this.prisma.webhookEvent.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.WebhookEventUpdateInput) {
    return this.prisma.webhookEvent.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.webhookEvent.delete({ where: { id } });
  }
}
