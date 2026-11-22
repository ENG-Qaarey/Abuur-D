# ABUUR DIGITAL — COMPLETE FIVE-MODULE DEVELOPMENT MASTER PROMPT

## 1. PROJECT OVERVIEW

You are a senior SaaS software architect, full-stack developer, database engineer, UI/UX designer, and application security specialist.

Your task is to develop and integrate all five core modules of **ABUUR DIGITAL**, a professional Digital Creative & Growth platform designed to help businesses manage their operations, creative production, marketing, online stores, finances, and performance from one platform.

**Brand:** ABUUR DIGITAL  
**Tagline:** Abuur. Kobac.  
**Positioning:** Digital Creative & Growth  
**Target Market:** Somali businesses, entrepreneurs, agencies, retailers, and growing companies.

ABUUR DIGITAL is not just a social media management tool. It is a complete multi-tenant SaaS business management and digital growth platform.

### Main Objective

Build one connected platform where businesses can:

- Manage customers, leads, sales, and services.
- Request and manage creative projects.
- Communicate with customers through WhatsApp and SMS.
- Create online stores and manage products and orders.
- Manage revenue, expenses, payments, and subscriptions.
- Analyze business performance through reports and analytics.

All five modules must share the same authentication system, business data, permissions, notification system, and platform architecture.

> ## ✅ Implementation status — 2026-11-22
> **✅ = built in the backend API (database + endpoints + permissions) and passed the end-to-end test suite** (196/196 checks: all five modules, workflows A–E, tenant isolation). Items without ✅ are not finished.
>
> **Not done yet:**
> - **Screens (frontend)** for the new features: the web app still needs pages for CRM pipeline, creative workflow, campaigns, storefront cart/checkout, finance & reports. The backend they need is ready.
> - **Live database:** the migration `backend/prisma/migrations/20261122000000_five_modules` is tested but **not yet applied to Supabase** (run `cd backend; npx prisma migrate deploy`).
> - Payment-provider reconciliation (EVC Plus / Zaad / card), email sending (no SMTP yet), WhatsApp media templates, attaching files to individual tasks, payment adjustments, plan-based limits (e.g. number of stores), HTTPS for custom domains (hosting side), report filters beyond date range, asynchronous export of very large reports, audited platform-admin access to private business data.
> - **Credentials needed to go live:** WhatsApp (Meta access token, phone number ID, WABA ID, app secret, webhook verify token), Twilio (account SID, auth token, sender), `PUBLIC_API_URL`, `CREDENTIALS_KEY`, `STORE_DOMAIN_TARGET`.

---

## 2. IMPORTANT DEVELOPMENT RULES

Before writing or modifying code:

1. Inspect the entire existing repository.
2. Understand the current frontend, backend, database, authentication, API structure, and folder organization.
3. Read the existing database schema and migrations.
4. Identify existing features and reusable components.
5. Identify incomplete, duplicated, broken, or insecure implementations.
6. Prepare an implementation plan before making major architectural changes.
7. Preserve working functionality.
8. Do not create duplicate models, APIs, components, or services when equivalent implementations already exist.
9. Do not replace the existing architecture without a clear technical reason.
10. Implement real backend functionality, not just frontend screens.

**Critical:** Never assume that a feature is implemented because its page or button exists. Verify its actual functionality from frontend to backend to database.

Do not:
- Use fake statistics or hardcoded business data.
- Create nonfunctional buttons.
- Use mock data as production data.
- Leave important actions as TODOs.
- expose data belonging to another business.
- Put business authorization logic only in the frontend.
- Automatically claim that a payment or message was successful without provider confirmation.

If an external integration requires API credentials, build its configuration, connection status, validation, and error handling. Clearly identify the credentials needed to activate it.

---

# MODULE 1: CRM & BUSINESS MANAGEMENT

## Objective

Build a complete CRM and business management system that allows each business to manage customers, leads, sales opportunities, services, subscriptions, payments, staff, and daily operations.

### 1.1 Client & Lead Management

Implement a complete customer and lead management system.

Features:
- Create, view, edit, archive, and search clients. ✅
- Store customer name, phone, email, address, company, and notes. ✅
- Create and manage potential leads. ✅
- Record lead source, interest, assigned employee, priority, and status. ✅
- Track customer communication and interaction history. ✅
- Add internal notes and follow-up reminders. ✅
- Assign clients and leads to staff. ✅
- Convert qualified leads into customers. ✅
- Prevent duplicate customer records where appropriate. ✅
- Filter and export customer and lead records. ✅

Suggested lead statuses:
- New ✅
- Contacted ✅
- Qualified ✅
- Proposal Sent ✅
- Negotiation ✅
- Converted ✅
- Lost ✅

### 1.2 Sales Pipeline

Create a visual sales pipeline that allows businesses to track opportunities from initial contact to successful conversion.

Features:
- Customizable pipeline stages. ✅
- Kanban-style sales board. ✅ (board data API; screen not built)
- Move opportunities between stages. ✅
- Assign sales representatives. ✅
- Record expected deal value. ✅
- Set expected closing dates. ✅
- Add activities and follow-up tasks. ✅
- Track lost and won opportunities. ✅
- Calculate pipeline value and conversion rates. ✅
- Maintain a complete opportunity history. ✅

