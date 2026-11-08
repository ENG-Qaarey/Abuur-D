import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard.js';
import { BusinessAccessGuard } from './auth/guards/business-access.guard.js';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { Config } from './config/config.module.js';
import { AuthModule } from './auth/auth.module.js';
import { QueueModule } from './queue/queue.module.js';
import { EmailModule } from './email/email.module.js';
import { WhatsAppModule } from './whatsapp/whatsapp.module.js';
import { SMSModule } from './sms/sms.module.js';
import { MonitoringModule } from './monitoring/monitoring.module.js';

import { UserModule } from './users/user.module.js';
import { BusinessModule } from './businesses/business.module.js';
import { BusinessMembershipModule } from './business-memberships/business-membership.module.js';
import { PlanModule } from './plans/plan.module.js';
import { SubscriptionModule } from './subscriptions/subscription.module.js';
import { CRMCustomerModule } from './crm-customers/crm-customer.module.js';
import { LeadModule } from './leads/lead.module.js';
import { CreativeRequestModule } from './creative-requests/creative-request.module.js';
import { CreativeProjectModule } from './creative-projects/creative-project.module.js';
import { CreativeTaskModule } from './creative-tasks/creative-task.module.js';
import { CreativeReviewModule } from './creative-reviews/creative-review.module.js';
import { MarketingContactModule } from './marketing-contacts/marketing-contact.module.js';
import { CampaignModule } from './campaigns/campaign.module.js';
import { CampaignRecipientModule } from './campaign-recipients/campaign-recipient.module.js';
import { StoreModule } from './stores/store.module.js';
import { StoreDomainModule } from './store-domains/store-domain.module.js';
import { ProductCategoryModule } from './product-categories/product-category.module.js';
import { ProductModule } from './products/product.module.js';
import { InventoryMovementModule } from './inventory-movements/inventory-movement.module.js';
import { StoreCustomerModule } from './store-customers/store-customer.module.js';
import { StoreOrderModule } from './store-orders/store-order.module.js';
import { StoreOrderItemModule } from './store-order-items/store-order-item.module.js';
import { FinanceTransactionModule } from './finance-transactions/finance-transaction.module.js';
import { InvoiceModule } from './invoices/invoice.module.js';
import { InvoiceItemModule } from './invoice-items/invoice-item.module.js';
import { PaymentModule } from './payments/payment.module.js';
import { NotificationModule } from './notifications/notification.module.js';
import { FileAssetModule } from './file-assets/file-asset.module.js';
import { IntegrationConnectionModule } from './integration-connections/integration-connection.module.js';
import { WebhookEventModule } from './webhook-events/webhook-event.module.js';
import { AuditLogModule } from './audit-logs/audit-log.module.js';
import { ContactMessageModule } from './contact-messages/contact-message.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

const isObserveConfigured = (): boolean => {
  const appKey = process.env.OBSERVE_APP_KEY;
  const appSecret = process.env.OBSERVE_APP_SECRET;
  return Boolean(
    appKey &&
      appSecret &&
      appKey !== 'YOUR_APP_KEY' &&
      appSecret !== 'YOUR_APP_SECRET',
  );
};

@Module({
  imports: [
    // Only load Observe telemetry when real credentials are provided
    ...(isObserveConfigured()
      ? [
          ObserveModule.forRoot({
            appKey: process.env.OBSERVE_APP_KEY!,
            appSecret: process.env.OBSERVE_APP_SECRET!,
            serviceId: 'backend',
          }),
        ]
      : []),
    Config,
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    QueueModule.register(),
    EmailModule,
    WhatsAppModule,
    SMSModule,
    MonitoringModule,
    UserModule,
    BusinessModule,
    BusinessMembershipModule,
    PlanModule,
    SubscriptionModule,
    CRMCustomerModule,
    LeadModule,
    CreativeRequestModule,
    CreativeProjectModule,
    CreativeTaskModule,
    CreativeReviewModule,
    MarketingContactModule,
    CampaignModule,
    CampaignRecipientModule,
    StoreModule,
    StoreDomainModule,
    ProductCategoryModule,
    ProductModule,
    InventoryMovementModule,
    StoreCustomerModule,
    StoreOrderModule,
    StoreOrderItemModule,
    FinanceTransactionModule,
    InvoiceModule,
    InvoiceItemModule,
    PaymentModule,
    NotificationModule,
    FileAssetModule,
    IntegrationConnectionModule,
    WebhookEventModule,
    AuditLogModule,
    ContactMessageModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Order matters: rate limit -> authenticate -> authorize.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: BusinessAccessGuard },
  ],
})
export class AppModule {}
