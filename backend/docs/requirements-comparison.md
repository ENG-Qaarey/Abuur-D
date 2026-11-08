# ABUUR backend vs. requirement documents

_Compared 2026-11-06 against the backend in `backend/` after the `align_store_mvp` migration._

**Documents compared**

| Document | Role in this comparison |
|---|---|
| **ABUUR Store Development Plan** (6 pp.) | **Source of truth**: modules, 19 core tables, phases, MVP scope |
| ABUUR Digital MVP Features (Kooban) | 5-module feature checklist |
| ABUUR Project Document, Draft v1.0 | Wider vision; booking, coupons, loyalty and AI are **deferred** |

**Decisions recorded (owner, 2026-11-05)**
1. The Store Development Plan wins where the documents disagree.
2. Every store belongs to a business. There are no standalone stores; store staff = business members.
3. Order lifecycle: `NEW → CONFIRMED → PREPARING → READY → DISPATCHED → DELIVERED`, or `CANCELLED`.
4. Shoppers never pay inside ABUUR. The order is saved, handed off to the seller on WhatsApp, and payment is agreed off-platform.
5. Business owners choose an ABUUR plan themselves. ABUUR keeps billing records without a payment gateway.

Legend: ✅ in place · ⚠️ partial (data model ready, API/logic not built) · ❌ missing · ⏸ deferred by decision

---

## 1. Store Development Plan

### Module 1: Online Store Builder (build phase 2)
| Feature | Status | Where / note |
|---|---|---|
| Seller registration & login | ✅ | Supabase Auth → `POST /auth/verify-supabase`, user created on first login |
| Create & customise a store | ⚠️ | `Store` model; API still default-deny |
| Unique public store link | ✅ model | `Store.slug` (unique), `StoreDomain` for custom domains |
| Name, logo, description, contact details, **WhatsApp number** | ✅ model | `whatsappNumber`, `phone`, `email`, `address`, `city` added |
| Product catalogue: images, prices, descriptions, categories | ⚠️ | `Product`, `ProductCategory` |
| **Product variations (size, colour)** | ✅ model | New `ProductVariant` (own price/stock/SKU) |
| Availability & basic stock | ⚠️ | `Product.stock`, `ProductVariant.stock`, `InventoryMovement` |
| Mobile storefront, cart, checkout form | ❌ | Frontend (`Abuur/`) not started; public read + order endpoints needed |
| Shareable store / product links | ✅ model | slugs |
| Basic store settings | ⚠️ | `Store.settings` JSON |

### Module 2: Order Management (build phase 3)
| Feature | Status | Where / note |
|---|---|---|
| Save orders with store & customer info, items, totals | ⚠️ | `StoreOrder`, `StoreOrderItem` (name/price/variant snapshot), `StoreCustomer` |
| Status: New → … → Delivered / Cancelled | ✅ model | `OrderStatus` enum (decision 3) |
| Order tracking / history | ✅ model | New `StoreOrderStatusEvent` (who changed what, when) |
| Send order details to seller via WhatsApp | ⚠️ | `whatsappHandoffAt`; message + `wa.me` link to be built |
| Order history & search, seller dashboard, basic reports | ❌ | API/frontend not built |
| No online payment in MVP | ✅ | `paymentStatus` + new `paymentMethod`, `paymentNote` recorded by staff |

### Module 3: WhatsApp Automation & Marketing (build phase 6)
| Feature | Status | Where / note |
|---|---|---|
| Connect seller's WhatsApp Business number | ⚠️ | `IntegrationConnection` (provider WHATSAPP); spec asks for `whatsapp_connections` |
| New-order / confirmation / status notifications | ⚠️ | `WhatsAppService` + BullMQ `whatsapp` queue exist; no triggers |
| Configurable message templates | ✅ model | `MessageTemplate` (Meta approval status, variables) |
| Automation rules, scheduled follow-ups | ✅ model | `AutomationRule` (trigger, conditions, delay) |
| Contact records, consent, opt-out | ✅ model | `MarketingContact` (whatsapp/sms/email consent, `optedOutAt`) |
| Marketing campaigns | ⚠️ | `Campaign`, `CampaignRecipient` |
| Delivery / failure tracking | ⚠️ | `CampaignRecipient.status/deliveredAt/error`, `WebhookEvent`; general `message_logs` missing |