### 1.3 Service Packages & Subscriptions

Allow businesses to create and sell their own services and packages.

Features:
- Create service packages. ✅
- Package name, description, price, duration, and included services. ✅
- One-time, monthly, quarterly, and yearly billing options. ✅
- Assign packages to customers. ✅
- Create customer subscriptions. ✅
- Track start date, renewal date, and expiration date. ✅
- Support active, pending, expired, cancelled, and suspended statuses. ✅
- Allow package upgrades and downgrades. ✅
- Maintain subscription history. ✅
- Send renewal reminders. ✅
- Track recurring revenue. ✅

Important: These are subscriptions sold by individual businesses to their customers. Keep them separate from ABUUR's own platform subscription billing.

### 1.4 Payment & Renewal Tracking

Implement customer payment management.

Features:
- Record customer payments. ✅
- Support partial and full payments. ✅
- Track outstanding balances. ✅
- Link payments to invoices, services, and subscriptions. ✅
- Record payment method and transaction reference. ✅
- Track due dates and overdue payments. ✅
- Generate payment receipts. ✅
- Record refunds and payment adjustments with authorization.
- Send payment and renewal reminders. ✅
- Maintain payment history. ✅
- Reconcile payment status with connected providers where available.

Do not mark a payment as successful simply because a user clicked a payment button.

### 1.5 User Roles & Permissions

Build a flexible role-based access control system.

Support:
- Business Owner ✅
- Business Admin ✅
- Manager ✅
- Employee ✅
- Accountant ✅
- Sales Representative ✅
- Custom Roles ✅

Features:
- Invite employees. ✅
- Assign roles. ✅
- Configure module-level permissions. ✅
- Configure action-level permissions. ✅
- Restrict access to sensitive financial information. ✅
- Assign records to specific staff. ✅
- Activate, deactivate, and remove memberships. ✅
- Maintain permission and membership history. ✅

Business owners must be able to control what their employees can view, create, edit, approve, delete, export, and manage.

### 1.6 CRM Admin Dashboard

Create a business management overview containing:
- Total customers. ✅
- New leads. ✅
- Active deals. ✅
- Sales pipeline value. ✅
- Converted leads. ✅
- Active customer subscriptions. ✅
- Upcoming renewals. ✅
- Outstanding payments. ✅
- Recent customer activities. ✅
- Upcoming tasks and follow-ups. ✅
- Sales performance. ✅

Provide date filters and business-specific data.

---

# MODULE 2: CREATIVE PRODUCTION & APPROVAL

## Objective

Build a complete creative project management and production workflow connecting businesses, clients, designers, content creators, and creative teams.

The module must support the entire process from a content request to final approved delivery.

### 2.1 Content Requests & Briefs

Allow businesses and authorized clients to submit creative requests.

Request types may include:
- Social media posts. ✅
- Social media campaigns. ✅
- Posters and flyers. ✅
- Logos and branding. ✅
- Video editing. ✅
- Advertisements. ✅
- Marketing materials. ✅
- Other custom creative services. ✅

Each request should support:
- Request title. ✅
- Description. ✅
- Creative category. ✅
- Required platform. ✅
- Target audience. ✅
- Design dimensions or format. ✅
- Reference files. ✅
- Text and content requirements. ✅
- Preferred deadline. ✅
- Priority. ✅
- Assigned package or service. ✅
- Request status. ✅

Create a structured creative brief form.

### 2.2 Project & Task Management

Features:
- Convert approved requests into projects. ✅
- Create projects manually. ✅
- Organize projects by business and client. ✅
- Create tasks and subtasks. ✅
- Assign team members. ✅
- Set deadlines and priorities. ✅
- Track project progress. ✅
- Add internal comments. ✅
- Attach files to tasks.
- Track task status and history. ✅

Suggested project statuses:
- New Request
- Pending Review
- Approved
- In Progress
- Internal Review
- Client Review
- Revision Requested
- Approved for Delivery
- Completed
- Cancelled ✅

### 2.3 Team Assignment & Deadlines

Features:
- Assign designers, editors, and team members. ✅
- Assign multiple members to a project. ✅
- Set individual task deadlines. ✅
- Track workloads. ✅
- View project calendars. ✅ (calendar data API)
- Track overdue tasks. ✅
- Notify assigned members. ✅
- Record completion history. ✅
- Allow managers to reassign work. ✅

### 2.4 File Uploads & Media Library

Build a centralized media library.

Features:
- Upload images, videos, documents, and creative files. ✅
- Organize files by project, business, client, and category. ✅
- Support file previews where possible. ✅
- Track file versions. ✅
- Add descriptions and metadata. ✅
- Download authorized files. ✅
- Search and filter files. ✅
- Store file size, type, uploader, and upload date. ✅
- Use secure storage and access-controlled file URLs. ✅

Validate file types and sizes. Do not expose private files through unrestricted public URLs.

### 2.5 Client Review & Approval

