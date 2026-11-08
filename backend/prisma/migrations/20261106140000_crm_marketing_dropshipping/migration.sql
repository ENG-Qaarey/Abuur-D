-- CRM / client services / creative production, WhatsApp marketing & messaging,
-- and dropshipping data model (26 tables). See docs/requirements-comparison.md.
--
-- Generated with prisma migrate diff, then edited by hand so existing
-- campaign_recipients.status values are converted instead of dropped.

-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('LEAD', 'ONBOARDING', 'ACTIVE', 'AT_RISK', 'CHURNED');

-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PackageBilling" AS ENUM ('ONE_TIME', 'MONTHLY', 'QUARTERLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "ClientSubscriptionStatus" AS ENUM ('ACTIVE', 'PAUSED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "CommunicationChannel" AS ENUM ('CALL', 'WHATSAPP', 'SMS', 'EMAIL', 'MEETING', 'NOTE');

-- CreateEnum
CREATE TYPE "MessageDirection" AS ENUM ('INBOUND', 'OUTBOUND', 'INTERNAL');

-- CreateEnum
CREATE TYPE "ProductionStage" AS ENUM ('BRIEF', 'SCRIPTING', 'SHOOTING', 'DESIGN', 'EDITING', 'INTERNAL_REVIEW', 'CLIENT_REVIEW', 'REVISION', 'DELIVERED');

-- CreateEnum
CREATE TYPE "DeliverableStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'REVISION_REQUESTED', 'APPROVED', 'DELIVERED');

-- CreateEnum
CREATE TYPE "WhatsAppAccountStatus" AS ENUM ('PENDING', 'CONNECTED', 'DISCONNECTED', 'BANNED');

-- CreateEnum
CREATE TYPE "TemplateCategory" AS ENUM ('MARKETING', 'UTILITY', 'AUTHENTICATION');

-- CreateEnum
CREATE TYPE "TemplateStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'PAUSED');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('QUEUED', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'OPTED_OUT');

-- CreateEnum
CREATE TYPE "ConsentAction" AS ENUM ('OPT_IN', 'OPT_OUT');

-- CreateEnum
CREATE TYPE "ConsentSource" AS ENUM ('STOREFRONT', 'FORM', 'WHATSAPP_REPLY', 'SMS_REPLY', 'IMPORT', 'MANUAL');

-- CreateEnum
CREATE TYPE "AutomationTrigger" AS ENUM ('ORDER_CREATED', 'ORDER_STATUS_CHANGED', 'CONTACT_OPTED_IN', 'KEYWORD_RECEIVED', 'CLIENT_RENEWAL_DUE', 'SCHEDULED');

-- CreateEnum
CREATE TYPE "AutoReplyMatch" AS ENUM ('EXACT', 'CONTAINS', 'WELCOME', 'AWAY', 'FALLBACK');