### Module 4: Dropshipping (build phase 5)
| Feature | Status |
|---|---|
| Suppliers, supplier catalogue, wholesale price & stock | ✅ model: `SupplierProfile`, `SupplierProduct` |
| Reseller discovery, add to store, selling price, margin | ✅ model: `ResellerProfile`, `ResellerProduct` |
| Track origin supplier, route orders, fulfilment status | ✅ model: `OrderFulfillment`, `StoreOrderItem.supplierProductId` |
| Supplier role / dashboard | ✅ model: a supplier is a business with a `SupplierProfile`; dashboard ❌ |

### Module 5: Platform Business Management (build phase 4)
| Feature | Status | Where / note |
|---|---|---|
| Central admin; approve / suspend / deactivate | ⚠️ | `PlatformRole` SUPER_ADMIN (+ new `ABUUR_STAFF`); business approve/suspend and user suspend endpoints exist; stores not yet |
| Configure subscription plans | ⚠️ | `Plan` model; API default-deny |
| Subscription status & **billing records** | ✅ model | `Subscription` (business-only) + new `SubscriptionBillingRecord` |
| Roles & permissions | ✅ | `MembershipRole` per business, `BusinessAccessGuard`, default-deny |
| Audit logs | ✅ | `AuditLog` written for business/member/user changes |
| Platform analytics & reports | ❌ | not built |

### Core tables (section 4 of the plan)
| Spec table | Backend | | Spec table | Backend |
|---|---|---|---|---|
| users | ✅ `User` | | customers | ✅ `StoreCustomer` |
| stores | ✅ `Store` | | orders | ✅ `StoreOrder` |
| store_members | ✅ via `BusinessMembership` (decision 2) | | order_items | ✅ `StoreOrderItem` |
| products | ✅ `Product` | | order_fulfillments | ✅ `OrderFulfillment` |
| categories | ✅ `ProductCategory` | | whatsapp_connections | ⚠️ `IntegrationConnection` |
| product_variants | ✅ `ProductVariant` | | message_templates | ✅ `MessageTemplate` |
| suppliers | ✅ `SupplierProfile` | | automation_rules | ✅ `AutomationRule` |
| supplier_products | ✅ `SupplierProduct` | | message_logs | ✅ `MessageLog` |
| reseller_products | ✅ `ResellerProduct` | | subscriptions | ✅ `Subscription` + billing records |
| | | | audit_logs | ✅ `AuditLog` |

**Security requirement** ("each seller only accesses their own stores, products, customers, orders; enforce on server **and** database"):
- Server: ✅ JWT verification, membership/role guard, default-deny, DTO validation.
- Database: ⚠️ RLS is enabled on every table with no policies, which blocks Supabase's public Data API. Per-tenant RLS policies are not written, and the API connects as owner. A follow-up is needed to fully meet "and database".

**Technical stack:** the plan suggests Next.js server APIs. We use a separate NestJS API with Supabase Auth, Postgres and Storage. The architecture layers are the same, so this is a deliberate deviation and not a gap.

---

## 2. MVP Features (Kooban), 5 modules

| Module | Status | Notes |
|---|---|---|
| 1. CRM & Business Management | ⚠️ | `Lead` (pipeline statuses), `CRMCustomer`, `Plan`/`Subscription`, roles ✅, admin endpoints partial |
| 2. Creative Production & Approval | ⚠️ | `CreativeRequest/Project/Task/Review`, `FileAsset` exist; API default-deny |
| 3. WhatsApp Marketing & SMS | ⚠️ | see Store plan module 3; SMS service + queue exist; templates missing |
| 4. WhatsApp Store & E-commerce | ⚠️ | see Store plan modules 1–2, 4 (dropshipping: data model ✅, API ❌) |
| 5. Finance, Analytics & Reporting | ⚠️ | `FinanceTransaction`, `Invoice`, `Payment`; reports/dashboards/export ❌ |

