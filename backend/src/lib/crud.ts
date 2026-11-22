import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../prisma';
import { AppError } from '../middleware/error';
import {
  accessOf,
  accessWhere,
  assertCanCreate,
  assertHasOwner,
  checkReferences,
  cleanData,
  hiddenFields,
  modelMeta,
  policyOf,
} from '../access/scope';
import { audit } from './audit';

export type PrismaModel = keyof typeof prisma;

export interface CrudOptions {
  model: PrismaModel;
  orderBy?: Record<string, Prisma.SortOrder>;
  searchableFields?: string[];
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const RESERVED_QUERY =new Set(['page', 'limit', 'take', 'skip', 'sortBy', 'sortOrder', 'cursor', 'q']);

const ok = (res: Response, data: unknown, status = 200, extra: Record<string, unknown> = {}) =>
  res.status(status).json({ success: true, statusCode: status, timestamp: new Date().toISOString(), data, ...extra });

const and = (...parts: (Record<string, unknown> | null | undefined)[]) => {
  const list = parts.filter((p) => p && Object.keys(p).length) as Record<string, unknown>[];
  return list.length === 0 ? {} : list.length === 1 ? list[0] : { AND: list };
};

/**
 * Generic CRUD for one Prisma model, with access control from src/access/policy.ts applied to
 * every operation: callers only see and change rows of businesses they are active members of
 * (by role), SUPER_ADMIN sees everything, and unknown models are SUPER_ADMIN only.
 * Routes must run `authenticate` first.
 */
export function createCrudRouter(options: CrudOptions) {
  const delegate = String(options.model);
  const { orderBy = { createdAt: 'desc' }, searchableFields = [] } = options;
  const routerModel = (prisma as any)[delegate];
  if (!routerModel) throw new Error(`Prisma model "${delegate}" not found`);
  const meta = modelMeta(delegate);
  const omit = hiddenFields(delegate);
  const defaultOrder = Object.keys(orderBy).every((k) => meta.scalars.has(k)) ? orderBy : { id: 'asc' as const };
  const policy = policyOf(delegate);
  const audited = policy.kind === 'business' && !!policy.audited;
  const businessOf = (row: any): string | null => (typeof row?.businessId === 'string' ? row.businessId : null);

  const parsePagination = (query: Record<string, any>) => {
    const page = Math.max(parseInt(String(query.page ?? '1'), 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(String(query.limit ?? query.take ?? '20'), 10) || 20, 1), 100);
    return { page, limit, skip: (page - 1) * limit };
  };

  /** Filters only on real columns, with the right comparison per column type. */
  const buildFilter = (query: Record<string, any>) => {
    const where: Record<string, unknown> = {};
    for (const [key, raw] of Object.entries(query)) {
      if (RESERVED_QUERY.has(key) || raw === undefined || raw === '' || Array.isArray(raw)) continue;
      const field = meta.fields.get(key);
      if (!field || (field.kind !== 'scalar' && field.kind !== 'enum') || omit?.[key]) continue;
      const value = String(raw);
      if (field.kind === 'enum') where[key] = value;
      else if (field.type === 'Boolean') where[key] = value === 'true';
      else if (field.type === 'Int') where[key] = Number.isInteger(Number(value)) ? Number(value) : undefined;
      else if (field.type === 'String' && !(field.isId || key.endsWith('Id'))) where[key] = { contains: value, mode: 'insensitive' };
      else if (field.type === 'String') where[key] = value;
    }
    const q = typeof query.q === 'string' ? query.q.trim() : '';
    const searchable = searchableFields.filter((f) => meta.fields.get(f)?.type === 'String');
    if (q && searchable.length) {
      where.OR = searchable.map((f) => ({ [f]: { contains: q, mode: 'insensitive' } }));
    }
    return where;
  };

  const buildOrderBy = (query: Record<string, any>) => {
    const sortBy = String(query.sortBy ?? '');
    if (sortBy && meta.scalars.has(sortBy) && !omit?.[sortBy]) {
      return { [sortBy]: String(query.sortOrder) === 'asc' ? 'asc' : 'desc' } as Record<string, Prisma.SortOrder>;
    }
    return defaultOrder;
  };

  /** The row, if the caller may perform `op` on it; otherwise 404 (no hint that it exists). */
  const findAllowed = async (req: Request, op: 'read' | 'write' | 'remove') => {
    if (!UUID.test(String(req.params.id))) throw new AppError(`${meta.name} not found`, 404);
    const access = await accessOf(req);
    const record = await routerModel.findFirst({
      where: and({ id: String(req.params.id) }, accessWhere(delegate, access, op)),
      ...(omit ? { omit } : {}),
    });
    if (!record) {
      // Visible but not changeable → 403; not visible at all → 404.
      if (op !== 'read') {
        const visible = await routerModel.count({ where: and({ id: String(req.params.id) }, accessWhere(delegate, access, 'read')) });
        if (visible) throw new AppError('Your role does not allow this change', 403);
      }
      throw new AppError(`${meta.name} not found`, 404);
    }
    return { record, access };
  };

  return {
    async list(req: Request, res: Response) {
      const access = await accessOf(req);
      const { page, limit, skip } = parsePagination(req.query as Record<string, any>);
      const where = and(buildFilter(req.query as Record<string, any>), accessWhere(delegate, access, 'read'));
      const [data, total] = await Promise.all([
        routerModel.findMany({ where, skip, take: limit, orderBy: buildOrderBy(req.query as Record<string, any>), ...(omit ? { omit } : {}) }),
        routerModel.count({ where }),
      ]);
      return ok(res, data, 200, { meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    },

    async getOne(req: Request, res: Response, _next?: NextFunction) {
      const { record } = await findAllowed(req, 'read');
      return ok(res, record);
    },

    async create(req: Request, res: Response) {
      const access = await accessOf(req);
      assertCanCreate(delegate, access);
      const data = cleanData(delegate, req.body, access, 'create');
      if (!access.isAdmin) assertHasOwner(delegate, data);
      await checkReferences(delegate, data, access, 'create');
      const record = await routerModel.create({ data, ...(omit ? { omit } : {}) });
      return ok(res, record, 201);
    },

    async update(req: Request, res: Response, _next?: NextFunction) {
      const { access, record: before } = await findAllowed(req, 'write');
      const data = cleanData(delegate, req.body, access, 'update');
      await checkReferences(delegate, data, access);
      const record = await routerModel.update({ where: { id: String(req.params.id) }, data, ...(omit ? { omit } : {}) });
      if (audited) {
        const changes = Object.fromEntries(
          Object.keys(data)
            .filter((k) => String((before as any)[k]) !== String((record as any)[k]))
            .map((k) => [k, { from: (before as any)[k], to: (record as any)[k] }]),
        );
        await audit(req, { action: `${delegate}.update`, entityType: meta.name, entityId: record.id, businessId: businessOf(record), metadata: { changes } });
      }
      return ok(res, record);
    },

    async remove(req: Request, res: Response, _next?: NextFunction) {
      const { record } = await findAllowed(req, 'remove');
      await routerModel.delete({ where: { id: String(req.params.id) } });
      if (audited) await audit(req, { action: `${delegate}.delete`, entityType: meta.name, entityId: String(req.params.id), businessId: businessOf(record), metadata: { record } });
      return res.json({ success: true, statusCode: 200, timestamp: new Date().toISOString(), message: `${meta.name} deleted` });
    },

    async count(req: Request, res: Response) {
      const access = await accessOf(req);
      const where = and(buildFilter(req.query as Record<string, any>), accessWhere(delegate, access, 'read'));
      return ok(res, { count: await routerModel.count({ where }) });
    },

    model: options.model,
    routerModel,
  };
}

/** Full REST router (GET / , /count, /:id, POST, PUT/PATCH /:id, DELETE /:id) for one model. */
export function crudRouter(options: CrudOptions): import('express').Router {
  // Lazy import to keep this file free of Express app wiring.
  const { Router } = require('express') as typeof import('express');
  const { authenticate } = require('../middleware/auth') as typeof import('../middleware/auth');
  const { asyncHandler } = require('../middleware/error') as typeof import('../middleware/error');
  const crud = createCrudRouter(options);
  const router = Router();
  router.use(authenticate);
  router.get('/', asyncHandler(crud.list));
  router.get('/count', asyncHandler(crud.count));
  router.get('/:id', asyncHandler(crud.getOne));
  router.post('/', asyncHandler(crud.create));
  router.put('/:id', asyncHandler(crud.update));
  router.patch('/:id', asyncHandler(crud.update));
  router.delete('/:id', asyncHandler(crud.remove));
  return router;
}
