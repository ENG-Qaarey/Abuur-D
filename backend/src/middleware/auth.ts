import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { prisma } from '../prisma';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string | null;
    phone: string | null;
    firstName: string | null;
    lastName: string | null;
    platformRole: string;
    status: string;
    emailVerified: boolean;
    phoneVerified: boolean;
    supabaseId: string | null;
  };
}

/** Statuses that may use the API (PENDING_VERIFICATION: legacy sign-ups not yet verified). */
const ALLOWED_STATUSES = new Set(['ACTIVE', 'PENDING_VERIFICATION']);

function deny(res: Response, statusCode: number, message: string) {
  res.status(statusCode).json({ success: false, statusCode, timestamp: new Date().toISOString(), message });
}

/**
 * Verifies the ABUUR token, then loads the user from the database on every request, so a
 * suspended account or a changed role takes effect at once (not when the token expires).
 */
async function resolveUser(token: string): Promise<AuthenticatedRequest['user'] | null> {
  let sub: string | undefined;
  try {
    sub = (jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] }) as { sub?: string }).sub;
  } catch {
    return null;
  }
  if (!sub) return null;
  const user = await prisma.user.findUnique({
    where: { id: sub },
    select: {
      id: true, email: true, phone: true, firstName: true, lastName: true, platformRole: true,
      status: true, emailVerified: true, phoneVerified: true, supabaseId: true,
    },
  });
  return user && ALLOWED_STATUSES.has(user.status) ? user : null;
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return deny(res, 401, 'Missing or invalid Authorization header');
  resolveUser(authHeader.slice(7))
    .then((user) => {
      if (!user) return deny(res, 401, 'Invalid or expired token');
      req.user = user;
      next();
    })
    .catch(next);
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) return deny(res, 401, 'Authentication required');
    if (!roles.includes(req.user.platformRole)) return deny(res, 403, 'Insufficient role');
    next();
  };
};

export const optionalAuth = (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return next();
  resolveUser(authHeader.slice(7))
    .then((user) => {
      if (user) req.user = user;
      next();
    })
    .catch(next);
};
