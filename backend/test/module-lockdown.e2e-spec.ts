import { Module, ValidationPipe, type INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import request from 'supertest';
import { Config } from '../src/config/config.module.js';
import { PrismaModule } from '../src/prisma/prisma.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { AuthModule } from '../src/auth/auth.module.js';
import { AuthService } from '../src/auth/auth.service.js';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard.js';
import { BusinessAccessGuard } from '../src/auth/guards/business-access.guard.js';
import { AuditLogModule } from '../src/audit-logs/audit-log.module.js';
import { IntegrationConnectionModule } from '../src/integration-connections/integration-connection.module.js';
import { WebhookEventModule } from '../src/webhook-events/webhook-event.module.js';
import { CampaignRecipientModule } from '../src/campaign-recipients/campaign-recipient.module.js';
import { CampaignModule } from '../src/campaigns/campaign.module.js';
import { CreativeProjectModule } from '../src/creative-projects/creative-project.module.js';
import { CreativeRequestModule } from '../src/creative-requests/creative-request.module.js';
import { CreativeReviewModule } from '../src/creative-reviews/creative-review.module.js';
import { CreativeTaskModule } from '../src/creative-tasks/creative-task.module.js';
import { CRMCustomerModule } from '../src/crm-customers/crm-customer.module.js';
import { FileAssetModule } from '../src/file-assets/file-asset.module.js';
import { FinanceTransactionModule } from '../src/finance-transactions/finance-transaction.module.js';
import { InventoryMovementModule } from '../src/inventory-movements/inventory-movement.module.js';
import { InvoiceItemModule } from '../src/invoice-items/invoice-item.module.js';
import { InvoiceModule } from '../src/invoices/invoice.module.js';
import { LeadModule } from '../src/leads/lead.module.js';
import { MarketingContactModule } from '../src/marketing-contacts/marketing-contact.module.js';
import { NotificationModule } from '../src/notifications/notification.module.js';
import { PaymentModule } from '../src/payments/payment.module.js';
import { PlanModule } from '../src/plans/plan.module.js';
import { ProductCategoryModule } from '../src/product-categories/product-category.module.js';
import { ProductModule } from '../src/products/product.module.js';
import { StoreCustomerModule } from '../src/store-customers/store-customer.module.js';
import { StoreDomainModule } from '../src/store-domains/store-domain.module.js';
import { StoreOrderItemModule } from '../src/store-order-items/store-order-item.module.js';
import { StoreOrderModule } from '../src/store-orders/store-order.module.js';
import { StoreModule } from '../src/stores/store.module.js';
import { SubscriptionModule } from '../src/subscriptions/subscription.module.js';
import { FakePrisma } from './fake-prisma.js';

/**
 * Regression test for the 2026-11-06 incident: these 28 modules have no
 * tenant-scoped queries yet (plain findMany/update/delete), so they must stay
 * locked (default deny) until each one gets business-scoped endpoints.
 * If you open one of them, remove it from this list in the same change and
 * add tenant-isolation tests for it.
 */
const LOCKED = [
  'audit-logs',
  'campaign-recipients',
  'campaigns',
  'creative-projects',
  'creative-requests',
  'creative-reviews',
  'creative-tasks',
  'crm-customers',
  'file-assets',
  'finance-transactions',
  'integration-connections',
  'inventory-movements',
  'invoice-items',
  'invoices',
  'leads',
  'marketing-contacts',
  'notifications',
  'payments',
  'plans',
  'product-categories',
  'products',
  'store-customers',
  'store-domains',
  'store-order-items',
  'store-orders',
  'stores',
  'subscriptions',
  'webhook-events',
];

@Module({
  imports: [
    Config,
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 100_000 }]),
    PrismaModule,
    AuthModule,
    AuditLogModule,
    IntegrationConnectionModule,
    WebhookEventModule,
    CampaignRecipientModule,
    CampaignModule,
    CreativeProjectModule,
    CreativeRequestModule,
    CreativeReviewModule,
    CreativeTaskModule,
    CRMCustomerModule,
    FileAssetModule,
    FinanceTransactionModule,
    InventoryMovementModule,
    InvoiceItemModule,
    InvoiceModule,
    LeadModule,
    MarketingContactModule,
    NotificationModule,
    PaymentModule,
    PlanModule,
    ProductCategoryModule,
    ProductModule,
    StoreCustomerModule,
    StoreDomainModule,
    StoreOrderItemModule,
    StoreOrderModule,
    StoreModule,
    SubscriptionModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: BusinessAccessGuard },
  ],
})
class LockdownTestModule {}

const ID = '11111111-1111-4111-8111-111111111111';
const CALLS = [
  ['get', ''],
  ['get', `/${ID}`],
  ['post', ''],
  ['patch', `/${ID}`],
  ['delete', `/${ID}`],
] as const;

describe('Modules without tenant scoping stay locked (e2e)', () => {
  let app: INestApplication;
  let prisma: FakePrisma;
  let userToken: string;
  let adminToken: string;
  let ownerToken: string;
  let businessId: string;

  beforeAll(async () => {
    prisma = new FakePrisma();
    const moduleRef = await Test.createTestingModule({ imports: [LockdownTestModule] })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api');
    await app.init();

    const auth = app.get(AuthService);
    const fresh = prisma.addUser({ email: 'fresh-signup@example.com' });
    const admin = prisma.addUser({ platformRole: 'SUPER_ADMIN' });
    const owner = prisma.addUser({ email: 'owner@example.com' });
    userToken = await auth.signAccessToken(fresh.id);
    adminToken = await auth.signAccessToken(admin.id);
    ownerToken = await auth.signAccessToken(owner.id);

    // A business the fresh user is NOT a member of.
    const business = await prisma.business.create({ data: { name: 'Hodan Fashion', slug: 'hodan', status: 'ACTIVE' } });
    businessId = business.id;
    await prisma.businessMembership.create({ data: { userId: owner.id, businessId, role: 'OWNER', status: 'ACTIVE' } });
  });

  afterAll(async () => {
    await app.close();
  });

  const http = () => request(app.getHttpServer());

  it.each(LOCKED)('/api/%s: no token → 401 on every method', async (path) => {
    for (const [method, suffix] of CALLS) {
      await http()[method](`/api/${path}${suffix}`).send({}).expect(401);
    }
  });

  it.each(LOCKED)('/api/%s: freshly signed-up user → 403 on every method', async (path) => {
    for (const [method, suffix] of CALLS) {
      await http()[method](`/api/${path}${suffix}`).set('Authorization', `Bearer ${userToken}`).send({}).expect(403);
    }
  });

  it.each(LOCKED)('/api/%s: fresh user naming another business in X-Business-Id → 403', async (path) => {
    for (const [method, suffix] of CALLS) {
      await http()
        [method](`/api/${path}${suffix}`)
        .set('Authorization', `Bearer ${userToken}`)
        .set('X-Business-Id', businessId)
        .send({})
        .expect(403);
    }
  });

  it.each(LOCKED)('/api/%s: even a business OWNER → 403 (no scoped policy yet)', async (path) => {
    await http().get(`/api/${path}`).set('Authorization', `Bearer ${ownerToken}`).set('X-Business-Id', businessId).expect(403);
  });

  it.each(LOCKED)('/api/%s: SUPER_ADMIN → 403 (admin access must be granted explicitly)', async (path) => {
    await http().get(`/api/${path}`).set('Authorization', `Bearer ${adminToken}`).expect(403);
  });
});