Create a review and approval workflow.

Features:
- Share creative work with authorized reviewers. ✅
- Display submitted previews. ✅
- Allow clients to approve or request revisions. ✅
- Add comments and feedback. ✅
- Support approval deadlines. ✅
- Notify creative teams about client decisions. ✅
- Maintain a full review history. ✅
- Record reviewer identity and approval timestamp. ✅

Only authorized users should approve or reject creative work.

### 2.6 Revisions & Final Delivery

Features:
- Allow revision requests. ✅
- Record revision instructions. ✅
- Track revision count. ✅
- Upload updated versions. ✅
- Compare previous and current versions where possible. ✅
- Notify assigned designers. ✅
- Require final approval before final delivery. ✅
- Mark approved files as final. ✅
- Provide secure final download links. ✅
- Maintain delivery history. ✅

The workflow must clearly distinguish draft files, review versions, approved versions, and final deliverables.

---

# MODULE 3: WHATSAPP MARKETING & SMS

## Objective

Build a professional communication and marketing module that allows businesses to manage contacts, create campaigns, send messages, automate communication, and monitor campaign performance through supported WhatsApp and SMS integrations.

### 3.1 WhatsApp API & SMS Integration

Implement integration management for:

- Meta WhatsApp Business Platform / Cloud API. ✅
- Supported SMS providers. ✅ (Twilio)
- Additional providers through a reusable integration architecture. ✅

Features:
- Connect business WhatsApp accounts. ✅
- Configure and validate credentials securely. ✅
- Manage phone number IDs and business account IDs. ✅
- Check connection status. ✅
- Handle webhook events. ✅
- Process incoming and outgoing messages. ✅
- Track provider errors. ✅
- Support message status updates. ✅
- Support SMS provider configuration. ✅
- Allow businesses to disconnect integrations safely. ✅

Never expose API secrets in frontend code or logs.

Use official provider APIs and follow their policies, message templates, rate limits, and consent requirements.

### 3.2 Contact Management & Segmentation

Features:
- Add and import contacts. ✅
- Store contact names, phone numbers, email addresses, and custom fields. ✅
- Organize contacts into groups. ✅
- Create dynamic and static segments. ✅
- Filter by location, tags, interests, customer status, and other available attributes. ✅
- Import CSV files with validation. ✅
- Detect duplicates. ✅
- Track contact source. ✅
- Manage contact subscription and consent status. ✅
- Export authorized contact lists. ✅

Example segments:
- New Customers
- Existing Customers
- Potential Customers
- VIP Customers
- Inactive Customers
- Customers with Pending Payments

### 3.3 Message Templates

Features:
- Create reusable WhatsApp and SMS templates. ✅
- Organize templates by category. ✅
- Support text, approved variables, and supported media.
- Add personalization variables. ✅
- Preview messages before sending. ✅
- Manage template status. ✅
- Support Meta-approved WhatsApp templates where required. ✅
- Track template approval and rejection. ✅
- Prevent use of unavailable or rejected provider templates. ✅

### 3.4 Campaign Creation & Scheduling

Create a complete campaign builder.

Workflow:
1. Create campaign. ✅
2. Select WhatsApp or SMS. ✅
3. Choose an approved message template or compose permitted content. ✅
4. Select audience or segment. ✅
5. Preview recipients and estimated cost where provider pricing data is available. ✅
6. Validate consent and opt-outs. ✅
7. Schedule or send immediately. ✅
8. Display campaign progress. ✅
9. View delivery and performance reports. ✅

Features:
- Draft campaigns. ✅
- Schedule campaigns. ✅
- Pause or cancel eligible scheduled campaigns. ✅
- Send campaigns in controlled batches. ✅
- Prevent duplicate campaign execution. ✅
- Track campaign ownership. ✅
- Maintain campaign history. ✅

### 3.5 Automated Messaging

Build an automation engine with configurable triggers and actions.

Possible triggers:
- New customer created. ✅
- New lead received. ✅
- Payment received. ✅
- Payment overdue. ✅
- Subscription approaching renewal. ✅
- Subscription expired. ✅
- New store order. ✅
- Order status changed. ✅
- Creative project approved. ✅
- Customer inactivity. ✅

Possible actions:
- Send WhatsApp message. ✅
- Send SMS. ✅
- Create a follow-up task. ✅
- Notify a business employee. ✅
- Update a customer status. ✅

Features:
- Enable and disable automation rules. ✅
- Configure delays. ✅
- Configure conditions. ✅
- View automation execution history. ✅
- Handle errors and retries. ✅
- Prevent duplicate execution. ✅
- Provide test mode where practical. ✅

### 3.6 Delivery Tracking & Analytics

Track:
- Total messages attempted. ✅
- Accepted by provider. ✅
- Sent. ✅
- Delivered. ✅
- Read, where supported. ✅
- Failed. ✅
- Pending. ✅
- Replied, where reliably measurable. ✅

Display:
- Campaign performance. ✅
- Delivery rate. ✅
- Failure rate. ✅
- Engagement metrics where available. ✅
- Campaign comparison. ✅
- Message costs where provider billing information is available. ✅

