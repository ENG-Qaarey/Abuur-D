import { Injectable } from '@nestjs/common';
import { BusinessStatus, ProductStatus, StoreStatus } from '@prisma/client';
import { PrismaService, Prisma } from '../prisma/prisma.service.js';

@Injectable()
export class StoreService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.StoreCreateInput) {
    return this.prisma.store.create({ data });
  }

  /**
   * Public store directory: only ACTIVE stores of ACTIVE (approved) businesses,
   * and only fields a shopper may see. No owner, contact or internal data.
   */
  async findPublic() {
    const stores = await this.prisma.store.findMany({
      where: { status: StoreStatus.ACTIVE, business: { status: BusinessStatus.ACTIVE } },
      orderBy: { createdAt: 'desc' },
      take: 60,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logoUrl: true,
        city: true,
        business: { select: { industry: true } },
        _count: { select: { products: { where: { status: ProductStatus.ACTIVE } } } },
      },
    });
    return stores.map(({ business, _count, ...store }) => ({
      ...store,
      industry: business.industry,
      productCount: _count.products,
    }));
  }

  async findAll() {
    return this.prisma.store.findMany();
  }

  async findOne(id: string) {
    return this.prisma.store.findUnique({ where: { id } });
  }

  async findBySlug(slug: string) {
    return this.prisma.store.findUnique({ where: { slug } });
  }

  async update(id: string, data: Prisma.StoreUpdateInput) {
    return this.prisma.store.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.store.delete({ where: { id } });
  }
}