---

## 3. Project Document (Draft v1.0)

| Item | Status |
|---|---|
| Business accounts, dashboard, public page `abuur.so/business-name` | ⚠️ `Business.slug`, `Store.slug`; frontend not started |
| Orders `New → Confirmed → Preparing → Ready → Delivered/Cancelled` | ✅ matches decision 3 (plus `DISPATCHED`) |
| Roles: Super Admin, ABUUR Staff, Business Owner, Business Staff, Customer | ✅ SUPER_ADMIN, ABUUR_STAFF (new), OWNER…VIEWER; customers check out as guests (`StoreCustomer.userId` optional) |
| Multi-tenant data isolation, audit logs | ✅ |
| Subscription revenue model (e.g. Store $10/month, admin-configurable) | ✅ model (`Plan.price`, `interval`) |
| Consent / opt-in for WhatsApp & SMS | ✅ model |
| Booking system, doctors, availability | ⏸ deferred (decision 1) |
| Coupons, loyalty, retention automation, abandoned cart | ⏸ deferred |
| AI assistant, QR & smart links | ⏸ deferred |
| Payment gateway (Visa, Mastercard, mobile money) | ⏸ deferred: out of MVP in the Store plan and decision 4 |

---

## 4. Other findings

- **Auth provider (decided 2026-11-05):** keep **Supabase Auth**. Clerk and Better Auth were considered. Clerk was rejected because of per-user cost, users stored outside our database, and lock-in. Better Auth is the fallback only if Supabase phone/SMS login proves unreliable for Somali (+252) numbers.

- **Three customer tables:** `CRMCustomer` (business CRM), `StoreCustomer` (shoppers) and `MarketingContact` (campaign audience) are separate, so a shopper who orders is not automatically in the CRM or marketing list. Recommend linking them, e.g. by phone per business, when CRM and marketing are built.
- **Two payment meanings:** `Payment` is the business's own client payments (MVP Features module 5). ABUUR's income from businesses is `SubscriptionBillingRecord`. Keep them separate.
- **Plan limits** (`Plan.limits` JSON, e.g. max products) are not enforced anywhere yet. Enforce them when products and stores get their APIs.

## 5. Data model added 2026-11-06 (migration `crm_marketing_dropshipping`)

The owner's list of missing features, mapped to tables. **Data model only:** these tables exist in the database (RLS on), but their API endpoints are still default-deny until each phase builds them.

### CRM, creative production and client services
| Feature | Where |
|---|---|
| Client profiles, business information | `CRMCustomer` + status (LEAD → ONBOARDING → ACTIVE → AT_RISK → CHURNED), contact person, WhatsApp, industry, website, city/country, social links, tags, account manager |
| Client onboarding | `ClientOnboarding` + checklist `ClientOnboardingTask` |
| Service packages & subscriptions | `ServicePackage` (price, billing, deliverables, max revisions) and `ClientSubscription` (agreed price, start/end) |
| Projects & task management, staff assignment | `CreativeProject` (client, manager, stage), `CreativeTask.assignedToId`, `estimatedHours` |
| Deadlines & project tracking | `deadline` on request/project/task; `ProductionStage` on project and task |
| Client communication history | `ClientCommunication` (call, WhatsApp, SMS, email, meeting, note; in/out) |
| Invoices & payment status | `Invoice` (now linkable to a `ClientSubscription`), `Payment` |
| Client retention & renewals | `ClientSubscription.renewalDate`, `autoRenew`, `renewalCount`, `cancelReason`; `CRMCustomer.status` AT_RISK/CHURNED; automation trigger `CLIENT_RENEWAL_DUE` |
| Content requests & briefs | `CreativeRequest` + client, objective, target audience, platforms, `requirements` |
| Production & editing workflow | `ProductionStage`: BRIEF → SCRIPTING → SHOOTING → DESIGN → EDITING → INTERNAL_REVIEW → CLIENT_REVIEW → REVISION → DELIVERED |
| Client review & approval | `CreativeReview` on a request, project or deliverable; reviewer user or client name |
| Revisions & final delivery | `CreativeDeliverable` (versioned file/URL, DRAFT → IN_REVIEW → REVISION_REQUESTED → APPROVED → DELIVERED); `ServicePackage.maxRevisions` |