Clearly distinguish provider-confirmed statuses from estimates.

### 3.7 Consent & Opt-out Management

This is a mandatory part of the module.

Features:
- Record how and when consent was obtained. ✅
- Store consent source and timestamp. ✅
- Support unsubscribe and opt-out requests. ✅
- Maintain suppression lists. ✅
- Prevent marketing messages to opted-out contacts. ✅
- Handle supported STOP or unsubscribe keywords. ✅
- Respect WhatsApp messaging windows and template requirements. ✅
- Allow contacts to update communication preferences. ✅ (STOP / START replies)
- Maintain consent and opt-out audit history. ✅

The campaign sending service must check consent and suppression rules immediately before sending.

---

# MODULE 4: STORES & E-COMMERCE

## Objective

Build an e-commerce system that allows businesses and merchants to create online stores, manage products, sell through storefronts, receive orders, and coordinate order fulfillment.

The architecture should support business-owned stores and independently managed merchant stores where the product's business rules permit.

### 4.1 Store Creation & Store Profile

Features:
- Create a store. ✅
- Store name and description. ✅
- Store logo and cover image. ✅
- Contact details. ✅
- Business information. ✅
- Store address and location. ✅
- Social media links. ✅
- Store operating status. ✅
- Store currency and regional settings. ✅
- Store policies. ✅
- Store branding and configuration. ✅
- Store ownership and member management. ✅

Support multiple stores per business if permitted by its plan and entitlements.

### 4.2 Store Link & Custom Domain Support

Features:
- Generate a unique public store URL. ✅
- Validate unique store slugs. ✅
- Allow store owners to configure their store link. ✅
- Support custom domain configuration. ✅
- Validate domain ownership. ✅
- Display DNS configuration instructions. ✅
- Verify domain status. ✅
- Support secure HTTPS provisioning through the hosting infrastructure.
- Allow owners to manage domain connections. ✅

Do not claim a domain is active until verification and deployment configuration succeed.

### 4.3 Product Catalog & Categories

Features:
- Create, edit, archive, and manage products. ✅
- Product name and description. ✅
- SKU and product code. ✅
- Product images and gallery. ✅
- Product categories. ✅
- Product tags. ✅
- Product variants. ✅
- Product status. ✅
- Product specifications. ✅
- Search and filtering. ✅
- Bulk product import and export. ✅

Support physical and digital products if appropriate for the existing business requirements.

### 4.4 Pricing, Images & Stock Management

Features:
- Regular price. ✅
- Sale price. ✅
- Product cost. ✅
- SKU. ✅
- Stock quantity. ✅
- Low-stock threshold. ✅
- Stock status. ✅
- Product variants and variant-level stock. ✅
- Stock adjustment history. ✅
- Inventory movement records. ✅
- Track who changed inventory. ✅
- Prevent invalid stock reductions. ✅
- Support out-of-stock and backorder rules where configured. ✅

Do not use product cost or internal margins in public storefront responses.

### 4.5 Online Storefront

Build a public-facing storefront for customers.

Features:
- Store homepage.
- Store profile and branding. ✅ (API)
- Product listing. ✅ (API)
- Product detail pages. ✅ (API)
- Product categories. ✅
- Product images and galleries. ✅ (API)
- Search and filtering. ✅
- Shopping cart.
- Checkout. ✅ (API)
- Customer information. ✅ (API)
- Delivery information. ✅ (API)
- Order confirmation. ✅ (API)
- Mobile-responsive experience.
- SEO-friendly product and store pages.

Use real store and product data from the backend.

Public storefront access must never expose private business records, internal inventory notes, or sensitive financial information.

### 4.6 Order Management & Tracking

Features:
- Receive new orders. ✅
- View order details. ✅
- Manage order items. ✅
- Customer information. ✅ (API)
- Payment status. ✅
- Fulfillment status. ✅
- Delivery address. ✅
- Order notes. ✅
- Update order status. ✅
- Track order history. ✅
- Assign fulfillment staff. ✅
- Record delivery information. ✅
- Cancel orders with authorization. ✅
- Handle refunds and returns where supported. ✅
- Notify customers about important order updates. ✅ (through automation rules)

Suggested order statuses:
- Pending ✅
- Confirmed ✅
- Processing ✅
- Ready for Delivery ✅
- Shipped ✅
- Delivered ✅
- Cancelled ✅
- Returned ✅

Keep payment status separate from fulfillment status.

### 4.7 WhatsApp Order Handoff

Allow customers to continue an order conversation through WhatsApp.

Features:
- Configure the store's WhatsApp number. ✅
- Add WhatsApp order handoff buttons.
- Generate a structured order summary. ✅
- Include product names, quantities, and order reference. ✅
- Open a WhatsApp conversation using a correctly encoded message. ✅
- Allow store staff to manage the conversation. ✅

Where supported and authorized, integrate WhatsApp order events with the store order workflow.

Do not mark an order as paid simply because a WhatsApp message was opened or sent.

### 4.8 Dropshipping Product Management

Build dropshipping support as a structured product sourcing and fulfillment feature.

