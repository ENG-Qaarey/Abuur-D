import { Request } from 'express';
import { prisma } from '../prisma';
import type { AuthenticatedRequest } from '../middleware/auth';

/** Records a critical action (status changes, role changes). Never blocks the request on failure. */
export async function audit(
  req: Request,
  entry: { action: string; entityType: string; entityId?: string; businessId?: string | null; metadata?: Record<string, unknown> },
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        businessId: entry.businessId ?? null,
        userId: (req as AuthenticatedRequest).user?.id ?? null,
        ipAddress: req.ip ?? null,
        userAgent: req.get('user-agent')?.slice(0, 500) ?? null,
        metadata: (entry.metadata ?? undefined) as any,
      },
    });
  } catch (error) {
    console.error('[audit] could not write audit log', error);
  }
}
