import { Request } from 'express';
import { Prisma } from '@prisma/client';
import datamodel from './datamodel.json';
import { prisma } from '../prisma';
import { AppError } from '../middleware/error';
import type { AuthenticatedRequest } from '../middleware/auth';
import {
  Action,
  AUTHOR_FIELDS,
  BusinessPolicy,
  MembershipRole,
  Permissions,
  POLICIES,
  Policy,
  REFERENCABLE,
  ROLE_PERMISSIONS,
  SYSTEM_FIELDS,
  ALL_ROLES,
  STAFF,
  MANAGERS,
} from './policy';

// ------------------------------------------------------------------ model metadata (from Prisma)

type FieldMeta = Pick<
  Prisma.DMMF.Field,
  'name' | 'kind' | 'type' | 'isList' | 'isRequired' | 'isId' | 'isUnique' | 'hasDefaultValue' | 'isUpdatedAt'
> & { relationName?: string | null; relationFromFields?: readonly string[]; relationToFields?: readonly string[] };
export type ModelMeta = {
  name: string;
  delegate: string;
  fields: Map<string, FieldMeta>;
  /** Writable scalar/enum columns. */
  scalars: Set<string>;
  /** Foreign key column -> target delegate (e.g. storeId -> store). */
  foreignKeys: Map<string, string>;
  /** Relation field -> { fk, target delegate } (e.g. store -> { fk: storeId, target: store }). */
  relations: Map<string, { fk: string; target: string }>;
};

const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

export const MODELS = new Map<string, ModelMeta>();
// Prisma's data model, saved at build time by prisma/dump-datamodel.cjs (Prisma.dmmf isn't
// available on Cloudflare Workers).
for (const model of (datamodel as { models: { name: string; fields: FieldMeta[] }[] }).models) {
  const meta: ModelMeta = {
    name: model.name,
    delegate: lowerFirst(model.name),
    fields: new Map(model.fields.map((f) => [f.name, f])),
    scalars: new Set(),
    foreignKeys: new Map(),
    relations: new Map(),
  };
  for (const f of model.fields) {
    if (f.kind === 'scalar' || f.kind === 'enum') meta.scalars.add(f.name);
    if (f.kind === 'object' && f.relationFromFields?.length === 1) {
      const fk = f.relationFromFields[0];
      meta.foreignKeys.set(fk, lowerFirst(f.type));
      meta.relations.set(f.name, { fk, target: lowerFirst(f.type) });
    }
  }
  MODELS.set(meta.delegate, meta);
}

export function modelMeta(delegate: string): ModelMeta {
  const meta = MODELS.get(delegate);
  if (!meta) throw new Error(`Unknown model ${delegate}`);
  return meta;
}

export function policyOf(delegate: string): Policy {
  return POLICIES[delegate] ?? { kind: 'admin' };
}

function businessPolicy(delegate: string): BusinessPolicy {
  const p = policyOf(delegate);
  if (p.kind !== 'business') throw new Error(`${delegate} is not business-scoped`);
  return p;
}

const delegateOf = (name: string) => (prisma as any)[name];

// ------------------------------------------------------------------ caller context

export type Membership = {
  businessId: string;
  role: MembershipRole;
  businessStatus: string;
  /** Module permissions from a custom role (null = built-in role rules). */
  permissions: Permissions | null;
};
export type Access = {
  userId: string;
  isAdmin: boolean;
  memberships: Membership[];
};

/** Businesses whose data can be changed: suspended/inactive businesses are read-only. */
const WRITABLE_BUSINESS = new Set(['ACTIVE', 'PENDING_APPROVAL']);

/** Loads (once per request) the caller's role and ACTIVE business memberships. */
export async function accessOf(req: Request): Promise<Access> {
  const r = req as AuthenticatedRequest & { _access?: Access };
  if (r._access) return r._access;
  if (!r.user) throw new AppError('Authentication required', 401);
  const rows = await prisma.businessMembership.findMany({
    where: { userId: r.user.id, status: 'ACTIVE' },
    select: {
      businessId: true,
      role: true,
      business: { select: { status: true } },
      customRole: { select: { permissions: true } },
    },
  });
  r._access = {
    userId: r.user.id,
    isAdmin: r.user.platformRole === 'SUPER_ADMIN',
    memberships: rows.map((m) => ({
      businessId: m.businessId,
      role: m.role as MembershipRole,
      businessStatus: m.business.status,
      permissions: m.role === 'OWNER' ? null : ((m.customRole?.permissions as Permissions | undefined) ?? null),
    })),
  };
  return r._access;
}

