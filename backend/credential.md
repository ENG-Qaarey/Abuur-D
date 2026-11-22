# ABUUR Platform — Test Credentials

## Role-Based Credentials (8 Users)

| # | Role | PlatformRole | Email | Password | Dashboard URL |
|---|------|-------------|-------|----------|---------------|
| 1 | Platform Admin | `SUPER_ADMIN` | admin@abuur.com | Admin123! | `/admin` |
| 2 | Business Owner | `OWNER` | owner@cafemogadishu.com | Owner123! | `/dashboard` |
| 3 | Business Staff | `STAFF` | staff@abuur.com | Staff123! | `/staff` |
| 4 | Creative Designer | `DESIGNER` | designer@abuur.com | Designer123! | `/creative` |
| 5 | Marketing Manager | `MARKETING_MANAGER` | marketing@abuur.com | Marketing123! | `/marketing` |
| 6 | Store Manager | `STORE_MANAGER` | store@abuur.com | Store123! | `/store` |
| 7 | Finance Manager | `FINANCE_MANAGER` | finance@abuur.com | Finance123! | `/finance` |
| 8 | Customer | `OWNER` | customer@example.com | Customer123! | `/dashboard` |

## Dashboard Route Structure

```
Platform Admin (SUPER_ADMIN)    → /admin
├── /admin                      - Overview
├── /admin/businesses           - Businesses
├── /admin/users                - Users
├── /admin/subscriptions        - Subscriptions
├── /admin/payments             - Payments
├── /admin/packages             - Service Packages
├── /admin/services             - Creative Services
├── /admin/integrations/whatsapp - WhatsApp Providers
├── /admin/integrations/sms     - SMS Providers
├── /admin/finance              - Platform Finance
├── /admin/analytics            - Reports & Analytics
├── /admin/support              - Support Tickets
├── /admin/settings             - System Settings
└── /admin/audit-logs           - Audit Logs

Business Owner (OWNER)          → /dashboard
├── /dashboard                  - Overview
├── /dashboard/business         - My Business
├── /dashboard/crm              - CRM
├── /dashboard/crm/customers    - Customers
├── /dashboard/crm/leads        - Leads
├── /dashboard/crm/pipeline     - Sales Pipeline
├── /dashboard/creative         - Creative Projects
├── /dashboard/marketing        - Marketing
├── /dashboard/marketing/whatsapp - WhatsApp Campaigns
├── /dashboard/marketing/sms    - SMS Campaigns
├── /dashboard/store            - Store
├── /dashboard/store/products   - Products
├── /dashboard/store/orders     - Orders
├── /dashboard/finance/invoices - Invoices
├── /dashboard/finance/payments - Payments
├── /dashboard/finance          - Business Finance
├── /dashboard/analytics        - Analytics
├── /dashboard/team             - Team Management
├── /dashboard/subscription     - Subscription
└── /dashboard/settings         - Settings

Business Staff (STAFF)          → /staff
├── /staff                      - Overview
├── /staff/tasks                - Assigned Tasks
├── /staff/customers            - Customers
├── /staff/leads                - Leads
├── /staff/creative             - Creative Projects
├── /staff/orders               - Orders
├── /staff/products             - Products
├── /staff/notifications        - Notifications
└── /staff/profile              - My Profile

Creative Team (DESIGNER)        → /creative
├── /creative                   - Overview
├── /creative/projects          - My Projects
├── /creative/tasks             - Assigned Tasks
├── /creative/briefs            - Project Briefs
├── /creative/uploads           - Upload Files
├── /creative/revisions         - Review & Revisions
├── /creative/approved          - Approved Projects
├── /creative/notifications     - Notifications
└── /creative/profile           - My Profile

Marketing Manager               → /marketing
├── /marketing                  - Overview
├── /marketing/campaigns        - Campaigns
├── /marketing/whatsapp         - WhatsApp Marketing
├── /marketing/sms              - SMS Marketing
├── /marketing/contacts         - Contacts & Segments
├── /marketing/templates        - Message Templates
├── /marketing/schedule         - Campaign Schedule
├── /marketing/automation       - Automation
├── /marketing/analytics        - Campaign Analytics
└── /marketing/settings         - Settings

Store Manager / Merchant        → /store
├── /store                      - Overview
├── /store/manage               - My Store
├── /store/products             - Products
├── /store/categories           - Categories
├── /store/orders               - Orders
├── /store/customers            - Customers
├── /store/inventory            - Inventory
├── /store/discounts            - Discounts
├── /store/analytics            - Store Analytics
├── /store/settings             - Store Settings
└── /store/subscription         - Subscription

Finance Manager                 → /finance
├── /finance                    - Overview
├── /finance/invoices           - Invoices
├── /finance/payments           - Payments
├── /finance/expenses           - Expenses
├── /finance/revenue            - Revenue
├── /finance/reports            - Financial Reports
└── /finance/transactions       - Transactions
```

## Seeded Businesses (4)

| Name | Slug | Status |
|------|------|--------|
| Cafe Mogadishu | cafe-mogadishu | ACTIVE |
| Somali Mart | somali-mart | ACTIVE |
| Hargeisa Digital Shop | hargeisa-digital-shop | ACTIVE |
| New Supply Co. | new-supply-co | PENDING_APPROVAL |

## Seeded Stores (3)

| Name | Slug | City | Industry | Products |
|------|------|------|----------|----------|
| Cafe Mogadishu Online Store | cafe-mogadishu-store | Mogadishu | Food & Beverage | 4 |
| Somali Mart Grocery Store | somali-mart-store | Mogadishu | Retail | 4 |
| Hargeisa Digital Store | hargeisa-digital-store | Hargeisa | Electronics | 4 |

## Public API Endpoints (no auth)

- `GET /api/stores/public` — List all active stores
- `GET /api/stores/public/slug/:slug` — Get single store by slug
- `GET /api/health` — Health check

## Auth API

- `POST /api/auth/login` — Email + password login
- `POST /api/auth/register` — Register new user
- `POST /api/auth/supabase` — Supabase token login
- `GET /api/auth/me` — Get current user (auth required)

## How to Run

**Backend:**
```bash
cd backend
npx tsx src/index.ts
# Server runs on http://localhost:4000
```

**Frontend:**
```bash
cd web
npm run dev
# Frontend runs on http://localhost:3001
```

**Access dashboards:**
- Platform Admin: `http://localhost:3001/admin`
- Business Owner: `http://localhost:3001/dashboard`
- Staff: `http://localhost:3001/staff`
- Creative: `http://localhost:3001/creative`
- Marketing: `http://localhost:3001/marketing`
- Store: `http://localhost:3001/store`
- Finance: `http://localhost:3001/finance`

> ⚠️ These are **development/test credentials only**. Do not use in production.
