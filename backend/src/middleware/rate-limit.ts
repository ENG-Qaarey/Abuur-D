import { Request, Response, NextFunction } from 'express';

/**
 * Small in-memory fixed-window rate limiter (per IP, per limiter). Enough for one backend
 * instance; use a shared store (e.g. Redis) if the API ever runs on several instances.
 */
export function rateLimit(options: { windowMs: number; max: number; message?: string }) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  // Expired entries are swept during requests (no background timer: Cloudflare Workers
  // don't allow timers at startup).
  let nextSweep = 0;

  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip ?? 'unknown';
    const now = Date.now();
    if (now >= nextSweep) {
      for (const [k, e] of hits) if (e.resetAt <= now) hits.delete(k);
      nextSweep = now + options.windowMs;
    }
    const entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + options.windowMs });
      return next();
    }
    entry.count += 1;
    if (entry.count > options.max) {
      res.setHeader('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
      return res.status(429).json({
        success: false,
        statusCode: 429,
        timestamp: new Date().toISOString(),
        message: options.message ?? 'Too many attempts. Please wait a minute and try again.',
      });
    }
    next();
  };
}