Features:
- Supplier management. ✅
- Supplier contact information. ✅
- Supplier product catalog. ✅
- Supplier product cost. ✅
- Reseller selling price. ✅
- Product markup and margin calculation. ✅
- Link reseller products to supplier products. ✅
- Track supplier stock where available. ✅
- Create supplier purchase or fulfillment requests. ✅
- Track supplier fulfillment status. ✅
- Record tracking references. ✅
- Calculate estimated profit. ✅
- Handle supplier errors and stock changes. ✅

Do not assume supplier APIs exist. Support manual supplier management first and add provider integrations through explicit configuration.

---

# MODULE 5: FINANCE, ANALYTICS & REPORTING

## Objective

Build a business finance and reporting module that allows each business to understand its revenue, expenses, payments, subscriptions, marketing results, store sales, and overall performance.

Important: This module represents the individual business's finances. It must remain separate from ABUUR DIGITAL's own platform revenue, subscriptions, and billing.

### 5.1 Revenue & Expense Management

Features:
- Record business revenue. ✅
- Record business expenses. ✅
- Create financial categories. ✅
- Add descriptions and references. ✅
- Record payment method. ✅
- Record transaction date. ✅
- Attach receipts and documents. ✅
- Track recurring expenses. ✅
- Edit or reverse transactions with proper permissions and audit history. ✅
- Filter transactions by date, category, type, and status. ✅
- Export financial records. ✅

Show:
- Total revenue. ✅
- Total expenses. ✅
- Net profit. ✅
- Outstanding balances. ✅
- Revenue trends. ✅
- Expense breakdown. ✅

Clearly label net profit as calculated from the recorded financial data, not necessarily audited accounting profit.

### 5.2 Client Payment Tracking

Features:
- View customer invoices. ✅
- Track paid, partially paid, pending, and overdue invoices. ✅
- Track outstanding balances. ✅
- Connect payments to customers and services. ✅
- Generate payment receipts. ✅
- Track payment history. ✅
- Display upcoming payment deadlines. ✅
- Send payment reminders. ✅
- Support manual payment recording and configured payment-provider reconciliation.

Prevent duplicate payment recording and maintain transaction references.

### 5.3 Subscription Reports

Generate reports for subscriptions sold by the business.

Include:
- Active subscriptions. ✅
- New subscriptions. ✅
- Expired subscriptions. ✅
- Cancelled subscriptions. ✅
- Upcoming renewals. ✅
- Renewal success rate. ✅
- Recurring revenue. ✅
- Subscription revenue by package. ✅
- Customer subscription history. ✅

Keep these reports separate from ABUUR platform subscription analytics.

### 5.4 Marketing Campaign Reports

Generate marketing reports based on actual campaign records and provider events.

Include:
- Campaign count. ✅
- Total recipients. ✅
- Messages attempted. ✅
- Delivered messages. ✅
- Failed messages. ✅
- Read messages where available. ✅
- Campaign performance over time. ✅
- Channel comparison. ✅
- Segment performance.
- Campaign cost where available. ✅
- Engagement and conversion metrics only where reliable tracking exists. ✅

Do not invent sales attribution or conversion rates without a valid tracking method.

### 5.5 Store Sales Reports

Generate store and e-commerce reports.

Include:
- Total orders. ✅
- Gross sales. ✅
- Net sales where properly calculated. ✅
- Paid and unpaid orders. ✅
- Cancelled orders. ✅
- Returned orders. ✅
- Average order value. ✅
- Best-selling products. ✅
- Sales by category. ✅
- Sales by date. ✅
- Inventory performance. ✅
- Low-stock products. ✅
- Product cost and margin where available. ✅
- Dropshipping performance. ✅

Avoid double-counting revenue when an order payment is already recorded in financial transactions.

### 5.6 Business Performance Dashboard

Create a unified business performance overview.

Display:
- Total revenue. ✅
- Total expenses. ✅
- Net profit. ✅
- Customer growth. ✅
- Lead conversion. ✅
- Active subscriptions. ✅
- Outstanding payments. ✅
- Creative project progress. ✅
- Marketing campaign performance. ✅
- Store sales. ✅
- Recent business activities. ✅
- Upcoming tasks and renewals. ✅

Allow date range selection:
- Today ✅
- Last 7 days ✅
- Last 30 days ✅
- Last 90 days ✅
- This month ✅
- Last month ✅
- This year ✅
- Custom date range ✅

All metrics must come from actual authorized business data.

### 5.7 Report Export

Support professional report generation.

Formats:
- PDF ✅
- Excel (XLSX) ✅
- CSV ✅

Report types:
- Financial reports. ✅
- Revenue and expense reports. ✅
- Customer reports. ✅
- Lead and sales reports. ✅
- Subscription reports. ✅
- Marketing reports. ✅
- Store sales reports. ✅
- Inventory reports. ✅
- Creative project reports. ✅
- Business performance reports. ✅

