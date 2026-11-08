import { Injectable, NotFoundException } from '@nestjs/common';
import {
  BusinessStatus,
  MembershipRole,
  MembershipStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditLogService } from '../audit-logs/audit-log.service.js';
import type { CreateBusinessDto, UpdateBusinessDto } from './dto/business.dto.js';

@Injectable()
export class BusinessService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLogService,
  ) {}

  /** Creates a business and makes the caller its OWNER, atomically. */
  async create(userId: string, dto: CreateBusinessDto) {
    return this.prisma.$transaction(async (tx) => {
      const business = await tx.business.create({ data: dto });
      await tx.businessMembership.create({
        data: {
          userId,
          businessId: business.id,
          role: MembershipRole.OWNER,
          status: MembershipStatus.ACTIVE,
          joinedAt: new Date(),
        },
      });
      await this.audit.record(
        {
          action: 'business.created',
          entityType: 'Business',
          entityId: business.id,
          businessId: business.id,
          userId,
        },
        tx,
      );
      return business;
    });
  }

  /** Businesses where the caller is an active member. */
  async findMine(userId: string) {
    const memberships = await this.prisma.businessMembership.findMany({
      where: { userId, status: MembershipStatus.ACTIVE },
      select: { role: true, business: true },
      orderBy: { createdAt: 'asc' },
    });
    return memberships.map(({ role, business }) => ({ ...business, myRole: role }));
  }

  /** Platform admin: every business, newest first, with its owners and counts. */
  async findAllForAdmin(query: { status?: BusinessStatus; skip: number; take: number }) {
    const where = query.status ? { status: query.status } : {};
    const [items, total] = await Promise.all([
      this.prisma.business.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.take,
        include: {
          memberships: {
            where: { role: MembershipRole.OWNER, status: MembershipStatus.ACTIVE },
            select: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
          },
          _count: { select: { memberships: { where: { status: MembershipStatus.ACTIVE } }, stores: true } },
        },
      }),
      this.prisma.business.count({ where }),
    ]);
    return {
      total,
      items: items.map(({ memberships, _count, ...business }) => ({
        ...business,
        owners: memberships.map((m) => m.user),
        memberCount: _count.memberships,
        storeCount: _count.stores,
      })),
    };
  }

  async findOne(businessId: string) {
    const business = await this.prisma.business.findUnique({ where: { id: businessId } });
    if (!business) throw new NotFoundException('Business not found');
    return business;
  }

  async update(userId: string, businessId: string, dto: UpdateBusinessDto) {
    await this.findOne(businessId);
    return this.prisma.$transaction(async (tx) => {
      const business = await tx.business.update({ where: { id: businessId }, data: dto });
      await this.audit.record(
        {
          action: 'business.updated',
          entityType: 'Business',
          entityId: businessId,
          businessId,
          userId,
          metadata: { fields: Object.keys(dto) },
        },
        tx,
      );
      return business;
    });
  }

  /**
   * Deactivates the business. A hard delete would cascade into orders,
   * invoices and payments, so it is intentionally not exposed.
   */
  async deactivate(userId: string, businessId: string) {
    return this.setStatus(userId, businessId, BusinessStatus.INACTIVE, 'business.deactivated');
  }

  /** Platform admin: approve, suspend or reactivate a business. */
  async setStatus(
    userId: string,
    businessId: string,
    status: BusinessStatus,
    action = 'business.status_changed',
  ) {
    await this.findOne(businessId);
    return this.prisma.$transaction(async (tx) => {
      const business = await tx.business.update({
        where: { id: businessId },
        data: { status },
      });
      await this.audit.record(
        {
          action,
          entityType: 'Business',
          entityId: businessId,
          businessId,
          userId,
          metadata: { status },
        },
        tx,
      );
      return business;
    });
  }
}
