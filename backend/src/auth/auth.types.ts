import type { Request } from 'express';
import type {
  BusinessMembership,
  PlatformRole,
  UserStatus,
} from '@prisma/client';

/** Claims carried in tokens issued by this API. */
export interface AppJwtPayload {
  sub: string; // User.id
  typ: 'access';
}

/** The authenticated caller, loaded from the database on every request. */
export interface AuthUser {
  id: string;
  email: string | null;
  status: UserStatus;
  platformRole: PlatformRole;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
  /** Set by BusinessAccessGuard on business-scoped routes. Null for platform admins without a membership. */
  membership?: BusinessMembership | null;
  businessId?: string;
}
