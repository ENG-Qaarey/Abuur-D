-- Website contact form messages (read by ABUUR staff in the admin dashboard).

-- CreateEnum
CREATE TYPE "ContactTopic" AS ENUM ('SALES', 'SUPPORT', 'PARTNERSHIP', 'OTHER');

-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('NEW', 'HANDLED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "businessName" TEXT,
    "topic" "ContactTopic" NOT NULL DEFAULT 'SALES',
    "message" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'so',
    "status" "ContactStatus" NOT NULL DEFAULT 'NEW',
    "ipHash" TEXT,
    "userAgent" TEXT,
    "handledAt" TIMESTAMP(3),
    "handledById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contact_messages_status_createdAt_idx" ON "contact_messages"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "contact_messages" ADD CONSTRAINT "contact_messages_handledById_fkey" FOREIGN KEY ("handledById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Follows the enable_rls policy: RLS on, no policies (Data API blocked).
ALTER TABLE "contact_messages" ENABLE ROW LEVEL SECURITY;
