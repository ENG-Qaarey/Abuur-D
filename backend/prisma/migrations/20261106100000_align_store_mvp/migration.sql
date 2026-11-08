-- Align the store MVP with the ABUUR Store Development Plan.
--   * every store belongs to a business (no standalone stores)
--   * order statuses: NEW -> CONFIRMED -> PREPARING -> READY -> DISPATCHED -> DELIVERED / CANCELLED
--   * product variants, order status history, off-platform payment notes
--   * subscriptions are business-only, with billing records kept without a gateway
--
-- Hand-written (not `prisma migrate dev`) so existing rows are preserved:
-- the generated SQL would drop stores.ownerUserId, fail to cast old order
-- statuses, and fail NOT NULL on stores/subscriptions that have no business.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
CREATE TYPE "BillingRecordStatus" AS ENUM ('PENDING', 'PAID', 'VOID');

ALTER TYPE "PlatformRole" ADD VALUE 'ABUUR_STAFF';

-- Order status: map old values onto the new lifecycle.
CREATE TYPE "OrderStatus_new" AS ENUM ('NEW', 'CONFIRMED', 'PREPARING', 'READY', 'DISPATCHED', 'DELIVERED', 'CANCELLED');
ALTER TABLE "store_orders" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "store_orders" ALTER COLUMN "status" TYPE "OrderStatus_new" USING (
  CASE "status"::text
    WHEN 'PENDING'    THEN 'NEW'
    WHEN 'PROCESSING' THEN 'PREPARING'
    WHEN 'SHIPPED'    THEN 'DISPATCHED'
    WHEN 'COMPLETED'  THEN 'DELIVERED'
    WHEN 'REFUNDED'   THEN 'CANCELLED'
    ELSE "status"::text  -- CONFIRMED, READY, CANCELLED keep their names
  END
)::"OrderStatus_new";
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "OrderStatus_old";
ALTER TABLE "store_orders" ALTER COLUMN "status" SET DEFAULT 'NEW';

-- ---------------------------------------------------------------------------
-- Stores: ownerUserId -> createdById (data kept), every store gets a business
-- ---------------------------------------------------------------------------
ALTER TABLE "stores" RENAME COLUMN "ownerUserId" TO "createdById";
ALTER INDEX "stores_ownerUserId_idx" RENAME TO "stores_createdById_idx";
ALTER TABLE "stores" RENAME CONSTRAINT "stores_ownerUserId_fkey" TO "stores_createdById_fkey";

-- Former standalone stores: create a business owned by the store's creator.
DO $$
DECLARE
  r record;
  new_business_id uuid;
BEGIN
  FOR r IN SELECT "id", "createdById", "name", "slug" FROM "stores" WHERE "businessId" IS NULL LOOP
    new_business_id := gen_random_uuid();

    INSERT INTO "businesses" ("id", "name", "slug", "status", "createdAt", "updatedAt")
    VALUES (new_business_id, r."name", r."slug" || '-' || substr(new_business_id::text, 1, 8), 'ACTIVE', now(), now());

    INSERT INTO "business_memberships" ("id", "userId", "businessId", "role", "status", "joinedAt", "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), r."createdById", new_business_id, 'OWNER', 'ACTIVE', now(), now(), now())
    ON CONFLICT ("userId", "businessId") DO NOTHING;

    UPDATE "stores" SET "businessId" = new_business_id WHERE "id" = r."id";
  END LOOP;
END
$$;

ALTER TABLE "stores" DROP CONSTRAINT "stores_businessId_fkey";
ALTER TABLE "stores"
  DROP COLUMN "mode",
  ADD COLUMN "whatsappNumber" TEXT,
  ADD COLUMN "phone" TEXT,
  ADD COLUMN "email" TEXT,
  ADD COLUMN "address" TEXT,
  ADD COLUMN "city" TEXT,
  ALTER COLUMN "businessId" SET NOT NULL;
ALTER TABLE "stores" ADD CONSTRAINT "stores_businessId_fkey"
  FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

DROP TYPE "StoreMode";

-- ---------------------------------------------------------------------------
-- Subscriptions: business-only
-- ---------------------------------------------------------------------------
-- Store-level subscriptions move to the store's business. If any row still
-- has no business after this, the NOT NULL below fails and the migration
-- stops instead of deleting billing data; fix those rows by hand.
UPDATE "subscriptions" s
SET "businessId" = st."businessId"
FROM "stores" st
WHERE s."businessId" IS NULL AND s."storeId" = st."id";

ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_storeId_fkey";
DROP INDEX "subscriptions_storeId_status_idx";
ALTER TABLE "subscriptions"
  DROP COLUMN "storeId",
  ALTER COLUMN "businessId" SET NOT NULL;

-- ---------------------------------------------------------------------------
-- Orders: off-platform payment notes, variant snapshot on items
-- ---------------------------------------------------------------------------
ALTER TABLE "store_orders"
  ADD COLUMN "paymentMethod" TEXT,
  ADD COLUMN "paymentNote" TEXT;

ALTER TABLE "store_order_items"
  ADD COLUMN "variantId" UUID,
  ADD COLUMN "variantName" TEXT;

-- ---------------------------------------------------------------------------
-- New tables
-- ---------------------------------------------------------------------------
CREATE TABLE "subscription_billing_records" (
    "id" UUID NOT NULL,
    "subscriptionId" UUID NOT NULL,
    "businessId" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "status" "BillingRecordStatus" NOT NULL DEFAULT 'PENDING',
    "method" TEXT,
    "reference" TEXT,
    "notes" TEXT,
    "recordedById" UUID,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_billing_records_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "product_variants" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "sku" TEXT,
    "price" DECIMAL(12,2),
    "stock" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "store_order_status_events" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "fromStatus" "OrderStatus",
    "toStatus" "OrderStatus" NOT NULL,
    "note" TEXT,
    "changedById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "store_order_status_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "subscription_billing_records_subscriptionId_periodStart_idx" ON "subscription_billing_records"("subscriptionId", "periodStart");
CREATE INDEX "subscription_billing_records_businessId_status_idx" ON "subscription_billing_records"("businessId", "status");
CREATE INDEX "product_variants_productId_idx" ON "product_variants"("productId");
CREATE UNIQUE INDEX "product_variants_productId_sku_key" ON "product_variants"("productId", "sku");
CREATE INDEX "store_order_status_events_orderId_createdAt_idx" ON "store_order_status_events"("orderId", "createdAt");

ALTER TABLE "subscription_billing_records" ADD CONSTRAINT "subscription_billing_records_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "subscription_billing_records" ADD CONSTRAINT "subscription_billing_records_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "subscription_billing_records" ADD CONSTRAINT "subscription_billing_records_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "store_order_items" ADD CONSTRAINT "store_order_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "store_order_status_events" ADD CONSTRAINT "store_order_status_events_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "store_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "store_order_status_events" ADD CONSTRAINT "store_order_status_events_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- New tables follow the enable_rls policy: RLS on, no policies (Data API blocked).
ALTER TABLE "subscription_billing_records" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "product_variants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "store_order_status_events" ENABLE ROW LEVEL SECURITY;
