import { Request, Response, NextFunction } from 'express';

/**
 * Small in-memory fixed-window rate limiter (per IP, per limiter). Enough for one backend
 * instance; use a shared store (e.g. Redis) if the API ever runs on several instances.
 */
export function rateLimit(options: { windowMs: number; max: number; message?: string }) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) if (entry.resetAt <= now) hits.delete(key);
  }, options.windowMs).unref();

  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip ?? 'unknown';
    const now = Date.now();
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
