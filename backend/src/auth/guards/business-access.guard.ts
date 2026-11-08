import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { isUUID } from 'class-validator';
import {
  BusinessStatus,
  MembershipStatus,
  PlatformRole,
  type MembershipRole,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service.js';
import {
  AUTHENTICATED_KEY,
  BUSINESS_ROLES_KEY,
  BUSINESS_STATUSES_KEY,
  IS_PUBLIC_KEY,
  PLATFORM_ADMIN_KEY,
} from '../decorators/auth.decorators.js';
import type { AuthenticatedRequest } from '../auth.types.js';

export const BUSINESS_ID_HEADER = 'x-business-id';

const BUSINESS_STATUS_MESSAGES: Record<BusinessStatus, string> = {
  ACTIVE: 'This action is not available for an active business',
  PENDING_APPROVAL: 'This business is waiting for approval',
  SUSPENDED: 'This business is suspended',
  INACTIVE: 'This business is inactive',
};

/**
 * Global guard #2 (runs after JwtAuthGuard): enforces the access marker on
 * each route. Routes without any marker are denied.
 */
@Injectable()
export class BusinessAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const targets = [context.getHandler(), context.getClass()];
    const get = <T>(key: string) =>
      this.reflector.getAllAndOverride<T>(key, targets);

    if (get<boolean>(IS_PUBLIC_KEY)) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    if (!user) throw new UnauthorizedException();

    const isSuperAdmin = user.platformRole === PlatformRole.SUPER_ADMIN;
    const platformAdminOnly = get<boolean>(PLATFORM_ADMIN_KEY);
    const businessRoles = get<MembershipRole[] | undefined>(BUSINESS_ROLES_KEY);

    if (platformAdminOnly && isSuperAdmin) return true;

    if (businessRoles) {
      const businessId = this.resolveBusinessId(request);
      request.businessId = businessId;

      if (isSuperAdmin) {
        request.membership = null;
        return true;
      }

      const found = await this.prisma.businessMembership.findUnique({
        where: { userId_businessId: { userId: user.id, businessId } },
        include: { business: { select: { status: true } } },
      });
      if (!found || found.status !== MembershipStatus.ACTIVE) {
        throw new ForbiddenException('You are not a member of this business');
      }
      const { business, ...membership } = found;
      const allowedStatuses = get<BusinessStatus[] | undefined>(BUSINESS_STATUSES_KEY) ?? [
        BusinessStatus.ACTIVE,
      ];
      if (!allowedStatuses.includes(business.status)) {
        throw new ForbiddenException(BUSINESS_STATUS_MESSAGES[business.status]);
      }
      if (businessRoles.length > 0 && !businessRoles.includes(membership.role)) {
        throw new ForbiddenException('Your role does not allow this action');
      }
      request.membership = membership;
      return true;
    }

    if (get<boolean>(AUTHENTICATED_KEY)) return true;

    if (platformAdminOnly) {
      throw new ForbiddenException('Platform admin access required');
    }
    // Default deny: route has not been given an access policy yet.
    throw new ForbiddenException('This endpoint is not enabled');
  }

  private resolveBusinessId(request: AuthenticatedRequest): string {
    const fromParam = request.params?.businessId as string | undefined;
    const rawHeader = request.headers[BUSINESS_ID_HEADER];
    const fromHeader = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;

    if (fromParam && fromHeader && fromParam !== fromHeader) {
      throw new BadRequestException('Business id in path and header do not match');
    }
    const businessId = fromParam ?? fromHeader;
    if (!businessId || !isUUID(businessId)) {
      throw new BadRequestException('A valid business id is required');
    }
    return businessId;
  }
}
