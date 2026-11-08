import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  createRemoteJWKSet,
  decodeProtectedHeader,
  jwtVerify,
  type JWTPayload,
} from 'jose';
import { UserStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import type { AppJwtPayload } from './auth.types.js';
import { getDummyHash, hashPassword, verifyPassword } from './password.js';

/** What a login response returns about the user. Never includes passwordHash. */
const LOGIN_USER_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  status: true,
  platformRole: true,
} as const;

export interface SupabaseClaims extends JWTPayload {
  sub: string;
  email?: string;
  phone?: string;
  role?: string;
  user_metadata?: { email_verified?: boolean; phone_verified?: boolean };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly supabaseIssuer: string;
  private readonly jwks: ReturnType<typeof createRemoteJWKSet>;

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const supabaseUrl = this.config
      .getOrThrow<string>('app.supabaseUrl')
      .replace(/\/+$/, '');
    this.supabaseIssuer = `${supabaseUrl}/auth/v1`;
    this.jwks = createRemoteJWKSet(
      new URL(`${this.supabaseIssuer}/.well-known/jwks.json`),
    );
  }

  /**
   * Verifies a Supabase access token. Asymmetric (JWKS) keys are preferred;
   * the legacy HS256 shared secret is used only when the token says HS256 and
   * a secret is configured.
   */
  async verifySupabaseToken(token: string): Promise<SupabaseClaims> {
    const options = {
      issuer: this.supabaseIssuer,
      audience: 'authenticated',
    };
    try {
      const { alg } = decodeProtectedHeader(token);
      let payload: JWTPayload;
      if (alg === 'HS256') {
        const secret = this.config.get<string>('app.supabaseJwtSecret');
        if (!secret) {
          throw new Error('HS256 token but SUPABASE_JWT_SECRET is not set');
        }
        ({ payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
          ...options,
          algorithms: ['HS256'],
        }));
      } else {
        ({ payload } = await jwtVerify(token, this.jwks, {
          ...options,
          algorithms: ['RS256', 'ES256'],
        }));
      }
      if (typeof payload.sub !== 'string' || payload.sub.length === 0) {
        throw new Error('Token has no subject');
      }
      return payload as SupabaseClaims;
    } catch (error) {
      this.logger.debug(`Supabase token rejected: ${(error as Error).message}`);
      throw new UnauthorizedException('Invalid or expired Supabase token');
    }
  }

  /** Exchanges a Supabase token for an app token, creating the User on first login. */
  async loginWithSupabase(supabaseToken: string) {
    const claims = await this.verifySupabaseToken(supabaseToken);
    const meta = claims.user_metadata ?? {};
    // Only trust contact details Supabase has confirmed. Invitations are
    // matched by email, so an unconfirmed address must never be stored.
    const email =
      claims.email && meta.email_verified === true ? claims.email.trim().toLowerCase() : null;
    const phone = claims.phone && meta.phone_verified === true ? claims.phone : null;

    const existing = await this.prisma.user.findUnique({
      where: { supabaseId: claims.sub },
      select: { id: true },
    });

    if (existing) {
      const user = await this.prisma.user.update({
        where: { id: existing.id },
        data: {
          ...(email ? { email, emailVerified: true } : {}),
          ...(phone ? { phone, phoneVerified: true } : {}),
        },
        select: LOGIN_USER_SELECT,
      });
      return this.issueSession(user);
    }

    // First Supabase login. A verified email that already belongs to a local
    // (password) account is linked to it instead of failing with a conflict.
    const local = email
      ? await this.prisma.user.findUnique({
          where: { email },
          select: { id: true, supabaseId: true },
        })
      : null;
    if (local && !local.supabaseId) {
      const user = await this.prisma.user.update({
        where: { id: local.id },
        data: { supabaseId: claims.sub, emailVerified: true },
        select: LOGIN_USER_SELECT,
      });
      return this.issueSession(user);
    }

    const user = await this.prisma.user.create({
      data: {
        supabaseId: claims.sub,
        email: local ? null : email,
        emailVerified: Boolean(email) && !local,
        phone,
        phoneVerified: Boolean(phone),
      },
      select: LOGIN_USER_SELECT,
    });
    return this.issueSession(user);
  }

  /**
   * Local email + password login (users with a passwordHash, e.g. the seeded
   * platform admin). Unknown email and wrong password give the same answer.
   */
  async loginWithPassword(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { ...LOGIN_USER_SELECT, passwordHash: true },
    });

    const valid = await verifyPassword(password, user?.passwordHash ?? (await getDummyHash()));
    if (!user?.passwordHash || !valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const { passwordHash: _omit, ...publicUser } = user;
    return this.issueSession(publicUser);
  }

  /**
   * Self-service sign-up for business owners: a local (email + password)
   * account. The email is not verified yet; Supabase can link to it later.
   */
  async registerWithPassword(input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    const email = input.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash: await hashPassword(input.password),
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
      },
      select: LOGIN_USER_SELECT,
    });
    return this.issueSession(user);
  }

  private async issueSession(user: { id: string; status: UserStatus } & Record<string, unknown>) {
    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException('Account is not active');
    }
    return {
      accessToken: await this.signAccessToken(user.id),
      tokenType: 'Bearer' as const,
      expiresIn: this.config.get<string>('app.jwtExpiresIn'),
      user,
    };
  }

  signAccessToken(userId: string): Promise<string> {
    const payload: AppJwtPayload = { sub: userId, typ: 'access' };
    return this.jwtService.signAsync(payload);
  }
}
