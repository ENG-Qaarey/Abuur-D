import { Injectable } from '@nestjs/common';
import { PrismaService, Prisma } from '../prisma/prisma.service.js';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.NotificationCreateInput) {
    return this.prisma.notification.create({ data });
  }

  async findAll() {
    return this.prisma.notification.findMany();
  }

  async findOne(id: string) {
    return this.prisma.notification.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.NotificationUpdateInput) {
    return this.prisma.notification.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.notification.delete({ where: { id } });
  }
}
