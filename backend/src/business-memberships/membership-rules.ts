import { MembershipRole } from '@prisma/client';

export const ROLE_RANK: Record<MembershipRole, number> = {
  OWNER: 5,
  ADMIN: 4,
  MANAGER: 3,
  EMPLOYEE: 2,
  VIEWER: 1,
};

/**
 * Who may manage whom.
 * - OWNER (and platform admins, passed as OWNER) may manage anyone and grant any role.
 * - Everyone else may only manage members ranked strictly below them and
 *   only grant roles ranked strictly below them.
 */
export function canManage(
  actorRole: MembershipRole,
  targetCurrentRole: MembershipRole,
  targetNewRole?: MembershipRole,
): boolean {
  if (actorRole === MembershipRole.OWNER) return true;
  const actor = ROLE_RANK[actorRole];
  if (ROLE_RANK[targetCurrentRole] >= actor) return false;
  if (targetNewRole && ROLE_RANK[targetNewRole] >= actor) return false;
  return true;
}

export function canGrant(actorRole: MembershipRole, role: MembershipRole): boolean {
  return actorRole === MembershipRole.OWNER || ROLE_RANK[role] < ROLE_RANK[actorRole];
}
