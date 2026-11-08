// Seed: mock data for development.
//
//   npx prisma db seed        (or: npm run db:seed)
//
// Creates the ABUUR platform admin as a LOCAL user (email + password stored
// as an scrypt hash in public.users). It is not a Supabase Auth user, so it
// logs in through POST /api/auth/login, not through Supabase.
//
//   email:    abuur@gmail.com
//   password: abuur@1234
//
// These are mock credentials and this file is in git: change the password
// (or override it with SEED_ADMIN_PASSWORD) before using a real/live database.
// Safe to run repeatedly: the admin is upserted, never duplicated.
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/auth/password.ts';

if (process.env.NODE_ENV === 'production' && !process.env.SEED_ADMIN_PASSWORD) {
  console.error('Refusing to seed in production without SEED_ADMIN_PASSWORD (the default is public in git).');
  process.exit(1);
}

const ADMIN = {
  email: (process.env.SEED_ADMIN_EMAIL ?? 'abuur@gmail.com').trim().toLowerCase(),
  password: process.env.SEED_ADMIN_PASSWORD ?? 'abuur@1234',
  firstName: 'ABUUR',
  lastName: 'Admin',
};

const prisma = new PrismaClient();

async function seedAdmin() {
  const passwordHash = await hashPassword(ADMIN.password);

  const admin = await prisma.user.upsert({
    where: { email: ADMIN.email },
    create: {
      email: ADMIN.email,
      passwordHash,
      firstName: ADMIN.firstName,
      lastName: ADMIN.lastName,
      emailVerified: true,
      status: 'ACTIVE',
      platformRole: 'SUPER_ADMIN',
    },
    // Re-running the seed keeps an existing password unless one is given
    // explicitly, so a changed admin password is never silently reset.
    update: {
      ...(process.env.SEED_ADMIN_PASSWORD ? { passwordHash } : {}),
      status: 'ACTIVE',
      platformRole: 'SUPER_ADMIN',
    },
    select: { id: true, email: true, platformRole: true, status: true },
  });

  await prisma.auditLog.create({
    data: {
      action: 'seed.admin_upserted',
      entityType: 'User',
      entityId: admin.id,
      userId: admin.id,
      metadata: { email: admin.email },
    },
  });

  console.log(`Admin ready: ${admin.email} (${admin.platformRole}, ${admin.status})`);
  console.log('Log in with: POST /api/auth/login { "email", "password" }');
}

seedAdmin()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