/** Business IDs where the caller has one of `roles` (writes also need a writable business). */
export function businessIds(access: Access, roles: MembershipRole[], forWrite = false): string[] {
  return access.memberships
    .filter((m) => roles.includes(m.role) && (!forWrite || WRITABLE_BUSINESS.has(m.businessStatus)))
    .map((m) => m.businessId);
}

export function roleIn(access: Access, businessId: string): MembershipRole | null {
  return access.memberships.find((m) => m.businessId === businessId)?.role ?? null;
}

export type Op = 'read' | 'create' | 'write' | 'remove';

function rolesFor(policy: BusinessPolicy, op: Op): MembershipRole[] {
  if (op === 'read') return policy.read ?? ALL_ROLES;
  if (op === 'write' || op === 'create') return policy.readOnly ? [] : policy.write ?? STAFF;
  return policy.readOnly ? [] : policy.remove ?? MANAGERS;
}

const ACTION_OF: Record<Op, Action> = { read: 'view', create: 'create', write: 'edit', remove: 'delete' };

/** Module permissions of a membership, if it uses them (custom role, ACCOUNTANT, SALES_REP). */
function modulePermissions(m: Membership): Permissions | null {
  if (m.role === 'OWNER') return null;
  return m.permissions ?? ROLE_PERMISSIONS[m.role] ?? null;
}

/**
 * Whether one membership may do `op` (or a special `action`, e.g. export/approve) on a model with
 * this policy. Writes also need the business to be writable.
 */
export function memberCan(m: Membership, policy: BusinessPolicy, op: Op, action?: Action): boolean {
  if (op !== 'read' && !WRITABLE_BUSINESS.has(m.businessStatus)) return false;
  if (op !== 'read' && policy.readOnly && !action) return false;
  const perms = modulePermissions(m);
  const wanted = action ?? ACTION_OF[op];
  if (perms) {
    if (!policy.module) return false;
    return (perms[policy.module] ?? []).includes(wanted);
  }
  if (action === 'export' || action === 'approve') return MANAGERS.includes(m.role) && rolesFor(policy, 'read').includes(m.role);
  return rolesFor(policy, op).includes(m.role);
}

/** Business IDs where the caller may do `op` on `delegate`. */
export function allowedBusinessIds(access: Access, delegate: string, op: Op, action?: Action): string[] {
  const policy = businessPolicy(delegate);
  return access.memberships.filter((m) => memberCan(m, policy, op, action)).map((m) => m.businessId);
}

/**
 * For workflow endpoints: throws unless the caller may do `op`/`action` on `delegate` rows of
 * this business. 404 when the caller is not a member at all (don't reveal the business exists).
 */
export function assertCan(access: Access, businessId: string, delegate: string, op: Op, action?: Action): void {
  if (access.isAdmin) return;
  const m = access.memberships.find((x) => x.businessId === businessId);
  if (!m) throw new AppError('Not found', 404);
  if (!memberCan(m, businessPolicy(delegate), op, action)) throw new AppError('Your role does not allow this action', 403);
}

// ------------------------------------------------------------------ where builders

function pathWhere(path: string[], ids: string[]): Record<string, unknown> {
  let where: Record<string, unknown> = { businessId: { in: ids } };
  for (let i = path.length - 1; i >= 0; i--) where = { [path[i]]: where };
  return where;
}

/** Rows of `delegate` that belong to any of `ids` (a business-scoped model). */
export function scopeWhere(delegate: string, ids: string[]): Record<string, unknown> {
  const policy = businessPolicy(delegate);
  const ors = policy.paths.map((p) => pathWhere(p, ids));
  return ors.length === 1 ? ors[0] : { OR: ors };
}

/**
 * Prisma `where` limiting `delegate` to rows the caller may `op`. Returns null for "everything"
 * (SUPER_ADMIN). Throws 403 when the caller may not use this model at all.
 */