Features:
- Select date range. ✅
- Select report type. ✅
- Apply filters.
- Preview before export. ✅
- Include business name and reporting period. ✅
- Include generation date. ✅
- Include relevant totals and summaries. ✅
- Respect user permissions. ✅
- Generate large reports asynchronously where necessary.
- Record export activity. ✅

---

# 3. SHARED PLATFORM ARCHITECTURE

All five modules must work together through one shared platform.

### Shared Core Services

Build or reuse these shared services:

1. Authentication and session management. ✅
2. Business and tenant management. ✅
3. Business membership management. ✅
4. Role-based permissions. ✅
5. Notification service. ✅ (in-app)
6. File and media storage. ✅
7. Search and filtering. ✅
8. Audit logging. ✅
9. Integration management. ✅
10. Background jobs and scheduling. ✅
11. Reporting and export service. ✅
12. Subscription and entitlement management.

### Main Data Relationships

Use a consistent relational architecture.

Core entities may include:

- User ✅
- Business ✅
- BusinessMember ✅ (BusinessMembership)
- Role ✅ (BusinessRole)
- Permission ✅ (module permissions on BusinessRole)
- BusinessInvitation ✅
- BusinessSettings ✅ (Business.settings)
- Plan ✅
- PlatformSubscription ✅ (Subscription)
- ModuleEntitlement
- Payment ✅
- Invoice ✅
- Notification ✅
- AuditLog ✅

CRM:
- Customer ✅ (CRMCustomer)
- Lead ✅
- Pipeline ✅
- PipelineStage ✅
- Deal ✅ (+ DealStageChange history)
- Task ✅ (CrmTask)
- Activity ✅ (ClientCommunication)
- ServicePackage ✅
- CustomerSubscription ✅ (ClientSubscription + ClientSubscriptionEvent)

Creative:
- CreativeRequest ✅
- CreativeBrief ✅ (brief fields on CreativeRequest)
- CreativeProject ✅
- ProjectTask ✅ (CreativeTask, with subtasks)
- ProjectAssignment ✅ (ProjectMember)
- CreativeFile ✅ (FileAsset + CreativeDeliverable)
- ProjectComment ✅
- ProjectRevision ✅ (deliverable versions)
- ProjectApproval ✅ (CreativeReview)

Marketing:
- WhatsAppConnection ✅ (IntegrationConnection + WhatsAppAccount)
- SMSConnection ✅ (IntegrationConnection)
- MarketingContact ✅
- ContactSegment ✅
- Campaign ✅
- CampaignRecipient ✅
- MessageTemplate ✅
- AutomationRule ✅
- AutomationExecution ✅
- MessageLog ✅
- OptOut ✅ (ContactConsentEvent + suppression list)

Store:
- Store ✅
- StoreMember ✅ (business membership)
- Product ✅
- ProductCategory ✅
- ProductVariant ✅
- Supplier ✅ (SupplierProfile)
- SupplierProduct ✅
- ResellerProduct ✅
- Order ✅ (StoreOrder)
- OrderItem ✅ (StoreOrderItem)
- OrderFulfillment ✅

Finance and reporting:
- BusinessTransaction ✅ (FinanceTransaction)
- BusinessExpense ✅ (FinanceTransaction type EXPENSE)
- BusinessInvoice ✅ (Invoice)
- BusinessPayment ✅ (Payment)
- FinancialCategory ✅
- FinancialAccount
- ReportExport ✅

These are proposed domain entities, not instructions to duplicate existing tables. Inspect the current schema and reuse or adapt existing models. Resolve shared entities carefully, especially customers, invoices, payments, notifications, and files.

### Important Relationship Rules

- A user can belong to multiple businesses. ✅
- A business can have multiple users and staff members. ✅
- A business owns its CRM, creative, marketing, finance, and business data. ✅
- A business can have multiple stores if permitted. ✅
- Store orders must belong to the correct store. ✅
- Creative projects must belong to the correct business. ✅
- Campaigns must belong to the correct business and connected channel. ✅
- Business payments must not be confused with ABUUR platform payments. ✅
- Every sensitive operation must verify the user's membership and permissions. ✅

---

# 4. MULTI-TENANT SECURITY REQUIREMENTS

This is one of the most important parts of the project.

ABUUR DIGITAL must use secure multi-tenant architecture.

### Mandatory Security Rules

1. Every business-owned resource must be scoped to the authenticated user's authorized business membership. ✅
2. Never trust a client-supplied `businessId` as proof of authorization. ✅
3. Validate tenant ownership on the server for every read, update, delete, export, and file access. ✅
4. Implement resource-level authorization, not just authentication. ✅
5. Apply role and permission checks to sensitive actions. ✅
6. Prevent cross-business data access. ✅
7. Use default-deny authorization. ✅
8. Protect file uploads and downloads. ✅
9. Validate external webhooks. ✅
10. Store API secrets securely. ✅
11. Add rate limiting to sensitive endpoints. ✅
12. Maintain immutable or tamper-resistant audit records for critical operations. ✅
13. Protect exports from unauthorized data access. ✅
14. Ensure background jobs preserve the correct tenant context. ✅
15. Never add broad authentication decorators without business ownership checks. ✅

Platform administrators and business users have different permissions.

