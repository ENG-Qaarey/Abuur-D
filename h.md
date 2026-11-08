

│   ── backend/                         # NestJS backend
│       │
│       ├── src/
│       │   │
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   │
│       │   ├── config/
│       │   │   ├── config.module.ts
│       │   │   ├── configuration.ts
│       │   │   ├── database.config.ts
│       │   │   ├── auth.config.ts
│       │   │   ├── storage.config.ts
│       │   │   └── validation.schema.ts
│       │   │
│       │   ├── common/
│       │   │   ├── decorators/
│       │   │   ├── guards/
│       │   │   ├── interceptors/
│       │   │   ├── filters/
│       │   │   ├── pipes/
│       │   │   ├── middleware/
│       │   │   ├── constants/
│       │   │   ├── enums/
│       │   │   ├── interfaces/
│       │   │   ├── types/
│       │   │   ├── utils/
│       │   │   └── exceptions/
│       │   │
│       │   ├── database/
│       │   │   ├── database.module.ts
│       │   │   ├── prisma.service.ts
│       │   │   └── prisma.module.ts
│       │   │
│       │   ├── health/
│       │   │   ├── health.module.ts
│       │   │   ├── health.controller.ts
│       │   │   └── health.service.ts
│       │   │
│       │   ├── auth/
│       │   │   ├── auth.module.ts
│       │   │   ├── controllers/
│       │   │   ├── services/
│       │   │   ├── strategies/
│       │   │   ├── guards/
│       │   │   ├── decorators/
│       │   │   ├── dto/
│       │   │   └── interfaces/
│       │   │
│       │   ├── users/
│       │   │   ├── users.module.ts
│       │   │   ├── controllers/
│       │   │   ├── services/
│       │   │   ├── dto/
│       │   │   ├── repositories/
│       │   │   └── interfaces/
│       │   │
│       │   ├── roles-permissions/
│       │   │   ├── roles-permissions.module.ts
│       │   │   ├── controllers/
│       │   │   ├── services/
│       │   │   ├── decorators/
│       │   │   ├── guards/
│       │   │   ├── dto/
│       │   │   └── constants/
│       │   │
│       │   ├── businesses/
│       │   │   ├── businesses.module.ts
│       │   │   ├── controllers/
│       │   │   ├── services/
│       │   │   ├── dto/
│       │   │   ├── repositories/
│       │   │   └── interfaces/
│       │   │
│       │   ├── tenants/
│       │   │   ├── tenants.module.ts
│       │   │   ├── controllers/
│       │   │   ├── services/
│       │   │   ├── guards/
│       │   │   ├── decorators/
│       │   │   ├── dto/
│       │   │   └── interfaces/
│       │   │
│       │   ├── subscriptions/
│       │   │   ├── subscriptions.module.ts
│       │   │   ├── controllers/
│       │   │   ├── services/
│       │   │   ├── plans/
│       │   │   ├── billing/
│       │   │   ├── renewals/
│       │   │   ├── guards/
│       │   │   ├── dto/
│       │   │   └── interfaces/
│       │   │
│       │   ├── crm/
│       │   │   ├── crm.module.ts
│       │   │   ├── controllers/
│       │   │   ├── services/
│       │   │   ├── customers/
│       │   │   ├── leads/
│       │   │   ├── pipeline/
│       │   │   ├── interactions/
│       │   │   ├── dto/
│       │   │   └── repositories/
│       │   │
│       │   ├── creative/
│       │   │   ├── creative.module.ts
│       │   │   ├── controllers/
│       │   │   ├── services/
│       │   │   ├── requests/
│       │   │   ├── projects/
│       │   │   ├── tasks/
│       │   │   ├── assignments/
│       │   │   ├── approvals/
│       │   │   ├── revisions/
│       │   │   ├── media-library/
│       │   │   ├── dto/
│       │   │   └── repositories/
│       │   │
│       │   ├── marketing/
│       │   │   ├── marketing.module.ts
│       │   │   ├── controllers/
│       │   │   ├── services/
│       │   │   ├── contacts/
│       │   │   ├── segments/
│       │   │   ├── campaigns/
│       │   │   ├── templates/
│       │   │   ├── scheduling/
│       │   │   ├── consent/
│       │   │   ├── delivery-reports/
│       │   │   ├── dto/
│       │   │   └── repositories/
│       │   │
│       │   ├── stores/
│       │   │   ├── stores.module.ts
│       │   │   ├── controllers/
│       │   │   ├── services/
│       │   │   ├── storefront/
│       │   │   ├── products/
│       │   │   ├── categories/
│       │   │   ├── inventory/
│       │   │   ├── orders/
│       │   │   ├── customers/
│       │   │   ├── domains/
│       │   │   ├── shipping/
│       │   │   ├── dropshipping/
│       │   │   ├── subscriptions/
│       │   │   ├── dto/
│       │   │   └── repositories/
│       │   │
│       │   ├── finance/
│       │   │   ├── finance.module.ts
│       │   │   ├── controllers/
│       │   │   ├── services/
│       │   │   ├── transactions/
│       │   │   ├── revenue/
│       │   │   ├── expenses/
│       │   │   ├── invoices/
│       │   │   ├── payments/
│       │   │   ├── accounts/
│       │   │   ├── reports/
│       │   │   ├── dto/
│       │   │   └── repositories/
│       │   │
│       │   ├── analytics/
│       │   │   ├── analytics.module.ts
│       │   │   ├── controllers/
│       │   │   ├── services/
│       │   │   ├── business-reports/
│       │   │   ├── sales-reports/
│       │   │   ├── marketing-reports/
│       │   │   ├── subscription-reports/
│       │   │   ├── dashboards/
│       │   │   └── exports/
│       │   │
│       │   ├── notifications/
│       │   │   ├── notifications.module.ts
│       │   │   ├── controllers/
│       │   │   ├── services/
│       │   │   ├── email/
│       │   │   ├── sms/
│       │   │   ├── in-app/
│       │   │   ├── templates/
│       │   │   └── dto/
│       │   │
│       │   ├── integrations/
│       │   │   ├── integrations.module.ts
│       │   │   ├── whatsapp/
│       │   │   ├── sms-providers/
│       │   │   ├── email-providers/
│       │   │   ├── payment-providers/
│       │   │   ├── supabase/
│       │   │   └── storage/
│       │   │
│       │   ├── files/
│       │   │   ├── files.module.ts
│       │   │   ├── controllers/
│       │   │   ├── services/
│       │   │   ├── storage/
│       │   │   ├── validators/
│       │   │   └── dto/
│       │   │
│       │   ├── webhooks/
│       │   │   ├── webhooks.module.ts
│       │   │   ├── controllers/
│       │   │   ├── handlers/
│       │   │   └── dto/
│       │   │
│       │   ├── jobs/
│       │   │   ├── jobs.module.ts
│       │   │   ├── processors/
│       │   │   ├── queues/
│       │   │   ├── schedulers/
│       │   │   └── tasks/
│       │   │
│       │   └── admin/
│       │       ├── admin.module.ts
│       │       ├── controllers/
│       │       ├── services/
│       │       ├── dashboard/
│       │       ├── businesses/
│       │       ├── users/
│       │       ├── subscriptions/
│       │       └── audit-logs/
│       │
│       ├── test/
│       │   ├── unit/
│       │   ├── integration/
│       │   ├── e2e/
│       │   └── fixtures/
│       │
│       ├── .env.example
│       ├── nest-cli.json
│       ├── package.json
│       ├── tsconfig.json
│       └── tsconfig.build.json
│
├── packages/
│   ├── shared-types/
│   └── shared-validation/
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── docs/
│   ├── architecture/
│   ├── api/
│   ├── database/
│   └── deployment/
│
├── .gitignore
├── package.json
└── README.md