-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REVOKED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "DealStatus" AS ENUM ('OPEN', 'WON', 'LOST');

-- CreateEnum
CREATE TYPE "SubscriptionEventType" AS ENUM ('CREATED', 'RENEWED', 'UPGRADED', 'DOWNGRADED', 'PAUSED', 'RESUMED', 'SUSPENDED', 'CANCELLED', 'EXPIRED', 'REMINDER_SENT');

-- CreateEnum
CREATE TYPE "PaymentKind" AS ENUM ('PAYMENT', 'REFUND', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "AutomationAction" AS ENUM ('SEND_WHATSAPP', 'SEND_SMS', 'CREATE_TASK', 'NOTIFY_STAFF', 'UPDATE_CUSTOMER_STATUS');

-- CreateEnum
CREATE TYPE "ExecutionStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCEEDED', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "DomainStatus" AS ENUM ('PENDING', 'VERIFIED', 'FAILED');

-- CreateEnum
CREATE TYPE "FinanceTxStatus" AS ENUM ('POSTED', 'VOID');

-- CreateEnum
CREATE TYPE "ReportFormat" AS ENUM ('CSV', 'XLSX', 'PDF');

-- CreateEnum
CREATE TYPE "ExportStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AutomationTrigger" ADD VALUE 'CUSTOMER_CREATED';
ALTER TYPE "AutomationTrigger" ADD VALUE 'LEAD_CREATED';
ALTER TYPE "AutomationTrigger" ADD VALUE 'PAYMENT_RECEIVED';
ALTER TYPE "AutomationTrigger" ADD VALUE 'PAYMENT_OVERDUE';
ALTER TYPE "AutomationTrigger" ADD VALUE 'SUBSCRIPTION_EXPIRED';
ALTER TYPE "AutomationTrigger" ADD VALUE 'PROJECT_APPROVED';
ALTER TYPE "AutomationTrigger" ADD VALUE 'CUSTOMER_INACTIVE';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ClientSubscriptionStatus" ADD VALUE 'PENDING';
ALTER TYPE "ClientSubscriptionStatus" ADD VALUE 'SUSPENDED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "MembershipRole" ADD VALUE 'ACCOUNTANT';
ALTER TYPE "MembershipRole" ADD VALUE 'SALES_REP';

-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'RETURNED';

ALTER TABLE "automation_rules" ADD COLUMN     "action" "AutomationAction" NOT NULL DEFAULT 'SEND_WHATSAPP',
ADD COLUMN     "actionConfig" JSONB,
ADD COLUMN     "testMode" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "business_memberships" ADD COLUMN     "customRoleId" UUID;

ALTER TABLE "campaign_recipients" ADD COLUMN     "attempts" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "campaigns" ADD COLUMN     "createdById" UUID,
ADD COLUMN     "skippedCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalCost" DECIMAL(12,4);

ALTER TABLE "client_subscriptions" ADD COLUMN     "remindedAt" TIMESTAMP(3);

ALTER TABLE "creative_deliverables" ADD COLUMN     "isFinal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reviewDeadline" TIMESTAMP(3),
ADD COLUMN     "reviewTokenHash" TEXT,
ADD COLUMN     "submittedAt" TIMESTAMP(3);

ALTER TABLE "creative_projects" ADD COLUMN     "revisionCount" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "creative_requests" ADD COLUMN     "format" TEXT,
ADD COLUMN     "packageId" UUID,
ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 3;

ALTER TABLE "creative_tasks" ADD COLUMN     "parentId" UUID;

ALTER TABLE "crm_customers" ADD COLUMN     "archivedAt" TIMESTAMP(3);

ALTER TABLE "file_assets" ADD COLUMN     "customerId" UUID,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "folder" TEXT,
ADD COLUMN     "previousVersionId" UUID,
ADD COLUMN     "projectId" UUID,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

ALTER TABLE "finance_transactions" ADD COLUMN     "categoryId" UUID,
ADD COLUMN     "isRecurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "nextOccurrenceAt" TIMESTAMP(3),
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "receiptFileId" UUID,
ADD COLUMN     "recurrenceInterval" "BillingInterval",
ADD COLUMN     "reversalOfId" UUID,
ADD COLUMN     "sourceId" TEXT,
ADD COLUMN     "sourceType" TEXT,
ADD COLUMN     "status" "FinanceTxStatus" NOT NULL DEFAULT 'POSTED';

ALTER TABLE "inventory_movements" ADD COLUMN     "createdById" UUID,
ADD COLUMN     "stockAfter" INTEGER,
ADD COLUMN     "variantId" UUID;

ALTER TABLE "leads" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "assignedToId" UUID,
ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactName" TEXT,
ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "convertedAt" TIMESTAMP(3),
ADD COLUMN     "interest" TEXT,
ADD COLUMN     "lostReason" TEXT,
ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 3;

ALTER TABLE "marketing_contacts" ADD COLUMN     "city" TEXT,
ADD COLUMN     "customerId" UUID,
ADD COLUMN     "lastInboundAt" TIMESTAMP(3),
ADD COLUMN     "source" TEXT;




ALTER TABLE "payments" ADD COLUMN     "clientSubscriptionId" UUID,
ADD COLUMN     "customerId" UUID,
ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "kind" "PaymentKind" NOT NULL DEFAULT 'PAYMENT',
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "receiptNumber" TEXT,
ADD COLUMN     "recordedById" UUID,
ADD COLUMN     "refundOfId" UUID;

ALTER TABLE "product_variants" ADD COLUMN     "costPrice" DECIMAL(12,2);

ALTER TABLE "products" ADD COLUMN     "allowBackorder" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "costPrice" DECIMAL(12,2),
ADD COLUMN     "lowStockThreshold" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "productType" TEXT NOT NULL DEFAULT 'PHYSICAL',
ADD COLUMN     "specifications" JSONB,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "trackInventory" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "service_packages" ADD COLUMN     "durationDays" INTEGER;

ALTER TABLE "store_domains" ADD COLUMN     "lastCheckedAt" TIMESTAMP(3),
ADD COLUMN     "lastError" TEXT,
ADD COLUMN     "status" "DomainStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "verificationToken" TEXT;

ALTER TABLE "store_orders" ADD COLUMN     "assignedToId" UUID,
ADD COLUMN     "cancelReason" TEXT,
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "trackingNumber" TEXT;

ALTER TABLE "stores" ADD COLUMN     "country" TEXT DEFAULT 'SO',
ADD COLUMN     "coverImageUrl" TEXT,
ADD COLUMN     "policies" JSONB,
ADD COLUMN     "socialLinks" JSONB;

ALTER TABLE "users" ALTER COLUMN "platformRole" SET DEFAULT 'OWNER';

-- CreateTable
CREATE TABLE "business_roles" (
    "id" UUID NOT NULL,
    "businessId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "permissions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_invitations" (
    "id" UUID NOT NULL,
    "businessId" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "role" "MembershipRole" NOT NULL DEFAULT 'EMPLOYEE',
    "customRoleId" UUID,
    "tokenHash" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "invitedById" UUID,
    "acceptedById" UUID,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pipelines" (
    "id" UUID NOT NULL,
    "businessId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pipelines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pipeline_stages" (
    "id" UUID NOT NULL,
    "pipelineId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "probability" INTEGER NOT NULL DEFAULT 0,
    "isWon" BOOLEAN NOT NULL DEFAULT false,
    "isLost" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pipeline_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deals" (
    "id" UUID NOT NULL,
    "businessId" UUID NOT NULL,
    "pipelineId" UUID NOT NULL,
    "stageId" UUID NOT NULL,
    "customerId" UUID,
    "leadId" UUID,
    "ownerId" UUID,
    "createdById" UUID,
    "title" TEXT NOT NULL,
    "value" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "expectedCloseDate" TIMESTAMP(3),
    "status" "DealStatus" NOT NULL DEFAULT 'OPEN',
    "closedAt" TIMESTAMP(3),
    "lostReason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deal_stage_changes" (
    "id" UUID NOT NULL,
    "dealId" UUID NOT NULL,
    "fromStageId" UUID,
    "toStageId" UUID NOT NULL,
    "changedById" UUID,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deal_stage_changes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_tasks" (
    "id" UUID NOT NULL,
    "businessId" UUID NOT NULL,
    "customerId" UUID,
    "leadId" UUID,
    "dealId" UUID,
    "assignedToId" UUID,
    "createdById" UUID,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'FOLLOW_UP',
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "priority" INTEGER NOT NULL DEFAULT 3,
    "dueAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "remindedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_members" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'DESIGNER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_comments" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "taskId" UUID,
    "deliverableId" UUID,
    "authorId" UUID,
    "authorName" TEXT,
    "body" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_categories" (
    "id" UUID NOT NULL,
    "businessId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_exports" (
    "id" UUID NOT NULL,
    "businessId" UUID NOT NULL,
    "createdById" UUID,
    "reportType" TEXT NOT NULL,
    "format" "ReportFormat" NOT NULL,
    "params" JSONB,
    "status" "ExportStatus" NOT NULL DEFAULT 'PENDING',
    "rowCount" INTEGER,
    "error" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_exports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_subscription_events" (
    "id" UUID NOT NULL,
    "subscriptionId" UUID NOT NULL,
    "type" "SubscriptionEventType" NOT NULL,
    "fromPackageId" UUID,
    "toPackageId" UUID,
    "price" DECIMAL(12,2),
    "note" TEXT,
    "createdById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_subscription_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_executions" (
    "id" UUID NOT NULL,
    "businessId" UUID NOT NULL,
    "ruleId" UUID NOT NULL,
    "dedupeKey" TEXT NOT NULL,
    "payload" JSONB,
    "status" "ExecutionStatus" NOT NULL DEFAULT 'PENDING',
    "runAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "result" JSONB,
    "error" TEXT,
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "automation_executions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "business_roles_businessId_name_key" ON "business_roles"("businessId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "business_invitations_tokenHash_key" ON "business_invitations"("tokenHash");

-- CreateIndex
CREATE INDEX "business_invitations_businessId_status_idx" ON "business_invitations"("businessId", "status");

-- CreateIndex
CREATE INDEX "business_invitations_email_status_idx" ON "business_invitations"("email", "status");

-- CreateIndex
CREATE UNIQUE INDEX "pipelines_businessId_name_key" ON "pipelines"("businessId", "name");

-- CreateIndex
CREATE INDEX "pipeline_stages_pipelineId_sortOrder_idx" ON "pipeline_stages"("pipelineId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "pipeline_stages_pipelineId_name_key" ON "pipeline_stages"("pipelineId", "name");

-- CreateIndex
CREATE INDEX "deals_businessId_status_idx" ON "deals"("businessId", "status");

-- CreateIndex
CREATE INDEX "deals_pipelineId_stageId_idx" ON "deals"("pipelineId", "stageId");

-- CreateIndex
CREATE INDEX "deals_ownerId_idx" ON "deals"("ownerId");

-- CreateIndex
CREATE INDEX "deal_stage_changes_dealId_createdAt_idx" ON "deal_stage_changes"("dealId", "createdAt");

-- CreateIndex
CREATE INDEX "crm_tasks_businessId_status_dueAt_idx" ON "crm_tasks"("businessId", "status", "dueAt");

-- CreateIndex
CREATE INDEX "crm_tasks_assignedToId_status_idx" ON "crm_tasks"("assignedToId", "status");

-- CreateIndex
CREATE INDEX "project_members_userId_idx" ON "project_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "project_members_projectId_userId_key" ON "project_members"("projectId", "userId");

-- CreateIndex
CREATE INDEX "project_comments_projectId_createdAt_idx" ON "project_comments"("projectId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "financial_categories_businessId_type_name_key" ON "financial_categories"("businessId", "type", "name");

-- CreateIndex
CREATE INDEX "report_exports_businessId_createdAt_idx" ON "report_exports"("businessId", "createdAt");

-- CreateIndex
CREATE INDEX "client_subscription_events_subscriptionId_createdAt_idx" ON "client_subscription_events"("subscriptionId", "createdAt");

-- CreateIndex
CREATE INDEX "automation_executions_status_runAt_idx" ON "automation_executions"("status", "runAt");

-- CreateIndex
CREATE INDEX "automation_executions_businessId_createdAt_idx" ON "automation_executions"("businessId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "automation_executions_ruleId_dedupeKey_key" ON "automation_executions"("ruleId", "dedupeKey");

-- CreateIndex
CREATE UNIQUE INDEX "creative_deliverables_reviewTokenHash_key" ON "creative_deliverables"("reviewTokenHash");

-- CreateIndex
CREATE INDEX "creative_tasks_parentId_idx" ON "creative_tasks"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "file_assets_previousVersionId_key" ON "file_assets"("previousVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "finance_transactions_reversalOfId_key" ON "finance_transactions"("reversalOfId");

-- CreateIndex
CREATE INDEX "finance_transactions_isRecurring_nextOccurrenceAt_idx" ON "finance_transactions"("isRecurring", "nextOccurrenceAt");

-- CreateIndex
CREATE UNIQUE INDEX "finance_transactions_businessId_sourceType_sourceId_key" ON "finance_transactions"("businessId", "sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "leads_assignedToId_idx" ON "leads"("assignedToId");

-- CreateIndex
CREATE INDEX "payments_customerId_idx" ON "payments"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_businessId_reference_key" ON "payments"("businessId", "reference");

-- CreateIndex
CREATE UNIQUE INDEX "payments_businessId_receiptNumber_key" ON "payments"("businessId", "receiptNumber");

-- AddForeignKey
ALTER TABLE "business_memberships" ADD CONSTRAINT "business_memberships_customRoleId_fkey" FOREIGN KEY ("customRoleId") REFERENCES "business_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_roles" ADD CONSTRAINT "business_roles_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_invitations" ADD CONSTRAINT "business_invitations_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_invitations" ADD CONSTRAINT "business_invitations_customRoleId_fkey" FOREIGN KEY ("customRoleId") REFERENCES "business_roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_invitations" ADD CONSTRAINT "business_invitations_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pipelines" ADD CONSTRAINT "pipelines_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pipeline_stages" ADD CONSTRAINT "pipeline_stages_pipelineId_fkey" FOREIGN KEY ("pipelineId") REFERENCES "pipelines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_pipelineId_fkey" FOREIGN KEY ("pipelineId") REFERENCES "pipelines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "pipeline_stages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "crm_customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deal_stage_changes" ADD CONSTRAINT "deal_stage_changes_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deal_stage_changes" ADD CONSTRAINT "deal_stage_changes_fromStageId_fkey" FOREIGN KEY ("fromStageId") REFERENCES "pipeline_stages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deal_stage_changes" ADD CONSTRAINT "deal_stage_changes_toStageId_fkey" FOREIGN KEY ("toStageId") REFERENCES "pipeline_stages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deal_stage_changes" ADD CONSTRAINT "deal_stage_changes_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_tasks" ADD CONSTRAINT "crm_tasks_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_tasks" ADD CONSTRAINT "crm_tasks_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "crm_customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_tasks" ADD CONSTRAINT "crm_tasks_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_tasks" ADD CONSTRAINT "crm_tasks_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_tasks" ADD CONSTRAINT "crm_tasks_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_tasks" ADD CONSTRAINT "crm_tasks_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creative_requests" ADD CONSTRAINT "creative_requests_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "service_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creative_tasks" ADD CONSTRAINT "creative_tasks_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "creative_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "creative_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_comments" ADD CONSTRAINT "project_comments_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "creative_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_comments" ADD CONSTRAINT "project_comments_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "creative_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_comments" ADD CONSTRAINT "project_comments_deliverableId_fkey" FOREIGN KEY ("deliverableId") REFERENCES "creative_deliverables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_comments" ADD CONSTRAINT "project_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketing_contacts" ADD CONSTRAINT "marketing_contacts_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "crm_customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_orders" ADD CONSTRAINT "store_orders_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_transactions" ADD CONSTRAINT "finance_transactions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "financial_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_transactions" ADD CONSTRAINT "finance_transactions_reversalOfId_fkey" FOREIGN KEY ("reversalOfId") REFERENCES "finance_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finance_transactions" ADD CONSTRAINT "finance_transactions_receiptFileId_fkey" FOREIGN KEY ("receiptFileId") REFERENCES "file_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_categories" ADD CONSTRAINT "financial_categories_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_exports" ADD CONSTRAINT "report_exports_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_exports" ADD CONSTRAINT "report_exports_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "crm_customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_clientSubscriptionId_fkey" FOREIGN KEY ("clientSubscriptionId") REFERENCES "client_subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_refundOfId_fkey" FOREIGN KEY ("refundOfId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_assets" ADD CONSTRAINT "file_assets_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "creative_projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_assets" ADD CONSTRAINT "file_assets_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "crm_customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_assets" ADD CONSTRAINT "file_assets_previousVersionId_fkey" FOREIGN KEY ("previousVersionId") REFERENCES "file_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_subscription_events" ADD CONSTRAINT "client_subscription_events_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "client_subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_subscription_events" ADD CONSTRAINT "client_subscription_events_fromPackageId_fkey" FOREIGN KEY ("fromPackageId") REFERENCES "service_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_subscription_events" ADD CONSTRAINT "client_subscription_events_toPackageId_fkey" FOREIGN KEY ("toPackageId") REFERENCES "service_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_subscription_events" ADD CONSTRAINT "client_subscription_events_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_executions" ADD CONSTRAINT "automation_executions_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_executions" ADD CONSTRAINT "automation_executions_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "automation_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Defense in depth: the API connects as the table owner (RLS does not apply to it); Supabase's
-- public anon/authenticated roles get no rows from any table even if a GRANT is added later.
DO $$
DECLARE t record;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.tablename);
  END LOOP;
END $$;