-- Local email + password login (e.g. the seeded platform admin), alongside Supabase Auth.
--   * passwordHash: scrypt hash, null for Supabase-only users
--   * supabaseId: now optional, null for local-only users (still unique when set)

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "passwordHash" TEXT,
ALTER COLUMN "supabaseId" DROP NOT NULL;
