import {
  SetMetadata,
  createParamDecorator,
  type ExecutionContext,
} from '@nestjs/common';
import type { BusinessStatus, MembershipRole } from '@prisma/client';
import type { AuthenticatedRequest } from '../auth.types.js';

export const IS_PUBLIC_KEY = 'auth:isPublic';
export const AUTHENTICATED_KEY = 'auth:authenticated';
export const PLATFORM_ADMIN_KEY = 'auth:platformAdmin';
export const BUSINESS_ROLES_KEY = 'auth:businessRoles';
export const BUSINESS_STATUSES_KEY = 'auth:businessStatuses';

/*
 * Access markers. Every route must carry at least one of these, otherwise
 * BusinessAccessGuard rejects it (default deny).
 */

/** No authentication at all. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/** Any signed-in, active user. Not tied to a business. */
export const Authenticated = () => SetMetadata(AUTHENTICATED_KEY, true);

/** Platform super admins only. */
export const PlatformAdmin = () => SetMetadata(PLATFORM_ADMIN_KEY, true);

/**
 * Caller must be an ACTIVE member of the business named by the `:businessId`
 * route param (or `X-Business-Id` header). With no roles listed, any role is allowed.
 * Platform super admins always pass.
 */
export const BusinessRoles = (...roles: MembershipRole[]) =>
  SetMetadata(BUSINESS_ROLES_KEY, roles);

/**
 * Business statuses a @BusinessRoles route accepts. Without this marker only
 * ACTIVE businesses pass, so admin approval and suspension take effect.
 * Platform super admins are not affected.
 */
export const AllowBusinessStatus = (...statuses: BusinessStatus[]) =>
  SetMetadata(BUSINESS_STATUSES_KEY, statuses);

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) =>
    ctx.switchToHttp().getRequest<AuthenticatedRequest>().user,
);

export const CurrentMembership = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) =>
    ctx.switchToHttp().getRequest<AuthenticatedRequest>().membership ?? null,
);