export function accessWhere(delegate: string, access: Access, op: Op): Record<string, unknown> | null {
  if (access.isAdmin) return null;
  const policy = policyOf(delegate);
  switch (policy.kind) {
    case 'admin':
    case 'custom':
      throw new AppError('Insufficient permissions', 403);
    case 'self':
      // Users may read, update (e.g. mark read) and delete their own rows; creating is checked separately.
      return { [policy.userField]: access.userId };
    case 'business': {
      const own = scopeWhere(delegate, allowedBusinessIds(access, delegate, op));
      if (op === 'read' && policy.publicRead) return { OR: [own, policy.publicRead] };
      return own;
    }
  }
}

// ------------------------------------------------------------------ write checks

/**
 * Keeps only real columns of the model, drops system/author/workflow fields and (for non-admins)
 * admin-only fields and values. Relation objects are dropped, so nested writes can't slip past
 * the checks.
 */
export function cleanData(delegate: string, body: unknown, access: Access, op: 'create' | 'update'): Record<string, unknown> {
  const meta = modelMeta(delegate);
  const policy = policyOf(delegate);
  const input = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  const biz = policy.kind === 'business' ? policy : null;
  const blocked = new Set([
    ...SYSTEM_FIELDS,
    ...AUTHOR_FIELDS,
    ...(biz?.systemFields ?? []),
    ...(op === 'update' ? biz?.createOnlyFields ?? [] : []),
  ]);
  const data: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (!meta.scalars.has(key) || blocked.has(key)) continue;
    const field = meta.fields.get(key)!;
    if (field.isUpdatedAt) continue;
    data[key] = value;
  }
  if (biz?.workflowValues) {
    for (const [f, values] of Object.entries(biz.workflowValues)) {
      if (f in data && values.includes(String(data[f]))) {
        throw new AppError(`${f} ${String(data[f])} is set by its own action, not by editing the record`, 400);
      }
    }
  }
  if (!access.isAdmin) {
    const adminFields = 'adminFields' in policy ? policy.adminFields ?? [] : [];
    for (const f of adminFields) delete data[f];
    if (biz?.adminValues) {
      for (const [f, values] of Object.entries(biz.adminValues)) {
        if (f in data && values.includes(String(data[f]))) {
          throw new AppError(`Only the ABUUR team can set ${f} to ${String(data[f])}`, 403);
        }
      }
    }
  }
  if (op === 'create') {
    for (const f of AUTHOR_FIELDS) if (meta.scalars.has(f)) data[f] = access.userId;
    if (policy.kind === 'self' && !access.isAdmin) data[policy.userField] = access.userId;
  }
  return data;
}

/** Business IDs where a membership may reference rows of `target` (read access, writable business). */
function referenceIds(access: Access, target: string): string[] {
  const policy = policyOf(target);
  return access.memberships
    .filter((m) => {
      if (!WRITABLE_BUSINESS.has(m.businessStatus)) return false;
      const perms = modulePermissions(m);
      if (perms && policy.kind === 'business') return memberCan(m, policy, 'read');
      return STAFF.includes(m.role) || !!perms;
    })
    .map((m) => m.businessId);
}

/**
 * Every foreign key in `data` must point at a row the caller may write to (or a marketplace row
 * that may be referenced). User references must be members of one of the caller's businesses.
 * `op` = 'create' for new rows (owner needs create permission), 'write' for updates.
 */
