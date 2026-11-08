import { Injectable } from '@nestjs/common';
import { PrismaService, Prisma } from '../prisma/prisma.service.js';

@Injectable()
export class FileAssetService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.FileAssetCreateInput) {
    return this.prisma.fileAsset.create({ data });
  }

  async findAll() {
    return this.prisma.fileAsset.findMany();
  }

  async findOne(id: string) {
    return this.prisma.fileAsset.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.FileAssetUpdateInput) {
    return this.prisma.fileAsset.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.fileAsset.delete({ where: { id } });
  }
}
