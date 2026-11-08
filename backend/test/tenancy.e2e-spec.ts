import { Module, ValidationPipe, type INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import request from 'supertest';
import { Config } from '../src/config/config.module.js';
import { PrismaModule } from '../src/prisma/prisma.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { AuthModule } from '../src/auth/auth.module.js';
import { AuthService } from '../src/auth/auth.service.js';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard.js';
import { BusinessAccessGuard } from '../src/auth/guards/business-access.guard.js';
import { UserModule } from '../src/users/user.module.js';
import { BusinessModule } from '../src/businesses/business.module.js';
import { BusinessMembershipModule } from '../src/business-memberships/business-membership.module.js';
import { ProductModule } from '../src/products/product.module.js';
import { ContactMessageModule } from '../src/contact-messages/contact-message.module.js';
import { AppController } from '../src/app.controller.js';
import { AppService } from '../src/app.service.js';
import { PrismaExceptionFilter } from '../src/common/filters/prisma-exception.filter.js';
import { FakePrisma } from './fake-prisma.js';
import { hashPassword } from '../src/auth/password.js';

/**
 * Same guard stack as AppModule, without Redis/BullMQ and external providers.
 * ProductModule stands in for every module not yet given an access policy.
 */
@Module({
  imports: [
    Config,
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 1000 }]),
    PrismaModule,
    AuthModule,
    UserModule,
    BusinessModule,
    BusinessMembershipModule,
    ProductModule,
    ContactMessageModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: BusinessAccessGuard },
  ],
})
class TestAppModule {}

const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');

