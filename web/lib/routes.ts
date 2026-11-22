/** In-app routes for the ABUUR Digital web app. */
export const routes = {
  home: "/",
  services: "/services",
  stores: "/stores",
  solutions: "/solutions",
  howItWorks: "/#how-it-works",
  pricing: "/pricing",
  about: "/about",
  contact: "/contact",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  dashboard: "/dashboard",
  terms: "/terms",
  privacy: "/privacy",
} as const;

/** Super Admin console. Platform Admin role. */
export const adminRoutes = {
  dashboard: "/admin",
  analytics: "/admin/analytics",
  notifications: "/admin/notifications",
  businesses: "/admin/businesses",
  business: (id: string) => `/admin/businesses/${id}`,
  verification: "/admin/businesses/verification",
  users: "/admin/users",
  userRoles: "/admin/users/roles",
  subscriptions: "/admin/subscriptions",
  plans: "/admin/plans",
  discounts: "/admin/discounts",
  payments: "/admin/payments",
  transactions: "/admin/transactions",
  refunds: "/admin/refunds",
  modules: "/admin/modules",
  features: "/admin/features",
  creative: "/admin/creative",
  marketing: "/admin/marketing",
  stores: "/admin/stores",
  integrations: "/admin/integrations",
  support: "/admin/support",
  permissions: "/admin/permissions",
  auditLogs: "/admin/audit-logs",
  system: "/admin/system",
  settings: "/admin/settings",
  exportBusinesses: "/admin/businesses/export",
  packages: "/admin/packages",
  whatsappProviders: "/admin/integrations/whatsapp",
  smsProviders: "/admin/integrations/sms",
  platformFinance: "/admin/finance",
  reports: "/admin/analytics",
} as const;

/** Role-based dashboard routes. */
export const roleRoutes = {
  SUPER_ADMIN: "/admin",
  OWNER: "/dashboard",
  STAFF: "/staff",
  DESIGNER: "/creative",
  MARKETING_MANAGER: "/marketing",
  STORE_MANAGER: "/store",
  FINANCE_MANAGER: "/finance",
} as const;

export const CONTACT_EMAIL = "hello@abuur.so";