export async function checkReferences(delegate: string, data: Record<string, unknown>, access: Access, op: 'create' | 'write' = 'write'): Promise<void> {
  if (access.isAdmin) return;
  const meta = modelMeta(delegate);
  const policy = policyOf(delegate);
  const owners = new Set(ownerKeys(delegate));
  const ownerIds = policy.kind === 'business' ? allowedBusinessIds(access, delegate, op) : [];
  for (const [fk, target] of meta.foreignKeys) {
    const value = data[fk];
    if (value === undefined || value === null) continue;
    if (typeof value !== 'string') throw new AppError(`${fk} must be an id`, 400);

    if (target === 'user') {
      if (value === access.userId) continue;
      const shared = await prisma.businessMembership.count({
        where: { userId: value, status: 'ACTIVE', businessId: { in: access.memberships.map((m) => m.businessId) } },
      });
      if (!shared) throw new AppError(`${fk} must be a member of your business`, 400);
      continue;
    }

    const isOwner = owners.has(fk) && policy.kind === 'business';
    const ids = isOwner ? ownerIds : referenceIds(access, target);

    if (target === 'business') {
      if (!ids.includes(value)) throw new AppError('You cannot add data to this business', 403);
      continue;
    }

    const targetPolicy = policyOf(target);
    let where: Record<string, unknown> | null = null;
    if (targetPolicy.kind === 'business') {
      where = scopeWhere(target, ids);
    } else if (targetPolicy.kind === 'self') {
      where = { [targetPolicy.userField]: access.userId };
    }
    // Marketplace rows of other businesses may be referenced, but never as the owner of the new row.
    const referencable = isOwner ? undefined : REFERENCABLE[target];
    const ors = [where, referencable].filter(Boolean) as Record<string, unknown>[];
    if (!ors.length) throw new AppError(`${fk} cannot be set`, 403);
    const found = await delegateOf(target).count({
      where: { id: value, ...(ors.length === 1 ? ors[0] : { OR: ors }) },
    });
    if (!found) {
      // Visible to the caller but not writable with their role → 403; otherwise don't reveal it exists.
      if (targetPolicy.kind === 'business') {
        const visible = await delegateOf(target).count({ where: { id: value, ...scopeWhere(target, access.memberships.map((m) => m.businessId)) } });
        if (visible) throw new AppError('Your role does not allow this change', 403);
      }
      throw new AppError(`${fk} was not found in your business`, 404);
    }
  }
}

/** Fields never returned for this model. */
export function hiddenFields(delegate: string): Record<string, true> | undefined {
  const policy = policyOf(delegate);
  if (policy.kind !== 'business' || !policy.hiddenFields?.length) return undefined;
  return Object.fromEntries(policy.hiddenFields.map((f) => [f, true])) as Record<string, true>;
}

/** Prevents creating rows in a self-scoped model unless SUPER_ADMIN. */
export function assertCanCreate(delegate: string, access: Access): void {
  const policy = policyOf(delegate);
  if (access.isAdmin) return;
  if (policy.kind === 'self' && !policy.userCreates) throw new AppError('Insufficient permissions', 403);
  if (policy.kind === 'admin' || policy.kind === 'custom') throw new AppError('Insufficient permissions', 403);
  if (policy.kind === 'business') {
    if (policy.readOnly) throw new AppError('These records are created by the system', 403);
    // A business-scoped row needs at least one owner path set to a business the caller can write.
    const meta = modelMeta(delegate);
    const hasOwner = policy.paths.some((path) => {
      if (path.length === 0) return meta.scalars.has('businessId');
      return meta.relations.has(path[0]);
    });
    if (!hasOwner) throw new AppError('Insufficient permissions', 403);
  }
}

/** A new business-scoped row must name at least one owner (e.g. businessId or storeId). */
export function assertHasOwner(delegate: string, data: Record<string, unknown>): void {
  const keys = ownerKeys(delegate);
  if (keys.length && !keys.some((k) => typeof data[k] === 'string' && data[k])) {
    throw new AppError(`${keys.join(' or ')} is required`, 400);
  }
}

/** On create, the row must be attached to something the caller owns (checked via its owner path FKs). */
export function ownerKeys(delegate: string): string[] {
  const policy = policyOf(delegate);
  if (policy.kind !== 'business') return [];
  const meta = modelMeta(delegate);
  return policy.paths.map((path) => (path.length === 0 ? 'businessId' : meta.relations.get(path[0])?.fk)).filter(Boolean) as string[];
}

/** businessId of a row of a business-scoped model (following its first owner path). */
export async function businessIdOf(delegate: string, id: string): Promise<string | null> {
  const policy = businessPolicy(delegate);
  const path = policy.paths[0];
  let select: Record<string, unknown> = { businessId: true };
  for (let i = path.length - 1; i >= 0; i--) select = { [path[i]]: { select: select } };
  const row = await delegateOf(delegate).findUnique({ where: { id }, select });
  if (!row) return null;
  let cur: any = row;
  for (const p of path) cur = cur?.[p];
  return cur?.businessId ?? null;
}