describe('Auth & tenancy (e2e)', () => {
  let app: INestApplication;
  let prisma: FakePrisma;
  let auth: AuthService;
  let alice: { id: string; email: string };
  let bob: { id: string; email: string };
  let admin: { id: string };
  let aliceToken: string;
  let bobToken: string;
  let adminToken: string;
  let businessId: string;

  const http = () => request(app.getHttpServer());

  beforeAll(async () => {
    prisma = new FakePrisma();
    const moduleRef = await Test.createTestingModule({ imports: [TestAppModule] })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalFilters(new PrismaExceptionFilter());
    app.setGlobalPrefix('api');
    await app.init();

    auth = app.get(AuthService);
    alice = prisma.addUser({ email: 'alice@example.com' });
    bob = prisma.addUser({ email: 'bob@example.com' });
    admin = prisma.addUser({ platformRole: 'SUPER_ADMIN' });
    aliceToken = await auth.signAccessToken(alice.id);
    bobToken = await auth.signAccessToken(bob.id);
    adminToken = await auth.signAccessToken(admin.id);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('authentication', () => {
    it('serves the public health route without a token', async () => {
      await http().get('/api').expect(200);
    });

    it('rejects requests without a token', async () => {
      await http().get('/api/businesses').expect(401);
    });

    it('rejects an unsigned token that the previous guard accepted', async () => {
      const unsigned = `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ sub: alice.id, typ: 'access', exp: 9999999999 })}.x`;
      await http().get('/api/businesses').set('Authorization', `Bearer ${unsigned}`).expect(401);
    });

    it('rejects a token signed with a different secret', async () => {
      const forged = new JwtService({}).sign(
        { sub: alice.id, typ: 'access' },
        { secret: 'attacker-chosen-secret-attacker-chosen', issuer: 'abuur-backend', audience: 'abuur-api' },
      );
      await http().get('/api/businesses').set('Authorization', `Bearer ${forged}`).expect(401);
    });

    it('rejects a malformed Supabase token body', async () => {
      await http().post('/api/auth/verify-supabase').send({ accessToken: 'nope' }).expect(400);
    });
  });

  describe('default deny', () => {
    it('blocks modules that have no access policy yet', async () => {
      await http().get('/api/products').set('Authorization', `Bearer ${aliceToken}`).expect(403);
    });
  });

  describe('businesses', () => {
    it('rejects mass-assigned fields such as status', async () => {
      await http()
        .post('/api/businesses')
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({ name: 'Alice Shop', slug: 'alice-shop', status: 'ACTIVE' })
        .expect(400);
    });

    it('creates a business and makes the creator OWNER', async () => {
      const res = await http()
        .post('/api/businesses')
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({ name: 'Alice Shop', slug: 'alice-shop' })
        .expect(201);
      businessId = res.body.id;
      expect(res.body.status).toBe('PENDING_APPROVAL');

      const mine = await http().get('/api/businesses').set('Authorization', `Bearer ${aliceToken}`).expect(200);
      expect(mine.body).toEqual([expect.objectContaining({ id: businessId, myRole: 'OWNER' })]);
    });

    it("hides Alice's business from Bob", async () => {
      const bobs = await http().get('/api/businesses').set('Authorization', `Bearer ${bobToken}`).expect(200);
      expect(bobs.body).toEqual([]);

      await http().get(`/api/businesses/${businessId}`).set('Authorization', `Bearer ${bobToken}`).expect(403);
      await http()
        .patch(`/api/businesses/${businessId}`)
        .set('Authorization', `Bearer ${bobToken}`)
        .send({ name: 'Pwned' })
        .expect(403);
      await http().delete(`/api/businesses/${businessId}`).set('Authorization', `Bearer ${bobToken}`).expect(403);
      await http()
        .get(`/api/businesses/${businessId}/members`)
        .set('Authorization', `Bearer ${bobToken}`)
        .expect(403);
    });

    it('keeps the all-businesses list for platform admins', async () => {
      await http().get('/api/businesses/admin/list').set('Authorization', `Bearer ${aliceToken}`).expect(403);
      await http()
        .get('/api/businesses/admin/list?take=500')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });

    it('does not let an owner approve their own business', async () => {
      await http()
        .patch(`/api/businesses/${businessId}/status`)
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({ status: 'ACTIVE' })
        .expect(403);
    });

    it('lets a platform admin approve it', async () => {
      const res = await http()
        .patch(`/api/businesses/${businessId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'ACTIVE' })
        .expect(200);
      expect(res.body.status).toBe('ACTIVE');
    });
  });

  describe('memberships', () => {
    let bobMembershipId: string;

    it('invited users get no access until they accept', async () => {
      const res = await http()
        .post(`/api/businesses/${businessId}/members`)
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({ email: bob.email, role: 'EMPLOYEE' })
        .expect(201);
      bobMembershipId = res.body.id;
      expect(res.body.status).toBe('INVITED');

      await http().get(`/api/businesses/${businessId}`).set('Authorization', `Bearer ${bobToken}`).expect(403);
    });

    it('only the invitee can accept the invitation', async () => {
      await http()
        .post(`/api/users/me/memberships/${bobMembershipId}/accept`)
        .set('Authorization', `Bearer ${aliceToken}`)
        .expect(404);
      await http()
        .post(`/api/users/me/memberships/${bobMembershipId}/accept`)
        .set('Authorization', `Bearer ${bobToken}`)
        .expect(200);
    });

    it('an EMPLOYEE can read but not manage the business', async () => {
      await http().get(`/api/businesses/${businessId}`).set('Authorization', `Bearer ${bobToken}`).expect(200);
      await http()
        .patch(`/api/businesses/${businessId}`)
        .set('Authorization', `Bearer ${bobToken}`)
        .send({ name: 'Renamed' })
        .expect(403);
      await http()
        .patch(`/api/businesses/${businessId}/members/${bobMembershipId}`)
        .set('Authorization', `Bearer ${bobToken}`)
        .send({ role: 'OWNER' })
        .expect(403);
    });

    it('the last OWNER cannot leave', async () => {
      const members = await http()
        .get(`/api/businesses/${businessId}/members`)
        .set('Authorization', `Bearer ${aliceToken}`)
        .expect(200);
      const aliceMembership = members.body.find((m: { user: { id: string } }) => m.user.id === alice.id);
      await http()
        .delete(`/api/businesses/${businessId}/members/${aliceMembership.id}`)
        .set('Authorization', `Bearer ${aliceToken}`)
        .expect(409);
    });

    it('records audit entries for sensitive changes', () => {
      const actions = prisma.auditLog.rows.map((r) => r.action);
      expect(actions).toEqual(
        expect.arrayContaining(['business.created', 'business.status_changed', 'membership.invited', 'membership.accepted']),
      );
    });
  });

  describe('email + password login (seeded admin)', () => {
    beforeAll(async () => {
      prisma.addUser({
        email: 'abuur@gmail.com',
        supabaseId: null,
        platformRole: 'SUPER_ADMIN',
        passwordHash: await hashPassword('abuur@1234'),
      });
    });

    const login = (body: object) => http().post('/api/auth/login').send(body);

    it('logs the admin in and the token works on admin routes', async () => {
      const res = await login({ email: 'ABUUR@gmail.com', password: 'abuur@1234' }).expect(200);
      expect(res.body.user).toMatchObject({ email: 'abuur@gmail.com', platformRole: 'SUPER_ADMIN' });
      expect(res.body.user).not.toHaveProperty('passwordHash');
      expect(JSON.stringify(res.body)).not.toContain('scrypt$');

      await http().get('/api/users').set('Authorization', `Bearer ${res.body.accessToken}`).expect(200);
    });

    it('gives the same answer for a wrong password and an unknown email', async () => {
      const wrong = await login({ email: 'abuur@gmail.com', password: 'nope' }).expect(401);
      const unknown = await login({ email: 'nobody@abuur.so', password: 'abuur@1234' }).expect(401);
      expect(wrong.body.message).toBe('Invalid email or password');
      expect(unknown.body.message).toBe(wrong.body.message);
    });

    it('Supabase-only users (no password) cannot use password login', async () => {
      await login({ email: alice.email, password: 'anything' }).expect(401);
    });

    it('rejects malformed bodies', async () => {
      await login({ email: 'not-an-email', password: 'x' }).expect(400);
    });

    // The 5 requests above used up this IP's allowance for /auth/login.
    it('blocks the 6th attempt within a minute (brute-force protection)', async () => {
      await login({ email: 'abuur@gmail.com', password: 'guess-6' }).expect(429);
    });
  });

  describe('website contact form', () => {
    const send = (body: object) => http().post('/api/contact-messages').send(body);
    const valid = { name: 'Hodan Ali', email: 'hodan@example.com', topic: 'SALES', message: 'I want a store for my shop.', locale: 'so' };

    it('stores a valid message without needing a login', async () => {
      await send(valid).expect(201, { received: true });
      const saved = prisma.contactMessage.rows.at(-1)!;
      expect(saved).toMatchObject({ name: 'Hodan Ali', email: 'hodan@example.com', status: 'NEW' });
      expect(saved.ipHash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('requires an email or a phone, and validates fields', async () => {
      await send({ ...valid, email: undefined }).expect(400);
      await send({ ...valid, message: 'short' }).expect(400);
    });

    it('silently drops honeypot spam', async () => {
      const before = prisma.contactMessage.rows.length;
      await send({ ...valid, website: 'http://spam.example' }).expect(201, { received: true });
      expect(prisma.contactMessage.rows.length).toBe(before);
    });

    it('lists messages for platform admins only', async () => {
      await http().get('/api/contact-messages').set('Authorization', `Bearer ${aliceToken}`).expect(403);
      const res = await http().get('/api/contact-messages').set('Authorization', `Bearer ${adminToken}`).expect(200);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).not.toHaveProperty('ipHash');
    });
  });

  describe('business status', () => {
    const setStatus = (status: string) =>
      http()
        .patch(`/api/businesses/${businessId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status })
        .expect(200);

    it('a suspended business blocks its members, except reading its status and leaving', async () => {
      await setStatus('SUSPENDED');
      const res = await http().get(`/api/businesses/${businessId}`).set('Authorization', `Bearer ${aliceToken}`).expect(200);
      expect(res.body.status).toBe('SUSPENDED');
      await http()
        .patch(`/api/businesses/${businessId}`)
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({ name: 'Still selling' })
        .expect(403);
      await http().get(`/api/businesses/${businessId}/members`).set('Authorization', `Bearer ${aliceToken}`).expect(403);
    });

    it('the owner cannot undo a suspension by deactivating', async () => {
      await http().delete(`/api/businesses/${businessId}`).set('Authorization', `Bearer ${aliceToken}`).expect(403);
      expect(prisma.business.rows.find((b) => b.id === businessId)!.status).toBe('SUSPENDED');
    });

    it('a pending business can still be set up', async () => {
      await setStatus('PENDING_APPROVAL');
      await http()
        .patch(`/api/businesses/${businessId}`)
        .set('Authorization', `Bearer ${aliceToken}`)
        .send({ description: 'Setting up' })
        .expect(200);
      await http().get(`/api/businesses/${businessId}/members`).set('Authorization', `Bearer ${aliceToken}`).expect(200);
      await setStatus('ACTIVE');
    });
  });

  describe('Supabase login', () => {
    const claims = (sub: string, email: string, emailVerified: boolean) => ({
      sub,
      email,
      user_metadata: { email_verified: emailVerified },
    });

    it('does not store an email Supabase has not verified', async () => {
      vi.spyOn(auth, 'verifySupabaseToken').mockResolvedValueOnce(claims('sb-unverified', 'alice@example.com', false));
      const res = await auth.loginWithSupabase('token');
      const row = prisma.user.rows.find((u) => u.id === res.user.id)!;
      expect(row.email).toBeNull();
      expect(row.id).not.toBe(alice.id);
    });

    it('links a verified email to an existing local account instead of failing', async () => {
      const local = prisma.addUser({ email: 'owner@example.com', supabaseId: null, passwordHash: 'x' });
      vi.spyOn(auth, 'verifySupabaseToken').mockResolvedValueOnce(claims('sb-owner', 'Owner@Example.com', true));
      const res = await auth.loginWithSupabase('token');
      expect(res.user.id).toBe(local.id);
      expect(prisma.user.rows.find((u) => u.id === local.id)!.supabaseId).toBe('sb-owner');
    });
  });

  describe('users', () => {
    it('rejects negative pagination', async () => {
      await http().get('/api/users?skip=-1').set('Authorization', `Bearer ${adminToken}`).expect(400);
    });

    it('restricts the user directory to platform admins', async () => {
      await http().get('/api/users').set('Authorization', `Bearer ${aliceToken}`).expect(403);
      await http().get('/api/users').set('Authorization', `Bearer ${adminToken}`).expect(200);
    });

    it('suspended users are locked out immediately', async () => {
      prisma.user.rows.find((u) => u.id === bob.id)!.status = 'SUSPENDED';
      await http().get('/api/businesses').set('Authorization', `Bearer ${bobToken}`).expect(401);
    });
  });
});
