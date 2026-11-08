import {
  BadRequestException,
  ForbiddenException,
  type ExecutionContext,
} from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import { BusinessAccessGuard } from './business-access.guard.js';
import {
  AUTHENTICATED_KEY,
  BUSINESS_ROLES_KEY,
  BUSINESS_STATUSES_KEY,
  IS_PUBLIC_KEY,
  PLATFORM_ADMIN_KEY,
} from '../decorators/auth.decorators.js';

const BIZ = '22222222-2222-4222-8222-222222222222';
const OTHER = '33333333-3333-4333-8333-333333333333';
const user = (platformRole = 'USER') => ({ id: 'u1', email: null, status: 'ACTIVE', platformRole });

function run(opts: {
  meta: Record<string, unknown>;
  user?: object;
  membership?: object | null;
  params?: Record<string, string>;
  headers?: Record<string, string>;
}) {
  const reflector = { getAllAndOverride: (key: string) => opts.meta[key] } as unknown as Reflector;
  const prisma = { businessMembership: { findUnique: vi.fn().mockResolvedValue(opts.membership ?? null) } };
  const guard = new BusinessAccessGuard(reflector, prisma as never);
  const request: Record<string, any> = {
    user: opts.user ?? user(),
    params: opts.params ?? {},
    headers: opts.headers ?? {},
  };
  const ctx = {
    getHandler: () => null,
    getClass: () => null,
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
  return { result: guard.canActivate(ctx), request, prisma };
}

const active = (role: string, businessStatus = 'ACTIVE') => ({
  role,
  status: 'ACTIVE',
  businessId: BIZ,
  userId: 'u1',
  business: { status: businessStatus },
});

describe('BusinessAccessGuard', () => {
  it('denies routes without any access marker (default deny)', async () => {
    await expect(run({ meta: {} }).result).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows @Public and @Authenticated routes', async () => {
    await expect(run({ meta: { [IS_PUBLIC_KEY]: true } }).result).resolves.toBe(true);
    await expect(run({ meta: { [AUTHENTICATED_KEY]: true } }).result).resolves.toBe(true);
  });

  it('restricts @PlatformAdmin routes to SUPER_ADMIN', async () => {
    await expect(run({ meta: { [PLATFORM_ADMIN_KEY]: true } }).result).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      run({ meta: { [PLATFORM_ADMIN_KEY]: true }, user: user('SUPER_ADMIN') }).result,
    ).resolves.toBe(true);
  });

  describe('@BusinessRoles', () => {
    const meta = (...roles: string[]) => ({ [BUSINESS_ROLES_KEY]: roles });

    it('rejects non-members', async () => {
      await expect(run({ meta: meta(), params: { businessId: BIZ } }).result).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it.each(['INVITED', 'SUSPENDED', 'REMOVED'])('rejects %s memberships', async (status) => {
      const { result } = run({ meta: meta(), params: { businessId: BIZ }, membership: { role: 'OWNER', status } });
      await expect(result).rejects.toBeInstanceOf(ForbiddenException);
    });

    it.each([
      ['OWNER', ['OWNER', 'ADMIN'], true],
      ['ADMIN', ['OWNER', 'ADMIN'], true],
      ['MANAGER', ['OWNER', 'ADMIN'], false],
      ['VIEWER', ['OWNER'], false],
      ['VIEWER', [], true],
    ])('%s with required %j -> allowed=%s', async (role, required, allowed) => {
      const { result, request } = run({ meta: meta(...required), params: { businessId: BIZ }, membership: active(role) });
      if (allowed) {
        await expect(result).resolves.toBe(true);
        expect(request.membership.role).toBe(role);
        expect(request.membership).not.toHaveProperty('business');
        expect(request.businessId).toBe(BIZ);
      } else {
        await expect(result).rejects.toBeInstanceOf(ForbiddenException);
      }
    });

    it('looks the membership up for the caller and the requested business', async () => {
      const { result, prisma } = run({ meta: meta(), params: { businessId: BIZ }, membership: active('VIEWER') });
      await result;
      expect(prisma.businessMembership.findUnique).toHaveBeenCalledWith({
        where: { userId_businessId: { userId: 'u1', businessId: BIZ } },
        include: { business: { select: { status: true } } },
      });
    });

    it('accepts the X-Business-Id header when there is no route param', async () => {
      const { result } = run({ meta: meta(), headers: { 'x-business-id': BIZ }, membership: active('VIEWER') });
      await expect(result).resolves.toBe(true);
    });

    it('rejects a header that disagrees with the route param', async () => {
      const { result } = run({ meta: meta(), params: { businessId: BIZ }, headers: { 'x-business-id': OTHER } });
      await expect(result).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects a missing or malformed business id', async () => {
      await expect(run({ meta: meta() }).result).rejects.toBeInstanceOf(BadRequestException);
      await expect(run({ meta: meta(), params: { businessId: 'nope' } }).result).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it.each(['PENDING_APPROVAL', 'SUSPENDED', 'INACTIVE'])(
      'rejects a %s business by default',
      async (businessStatus) => {
        const { result } = run({ meta: meta(), params: { businessId: BIZ }, membership: active('OWNER', businessStatus) });
        await expect(result).rejects.toBeInstanceOf(ForbiddenException);
      },
    );

    it('allows the business statuses listed with @AllowBusinessStatus', async () => {
      const metaWith = { ...meta(), [BUSINESS_STATUSES_KEY]: ['ACTIVE', 'PENDING_APPROVAL'] };
      const ok = run({ meta: metaWith, params: { businessId: BIZ }, membership: active('OWNER', 'PENDING_APPROVAL') });
      await expect(ok.result).resolves.toBe(true);
      const blocked = run({ meta: metaWith, params: { businessId: BIZ }, membership: active('OWNER', 'SUSPENDED') });
      await expect(blocked.result).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('lets SUPER_ADMIN in without a membership', async () => {
      const { result, request } = run({ meta: meta('OWNER'), params: { businessId: BIZ }, user: user('SUPER_ADMIN') });
      await expect(result).resolves.toBe(true);
      expect(request.membership).toBeNull();
    });
  });
});
