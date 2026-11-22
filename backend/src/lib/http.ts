import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../middleware/error';
import type { AuthenticatedRequest } from '../middleware/auth';

/** Standard success envelope used by every endpoint. */
export const ok = (res: Response, data: unknown, status = 200, extra: Record<string, unknown> = {}) =>
  res.status(status).json({ success: true, statusCode: status, timestamp: new Date().toISOString(), data, ...extra });

export const userId = (req: Request) => {
  const id = (req as AuthenticatedRequest).user?.id;
  if (!id) throw new AppError('Authentication required', 401);
  return id;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (v: unknown): v is string => typeof v === 'string' && UUID.test(v);

/** Small, explicit input readers: each throws a 400 with a clear message. */
export class Input {
  constructor(private body: Record<string, unknown>, private where = 'body') {}
  static of(req: Request) {
    const b = req.body;
    return new Input(b && typeof b === 'object' && !Array.isArray(b) ? b : {});
  }
  static query(req: Request) {
    return new Input(req.query as Record<string, unknown>, 'query');
  }
  has(key: string) {
    return this.body[key] !== undefined && this.body[key] !== null && this.body[key] !== '';
  }
  raw(key: string) {
    return this.body[key];
  }
  str(key: string, opts: { required?: boolean; max?: number; min?: number } = {}): string | undefined {
    const v = this.body[key];
    if (v === undefined || v === null || v === '') {
      if (opts.required) throw new AppError(`${key} is required`, 400);
      return undefined;
    }
    if (typeof v !== 'string' && typeof v !== 'number') throw new AppError(`${key} must be text`, 400);
    const s = String(v).trim();
    if (opts.required && !s) throw new AppError(`${key} is required`, 400);
    if (opts.max && s.length > opts.max) throw new AppError(`${key} must be at most ${opts.max} characters`, 400);
    if (opts.min && s.length < opts.min) throw new AppError(`${key} must be at least ${opts.min} characters`, 400);
    return s;
  }
  reqStr(key: string, max = 500) {
    return this.str(key, { required: true, max })!;
  }
  id(key: string, required = false): string | undefined {
    const v = this.body[key];
    if (v === undefined || v === null || v === '') {
      if (required) throw new AppError(`${key} is required`, 400);
      return undefined;
    }
    if (!isUuid(v)) throw new AppError(`${key} must be a valid id`, 400);
    return v;
  }
  reqId(key: string) {
    return this.id(key, true)!;
  }
  num(key: string, opts: { required?: boolean; min?: number; max?: number } = {}): number | undefined {
    const v = this.body[key];
    if (v === undefined || v === null || v === '') {
      if (opts.required) throw new AppError(`${key} is required`, 400);
      return undefined;
    }
    const n = Number(v);
    if (!Number.isFinite(n)) throw new AppError(`${key} must be a number`, 400);
    if (opts.min !== undefined && n < opts.min) throw new AppError(`${key} must be at least ${opts.min}`, 400);
    if (opts.max !== undefined && n > opts.max) throw new AppError(`${key} must be at most ${opts.max}`, 400);
    return n;
  }
  int(key: string, opts: { required?: boolean; min?: number; max?: number } = {}) {
    const n = this.num(key, opts);
    if (n !== undefined && !Number.isInteger(n)) throw new AppError(`${key} must be a whole number`, 400);
    return n;
  }
  /** Money: positive (or >= 0) with at most 2 decimals. */
  money(key: string, opts: { required?: boolean; allowZero?: boolean } = {}): Prisma.Decimal | undefined {
    const n = this.num(key, { required: opts.required, min: 0 });
    if (n === undefined) return undefined;
    if (!opts.allowZero && n === 0) throw new AppError(`${key} must be more than 0`, 400);
    if (Math.round(n * 100) / 100 !== n) throw new AppError(`${key} can have at most 2 decimals`, 400);
    return new Prisma.Decimal(n.toFixed(2));
  }
  date(key: string, required = false): Date | undefined {
    const v = this.body[key];
    if (v === undefined || v === null || v === '') {
      if (required) throw new AppError(`${key} is required`, 400);
      return undefined;
    }
    const d = new Date(String(v));
    if (Number.isNaN(d.getTime())) throw new AppError(`${key} must be a date`, 400);
    return d;
  }
  bool(key: string): boolean | undefined {
    const v = this.body[key];
    if (v === undefined || v === null || v === '') return undefined;
    if (typeof v === 'boolean') return v;
    if (v === 'true') return true;
    if (v === 'false') return false;
    throw new AppError(`${key} must be true or false`, 400);
  }
  oneOf<T extends string>(key: string, values: readonly T[], required = false): T | undefined {
    const v = this.str(key, { required });
    if (v === undefined) return undefined;
    if (!values.includes(v as T)) throw new AppError(`${key} must be one of: ${values.join(', ')}`, 400);
    return v as T;
  }
  list(key: string, max = 200): string[] | undefined {
    const v = this.body[key];
    if (v === undefined || v === null) return undefined;
    const arr = Array.isArray(v) ? v : String(v).split(',');
    if (arr.length > max) throw new AppError(`${key} can have at most ${max} items`, 400);
    return arr.map((x) => String(x).trim()).filter(Boolean);
  }
  email(key: string, required = false) {
    const v = this.str(key, { required, max: 254 });
    if (v === undefined) return undefined;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) throw new AppError(`${key} must be a valid email`, 400);
    return v.toLowerCase();
  }
  phone(key: string, required = false) {
    const v = this.str(key, { required, max: 32 });
    return v === undefined ? undefined : normalizePhone(v, key);
  }
}

