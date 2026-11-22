import { Router } from 'express';
import { authenticate } from '../middleware/auth';

/**
 * A Router whose routes all require sign-in, except paths under `publicPrefixes`.
 * (A plain `router.use(authenticate)` would also block unrelated public routes when the router
 * is mounted at the API root.)
 */
export function authedRouter(opts: { publicPrefixes?: string[] } = {}): Router {
  const r = Router();
  const pub = opts.publicPrefixes ?? [];
  for (const m of ['get', 'post', 'put', 'patch', 'delete'] as const) {
    const orig = (r as any)[m].bind(r);
    (r as any)[m] = (path: string, ...handlers: unknown[]) =>
      typeof path === 'string' && pub.some((p) => path.startsWith(p)) ? orig(path, ...handlers) : orig(path, authenticate, ...handlers);
  }
  return r;
}
