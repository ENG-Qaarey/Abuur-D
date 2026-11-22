import { NotificationType } from '@prisma/client';
import { prisma } from '../prisma';
import type { MembershipRole } from '../access/policy';

type Note = { title: string; message: string; type?: NotificationType; actionUrl?: string; metadata?: Record<string, unknown> };

/** In-app notification to specific users. Never throws (a failed notification must not undo work). */
export async function notifyUsers(userIds: (string | null | undefined)[], note: Note): Promise<void> {
  const ids = [...new Set(userIds.filter((x): x is string => !!x))];
  if (!ids.length) return;
  try {
    await prisma.notification.createMany({
      data: ids.map((userId) => ({
        userId,
        title: note.title.slice(0, 200),
        message: note.message.slice(0, 2000),
        type: note.type ?? 'INFO',
        actionUrl: note.actionUrl,
        metadata: note.metadata as any,
      })),
    });
  } catch (error) {
    console.error('[notify] could not create notifications', error);
  }
}

/** Notify active members of a business with one of `roles` (default: owners, admins, managers). */
export async function notifyBusiness(businessId: string, note: Note, roles: MembershipRole[] = ['OWNER', 'ADMIN', 'MANAGER']): Promise<void> {
  const members = await prisma.businessMembership.findMany({
    where: { businessId, status: 'ACTIVE', role: { in: roles as any } },
    select: { userId: true },
  });
  await notifyUsers(members.map((m) => m.userId), note);
}