-- CreateEnum
CREATE TYPE "SupplierStatus" AS ENUM ('PENDING', 'VERIFIED', 'SUSPENDED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SupplierDocumentType" AS ENUM ('BUSINESS_LICENSE', 'NATIONAL_ID', 'TAX_CERTIFICATE', 'BANK_LETTER', 'OTHER');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SupplierProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'OUT_OF_STOCK', 'DISCONTINUED');

-- CreateEnum
CREATE TYPE "ImportSource" AS ENUM ('MANUAL', 'CSV', 'API');

-- CreateEnum
CREATE TYPE "ImportStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ResellerStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "CommissionStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SyncField" AS ENUM ('PRICE', 'STOCK', 'STATUS', 'DETAILS');

-- CreateEnum
CREATE TYPE "PromotionChannel" AS ENUM ('WHATSAPP', 'FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'OTHER');

-- CreateEnum
CREATE TYPE "FulfillmentStatus" AS ENUM ('PENDING', 'ACCEPTED', 'PREPARING', 'DISPATCHED', 'DELIVERED', 'CANCELLED', 'RETURNED');

-- AlterTable
ALTER TABLE "crm_customers" ADD COLUMN     "accountManagerId" UUID,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "contactPerson" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "onboardedAt" TIMESTAMP(3),
ADD COLUMN     "socialLinks" JSONB,
ADD COLUMN     "status" "ClientStatus" NOT NULL DEFAULT 'LEAD',
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "website" TEXT,
ADD COLUMN     "whatsappNumber" TEXT;

-- AlterTable
ALTER TABLE "creative_requests" ADD COLUMN     "customerId" UUID,
ADD COLUMN     "objective" TEXT,
ADD COLUMN     "platforms" TEXT[],
ADD COLUMN     "targetAudience" TEXT;

-- AlterTable
ALTER TABLE "creative_projects" ADD COLUMN     "clientSubscriptionId" UUID,
ADD COLUMN     "customerId" UUID,
ADD COLUMN     "managerId" UUID,
ADD COLUMN     "stage" "ProductionStage" NOT NULL DEFAULT 'BRIEF';

-- AlterTable
ALTER TABLE "creative_tasks" ADD COLUMN     "estimatedHours" DECIMAL(6,2),
ADD COLUMN     "stage" "ProductionStage" NOT NULL DEFAULT 'BRIEF';

-- AlterTable
ALTER TABLE "creative_reviews" ADD COLUMN     "deliverableId" UUID,
ADD COLUMN     "projectId" UUID,
ADD COLUMN     "reviewedById" UUID,
ADD COLUMN     "reviewerName" TEXT,
ALTER COLUMN "requestId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "marketing_contacts" ADD COLUMN     "whatsappOptInAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "campaigns" ADD COLUMN     "clickCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "deliveredCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "failedCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "readCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "replyCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "segmentId" UUID,
ADD COLUMN     "senderId" TEXT,
ADD COLUMN     "sentCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "templateId" UUID,
ADD COLUMN     "templateParams" JSONB,
ADD COLUMN     "totalRecipients" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "whatsappAccountId" UUID;

-- AlterTable
ALTER TABLE "campaign_recipients" ADD COLUMN     "clickedAt" TIMESTAMP(3),
ADD COLUMN     "failedAt" TIMESTAMP(3),
ADD COLUMN     "readAt" TIMESTAMP(3),
ADD COLUMN     "repliedAt" TIMESTAMP(3),
ALTER COLUMN "status" DROP DEFAULT;

-- Keep existing delivery statuses (the generated SQL would drop the column).
ALTER TABLE "campaign_recipients" ALTER COLUMN "status" TYPE "MessageStatus" USING (
  CASE upper("status")
    WHEN 'SENT'      THEN 'SENT'
    WHEN 'DELIVERED' THEN 'DELIVERED'
    WHEN 'READ'      THEN 'READ'
    WHEN 'FAILED'    THEN 'FAILED'
    WHEN 'OPTED_OUT' THEN 'OPTED_OUT'
    ELSE 'QUEUED'  -- PENDING and anything unknown
  END
)::"MessageStatus";
ALTER TABLE "campaign_recipients" ALTER COLUMN "status" SET DEFAULT 'QUEUED';

-- AlterTable
ALTER TABLE "store_orders" ADD COLUMN     "promotionLinkId" UUID,
ADD COLUMN     "referralCode" TEXT,
ADD COLUMN     "resellerId" UUID;

-- AlterTable
ALTER TABLE "store_order_items" ADD COLUMN     "fulfillmentId" UUID,
ADD COLUMN     "supplierProductId" UUID,
ADD COLUMN     "wholesalePrice" DECIMAL(12,2);

-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "clientSubscriptionId" UUID;

-- CreateTable
CREATE TABLE "client_onboardings" (
    "id" UUID NOT NULL,
    "businessId" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "status" "OnboardingStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_onboardings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_onboarding_tasks" (
    "id" UUID NOT NULL,
    "onboardingId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "isDone" BOOLEAN NOT NULL DEFAULT false,
    "doneAt" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_onboarding_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_packages" (
    "id" UUID NOT NULL,
    "businessId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "billing" "PackageBilling" NOT NULL DEFAULT 'MONTHLY',
    "deliverables" JSONB,
    "maxRevisions" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_subscriptions" (
    "id" UUID NOT NULL,
    "businessId" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "packageId" UUID NOT NULL,
    "status" "ClientSubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "price" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "renewalDate" TIMESTAMP(3),
    "autoRenew" BOOLEAN NOT NULL DEFAULT true,
    "renewalCount" INTEGER NOT NULL DEFAULT 0,
    "lastRenewedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "cancelReason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_communications" (
    "id" UUID NOT NULL,
    "businessId" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "userId" UUID,
    "channel" "CommunicationChannel" NOT NULL,
    "direction" "MessageDirection" NOT NULL DEFAULT 'OUTBOUND',
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_communications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creative_deliverables" (
    "id" UUID NOT NULL,
    "businessId" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "DeliverableStatus" NOT NULL DEFAULT 'DRAFT',
    "fileId" UUID,
    "url" TEXT,
    "notes" TEXT,
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "creative_deliverables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_accounts" (
    "id" UUID NOT NULL,
    "businessId" UUID NOT NULL,
    "integrationId" UUID,
    "displayName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "phoneNumberId" TEXT,
    "wabaId" TEXT,
    "status" "WhatsAppAccountStatus" NOT NULL DEFAULT 'PENDING',
    "qualityRating" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "connectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_segments" (
    "id" UUID NOT NULL,
    "businessId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "rules" JSONB,
    "isDynamic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_segments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_segment_members" (
    "segmentId" UUID NOT NULL,
    "contactId" UUID NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_segment_members_pkey" PRIMARY KEY ("segmentId","contactId")
);

-- CreateTable
CREATE TABLE "contact_consent_events" (
    "id" UUID NOT NULL,
    "contactId" UUID NOT NULL,
    "channel" "CampaignChannel" NOT NULL,
    "action" "ConsentAction" NOT NULL,
    "source" "ConsentSource" NOT NULL,
    "evidence" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_consent_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_templates" (
    "id" UUID NOT NULL,
    "businessId" UUID NOT NULL,
    "whatsappAccountId" UUID,
    "channel" "CampaignChannel" NOT NULL DEFAULT 'WHATSAPP',
    "name" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "category" "TemplateCategory" NOT NULL DEFAULT 'MARKETING',
    "header" JSONB,
    "body" TEXT NOT NULL,
    "footer" TEXT,
    "buttons" JSONB,
    "variables" TEXT[],
    "status" "TemplateStatus" NOT NULL DEFAULT 'DRAFT',
    "providerTemplateId" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "message_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_rules" (
    "id" UUID NOT NULL,
    "businessId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "trigger" "AutomationTrigger" NOT NULL,
    "conditions" JSONB,
    "channel" "CampaignChannel" NOT NULL DEFAULT 'WHATSAPP',
    "templateId" UUID,
    "message" TEXT,
    "delayMinutes" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastRunAt" TIMESTAMP(3),
    "runCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automation_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auto_replies" (
    "id" UUID NOT NULL,
    "businessId" UUID NOT NULL,
    "whatsappAccountId" UUID,
    "name" TEXT NOT NULL,
    "matchType" "AutoReplyMatch" NOT NULL DEFAULT 'CONTAINS',
    "keywords" TEXT[],
    "reply" TEXT,
    "templateId" UUID,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "activeHours" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auto_replies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chatbot_flows" (
    "id" UUID NOT NULL,
    "businessId" UUID NOT NULL,
    "whatsappAccountId" UUID,
    "name" TEXT NOT NULL,
    "definition" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chatbot_flows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_logs" (
    "id" UUID NOT NULL,
    "businessId" UUID NOT NULL,
    "channel" "CampaignChannel" NOT NULL,
    "direction" "MessageDirection" NOT NULL,
    "whatsappAccountId" UUID,
    "contactId" UUID,
    "campaignId" UUID,
    "automationRuleId" UUID,
    "templateId" UUID,
    "orderId" UUID,
    "fromAddress" TEXT,
    "toAddress" TEXT NOT NULL,
    "body" TEXT,
    "providerMessageId" TEXT,
    "status" "MessageStatus" NOT NULL DEFAULT 'QUEUED',
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "error" TEXT,
    "cost" DECIMAL(10,4),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_profiles" (
    "id" UUID NOT NULL,
    "businessId" UUID NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "phone" TEXT,
    "whatsappNumber" TEXT,
    "email" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT DEFAULT 'SO',
    "status" "SupplierStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "verifiedById" UUID,
    "verificationNotes" TEXT,
    "handlesDelivery" BOOLEAN NOT NULL DEFAULT true,
    "handlesReturns" BOOLEAN NOT NULL DEFAULT true,
    "handlesCustomerCommunication" BOOLEAN NOT NULL DEFAULT false,
    "fulfillmentTerms" JSONB,
    "returnPolicy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supplier_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_documents" (
    "id" UUID NOT NULL,
    "supplierId" UUID NOT NULL,
    "type" "SupplierDocumentType" NOT NULL,
    "fileId" UUID NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedById" UUID,
    "reviewedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supplier_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_products" (
    "id" UUID NOT NULL,
    "supplierId" UUID NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "images" JSONB,
    "options" JSONB,
    "wholesalePrice" DECIMAL(12,2) NOT NULL,
    "suggestedRetailPrice" DECIMAL(12,2),
    "minRetailPrice" DECIMAL(12,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "stock" INTEGER NOT NULL DEFAULT 0,
    "status" "SupplierProductStatus" NOT NULL DEFAULT 'DRAFT',
    "weightGrams" INTEGER,
    "externalId" TEXT,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supplier_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_import_jobs" (
    "id" UUID NOT NULL,
    "supplierId" UUID NOT NULL,
    "source" "ImportSource" NOT NULL DEFAULT 'CSV',
    "fileId" UUID,
    "status" "ImportStatus" NOT NULL DEFAULT 'PENDING',
    "totalRows" INTEGER NOT NULL DEFAULT 0,
    "importedRows" INTEGER NOT NULL DEFAULT 0,
    "failedRows" INTEGER NOT NULL DEFAULT 0,
    "errors" JSONB,
    "createdById" UUID,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_import_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reseller_profiles" (
    "id" UUID NOT NULL,
    "businessId" UUID NOT NULL,
    "status" "ResellerStatus" NOT NULL DEFAULT 'PENDING',
    "referralCode" TEXT NOT NULL,
    "defaultMarginPercent" DECIMAL(5,2),
    "approvedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reseller_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reseller_products" (
    "id" UUID NOT NULL,
    "resellerId" UUID NOT NULL,
    "storeId" UUID NOT NULL,
    "supplierProductId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "sellingPrice" DECIMAL(12,2) NOT NULL,
    "wholesalePrice" DECIMAL(12,2) NOT NULL,
    "syncPrice" BOOLEAN NOT NULL DEFAULT true,
    "syncStock" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reseller_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_sync_events" (
    "id" UUID NOT NULL,
    "supplierProductId" UUID NOT NULL,
    "resellerProductId" UUID,
    "field" "SyncField" NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_sync_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotion_links" (
    "id" UUID NOT NULL,
    "resellerId" UUID NOT NULL,
    "storeId" UUID,
    "resellerProductId" UUID,
    "code" TEXT NOT NULL,
    "channel" "PromotionChannel" NOT NULL DEFAULT 'WHATSAPP',
    "targetUrl" TEXT,
    "redirectToWhatsApp" BOOLEAN NOT NULL DEFAULT false,
    "whatsappMessage" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "orderCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promotion_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referral_clicks" (
    "id" UUID NOT NULL,
    "linkId" UUID NOT NULL,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referral_clicks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_fulfillments" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "supplierId" UUID NOT NULL,
    "status" "FulfillmentStatus" NOT NULL DEFAULT 'PENDING',
    "wholesaleTotal" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "carrier" TEXT,
    "trackingNumber" TEXT,
    "notes" TEXT,
    "acceptedAt" TIMESTAMP(3),
    "dispatchedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_fulfillments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reseller_commissions" (
    "id" UUID NOT NULL,
    "resellerId" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "fulfillmentId" UUID,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "CommissionStatus" NOT NULL DEFAULT 'PENDING',
    "approvedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "reference" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reseller_commissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "client_onboardings_customerId_key" ON "client_onboardings"("customerId");

-- CreateIndex
CREATE INDEX "client_onboardings_businessId_status_idx" ON "client_onboardings"("businessId", "status");

-- CreateIndex
CREATE INDEX "client_onboarding_tasks_onboardingId_sortOrder_idx" ON "client_onboarding_tasks"("onboardingId", "sortOrder");

-- CreateIndex
CREATE INDEX "service_packages_businessId_isActive_idx" ON "service_packages"("businessId", "isActive");

-- CreateIndex
CREATE INDEX "client_subscriptions_businessId_status_idx" ON "client_subscriptions"("businessId", "status");

-- CreateIndex
CREATE INDEX "client_subscriptions_businessId_renewalDate_idx" ON "client_subscriptions"("businessId", "renewalDate");

-- CreateIndex
CREATE INDEX "client_subscriptions_customerId_idx" ON "client_subscriptions"("customerId");

-- CreateIndex
CREATE INDEX "client_communications_customerId_occurredAt_idx" ON "client_communications"("customerId", "occurredAt");

-- CreateIndex
CREATE INDEX "client_communications_businessId_occurredAt_idx" ON "client_communications"("businessId", "occurredAt");

-- CreateIndex
CREATE INDEX "creative_deliverables_businessId_status_idx" ON "creative_deliverables"("businessId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "creative_deliverables_projectId_title_version_key" ON "creative_deliverables"("projectId", "title", "version");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_accounts_businessId_phoneNumber_key" ON "whatsapp_accounts"("businessId", "phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_accounts_phoneNumberId_key" ON "whatsapp_accounts"("phoneNumberId");

-- CreateIndex
CREATE UNIQUE INDEX "contact_segments_businessId_name_key" ON "contact_segments"("businessId", "name");

-- CreateIndex
CREATE INDEX "contact_segment_members_contactId_idx" ON "contact_segment_members"("contactId");

-- CreateIndex
CREATE INDEX "contact_consent_events_contactId_channel_occurredAt_idx" ON "contact_consent_events"("contactId", "channel", "occurredAt");

-- CreateIndex
CREATE INDEX "message_templates_businessId_status_idx" ON "message_templates"("businessId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "message_templates_businessId_channel_name_language_key" ON "message_templates"("businessId", "channel", "name", "language");

-- CreateIndex
CREATE INDEX "automation_rules_businessId_trigger_isActive_idx" ON "automation_rules"("businessId", "trigger", "isActive");

-- CreateIndex
CREATE INDEX "auto_replies_businessId_isActive_priority_idx" ON "auto_replies"("businessId", "isActive", "priority");

-- CreateIndex
CREATE INDEX "chatbot_flows_businessId_isActive_idx" ON "chatbot_flows"("businessId", "isActive");

-- CreateIndex
CREATE INDEX "message_logs_businessId_createdAt_idx" ON "message_logs"("businessId", "createdAt");

-- CreateIndex
CREATE INDEX "message_logs_campaignId_status_idx" ON "message_logs"("campaignId", "status");

-- CreateIndex
CREATE INDEX "message_logs_contactId_createdAt_idx" ON "message_logs"("contactId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "message_logs_channel_providerMessageId_key" ON "message_logs"("channel", "providerMessageId");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_profiles_businessId_key" ON "supplier_profiles"("businessId");

-- CreateIndex
CREATE INDEX "supplier_profiles_status_idx" ON "supplier_profiles"("status");

-- CreateIndex
CREATE INDEX "supplier_documents_supplierId_status_idx" ON "supplier_documents"("supplierId", "status");

-- CreateIndex
CREATE INDEX "supplier_products_status_category_idx" ON "supplier_products"("status", "category");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_products_supplierId_sku_key" ON "supplier_products"("supplierId", "sku");

-- CreateIndex
CREATE INDEX "product_import_jobs_supplierId_createdAt_idx" ON "product_import_jobs"("supplierId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "reseller_profiles_businessId_key" ON "reseller_profiles"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "reseller_profiles_referralCode_key" ON "reseller_profiles"("referralCode");

-- CreateIndex
CREATE INDEX "reseller_profiles_status_idx" ON "reseller_profiles"("status");

-- CreateIndex
CREATE UNIQUE INDEX "reseller_products_productId_key" ON "reseller_products"("productId");

-- CreateIndex
CREATE INDEX "reseller_products_resellerId_isActive_idx" ON "reseller_products"("resellerId", "isActive");

-- CreateIndex
CREATE INDEX "reseller_products_supplierProductId_idx" ON "reseller_products"("supplierProductId");

-- CreateIndex
CREATE UNIQUE INDEX "reseller_products_storeId_supplierProductId_key" ON "reseller_products"("storeId", "supplierProductId");

-- CreateIndex
CREATE INDEX "product_sync_events_supplierProductId_createdAt_idx" ON "product_sync_events"("supplierProductId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "promotion_links_code_key" ON "promotion_links"("code");

-- CreateIndex
CREATE INDEX "promotion_links_resellerId_isActive_idx" ON "promotion_links"("resellerId", "isActive");

-- CreateIndex
CREATE INDEX "referral_clicks_linkId_occurredAt_idx" ON "referral_clicks"("linkId", "occurredAt");

-- CreateIndex
CREATE INDEX "order_fulfillments_supplierId_status_idx" ON "order_fulfillments"("supplierId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "order_fulfillments_orderId_supplierId_key" ON "order_fulfillments"("orderId", "supplierId");

-- CreateIndex
CREATE INDEX "reseller_commissions_resellerId_status_idx" ON "reseller_commissions"("resellerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "reseller_commissions_orderId_resellerId_key" ON "reseller_commissions"("orderId", "resellerId");

-- AddForeignKey
ALTER TABLE "crm_customers" ADD CONSTRAINT "crm_customers_accountManagerId_fkey" FOREIGN KEY ("accountManagerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creative_requests" ADD CONSTRAINT "creative_requests_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "crm_customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creative_projects" ADD CONSTRAINT "creative_projects_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "crm_customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creative_projects" ADD CONSTRAINT "creative_projects_clientSubscriptionId_fkey" FOREIGN KEY ("clientSubscriptionId") REFERENCES "client_subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creative_projects" ADD CONSTRAINT "creative_projects_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creative_reviews" ADD CONSTRAINT "creative_reviews_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "creative_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creative_reviews" ADD CONSTRAINT "creative_reviews_deliverableId_fkey" FOREIGN KEY ("deliverableId") REFERENCES "creative_deliverables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creative_reviews" ADD CONSTRAINT "creative_reviews_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "contact_segments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "message_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_whatsappAccountId_fkey" FOREIGN KEY ("whatsappAccountId") REFERENCES "whatsapp_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_orders" ADD CONSTRAINT "store_orders_resellerId_fkey" FOREIGN KEY ("resellerId") REFERENCES "reseller_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_orders" ADD CONSTRAINT "store_orders_promotionLinkId_fkey" FOREIGN KEY ("promotionLinkId") REFERENCES "promotion_links"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_order_items" ADD CONSTRAINT "store_order_items_supplierProductId_fkey" FOREIGN KEY ("supplierProductId") REFERENCES "supplier_products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_order_items" ADD CONSTRAINT "store_order_items_fulfillmentId_fkey" FOREIGN KEY ("fulfillmentId") REFERENCES "order_fulfillments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_clientSubscriptionId_fkey" FOREIGN KEY ("clientSubscriptionId") REFERENCES "client_subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_onboardings" ADD CONSTRAINT "client_onboardings_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_onboardings" ADD CONSTRAINT "client_onboardings_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "crm_customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_onboarding_tasks" ADD CONSTRAINT "client_onboarding_tasks_onboardingId_fkey" FOREIGN KEY ("onboardingId") REFERENCES "client_onboardings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_packages" ADD CONSTRAINT "service_packages_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_subscriptions" ADD CONSTRAINT "client_subscriptions_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_subscriptions" ADD CONSTRAINT "client_subscriptions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "crm_customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_subscriptions" ADD CONSTRAINT "client_subscriptions_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "service_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_communications" ADD CONSTRAINT "client_communications_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_communications" ADD CONSTRAINT "client_communications_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "crm_customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_communications" ADD CONSTRAINT "client_communications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creative_deliverables" ADD CONSTRAINT "creative_deliverables_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creative_deliverables" ADD CONSTRAINT "creative_deliverables_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "creative_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creative_deliverables" ADD CONSTRAINT "creative_deliverables_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "file_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_accounts" ADD CONSTRAINT "whatsapp_accounts_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_accounts" ADD CONSTRAINT "whatsapp_accounts_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "integration_connections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_segments" ADD CONSTRAINT "contact_segments_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_segment_members" ADD CONSTRAINT "contact_segment_members_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "contact_segments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_segment_members" ADD CONSTRAINT "contact_segment_members_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "marketing_contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_consent_events" ADD CONSTRAINT "contact_consent_events_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "marketing_contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_templates" ADD CONSTRAINT "message_templates_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_templates" ADD CONSTRAINT "message_templates_whatsappAccountId_fkey" FOREIGN KEY ("whatsappAccountId") REFERENCES "whatsapp_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_rules" ADD CONSTRAINT "automation_rules_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_rules" ADD CONSTRAINT "automation_rules_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "message_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auto_replies" ADD CONSTRAINT "auto_replies_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auto_replies" ADD CONSTRAINT "auto_replies_whatsappAccountId_fkey" FOREIGN KEY ("whatsappAccountId") REFERENCES "whatsapp_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auto_replies" ADD CONSTRAINT "auto_replies_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "message_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chatbot_flows" ADD CONSTRAINT "chatbot_flows_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chatbot_flows" ADD CONSTRAINT "chatbot_flows_whatsappAccountId_fkey" FOREIGN KEY ("whatsappAccountId") REFERENCES "whatsapp_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_logs" ADD CONSTRAINT "message_logs_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_logs" ADD CONSTRAINT "message_logs_whatsappAccountId_fkey" FOREIGN KEY ("whatsappAccountId") REFERENCES "whatsapp_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_logs" ADD CONSTRAINT "message_logs_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "marketing_contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_logs" ADD CONSTRAINT "message_logs_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_logs" ADD CONSTRAINT "message_logs_automationRuleId_fkey" FOREIGN KEY ("automationRuleId") REFERENCES "automation_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_logs" ADD CONSTRAINT "message_logs_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "message_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_logs" ADD CONSTRAINT "message_logs_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "store_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_profiles" ADD CONSTRAINT "supplier_profiles_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_profiles" ADD CONSTRAINT "supplier_profiles_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_documents" ADD CONSTRAINT "supplier_documents_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "supplier_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_documents" ADD CONSTRAINT "supplier_documents_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "file_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_documents" ADD CONSTRAINT "supplier_documents_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_products" ADD CONSTRAINT "supplier_products_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "supplier_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_import_jobs" ADD CONSTRAINT "product_import_jobs_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "supplier_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_import_jobs" ADD CONSTRAINT "product_import_jobs_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "file_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_import_jobs" ADD CONSTRAINT "product_import_jobs_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reseller_profiles" ADD CONSTRAINT "reseller_profiles_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reseller_products" ADD CONSTRAINT "reseller_products_resellerId_fkey" FOREIGN KEY ("resellerId") REFERENCES "reseller_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reseller_products" ADD CONSTRAINT "reseller_products_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reseller_products" ADD CONSTRAINT "reseller_products_supplierProductId_fkey" FOREIGN KEY ("supplierProductId") REFERENCES "supplier_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reseller_products" ADD CONSTRAINT "reseller_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_sync_events" ADD CONSTRAINT "product_sync_events_supplierProductId_fkey" FOREIGN KEY ("supplierProductId") REFERENCES "supplier_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_sync_events" ADD CONSTRAINT "product_sync_events_resellerProductId_fkey" FOREIGN KEY ("resellerProductId") REFERENCES "reseller_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_links" ADD CONSTRAINT "promotion_links_resellerId_fkey" FOREIGN KEY ("resellerId") REFERENCES "reseller_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_links" ADD CONSTRAINT "promotion_links_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_links" ADD CONSTRAINT "promotion_links_resellerProductId_fkey" FOREIGN KEY ("resellerProductId") REFERENCES "reseller_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referral_clicks" ADD CONSTRAINT "referral_clicks_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "promotion_links"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_fulfillments" ADD CONSTRAINT "order_fulfillments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "store_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_fulfillments" ADD CONSTRAINT "order_fulfillments_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "supplier_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reseller_commissions" ADD CONSTRAINT "reseller_commissions_resellerId_fkey" FOREIGN KEY ("resellerId") REFERENCES "reseller_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reseller_commissions" ADD CONSTRAINT "reseller_commissions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "store_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reseller_commissions" ADD CONSTRAINT "reseller_commissions_fulfillmentId_fkey" FOREIGN KEY ("fulfillmentId") REFERENCES "order_fulfillments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- New tables follow the enable_rls policy: RLS on, no policies (Data API blocked).
ALTER TABLE "client_onboardings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "client_onboarding_tasks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "service_packages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "client_subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "client_communications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "creative_deliverables" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "whatsapp_accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contact_segments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contact_segment_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contact_consent_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "message_templates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "automation_rules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "auto_replies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "chatbot_flows" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "message_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "supplier_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "supplier_documents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "supplier_products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product_import_jobs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reseller_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reseller_products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product_sync_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "promotion_links" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "referral_clicks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order_fulfillments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reseller_commissions" ENABLE ROW LEVEL SECURITY;
