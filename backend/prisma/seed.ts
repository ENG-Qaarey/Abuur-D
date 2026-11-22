import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/auth/password';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding ABUUR mock data...');

  // Generate real scrypt password hashes (same format as auth/password.ts verifyPassword)
  const hashSuperAdmin = await hashPassword('Admin123!');
  const hashStaff = await hashPassword('Staff123!');
  const hashOwner = await hashPassword('Owner123!');
  const hashDesigner = await hashPassword('Designer123!');
  const hashMarketing = await hashPassword('Marketing123!');
  const hashStore = await hashPassword('Store123!');
  const hashFinance = await hashPassword('Finance123!');
  const hashCustomer = await hashPassword('Customer123!');

  // ============================================================
  // 1. USERS (one per role for testing)
  // ============================================================
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@abuur.com' },
    update: {},
    create: {
      email: 'admin@abuur.com',
      phone: '+252610000001',
      firstName: 'ABUUR',
      lastName: 'Super Admin',
      passwordHash: hashSuperAdmin,
      platformRole: 'SUPER_ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
    },
  });

  const staffUser = await prisma.user.upsert({
    where: { email: 'staff@abuur.com' },
    update: {},
    create: {
      email: 'staff@abuur.com',
      phone: '+252610000002',
      firstName: 'Hodan',
      lastName: 'Staff',
      passwordHash: hashStaff,
      platformRole: 'STAFF',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
    },
  });

  const shopOwner1 = await prisma.user.upsert({
    where: { email: 'owner@cafemogadishu.com' },
    update: {},
    create: {
      email: 'owner@cafemogadishu.com',
      phone: '+252611000001',
      firstName: 'Abdullahi',
      lastName: 'Ali',
      passwordHash: hashOwner,
      platformRole: 'OWNER',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
    },
  });

  const designerUser = await prisma.user.upsert({
    where: { email: 'designer@abuur.com' },
    update: {},
    create: {
      email: 'designer@abuur.com',
      phone: '+252611000004',
      firstName: 'Fadumo',
      lastName: 'Designer',
      passwordHash: hashDesigner,
      platformRole: 'DESIGNER',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
    },
  });

  const marketingUser = await prisma.user.upsert({
    where: { email: 'marketing@abuur.com' },
    update: {},
    create: {
      email: 'marketing@abuur.com',
      phone: '+252611000005',
      firstName: 'Mohamed',
      lastName: 'Marketing',
      passwordHash: hashMarketing,
      platformRole: 'MARKETING_MANAGER',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
    },
  });

  const storeUser = await prisma.user.upsert({
    where: { email: 'store@abuur.com' },
    update: {},
    create: {
      email: 'store@abuur.com',
      phone: '+252611000006',
      firstName: 'Amina',
      lastName: 'Store',
      passwordHash: hashStore,
      platformRole: 'STORE_MANAGER',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
    },
  });

  const financeUser = await prisma.user.upsert({
    where: { email: 'finance@abuur.com' },
    update: {},
    create: {
      email: 'finance@abuur.com',
      phone: '+252611000007',
      firstName: 'Omar',
      lastName: 'Finance',
      passwordHash: hashFinance,
      platformRole: 'FINANCE_MANAGER',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
    },
  });

  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      phone: '+252612000001',
      firstName: 'Amina',
      lastName: 'Hassan',
      passwordHash: hashCustomer,
      platformRole: 'OWNER',
      status: 'ACTIVE',
      emailVerified: true,
      phoneVerified: true,
    },
  });

  console.log(`✅ Created ${8} users`);

  // ============================================================
  // 2. BUSINESSES (Shops)
  // ============================================================
  const bizCafe = await prisma.business.upsert({
    where: { slug: 'cafe-mogadishu' },
    update: {},
    create: {
      name: 'Cafe Mogadishu',
      slug: 'cafe-mogadishu',
      description: 'Traditional Somali coffee and tea shop in the heart of Mogadishu',
      industry: 'Food & Beverage',
      email: 'info@cafemogadishu.com',
      phone: '+252611000001',
      address: 'Maka Al-Mukarama Road, Mogadishu, Somalia',
      status: 'ACTIVE',
      settings: { theme: 'warm', currency: 'USD', city: 'Mogadishu', country: 'SO' },
    },
  });

  const bizMart = await prisma.business.upsert({
    where: { slug: 'somali-mart' },
    update: {},
    create: {
      name: 'Somali Mart',
      slug: 'somali-mart',
      description: 'General grocery and provisions store',
      industry: 'Retail',
      email: 'orders@somalimart.com',
      phone: '+252611000002',
      address: 'Bakara Market, Mogadishu, Somalia',
      status: 'ACTIVE',
      settings: { theme: 'fresh', currency: 'USD', city: 'Mogadishu', country: 'SO' },
    },
  });

  const bizShop = await prisma.business.upsert({
    where: { slug: 'hargeisa-digital-shop' },
    update: {},
    create: {
      name: 'Hargeisa Digital Shop',
      slug: 'hargeisa-digital-shop',
      description: 'Electronics and mobile accessories store',
      industry: 'Electronics',
      email: 'sales@hargeisashop.com',
      phone: '+252611000003',
      address: 'Independence Avenue, Hargeisa, Somaliland',
      status: 'ACTIVE',
      settings: { theme: 'tech', currency: 'USD', city: 'Hargeisa', country: 'SO' },
    },
  });

  const bizPending = await prisma.business.upsert({
    where: { slug: 'new-supply-co' },
    update: {},
    create: {
      name: 'New Supply Co.',
      slug: 'new-supply-co',
      description: 'Wholesale office supplies (pending approval)',
      industry: 'Office Supplies',
      email: 'hello@newsupply.co',
      phone: '+252611000004',
      address: 'Industrial Area, Mogadishu, Somalia',
      status: 'PENDING_APPROVAL',
      settings: { theme: 'neutral', currency: 'USD', city: 'Mogadishu', country: 'SO' },
    },
  });

  console.log(`✅ Created ${4} businesses`);

  // ============================================================
  // 3. BUSINESS MEMBERSHIPS
  // ============================================================
  await prisma.businessMembership.create({
    data: {
      userId: superAdmin.id,
      businessId: bizCafe.id,
      role: 'ADMIN',
      status: 'ACTIVE',
      joinedAt: new Date(),
    },
  });
  await prisma.businessMembership.create({
    data: {
      userId: shopOwner1.id,
      businessId: bizCafe.id,
      role: 'OWNER',
      status: 'ACTIVE',
      joinedAt: new Date(),
    },
  });
  await prisma.businessMembership.create({
    data: {
      userId: staffUser.id,
      businessId: bizCafe.id,
      role: 'MANAGER',
      status: 'ACTIVE',
      joinedAt: new Date(),
    },
  });
  await prisma.businessMembership.create({
    data: {
      userId: customerUser.id,
      businessId: bizMart.id,
      role: 'OWNER',
      status: 'ACTIVE',
      joinedAt: new Date(),
    },
  });

  console.log(`✅ Created business memberships`);

  // ============================================================
  // 4. STORES (Shop frontends)
  // ============================================================
  const storeCafe = await prisma.store.upsert({
    where: { slug: 'cafe-mogadishu-store' },
    update: {},
    create: {
      businessId: bizCafe.id,
      createdById: shopOwner1.id,
      name: 'Cafe Mogadishu Online Store',
      slug: 'cafe-mogadishu-store',
      description: 'Order Somali coffee, tea, and snacks online',
      whatsappNumber: '+252611000001',
      phone: '+252611000001',
      email: 'info@cafemogadishu.com',
      address: 'Maka Al-Mukarama Road, Mogadishu',
      city: 'Mogadishu',
      status: 'ACTIVE',
      currency: 'USD',
      settings: { deliveryFee: 2.0, minOrder: 5.0 },
    },
  });

  const storeMart = await prisma.store.upsert({
    where: { slug: 'somali-mart-store' },
    update: {},
    create: {
      businessId: bizMart.id,
      createdById: customerUser.id,
      name: 'Somali Mart Grocery Store',
      slug: 'somali-mart-store',
      description: 'Fresh groceries delivered to your door',
      whatsappNumber: '+252611000002',
      phone: '+252611000002',
      email: 'orders@somalimart.com',
      address: 'Bakara Market, Mogadishu',
      city: 'Mogadishu',
      status: 'ACTIVE',
      currency: 'USD',
      settings: { deliveryFee: 3.0, minOrder: 10.0 },
    },
  });

  const storeShop = await prisma.store.upsert({
    where: { slug: 'hargeisa-digital-store' },
    update: {},
    create: {
      businessId: bizShop.id,
      createdById: designerUser.id,
      name: 'Hargeisa Digital Store',
      slug: 'hargeisa-digital-store',
      description: 'Phones, accessories, and electronics',
      whatsappNumber: '+252611000003',
      phone: '+252611000003',
      email: 'sales@hargeisashop.com',
      address: 'Independence Avenue, Hargeisa',
      city: 'Hargeisa',
      status: 'ACTIVE',
      currency: 'USD',
      settings: { deliveryFee: 5.0, minOrder: 20.0 },
    },
  });

  console.log(`✅ Created ${3} stores`);

  // ============================================================
  // 5. PRODUCT CATEGORIES
  // ============================================================
  const catCoffee = await prisma.productCategory.upsert({
    where: { storeId_slug: { storeId: storeCafe.id, slug: 'coffee-tea' } },
    update: {},
    create: {
      storeId: storeCafe.id,
      name: 'Coffee & Tea',
      slug: 'coffee-tea',
      description: 'Traditional Somali qaxwa and shaah',
      sortOrder: 1,
    },
  });
  const catSnacks = await prisma.productCategory.upsert({
    where: { storeId_slug: { storeId: storeCafe.id, slug: 'snacks' } },
    update: {},
    create: {
      storeId: storeCafe.id,
      name: 'Snacks & Sweets',
      slug: 'snacks',
      description: 'Sambusa, halwa, and traditional treats',
      sortOrder: 2,
    },
  });

  const catGrains = await prisma.productCategory.upsert({
    where: { storeId_slug: { storeId: storeMart.id, slug: 'grains' } },
    update: {},
    create: {
      storeId: storeMart.id,
      name: 'Grains & Staples',
      slug: 'grains',
      description: 'Rice, flour, pasta, and cooking staples',
      sortOrder: 1,
    },
  });
  const catOil = await prisma.productCategory.upsert({
    where: { storeId_slug: { storeId: storeMart.id, slug: 'oil-sugar' } },
    update: {},
    create: {
      storeId: storeMart.id,
      name: 'Oil & Sugar',
      slug: 'oil-sugar',
      description: 'Cooking oil, sugar, and salt',
      sortOrder: 2,
    },
  });

  const catPhones = await prisma.productCategory.upsert({
    where: { storeId_slug: { storeId: storeShop.id, slug: 'phones' } },
    update: {},
    create: {
      storeId: storeShop.id,
      name: 'Mobile Phones',
      slug: 'phones',
      description: 'Smartphones and feature phones',
      sortOrder: 1,
    },
  });
  const catAccessories = await prisma.productCategory.upsert({
    where: { storeId_slug: { storeId: storeShop.id, slug: 'accessories' } },
    update: {},
    create: {
      storeId: storeShop.id,
      name: 'Accessories',
      slug: 'accessories',
      description: 'Chargers, cases, headphones, and more',
      sortOrder: 2,
    },
  });

  console.log(`✅ Created product categories`);

  // ============================================================
  // 6. PRODUCTS (Shop products)
  // ============================================================
  await prisma.product.upsert({
    where: { storeId_slug: { storeId: storeCafe.id, slug: 'somali-coffee' } },
    update: {},
    create: {
      storeId: storeCafe.id,
      categoryId: catCoffee.id,
      name: 'Somali Qaxwa (Traditional Coffee)',
      slug: 'somali-coffee',
      description: 'Freshly ground traditional Somali coffee, served with cardamom',
      sku: 'CAF-QXW-001',
      price: 2.50,
      compareAtPrice: 3.00,
      currency: 'USD',
      stock: 100,
      status: 'ACTIVE',
      images: ['/images/cafe-coffee.jpg'],
    },
  });
  await prisma.product.upsert({
    where: { storeId_slug: { storeId: storeCafe.id, slug: 'somali-tea' } },
    update: {},
    create: {
      storeId: storeCafe.id,
      categoryId: catCoffee.id,
      name: 'Somali Shaah (Spiced Tea)',
      slug: 'somali-tea',
      description: 'Spiced black tea with cardamom and cloves',
      sku: 'CAF-SHA-002',
      price: 1.50,
      currency: 'USD',
      stock: 150,
      status: 'ACTIVE',
      images: ['/images/cafe-tea.jpg'],
    },
  });
  await prisma.product.upsert({
    where: { storeId_slug: { storeId: storeCafe.id, slug: 'sambusa' } },
    update: {},
    create: {
      storeId: storeCafe.id,
      categoryId: catSnacks.id,
      name: 'Beef Sambusa (4 pcs)',
      slug: 'sambusa',
      description: 'Crispy triangular pastries filled with spiced beef',
      sku: 'CAF-SAM-003',
      price: 3.00,
      stock: 50,
      status: 'ACTIVE',
      images: ['/images/cafe-sambusa.jpg'],
    },
  });
  await prisma.product.upsert({
    where: { storeId_slug: { storeId: storeCafe.id, slug: 'halwa' } },
    update: {},
    create: {
      storeId: storeCafe.id,
      categoryId: catSnacks.id,
      name: 'Somali Halwa (250g)',
      slug: 'halwa',
      description: 'Traditional Somali gelatinous sweet',
      sku: 'CAF-HAL-004',
      price: 4.00,
      stock: 30,
      status: 'ACTIVE',
      images: ['/images/cafe-halwa.jpg'],
    },
  });

  await prisma.product.upsert({
    where: { storeId_slug: { storeId: storeMart.id, slug: 'basmati-rice' } },
    update: {},
    create: {
      storeId: storeMart.id,
      categoryId: catGrains.id,
      name: 'Basmati Rice (5kg)',
      slug: 'basmati-rice',
      description: 'Premium long-grain basmati rice',
      sku: 'MAR-BAS-001',
      price: 12.00,
      stock: 200,
      status: 'ACTIVE',
      images: ['/images/mart-rice.jpg'],
    },
  });
  await prisma.product.upsert({
    where: { storeId_slug: { storeId: storeMart.id, slug: 'wheat-flour' } },
    update: {},
    create: {
      storeId: storeMart.id,
      categoryId: catGrains.id,
      name: 'Wheat Flour (2kg)',
      slug: 'wheat-flour',
      description: 'All-purpose wheat flour for baking',
      sku: 'MAR-FLO-002',
      price: 3.50,
      stock: 100,
      status: 'ACTIVE',
      images: ['/images/mart-flour.jpg'],
    },
  });
  await prisma.product.upsert({
    where: { storeId_slug: { storeId: storeMart.id, slug: 'cooking-oil' } },
    update: {},
    create: {
      storeId: storeMart.id,
      categoryId: catOil.id,
      name: 'Cooking Oil (2L)',
      slug: 'cooking-oil',
      description: 'Vegetable cooking oil',
      sku: 'MAR-OIL-003',
      price: 6.00,
      stock: 80,
      status: 'ACTIVE',
      images: ['/images/mart-oil.jpg'],
    },
  });
  await prisma.product.upsert({
    where: { storeId_slug: { storeId: storeMart.id, slug: 'sugar' } },
    update: {},
    create: {
      storeId: storeMart.id,
      categoryId: catOil.id,
      name: 'White Sugar (2kg)',
      slug: 'sugar',
      description: 'Refined white sugar',
      sku: 'MAR-SUG-004',
      price: 4.00,
      stock: 120,
      status: 'ACTIVE',
      images: ['/images/mart-sugar.jpg'],
    },
  });

  await prisma.product.upsert({
    where: { storeId_slug: { storeId: storeShop.id, slug: 'infinix-note' } },
    update: {},
    create: {
      storeId: storeShop.id,
      categoryId: catPhones.id,
      name: 'Infinix Note 30 5G',
      slug: 'infinix-note',
      description: '6.78 inch display, 8GB RAM, 256GB storage, 5000mAh battery',
      sku: 'SHO-INF-001',
      price: 199.00,
      compareAtPrice: 220.00,
      stock: 15,
      status: 'ACTIVE',
      images: ['/images/shop-infinix.jpg'],
    },
  });
  await prisma.product.upsert({
    where: { storeId_slug: { storeId: storeShop.id, slug: 'samsung-galaxy-a14' } },
    update: {},
    create: {
      storeId: storeShop.id,
      categoryId: catPhones.id,
      name: 'Samsung Galaxy A14',
      slug: 'samsung-galaxy-a14',
      description: '6.6 inch display, 4GB RAM, 128GB storage',
      sku: 'SHO-SAM-002',
      price: 179.00,
      stock: 10,
      status: 'ACTIVE',
      images: ['/images/shop-samsung.jpg'],
    },
  });
  await prisma.product.upsert({
    where: { storeId_slug: { storeId: storeShop.id, slug: 'usb-c-cable' } },
    update: {},
    create: {
      storeId: storeShop.id,
      categoryId: catAccessories.id,
      name: 'USB-C Fast Charging Cable (1m)',
      slug: 'usb-c-cable',
      description: 'Durable braided USB-C cable, 60W fast charging',
      sku: 'SHO-USB-003',
      price: 8.00,
      stock: 60,
      status: 'ACTIVE',
      images: ['/images/shop-cable.jpg'],
    },
  });
  await prisma.product.upsert({
    where: { storeId_slug: { storeId: storeShop.id, slug: 'phone-case' } },
    update: {},
    create: {
      storeId: storeShop.id,
      categoryId: catAccessories.id,
      name: 'Silicone Phone Case',
      slug: 'phone-case',
      description: 'Shock-absorbent silicone case for most smartphones',
      sku: 'SHO-CAS-004',
      price: 5.00,
      stock: 80,
      status: 'ACTIVE',
      images: ['/images/shop-case.jpg'],
    },
  });

  console.log(`✅ Created ${12} products`);

  // ============================================================
  // 7. STORE CUSTOMER
  // ============================================================
  await prisma.storeCustomer.create({
    data: {
      storeId: storeCafe.id,
      userId: customerUser.id,
      name: 'Amina Hassan',
      phone: '+252612000001',
      email: 'customer@example.com',
      address: 'Hodan District, Mogadishu',
    },
  });

  console.log(`✅ Created store customer`);

  // ============================================================
  // 8. PLAN & SUBSCRIPTION
  // ============================================================
  const planStarter = await prisma.plan.upsert({
    where: { slug: 'starter' },
    update: {},
    create: {
      name: 'Starter Plan',
      slug: 'starter',
      description: 'Perfect for small shops getting online',
      price: 9.99,
      currency: 'USD',
      interval: 'MONTHLY',
      features: { products: 100, stores: 1, whatsappOrders: true },
      limits: { maxProducts: 100, maxStores: 1 },
      isActive: true,
    },
  });

  await prisma.subscription.create({
    data: {
      planId: planStarter.id,
      businessId: bizCafe.id,
      status: 'ACTIVE',
      startDate: new Date(),
      nextBillingAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      metadata: { source: 'seed' },
    },
  });

  console.log(`✅ Created plan and subscription`);

  // ============================================================
  // 9. NOTIFICATIONS
  // ============================================================
  await prisma.notification.create({
    data: {
      userId: shopOwner1.id,
      title: 'Welcome to ABUUR!',
      message: 'Your shop "Cafe Mogadishu" is now live on the platform.',
      type: 'INFO',
      isRead: false,
      actionUrl: '/dashboard',
    },
  });
  await prisma.notification.create({
    data: {
      userId: customerUser.id,
      title: 'New Order Received',
      message: 'You have a new order from Somali Mart.',
      type: 'ORDER',
      isRead: false,
      actionUrl: '/orders',
    },
  });

  console.log(`✅ Created notifications`);

  // ============================================================
  // 10. AUDIT LOGS
  // ============================================================
  await prisma.auditLog.create({
    data: {
      businessId: bizCafe.id,
      userId: shopOwner1.id,
      action: 'SHOP_CREATED',
      entityType: 'business',
      entityId: bizCafe.id,
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (ABUUR Web)',
      metadata: { source: 'seed' },
    },
  });

  console.log(`✅ Created audit log`);
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
