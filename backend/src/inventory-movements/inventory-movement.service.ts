import { Injectable } from '@nestjs/common';
import { PrismaService, Prisma } from '../prisma/prisma.service.js';

@Injectable()
export class InventoryMovementService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.InventoryMovementCreateInput) {
    return this.prisma.inventoryMovement.create({ data });
  }

  async findAll() {
    return this.prisma.inventoryMovement.findMany();
  }

  async findOne(id: string) {
    return this.prisma.inventoryMovement.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.InventoryMovementUpdateInput) {
    return this.prisma.inventoryMovement.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.inventoryMovement.delete({ where: { id } });
  }
}
