/** Matches the backend Prisma enum. */
export type PlatformRole = "USER" | "ABUUR_STAFF" | "SUPER_ADMIN";

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

export type AuthResponse = {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn?: string;
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
  owners: { id: string; email: string | null; firstName: string | null; lastName: string | null }[];
  memberCount: number;
  storeCount: number;
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

/** Result shape every form Server Action returns to useActionState. */
export type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
  /** Non-secret values to put back into the form after an error (never passwords). */
  fields?: Record<string, string>;
};

export const IDLE: FormState = { status: "idle" };
