import { Injectable, NotFoundException } from '@nestjs/common';
import { MembershipStatus, type UserStatus } from '@prisma/client';
import { PrismaService, Prisma } from '../prisma/prisma.service.js';
import { AuditLogService } from '../audit-logs/audit-log.service.js';
import type { UpdateMeDto } from './dto/update-me.dto.js';

/** Fields safe to return to clients. Never expose supabaseId. */
export const USER_PUBLIC_SELECT = {
  id: true,
  email: true,
  phone: true,
  firstName: true,
  lastName: true,
  avatarUrl: true,
  status: true,
  platformRole: true,
  emailVerified: true,
  phoneVerified: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLogService,
  ) {}

  /** Profile plus active and pending memberships. */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        ...USER_PUBLIC_SELECT,
        memberships: {
          where: {
            status: { in: [MembershipStatus.ACTIVE, MembershipStatus.INVITED] },
          },
          select: {
            id: true,
            role: true,
            status: true,
            invitedAt: true,
            joinedAt: true,
            business: { select: { id: true, name: true, slug: true, status: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateMeDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: USER_PUBLIC_SELECT,
    });
  }

  /** Accepts a pending invitation addressed to this user. */
  async acceptInvitation(userId: string, membershipId: string) {
    const membership = await this.prisma.businessMembership.findFirst({
      where: { id: membershipId, userId, status: MembershipStatus.INVITED },
    });
    if (!membership) throw new NotFoundException('Invitation not found');

    return this.prisma.$transaction(async (tx) => {
      // Conditional update: if the invitation was revoked after we read it,
      // nothing matches and it is not reactivated.
      const { count } = await tx.businessMembership.updateMany({
        where: { id: membership.id, userId, status: MembershipStatus.INVITED },
        data: { status: MembershipStatus.ACTIVE, joinedAt: new Date() },
      });
      if (count === 0) throw new NotFoundException('Invitation not found');
      const updated = await tx.businessMembership.findUniqueOrThrow({
        where: { id: membership.id },
      });
      await this.audit.record(
        {
          action: 'membership.accepted',
          entityType: 'BusinessMembership',
          entityId: membership.id,
          businessId: membership.businessId,
          userId,
        },
        tx,
      );
      return updated;
    });
  }

  // ---- Platform admin ----

  async findAll(params: { skip?: number; take?: number }) {
    return this.prisma.user.findMany({
      select: USER_PUBLIC_SELECT,
      orderBy: { createdAt: 'desc' },
      skip: params.skip ?? 0,
      take: Math.min(params.take ?? 50, 100),
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: USER_PUBLIC_SELECT,
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async setStatus(actorId: string, id: string, status: UserStatus) {
    await this.findOne(id);
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id },
        data: { status },
        select: USER_PUBLIC_SELECT,
      });
      await this.audit.record(
        {
          action: 'user.status_changed',
          entityType: 'User',
          entityId: id,
          userId: actorId,
          metadata: { status },
        },
        tx,
      );
      return user;
    });
  }

  async findBySupabaseId(supabaseId: string) {
    return this.prisma.user.findUnique({ where: { supabaseId } });
  }
}
