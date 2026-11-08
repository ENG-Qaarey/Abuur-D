import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  MembershipRole,
  MembershipStatus,
  type BusinessMembership,
} from '@prisma/client';
import { PrismaService, Prisma } from '../prisma/prisma.service.js';
import { AuditLogService } from '../audit-logs/audit-log.service.js';
import { canGrant, canManage } from './membership-rules.js';
import type { InviteMemberDto } from './dto/membership.dto.js';

/** The caller's effective role. Platform admins act as OWNER. */
export interface Actor {
  userId: string;
  role: MembershipRole;
}

const MEMBER_SELECT = {
  id: true,
  role: true,
  status: true,
  invitedAt: true,
  joinedAt: true,
  createdAt: true,
  user: {
    select: { id: true, email: true, firstName: true, lastName: true, avatarUrl: true },
  },
} satisfies Prisma.BusinessMembershipSelect;

@Injectable()
export class BusinessMembershipService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLogService,
  ) {}

  static actorFrom(userId: string, membership: BusinessMembership | null): Actor {
    // null membership = platform admin (BusinessAccessGuard only allows that for SUPER_ADMIN)
    return { userId, role: membership?.role ?? MembershipRole.OWNER };
  }

  async list(businessId: string) {
    return this.prisma.businessMembership.findMany({
      where: {
        businessId,
        status: { in: [MembershipStatus.ACTIVE, MembershipStatus.INVITED] },
      },
      select: MEMBER_SELECT,
      orderBy: { createdAt: 'asc' },
    });
  }

  async invite(actor: Actor, businessId: string, dto: InviteMemberDto) {
    if (!canGrant(actor.role, dto.role)) {
      throw new ForbiddenException(`Your role cannot grant ${dto.role}`);
    }
    const invitee = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      select: { id: true },
    });
    if (!invitee) {
      throw new NotFoundException('No ABUUR account uses that email yet');
    }

    const existing = await this.prisma.businessMembership.findUnique({
      where: { userId_businessId: { userId: invitee.id, businessId } },
    });
    if (
      existing &&
      (existing.status === MembershipStatus.ACTIVE || existing.status === MembershipStatus.INVITED)
    ) {
      throw new ConflictException('This user is already a member or has a pending invitation');
    }

    return this.prisma.$transaction(async (tx) => {
      const data = {
        role: dto.role,
        status: MembershipStatus.INVITED,
        invitedAt: new Date(),
        joinedAt: null,
      };
      const membership = existing
        ? await tx.businessMembership.update({ where: { id: existing.id }, data, select: MEMBER_SELECT })
        : await tx.businessMembership.create({
            data: { ...data, userId: invitee.id, businessId },
            select: MEMBER_SELECT,
          });
      await this.audit.record(
        {
          action: 'membership.invited',
          entityType: 'BusinessMembership',
          entityId: membership.id,
          businessId,
          userId: actor.userId,
          metadata: { inviteeId: invitee.id, role: dto.role },
        },
        tx,
      );
      return membership;
    });
  }

  async changeRole(actor: Actor, businessId: string, memberId: string, role: MembershipRole) {
    const target = await this.getMember(businessId, memberId);
    if (target.userId === actor.userId && actor.role !== MembershipRole.OWNER) {
      throw new ForbiddenException('You cannot change your own role');
    }
    if (!canManage(actor.role, target.role, role)) {
      throw new ForbiddenException('Your role cannot make this change');
    }
    if (target.role === role) return this.getMemberView(memberId);

    return this.prisma.$transaction(
      async (tx) => {
        if (target.role === MembershipRole.OWNER) {
          await this.assertAnotherOwner(tx, businessId, target.id);
        }
        const updated = await tx.businessMembership.update({
          where: { id: target.id },
          data: { role },
          select: MEMBER_SELECT,
        });
        await this.audit.record(
          {
            action: 'membership.role_changed',
            entityType: 'BusinessMembership',
            entityId: target.id,
            businessId,
            userId: actor.userId,
            metadata: { from: target.role, to: role, memberUserId: target.userId },
          },
          tx,
        );
        return updated;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  /** Removes a member (soft). Members may always remove themselves (leave). */
  async remove(actor: Actor, businessId: string, memberId: string) {
    const target = await this.getMember(businessId, memberId);
    const isSelf = target.userId === actor.userId;
    if (!isSelf && !canManage(actor.role, target.role)) {
      throw new ForbiddenException('Your role cannot remove this member');
    }

    await this.prisma.$transaction(
      async (tx) => {
        if (target.role === MembershipRole.OWNER && target.status === MembershipStatus.ACTIVE) {
          await this.assertAnotherOwner(tx, businessId, target.id);
        }
        await tx.businessMembership.update({
          where: { id: target.id },
          data: { status: MembershipStatus.REMOVED },
        });
        await this.audit.record(
          {
            action: isSelf ? 'membership.left' : 'membership.removed',
            entityType: 'BusinessMembership',
            entityId: target.id,
            businessId,
            userId: actor.userId,
            metadata: { memberUserId: target.userId, role: target.role },
          },
          tx,
        );
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  /** Always scoped by businessId so ids from another tenant resolve to 404. */
  private async getMember(businessId: string, memberId: string) {
    const member = await this.prisma.businessMembership.findFirst({
      where: {
        id: memberId,
        businessId,
        status: { in: [MembershipStatus.ACTIVE, MembershipStatus.INVITED] },
      },
    });
    if (!member) throw new NotFoundException('Member not found');
    return member;
  }

  private getMemberView(memberId: string) {
    return this.prisma.businessMembership.findUniqueOrThrow({
      where: { id: memberId },
      select: MEMBER_SELECT,
    });
  }

  private async assertAnotherOwner(
    tx: Prisma.TransactionClient,
    businessId: string,
    excludingMembershipId: string,
  ) {
    const owners = await tx.businessMembership.count({
      where: {
        businessId,
        role: MembershipRole.OWNER,
        status: MembershipStatus.ACTIVE,
        id: { not: excludingMembershipId },
      },
    });
    if (owners === 0) {
      throw new ConflictException('A business must keep at least one active OWNER');
    }
  }
}
