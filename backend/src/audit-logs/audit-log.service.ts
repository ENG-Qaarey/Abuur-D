import { Injectable, Logger } from '@nestjs/common';
import { PrismaService, Prisma } from '../prisma/prisma.service.js';

export interface AuditEntry {
  action: string;
  entityType: string;
  entityId?: string | null;
  businessId?: string | null;
  userId?: string | null;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string | null;
  userAgent?: string | null;
}

type PrismaLike = Pick<PrismaService, 'auditLog'> | Prisma.TransactionClient;

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Records a sensitive action. Pass a transaction client to make the log
   * part of the same transaction as the change it describes.
   */
  async record(entry: AuditEntry, client: PrismaLike = this.prisma) {
    try {
      await client.auditLog.create({ data: entry });
    } catch (error) {
      // Inside a transaction we must fail loudly; outside, never break the request.
      if (client !== this.prisma) throw error;
      this.logger.error(`Failed to write audit log for ${entry.action}`, error as Error);
    }
  }

  async create(data: Prisma.AuditLogCreateInput) {
    return this.prisma.auditLog.create({ data });
  }

  async findAll() {
    return this.prisma.auditLog.findMany();
  }

  async findOne(id: string) {
    return this.prisma.auditLog.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.AuditLogUpdateInput) {
    return this.prisma.auditLog.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.auditLog.delete({ where: { id } });
  }
}
