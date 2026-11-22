import { Request } from 'express';
import { prisma } from '../prisma';
import { AppError } from '../middleware/error';
import { Access, accessOf, accessWhere, assertCan, businessIdOf, modelMeta, Op } from '../access/scope';
import type { Action } from '../access/policy';
import { isUuid } from './http';

const and = (...parts: (Record<string, unknown> | null | undefined)[]) => {
  const list = parts.filter((p) => p && Object.keys(p).length) as Record<string, unknown>[];
  return list.length === 0 ? {} : list.length === 1 ? list[0] : { AND: list };
};

/**
 * Loads one row the caller can see; with `op`/`action` it must also be allowed to do that on it.
 * Not visible → 404 (never reveals other businesses' data). Visible but not allowed → 403.
 */
export async function findFor<T = any>(
  req: Request,
  delegate: string,
  id: unknown,
  op: Op = 'read',
  opts: { action?: Action; include?: Record<string, unknown> } = {},
): Promise<{ row: T; access: Access; businessId: string }> {
  const name = modelMeta(delegate).name;
  if (!isUuid(id)) throw new AppError(`${name} not found`, 404);
  const access = await accessOf(req);
  const row = await (prisma as any)[delegate].findFirst({
    where: and({ id }, accessWhere(delegate, access, 'read')),
    ...(opts.include ? { include: opts.include } : {}),
  });
  if (!row) throw new AppError(`${name} not found`, 404);
  const businessId = (await businessIdOf(delegate, id))!;
  if (op !== 'read' || opts.action) assertCan(access, businessId, delegate, op, opts.action);
  return { row, access, businessId };
}

/** For endpoints that take a businessId: the caller must be allowed `op` on `delegate` there. */
export async function forBusiness(req: Request, businessId: unknown, delegate: string, op: Op = 'read', action?: Action): Promise<{ access: Access; businessId: string }> {
  if (!isUuid(businessId)) throw new AppError('businessId must be a valid id', 400);
  const access = await accessOf(req);
  if (access.isAdmin) {
    const exists = await prisma.business.count({ where: { id: businessId } });
    if (!exists) throw new AppError('Business not found', 404);
  }
  assertCan(access, businessId, delegate, op, action);
  return { access, businessId };
}

/** Whether the caller may read `delegate` in this business (for dashboards that hide sections). */
export function canRead(access: Access, businessId: string, delegate: string): boolean {
  try {
    assertCan(access, businessId, delegate, 'read');
    return true;
  } catch {
    return false;
  }
}

/** Ensures `id` is a row of `delegate` in `businessId` (for ids taken from request bodies). */
export async function assertInBusiness(delegate: string, id: string | undefined | null, businessId: string, label = 'id'): Promise<void> {
  if (!id) return;
  if (!isUuid(id)) throw new AppError(`${label} must be a valid id`, 400);
  const owner = await businessIdOf(delegate, id).catch(() => null);
  if (owner !== businessId) throw new AppError(`${label} was not found in this business`, 404);
}

/** A user referenced by a body field must be an active member of the business. */
export async function assertMember(userId: string | undefined | null, businessId: string, label = 'userId'): Promise<void> {
  if (!userId) return;
  if (!isUuid(userId)) throw new AppError(`${label} must be a valid id`, 400);
  const n = await prisma.businessMembership.count({ where: { userId, businessId, status: 'ACTIVE' } });
  if (!n) throw new AppError(`${label} must be an active member of this business`, 400);
}
