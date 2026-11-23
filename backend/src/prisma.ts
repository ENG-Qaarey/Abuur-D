import { AsyncLocalStorage } from 'node:async_hooks';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

/**
 * Prisma talks to Supabase Postgres through the `pg` driver adapter (no Rust engine),
 * so the same code runs on Node.js and on Cloudflare Workers.
 *
 * On Workers a database connection may not be reused across requests, so the Worker
 * entry (src/worker.ts) gives each request its own client through `prismaStore`.
 * On Node.js there is no per-request client and one shared client is used.
 */

/** pg does not understand Prisma's pooler-only URL options; drop them. */
function connectionString(): string {
  const raw = process.env.DATABASE_URL ?? '';
  try {
    const url = new URL(raw);
    for (const key of ['pgbouncer', 'connection_limit', 'pool_timeout', 'schema']) url.searchParams.delete(key);
    return url.toString();
  } catch {
    return raw;
  }
}

export function createPrisma(): PrismaClient {
  const local = /@(localhost|127\.0\.0\.1)[:/]/.test(process.env.DATABASE_URL ?? '');
  const adapter = new PrismaPg({
    connectionString: connectionString(),
    max: Number(process.env.DB_POOL_MAX ?? 5),
    ssl: local ? undefined : { rejectUnauthorized: false },
  });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

/** Per-request client (Cloudflare Workers). */
export const prismaStore = new AsyncLocalStorage<PrismaClient>();

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function current(): PrismaClient {
  const scoped = prismaStore.getStore();
  if (scoped) return scoped;
  return (globalForPrisma.prisma ??= createPrisma());
}

/** Use exactly like a PrismaClient; resolves to the right client for the current request. */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = current();
    const value = Reflect.get(client, prop, client);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

export default prisma;