Platform Admin access to private business content must be explicitly permissioned, limited to legitimate support or operational needs, and audited.

### Platform Billing vs Business Finance

Maintain separate financial domains:

**ABUUR Platform Finance**
- Platform plans. ✅
- Platform subscriptions. ✅
- Platform payments.
- Platform invoices.
- Platform revenue.

**Individual Business Finance**
- Customer payments. ✅
- Business revenue. ✅
- Business expenses. ✅
- Merchant sales. ✅
- Business invoices. ✅
- Business profit. ✅

Never combine these two financial systems in the same totals without an explicitly labeled consolidated report.

---

# 5. WORKFLOW INTEGRATION BETWEEN MODULES

The modules must not operate as disconnected features.

Implement the following cross-module workflows:

### Workflow A: New Customer to Sale ✅

1. A business creates a lead.
2. A sales representative contacts the lead.
3. The lead moves through the sales pipeline.
4. The lead converts into a customer.
5. The customer purchases a service package.
6. A subscription or invoice is created.
7. Payment is recorded or confirmed.
8. The CRM updates the customer history.
9. Relevant notifications are sent.

### Workflow B: Creative Request to Final Delivery ✅

1. A customer submits a creative request.
2. The business reviews the brief.
3. A project is created.
4. A creative manager assigns a designer.
5. Tasks and deadlines are created.
6. The designer uploads work.
7. The client reviews the work.
8. The client approves or requests revisions.
9. The team completes revisions if necessary.
10. Final files are delivered.
11. The project is marked completed.
12. The customer and assigned team receive notifications.

### Workflow C: Marketing Campaign ✅

1. The business connects WhatsApp or SMS.
2. Contacts are imported or created.
3. Contacts are organized into segments.
4. A campaign is created.
5. The message template is selected.
6. Consent and opt-out rules are checked.
7. The campaign is scheduled or sent.
8. Background workers process delivery.
9. Provider events update message statuses.
10. Marketing reports display actual campaign results.

### Workflow D: Store Order ✅

1. A merchant creates a store.
2. Products are added.
3. Customers browse the storefront.
4. A customer places an order.
5. Stock is validated and reserved or adjusted according to the order workflow.
6. The store receives an order notification.
7. Staff confirm and process the order.
8. Payment is recorded or confirmed.
9. Fulfillment and delivery are tracked.
10. The order is completed.
11. Sales and inventory reports are updated.
12. Relevant financial records are updated without double-counting.

### Workflow E: Business Financial Reporting ✅

1. Customer payments are recorded.
2. Store payments are recorded.
3. Business expenses are recorded.
4. Subscription transactions are recorded.
5. Financial reports aggregate the relevant records.
6. Dashboard metrics are updated.
7. Authorized users generate and export reports.

Use transactional database operations where multiple records must remain consistent.

---

# 6. USER WORKSPACES AND NAVIGATION

Build role-aware navigation within the existing application.

Suggested workspaces:

- Platform Admin: `/admin`
- Business Owner: `/dashboard`
- Business Staff: `/staff`
- Creative Team: `/creative`
- Marketing Manager: `/marketing`
- Store Manager: `/store`
- Finance Manager: `/finance`

These are proposed workspace routes. Reuse existing routes if they already exist.

The same user may have multiple business memberships or permissions. Provide an appropriate business/workspace switcher where required.

### Business Owner Navigation

- Overview
- CRM & Customers
- Leads & Sales
- Services & Subscriptions
- Creative Projects
- Marketing
- Stores
- Orders
- Finance
- Reports
- Team & Permissions
- Settings

Show only authorized features and actions.

---

# 7. TECHNICAL IMPLEMENTATION REQUIREMENTS

Follow the technology stack already established in the repository.

Do not introduce a new framework or replace working infrastructure without a documented reason.

### Frontend

- Reuse the existing frontend framework.
- Build reusable and maintainable components.
- Use clear feature-based organization.
- Implement responsive layouts.
- Support loading, empty, error, and success states.
- Implement form validation.
- Provide clear confirmation for destructive actions.
- Use real API data.
- Handle API errors consistently.
- Maintain accessibility and keyboard usability.

### Backend

- Use modular domain architecture. ✅
- Separate controllers, services, validation, and persistence logic.
- Apply authentication and authorization consistently. ✅
- Validate all incoming data. ✅
- Use transactions for critical workflows. ✅
- Implement pagination and filtering. ✅
- Add structured logging.
- Handle provider webhooks securely. ✅
- Implement scheduled and background jobs where necessary. ✅
- Document API contracts.

### Database

- Use relational models and foreign keys. ✅
- Add appropriate unique constraints. ✅
- Add indexes for frequently queried fields. ✅
- Use clear status enums. ✅
- Add timestamps and ownership relationships. ✅
- Use migrations for schema changes. ✅
- Preserve existing data. ✅
- Avoid unnecessary duplicate tables. ✅
- Use appropriate decimal precision for financial amounts. ✅
- Store currency explicitly where multi-currency support is required. ✅

### Background Processing

