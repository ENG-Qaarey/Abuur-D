import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'node:crypto';
import { ContactStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateContactMessageDto } from './dto/contact-message.dto.js';

const PUBLIC_FIELDS = {
  id: true,
  name: true,
  email: true,
  phone: true,
  businessName: true,
  topic: true,
  message: true,
  locale: true,
  status: true,
  handledAt: true,
  createdAt: true,
} as const;

@Injectable()
export class ContactMessageService {
  private readonly logger = new Logger(ContactMessageService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /** Public website form. Returns the same answer for spam so bots learn nothing. */
  async submit(dto: CreateContactMessageDto, meta: { ip?: string; userAgent?: string }) {
    if (dto.website) {
      this.logger.warn('Contact form honeypot filled; message dropped');
      return { received: true };
    }
    if (!dto.email && !dto.phone) {
      throw new BadRequestException('Give an email or a phone number so we can reply');
    }

    await this.prisma.contactMessage.create({
      data: {
        name: dto.name.trim(),
        email: dto.email?.trim().toLowerCase() || null,
        phone: dto.phone?.trim() || null,
        businessName: dto.businessName?.trim() || null,
        topic: dto.topic,
        message: dto.message.trim(),
        locale: dto.locale ?? 'so',
        ipHash: meta.ip ? this.hashIp(meta.ip) : null,
        userAgent: meta.userAgent?.slice(0, 300) ?? null,
      },
    });
    return { received: true };
  }

  list(status?: ContactStatus) {
    return this.prisma.contactMessage.findMany({
      where: status ? { status } : undefined,
      select: PUBLIC_FIELDS,
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  async setStatus(id: string, status: ContactStatus, userId: string) {
    const exists = await this.prisma.contactMessage.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new NotFoundException('Message not found');
    return this.prisma.contactMessage.update({
      where: { id },
      data: {
        status,
        handledAt: status === ContactStatus.NEW ? null : new Date(),
        handledById: status === ContactStatus.NEW ? null : userId,
      },
      select: PUBLIC_FIELDS,
    });
  }

  private hashIp(ip: string) {
    const salt = this.config.get<string>('app.jwtSecret') ?? '';
    return createHash('sha256').update(`${salt}:${ip}`).digest('hex');
  }
}
