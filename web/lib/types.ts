export type PlatformRole = "USER" | "ADMIN" | "SUPER_ADMIN";

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
};

export const IDLE: FormState = { status: "idle" };