### WhatsApp marketing
| Feature | Where |
|---|---|
| Contact segmentation | `ContactSegment` (dynamic `rules` or static members `ContactSegmentMember`) |
| Message templates | `MessageTemplate` (category, language, variables, buttons, Meta approval status) |
| Campaign scheduling | `Campaign.scheduledAt` + segment, template, WhatsApp account |
| Automated messaging | `AutomationRule` (order created / status changed / opted in / keyword / renewal due / scheduled) |
| Customer opt-in & opt-out | consent flags on `MarketingContact` + proof log `ContactConsentEvent` (channel, action, source, evidence) |
| Delivery & read reports | `MessageLog` (sent / delivered / read / failed times, cost); `CampaignRecipient` now has `readAt`, `repliedAt`, `clickedAt` and a `MessageStatus` |
| Campaign analytics | cached counters on `Campaign` (recipients, sent, delivered, read, failed, replies, clicks) |
| Multiple WhatsApp Business accounts | `WhatsAppAccount` (several numbers per business, default number, quality rating) |
| Chatbot & auto-replies | `AutoReply` (keyword / welcome / away / fallback, active hours) and `ChatbotFlow` (menu flow as JSON) |
| SMS campaign integration | channel `SMS` on campaigns, templates, rules and logs; `Campaign.senderId` |

### Dropshipping
| Feature | Where |
|---|---|
| Supplier registration & management | `SupplierProfile` (one per supplier business; who handles delivery, returns, customer contact) |
| Supplier verification | `SupplierProfile.status/verifiedBy` + `SupplierDocument` (licence, ID, … reviewed by ABUUR staff) |
| Product import & management | `SupplierProduct` + `ProductImportJob` (CSV/API import with row errors) |
| Product pricing & profit margins | `wholesalePrice`, `suggestedRetailPrice`, `minRetailPrice`; `ResellerProduct.sellingPrice` − `wholesalePrice` = margin |
| Reseller registration & management | `ResellerProfile` (status, unique referral code, default margin) |
| Reseller commission tracking | `ResellerCommission` (per order, PENDING → APPROVED → PAID, payout reference) |
| Product synchronization, stock updates | `ResellerProduct.syncPrice/syncStock/lastSyncedAt` + change log `ProductSyncEvent` |
| Product promotion links | `PromotionLink` (unique code, channel, target) |
| WhatsApp order redirection | `PromotionLink.redirectToWhatsApp` + prefilled `whatsappMessage`; `StoreOrder.whatsappHandoffAt` |
| Order referral tracking | `ReferralClick` (IP stored only as a hash) and `StoreOrder.resellerId`, `promotionLinkId`, `referralCode` |
| Supplier & reseller performance reports | computed from `OrderFulfillment`, `ResellerCommission`, `PromotionLink` counters and `ReferralClick` (no extra table) |

Order routing: each supplier's part of an order is an `OrderFulfillment` (PENDING → ACCEPTED → PREPARING → DISPATCHED → DELIVERED, or CANCELLED/RETURNED). `StoreOrderItem` records the supplier product and wholesale price at the time of sale.

## 6. Next steps (in the Store plan's order)
1. **Phase 2:** store builder + product management API (business-scoped), public storefront read endpoints.
2. **Phase 3:** cart → order creation (public), WhatsApp hand-off link, order dashboard with status changes writing `StoreOrderStatusEvent`.
3. **Phase 4:** admin dashboard API: stores, plans, subscriptions and billing records, platform reports.
4. **Phase 5:** dropshipping tables + supplier role.
5. **Phase 6:** WhatsApp provider connection, templates, automation rules, message logs.
