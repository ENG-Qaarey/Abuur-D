CREATE TYPE "NotificationCampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'FAILED', 'CANCELLED');
CREATE TYPE "NotificationRecipientStatus" AS ENUM ('PENDING', 'QUEUED', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'CANCELLED');
CREATE TYPE "NotificationTemplateStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

CREATE TABLE "notification_campaigns" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "creatorId" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "internalName" TEXT,
  "category" TEXT NOT NULL,
  "priority" TEXT NOT NULL DEFAULT 'NORMAL',
  "language" TEXT NOT NULL DEFAULT 'en',
  "message" TEXT NOT NULL,
  "actionText" TEXT,
  "actionUrl" TEXT,
  "imageUrl" TEXT,
  "audience" JSONB NOT NULL,
  "channels" JSONB NOT NULL,
  "status" "NotificationCampaignStatus" NOT NULL DEFAULT 'DRAFT',
  "scheduledAt" TIMESTAMP(3),
  "sentAt" TIMESTAMP(3),
  "recipientCount" INTEGER NOT NULL DEFAULT 0,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "notification_campaigns_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "notification_campaigns_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "notification_recipients" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "campaignId" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "channel" TEXT NOT NULL,
  "status" "NotificationRecipientStatus" NOT NULL DEFAULT 'PENDING',
  "sentAt" TIMESTAMP(3),
  "deliveredAt" TIMESTAMP(3),
  "failureReason" TEXT,
  "providerResponse" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "notification_recipients_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "notification_recipients_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "notification_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "notification_recipients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "notification_templates" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "creatorId" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "channels" JSONB NOT NULL,
  "variables" JSONB,
  "language" TEXT NOT NULL DEFAULT 'en',
  "status" "NotificationTemplateStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "notification_templates_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "notification_recipients_campaignId_userId_channel_key" ON "notification_recipients"("campaignId", "userId", "channel");
CREATE INDEX "notification_recipients_campaignId_status_idx" ON "notification_recipients"("campaignId", "status");
CREATE INDEX "notification_recipients_userId_channel_idx" ON "notification_recipients"("userId", "channel");
CREATE INDEX "notification_campaigns_status_scheduledAt_idx" ON "notification_campaigns"("status", "scheduledAt");
CREATE INDEX "notification_templates_status_category_idx" ON "notification_templates"("status", "category");
