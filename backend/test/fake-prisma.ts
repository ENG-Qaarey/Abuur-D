import { randomUUID } from 'node:crypto';

/**
 * Minimal in-memory stand-in for PrismaService, covering only the queries used
 * by the auth / users / businesses / memberships modules. Supports equality,
 * `{ in }`, `{ not }` filters and the userId_businessId compound key.
 */
type Row = Record<string, any>;

function matches(row: Row, where: Row = {}): boolean {
  return Object.entries(where).every(([key, cond]) => {
    if (key === 'userId_businessId') return matches(row, cond);
    if (cond && typeof cond === 'object' && !(cond instanceof Date)) {
      if ('in' in cond) return cond.in.includes(row[key]);
      if ('not' in cond) return row[key] !== cond.not;
    }
    return row[key] === cond;
  });
}

class Model {
  rows: Row[] = [];

  constructor(
    private readonly defaults: () => Row,
    private readonly relations: Record<string, () => { model: Model; fk: string }> = {},
  ) {}

  /** Like Prisma: with `select`, return only the selected fields (and relations). */
  private shape(row: Row | undefined, select?: Row, include?: Row) {
    if (!row) return null;
    const out: Row = select
      ? Object.fromEntries(Object.keys(select).filter((k) => select[k] && !(k in this.relations)).map((k) => [k, row[k]]))
      : { ...row };
    const wanted = select ?? include;
    for (const [name, rel] of Object.entries(this.relations)) {
      if (wanted?.[name]) {
        const { model, fk } = rel();
        const related = model.rows.find((r) => r.id === row[fk]) ?? null;
        const nested = typeof wanted[name] === 'object' ? wanted[name].select : undefined;
        out[name] = related && nested ? Object.fromEntries(Object.keys(nested).map((k) => [k, related[k]])) : related;
      }
    }
    return out;
  }

  findUnique = async ({ where, select, include }: Row) =>
    this.shape(this.rows.find((r) => matches(r, where)), select, include);
  findUniqueOrThrow = async (args: Row) => {
    const row = await this.findUnique(args);
    if (!row) throw Object.assign(new Error('not found'), { code: 'P2025' });
    return row;
  };
  findFirst = this.findUnique;
  findMany = async ({ where, select }: Row = {}) =>
    this.rows.filter((r) => matches(r, where)).map((r) => this.shape(r, select));
  count = async ({ where }: Row = {}) => this.rows.filter((r) => matches(r, where)).length;
  create = async ({ data, select }: Row) => {
    const row = { id: randomUUID(), ...this.defaults(), ...data, createdAt: new Date(), updatedAt: new Date() };
    this.rows.push(row);
    return this.shape(row, select);
  };
  updateMany = async ({ where, data }: Row) => {
    const rows = this.rows.filter((r) => matches(r, where));
    for (const row of rows) Object.assign(row, data, { updatedAt: new Date() });
    return { count: rows.length };
  };
  update = async ({ where, data, select }: Row) => {
    const row = this.rows.find((r) => matches(r, where));
    if (!row) throw Object.assign(new Error('not found'), { code: 'P2025' });
    Object.assign(row, data, { updatedAt: new Date() });
    return this.shape(row, select);
  };
}

export class FakePrisma {
  user: Model;
  business: Model;
  businessMembership: Model;
  auditLog = new Model(() => ({}));
  contactMessage = new Model(() => ({ status: 'NEW', topic: 'SALES', locale: 'so' }));

  constructor() {
    this.user = new Model(() => ({ status: 'ACTIVE', platformRole: 'USER' }));
    this.business = new Model(() => ({ status: 'PENDING_APPROVAL' }));
    this.businessMembership = new Model(() => ({ role: 'EMPLOYEE', status: 'INVITED' }), {
      business: () => ({ model: this.business, fk: 'businessId' }),
      user: () => ({ model: this.user, fk: 'userId' }),
    });
  }

  $transaction = async (fn: (tx: this) => unknown) => fn(this);
  $connect = async () => undefined;
  $disconnect = async () => undefined;
  onModuleInit = async () => undefined;
  onModuleDestroy = async () => undefined;

  addUser(data: Row = {}) {
    const row = {
      id: randomUUID(),
      supabaseId: randomUUID(),
      email: `${randomUUID().slice(0, 8)}@example.com`,
      status: 'ACTIVE',
      platformRole: 'USER',
      ...data,
    };
    this.user.rows.push(row);
    return row;
  }
}
