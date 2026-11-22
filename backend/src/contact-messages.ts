import { Router } from 'express';
import { createHash } from 'crypto';
import { prisma } from './prisma';
import { config } from './config';
import { authenticate, requireRole, AuthenticatedRequest } from './middleware/auth';
import { AppError, asyncHandler } from './middleware/error';
import { rateLimit } from './middleware/rate-limit';
import { createCrudRouter } from './lib/crud';
import { audit } from './lib/audit';

/**
 * Contact form. Anyone can send a message (rate-limited, with a honeypot); reading and
 * handling messages is SUPER_ADMIN only (policy: admin).
 */
const router = Router();
const crud = createCrudRouter({ model: 'contactMessage', searchableFields: ['name', 'email', 'phone', 'businessName', 'message'] });

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TOPICS = ['SALES', 'SUPPORT', 'PARTNERSHIP', 'OTHER'];
const STATUSES = ['NEW', 'HANDLED', 'ARCHIVED'];
const LOCALES = ['so', 'en'];

function text(value: unknown, field: string, max: number, required = false): string | null {
  const v = typeof value === 'string' ? value.trim() : '';
  if (!v) {
    if (required) throw new AppError(`${field} is required`, 400);
    return null;
  }
  if (v.length > max) throw new AppError(`${field} must be at most ${max} characters`, 400);
  return v;
}

/** POST /contact-messages: public contact form (5 messages per 10 minutes per visitor). */
router.post('/', rateLimit({ windowMs: 10 * 60_000, max: 5, message: 'You have sent several messages already. Please wait a few minutes.' }),
  asyncHandler(async (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const ack = () => res.status(201).json({ success: true, statusCode: 201, timestamp: new Date().toISOString(), message: 'Message received' });
    if (typeof body.website === 'string' && body.website.trim()) return ack(); // honeypot: bots fill it, people don't

    const name = text(body.name, 'name', 120, true)!;
    const email = text(body.email, 'email', 254);
    const phone = text(body.phone, 'phone', 40);
    if (!email && !phone) throw new AppError('Add an email address or a phone number so we can reply', 400);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new AppError('email is not valid', 400);
    const message = text(body.message, 'message', 5000, true)!;
    const topic = TOPICS.includes(String(body.topic)) ? String(body.topic) : 'OTHER';
    const locale = LOCALES.includes(String(body.locale)) ? String(body.locale) : 'so';

    await prisma.contactMessage.create({
      data: {
        name,
        email: email?.toLowerCase() ?? null,
        phone,
        businessName: text(body.businessName, 'businessName', 160),
        topic: topic as any,
        message,
        locale,
        ipHash: createHash('sha256').update(`${req.ip}|${config.jwtSecret}`).digest('hex'),
        userAgent: req.get('user-agent')?.slice(0, 500) ?? null,
      },
    });
    return ack();
  }));

// ---- SUPER_ADMIN inbox
router.get('/', authenticate, asyncHandler(crud.list));
router.get('/count', authenticate, asyncHandler(crud.count));
router.get('/:id', authenticate, asyncHandler(crud.getOne));

/** PATCH /contact-messages/:id { status }: mark handled / archived (audited). */
router.patch('/:id', authenticate, requireRole('SUPER_ADMIN'), asyncHandler(async (req, res) => {
  const id = String(req.params.id);
  if (!UUID.test(id)) throw new AppError('Message not found', 404);
  const status = String((req.body ?? {}).status ?? '');
  if (!STATUSES.includes(status)) throw new AppError(`status must be one of ${STATUSES.join(', ')}`, 400);
  const existing = await prisma.contactMessage.findUnique({ where: { id }, select: { status: true } });
  if (!existing) throw new AppError('Message not found', 404);
  const handled = status !== 'NEW';
  const updated = await prisma.contactMessage.update({
    where: { id },
    data: {
      status: status as any,
      handledAt: handled ? new Date() : null,
      handledById: handled ? (req as AuthenticatedRequest).user!.id : null,
    },
  });
  await audit(req, { action: 'contact_message.status', entityType: 'ContactMessage', entityId: id, metadata: { from: existing.status, to: status } });
  return res.json({ success: true, statusCode: 200, timestamp: new Date().toISOString(), data: updated });
}));

router.delete('/:id', authenticate, asyncHandler(crud.remove));

export default router;