Use reliable workers or queues for:
- Scheduled marketing campaigns. ✅
- Message delivery. ✅
- Automation execution. ✅
- Renewal reminders. ✅
- Payment reminders. ✅
- Notification delivery. ✅ (in-app)
- Report generation.
- File processing.

Do not rely on an open browser session to execute scheduled tasks.

### Integrations

Create reusable integration adapters for:
- WhatsApp Business Platform. ✅
- SMS providers. ✅ (Twilio)
- Payment providers.
- Email services.
- File storage. ✅ (private Supabase Storage bucket)
- Custom domains. ✅ (DNS ownership check)

An integration must have clear connection status, configuration validation, error reporting, and safe credential storage.

---

# 8. TESTING AND QUALITY ASSURANCE

Test each module independently and test the complete connected workflows.

### Required Tests

- Authentication tests. ✅
- Role and permission tests. ✅
- Cross-business access prevention tests. ✅
- CRM CRUD and conversion tests. ✅
- Subscription and renewal tests. ✅
- Creative project lifecycle tests. ✅
- File access security tests. ✅
- Client approval and revision tests. ✅
- WhatsApp/SMS integration tests using safe test environments.
- Consent and opt-out tests. ✅
- Campaign scheduling and duplicate prevention tests. ✅
- Product and inventory tests. ✅
- Order lifecycle tests. ✅
- Payment and refund tests. ✅
- Financial calculation tests. ✅
- Report export tests. ✅
- Background job retry and failure tests.

### Critical Acceptance Criteria

The implementation is not complete until:

1. Users can only access their authorized businesses. ✅
2. All five modules work with real backend data.
3. The CRM can manage customers, leads, and sales. ✅
4. Creative projects can move from request to final delivery. ✅
5. Marketing campaigns respect consent and provider rules. ✅
6. Stores can manage products and orders. ✅
7. Business finance can track revenue and expenses. ✅
8. Reports calculate from actual records. ✅
9. Permissions are enforced by the backend. ✅
10. Cross-module workflows work correctly. ✅
11. Errors are handled and recorded. ✅
12. Existing working features remain functional. ✅

---

# 9. DEVELOPMENT EXECUTION PLAN

Do not attempt to implement everything through one uncontrolled code-generation operation.

Work in structured phases:

**Phase 1 — Repository Audit** ✅
- Inspect existing architecture.
- Review database models.
- Review authentication and permissions.
- Identify missing features and security problems.
- Produce an implementation plan.

**Phase 2 — Shared Core** ✅
- Business and membership architecture.
- Roles and permissions.
- Notifications.
- Audit logging.
- File storage. ✅ (private Supabase Storage bucket)
- Shared API and validation patterns.

**Phase 3 — CRM & Business Management** ✅ (backend; screens ⏳)
- Customers and leads.
- Sales pipeline.
- Services and subscriptions.
- Payments and renewals.
- Staff management.

**Phase 4 — Creative Production** ✅ (backend; screens ⏳)
- Requests and briefs.
- Projects and tasks.
- Team assignments.
- Media library.
- Reviews, approvals, and revisions.

**Phase 5 — WhatsApp Marketing & SMS** ✅ (backend; screens ⏳)
- Integration configuration.
- Contact management.
- Templates.
- Campaigns.
- Automation.
- Delivery tracking and consent.

**Phase 6 — Stores & E-commerce** ✅ (backend; screens ⏳)
- Store management.
- Products and inventory.
- Storefront.
- Orders.
- WhatsApp handoff.
- Dropshipping.

**Phase 7 — Finance & Reporting** ✅ (backend; screens ⏳)
- Revenue and expenses.
- Payment tracking.
- Subscription reports. ✅
- Marketing reports. ✅
- Store sales reports. ✅
- Business performance.
- Export functionality.

**Phase 8 — Integration and Quality Assurance**
- Connect all five modules.
- Test end-to-end workflows.
- Verify tenant isolation.
- Fix bugs.
- Improve performance.
- Document completed functionality.

After each phase:
- Run relevant tests.
- Run type checks.
- Run linting.
- Verify database migrations.
- Fix errors before proceeding.
- Update the implementation report.

---

# 10. FINAL EXPECTATION

Deliver a complete, integrated, secure, and production-ready ABUUR DIGITAL platform.

The final result must be a real working SaaS application, not a collection of attractive but disconnected dashboard pages.

Prioritize:

1. Correct business logic.
2. Data integrity.
3. Multi-tenant security.
4. Reliable integrations.
5. Maintainable architecture.
6. Complete user workflows.
7. Accurate analytics and financial calculations.
8. Excellent user experience.

At the end, provide a clear implementation report containing:

- Features completed in each module.
- Existing features reused.
- Database models created or modified.
- API endpoints created or modified.
- Integrations configured and integrations still requiring credentials.
- Security measures implemented.
- Tests executed and their results.
- Known limitations.
- Remaining tasks.

**Do not claim that a feature is complete unless it has been implemented and verified.**

The goal is to make ABUUR DIGITAL a dependable business platform where companies can manage their operations and digital growth from one place.

**ABUUR DIGITAL — Abuur. Kobac.**