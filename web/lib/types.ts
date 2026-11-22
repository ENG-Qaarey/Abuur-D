/** Matches the backend Prisma enum. */
export type PlatformRole =
  | "USER"
  | "ABUUR_STAFF"
  | "SUPER_ADMIN"
  | "OWNER"
  | "STAFF"
  | "DESIGNER"
  | "MARKETING_MANAGER"
  | "STORE_MANAGER"
  | "FINANCE_MANAGER";

/** GET /users item (Super Admin only). */
export type AdminUser = {
  id: string;
  email: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  status: string;
  platformRole: PlatformRole;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SessionUser = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  status: string;
  platformRole: PlatformRole;
};

/** `data` of POST /auth/login, /auth/register and /auth/supabase. */
export type AuthResponse = {
  access_token: string;
  expires_in?: string;
  user: SessionUser;
};

export type Business = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  industry: string | null;
  status: string;
  myRole: string;
  createdAt: string;
};

/** GET /businesses/admin/list item (platform admins only). */
export type AdminBusiness = Omit<Business, "myRole"> & {
  owners: { id: string; email: string | null; phone: string | null; firstName: string | null; lastName: string | null }[];
  memberCount: number;
  storeCount: number;
  subscription: {
    id: string;
    status: string;
    endDate: string | null;
    trialEndsAt: string | null;
    plan: { id: string; name: string; interval: string; price: string | number };
  } | null;
};

/** GET /businesses/:id/members item. */
export type BusinessMember = {
  id: string;
  role: string;
  status: string;
  joinedAt: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
  };
};

/** GET /contact-messages item (platform admins only). */
export type ContactMessage = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  businessName: string | null;
  topic: string;
  message: string;
  status: string;
  createdAt: string;
};

export type Plan = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: string | number;
  currency: string;
  interval: string;
  features: unknown;
  limits: unknown;
};

export type AdminSubscription = {
  id: string;
  status: string;
  startDate: string;
  endDate: string | null;
  trialEndsAt: string | null;
  nextBillingAt: string | null;
  cancelledAt: string | null;
  externalSubscriptionId: string | null;
  createdAt: string;
  plan: { id: string; name: string; slug: string; price: string | number; currency: string; interval: string };
  business: { id: string; name: string; slug: string; status: string };
};

export type AdminPayment = {
  id: string;
  amount: string | number;
  currency: string;
  status: string;
  method: string | null;
  provider: string | null;
  reference: string | null;
  paidAt: string | null;
  createdAt: string;
  business: { id: string; name: string; slug: string };
  invoice: { id: string; invoiceNumber: string; status: string } | null;
};

export type AdminAuditLog = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: unknown;
  createdAt: string;
};

export type AdminFinanceTransaction = {
  id: string;
  businessId: string;
  type: string;
  amount: string | number;
  currency: string;
  category: string | null;
  description: string | null;
  reference: string | null;
  transactionDate: string;
  createdAt: string;
};

/** Result shape every form Server Action returns to useActionState. */
export type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
  /** Non-secret values to put back into the form after an error (never passwords). */
  fields?: Record<string, string>;
};

export const IDLE: FormState = { status: "idle" };
