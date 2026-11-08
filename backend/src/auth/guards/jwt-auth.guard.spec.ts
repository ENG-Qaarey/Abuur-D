import { UnauthorizedException, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './jwt-auth.guard.js';

const SECRET = 'unit-test-secret-that-is-at-least-32-chars';
const ISSUER = 'abuur-backend';
const AUDIENCE = 'abuur-api';
const USER = { id: '11111111-1111-4111-8111-111111111111', email: 'a@x.com', status: 'ACTIVE', platformRole: 'USER' };

const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');

function setup(opts: { isPublic?: boolean; user?: object | null } = {}) {
  const reflector = { getAllAndOverride: vi.fn().mockReturnValue(opts.isPublic ?? false) } as unknown as Reflector;
  const config = {
    getOrThrow: () => SECRET,
    get: (key: string) => ({ 'app.jwtIssuer': ISSUER, 'app.jwtAudience': AUDIENCE })[key],
  } as unknown as ConfigService;
  const prisma = { user: { findUnique: vi.fn().mockResolvedValue(opts.user === undefined ? USER : opts.user) } };
  const jwt = new JwtService({});
  const guard = new JwtAuthGuard(reflector, jwt, config, prisma as never);

  const run = (authorization?: string) => {
    const request: Record<string, any> = { headers: authorization ? { authorization } : {} };
    const ctx = {
      getHandler: () => null,
      getClass: () => null,
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
    return { result: guard.canActivate(ctx), request };
  };
  const sign = (payload: object, options: object = {}, secret = SECRET) =>
    jwt.sign(payload, { secret, algorithm: 'HS256', issuer: ISSUER, audience: AUDIENCE, expiresIn: '1h', ...options });

  return { run, sign, prisma };
}

describe('JwtAuthGuard', () => {
  it('accepts a correctly signed token and attaches the DB user', async () => {
    const { run, sign } = setup();
    const { result, request } = run(`Bearer ${sign({ sub: USER.id, typ: 'access' })}`);
    await expect(result).resolves.toBe(true);
    expect(request.user).toEqual(USER);
  });

  it('lets @Public routes through without a token', async () => {
    const { run } = setup({ isPublic: true });
    await expect(run().result).resolves.toBe(true);
  });

  it.each([
    ['no header', undefined],
    ['wrong scheme', 'Basic abc'],
    ['garbage', 'Bearer not-a-jwt'],
  ])('rejects %s', async (_label, header) => {
    const { run } = setup();
    await expect(run(header).result).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects a forged token signed with another secret', async () => {
    const { run, sign } = setup();
    const forged = sign({ sub: USER.id, typ: 'access' }, {}, 'attacker-secret-attacker-secret-attacker');
    await expect(run(`Bearer ${forged}`).result).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects an unsigned token (alg: none) — the old guard accepted these', async () => {
    const { run } = setup();
    const unsigned = `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ sub: USER.id, typ: 'access', iss: ISSUER, aud: AUDIENCE })}.`;
    await expect(run(`Bearer ${unsigned}`).result).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects a token with a tampered payload', async () => {
    const { run, sign } = setup();
    const [h, , s] = sign({ sub: USER.id, typ: 'access' }).split('.');
    const tampered = `${h}.${b64({ sub: 'someone-else', typ: 'access', iss: ISSUER, aud: AUDIENCE })}.${s}`;
    await expect(run(`Bearer ${tampered}`).result).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects an expired token', async () => {
    const { run, sign } = setup();
    const expired = sign({ sub: USER.id, typ: 'access' }, { expiresIn: -60 });
    await expect(run(`Bearer ${expired}`).result).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects a token for another audience (e.g. a Supabase token)', async () => {
    const { run, sign } = setup();
    const token = sign({ sub: USER.id, typ: 'access' }, { audience: 'authenticated' });
    await expect(run(`Bearer ${token}`).result).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects tokens whose user no longer exists or is suspended', async () => {
    for (const user of [null, { ...USER, status: 'SUSPENDED' }]) {
      const { run, sign } = setup({ user });
      await expect(run(`Bearer ${sign({ sub: USER.id, typ: 'access' })}`).result).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    }
  });
});