/**
 * E.164-style phone: digits with a leading +. Somali numbers written locally (61xxxxxxx /
 * 061xxxxxxx) get +252.
 */
export function normalizePhone(v: string, key = 'phone'): string {
  let s = v.replace(/[\s\-().]/g, '');
  if (s.startsWith('00')) s = '+' + s.slice(2);
  if (!s.startsWith('+')) {
    if (s.startsWith('0')) s = s.slice(1);
    s = s.startsWith('252') ? '+' + s : '+252' + s;
  }
  if (!/^\+[1-9]\d{6,14}$/.test(s)) throw new AppError(`${key} must be a valid phone number`, 400);
  return s;
}

/** Pagination from the query string (page/limit, max 100). */
export function pageOf(req: Request) {
  const page = Math.max(parseInt(String(req.query.page ?? '1'), 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(String(req.query.limit ?? '20'), 10) || 20, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
}

export const pageMeta = (page: number, limit: number, total: number) => ({ page, limit, total, totalPages: Math.ceil(total / limit) });

/** Date range from ?range=today|7d|30d|90d|month|last_month|year|custom (&from&to). */
export function rangeOf(req: Request, fallback = '30d'): { from: Date; to: Date; label: string } {
  const range = String(req.query.range ?? fallback);
  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const daysAgo = (n: number) => new Date(startOfDay(now).getTime() - (n - 1) * 86_400_000);
  switch (range) {
    case 'today':
      return { from: startOfDay(now), to: now, label: 'Today' };
    case '7d':
      return { from: daysAgo(7), to: now, label: 'Last 7 days' };
    case '30d':
      return { from: daysAgo(30), to: now, label: 'Last 30 days' };
    case '90d':
      return { from: daysAgo(90), to: now, label: 'Last 90 days' };
    case 'month':
      return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now, label: 'This month' };
    case 'last_month':
      return { from: new Date(now.getFullYear(), now.getMonth() - 1, 1), to: new Date(now.getFullYear(), now.getMonth(), 1), label: 'Last month' };
    case 'year':
      return { from: new Date(now.getFullYear(), 0, 1), to: now, label: 'This year' };
    case 'custom': {
      const q = Input.query(req);
      const from = q.date('from', true)!;
      const to = q.date('to', true)!;
      if (to < from) throw new AppError('to must be after from', 400);
      if (to.getTime() - from.getTime() > 3 * 366 * 86_400_000) throw new AppError('Custom range can be at most 3 years', 400);
      return { from, to: new Date(to.getTime() + 86_399_999), label: `${from.toISOString().slice(0, 10)} – ${to.toISOString().slice(0, 10)}` };
    }
    default:
      throw new AppError('range must be today, 7d, 30d, 90d, month, last_month, year or custom', 400);
  }
}

export const dec = (v: Prisma.Decimal | number | string | null | undefined) => new Prisma.Decimal(v ?? 0);
export const money = (v: Prisma.Decimal | number | null | undefined) => Number(dec(v).toFixed(2));
