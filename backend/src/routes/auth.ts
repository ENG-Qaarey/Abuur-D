import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import jwt, { SignOptions } from 'jsonwebtoken';
import { prisma } from '../prisma';
import { config } from '../config';
import { authenticate } from '../middleware/auth';
import { verifySupabaseToken, SupabaseClaims } from '../auth/supabase';
import { getDummyHash, hashPassword, verifyPassword } from '../auth/password';
import { rateLimit } from '../middleware/rate-limit';
import { AppError, asyncHandler } from '../middleware/error';

const router = Router();

// Slows password guessing and sign-up spam: 20 attempts per minute per visitor IP.
router.use(['/login', '/register', '/supabase'], rateLimit({ windowMs: 60_000, max: 20 }));

function issueToken(
  user: { id: string; email: string | null; platformRole: string },
): string {
  return jwt.sign(
    { sub: user.id, email: user.email, platformRole: user.platformRole },
    config.jwtSecret as string,
    { expiresIn: config.jwtExpiresIn as SignOptions['expiresIn'] },
  );
}

function userData(user: {
  id: string;
  email: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  status: string;
  platformRole: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  supabaseId: string | null;
}) {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    firstName: user.firstName,
    lastName: user.lastName,
    status: user.status,
    platformRole: user.platformRole,
    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified,
    supabaseId: user.supabaseId,
  };
}

/** POST /api/auth/register */
router.post(
  '/register',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, statusCode: 400, errors: errors.array() });
    }
    const { email, password, firstName, lastName, phone } = req.body;

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, ...(phone ? [{ phone }] : [])] },
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        statusCode: 409,
        message: 'A user with this email or phone already exists',
      });
    }

    const user = await prisma.user.create({
      data: {
        email,
        phone,
        firstName,
        lastName,
        passwordHash: await hashPassword(password),
        status: 'PENDING_VERIFICATION',
        platformRole: 'OWNER', // self sign-up = business owner (no platform admin rights)
        emailVerified: false,
        phoneVerified: false,
      },
    });

    const token = issueToken({
      id: user.id,
      email: user.email,
      platformRole: user.platformRole,
    });
    return res.status(201).json({
      success: true,
      statusCode: 201,
      timestamp: new Date().toISOString(),
      data: { access_token: token, expires_in: config.jwtExpiresIn, user: userData(user) },
    });
  }),
);

/** POST /api/auth/login */
router.post(
  '/login',
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, statusCode: 400, errors: errors.array() });
    }
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    // Always run one scrypt check, so unknown emails can't be spotted by response time.
    const valid = await verifyPassword(password, user?.passwordHash ?? (await getDummyHash()));
    if (!user || !user.passwordHash || !valid) {
      return res.status(401).json({ success: false, statusCode: 401, message: 'Invalid credentials' });
    }
    if (user.status !== 'ACTIVE' && user.status !== 'PENDING_VERIFICATION') {
      return res.status(401).json({ success: false, statusCode: 401, message: 'Account is not active' });
    }

    const token = issueToken({ id: user.id, email: user.email, platformRole: user.platformRole });
    return res.json({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: { access_token: token, expires_in: config.jwtExpiresIn, user: userData(user) },
    });
  }),
);

/** POST /api/auth/supabase - login/link via Supabase access token */
router.post(
  '/supabase',
  body('access_token').notEmpty(),
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, statusCode: 400, errors: errors.array() });
    }
    const { access_token } = req.body;

    // Signature, issuer, audience and expiry are all checked here. Identity
    // (email/phone) comes only from the verified claims, never the request body.
    let claims: SupabaseClaims;
    try {
      claims = await verifySupabaseToken(access_token);
    } catch {
      return res.status(401).json({ success: false, statusCode: 401, message: 'Invalid Supabase token' });
    }
    if (claims.is_anonymous) {
      return res.status(401).json({ success: false, statusCode: 401, message: 'Anonymous sign-ins are not allowed' });
    }

    const supabaseId = claims.sub;
    const email = claims.email ? claims.email.toLowerCase() : null;
    // Supabase stores phones without '+'; ABUUR stores E.164.
    const phone = claims.phone ? (claims.phone.startsWith('+') ? claims.phone : `+${claims.phone}`) : null;

    let user = await prisma.user.findUnique({ where: { supabaseId } });

    if (!user && (email || phone)) {
      // Link an existing ABUUR account that owns this confirmed email/phone.
      const existing = await prisma.user.findFirst({
        where: { OR: [...(email ? [{ email }] : []), ...(phone ? [{ phone }] : [])] },
      });
      if (existing) {
        if (existing.supabaseId && existing.supabaseId !== supabaseId) {
          return res.status(409).json({
            success: false,
            statusCode: 409,
            message: 'This email or phone is already linked to another sign-in',
          });
        }
        user = await prisma.user.update({
          where: { id: existing.id },
          data: {
            supabaseId,
            ...(!existing.firstName && claims.first_name ? { firstName: claims.first_name } : {}),
            ...(!existing.lastName && claims.last_name ? { lastName: claims.last_name } : {}),
            ...(email && existing.email === email ? { emailVerified: true } : {}),
            ...(phone && existing.phone === phone ? { phoneVerified: true } : {}),
          },
        });
      }
    }

    if (!user) {
      user = await prisma.user.create({
        data: {
          supabaseId,
          email,
          phone,
          firstName: claims.first_name,
          lastName: claims.last_name,
          status: 'ACTIVE',
          platformRole: 'OWNER', // self sign-up = business owner (no platform admin rights)
          emailVerified: !!email,
          phoneVerified: !!phone,
        },
      });
    }

    if (user.status !== 'ACTIVE' && user.status !== 'PENDING_VERIFICATION') {
      return res.status(401).json({ success: false, statusCode: 401, message: 'Account is not active' });
    }

    const token = issueToken({ id: user.id, email: user.email, platformRole: user.platformRole });
    return res.json({
      success: true,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: { access_token: token, expires_in: config.jwtExpiresIn, user: userData(user) },
    });
  }),
);

/** GET /api/auth/me */
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: (req as any).user.id },
      select: {
        id: true, supabaseId: true, email: true, phone: true, firstName: true,
        lastName: true, avatarUrl: true, status: true, platformRole: true,
        emailVerified: true, phoneVerified: true, createdAt: true, updatedAt: true,
      },
    });
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return res.json({ success: true, statusCode: 200, timestamp: new Date().toISOString(), data: user });
  }),
);

export default router;
