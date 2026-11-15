/**
 * The admin roles ABUUR plans (from the admin spec). Only USER, ABUUR_STAFF and
 * SUPER_ADMIN exist in the backend today; the rest are marked as planned.
 */
export const ADMIN_ROLES = [
  { key: "SUPER_ADMIN", name: "Super Admin", live: true, about: "Full control of the ABUUR ecosystem, including roles and critical actions." },
  { key: "ADMIN", name: "Admin", live: false, about: "Day-to-day platform management without role or settings changes." },
  { key: "FINANCE_ADMIN", name: "Finance Admin", live: false, about: "Plans, subscriptions, payments, invoices and refunds." },
  { key: "SUPPORT_ADMIN", name: "Support Admin", live: false, about: "Support tickets and read-only access to businesses and users." },
  { key: "OPERATIONS_ADMIN", name: "Operations Admin", live: false, about: "Stores, creative and marketing operations, integrations." },
] as const;

type Access = "full" | "read" | "none";

export const PERMISSIONS: { area: string; access: Record<(typeof ADMIN_ROLES)[number]["key"], Access> }[] = [
  { area: "Businesses (approve, suspend)", access: { SUPER_ADMIN: "full", ADMIN: "full", FINANCE_ADMIN: "read", SUPPORT_ADMIN: "read", OPERATIONS_ADMIN: "read" } },
  { area: "Users (suspend, reactivate)", access: { SUPER_ADMIN: "full", ADMIN: "full", FINANCE_ADMIN: "none", SUPPORT_ADMIN: "read", OPERATIONS_ADMIN: "none" } },
  { area: "Plans & pricing", access: { SUPER_ADMIN: "full", ADMIN: "read", FINANCE_ADMIN: "full", SUPPORT_ADMIN: "none", OPERATIONS_ADMIN: "none" } },
  { area: "Payments, refunds", access: { SUPER_ADMIN: "full", ADMIN: "none", FINANCE_ADMIN: "full", SUPPORT_ADMIN: "none", OPERATIONS_ADMIN: "none" } },
  { area: "Modules & feature flags", access: { SUPER_ADMIN: "full", ADMIN: "read", FINANCE_ADMIN: "none", SUPPORT_ADMIN: "none", OPERATIONS_ADMIN: "read" } },
  { area: "Stores & reported content", access: { SUPER_ADMIN: "full", ADMIN: "full", FINANCE_ADMIN: "none", SUPPORT_ADMIN: "read", OPERATIONS_ADMIN: "full" } },
  { area: "Creative & marketing", access: { SUPER_ADMIN: "full", ADMIN: "read", FINANCE_ADMIN: "none", SUPPORT_ADMIN: "none", OPERATIONS_ADMIN: "full" } },
  { area: "Integrations", access: { SUPER_ADMIN: "full", ADMIN: "read", FINANCE_ADMIN: "none", SUPPORT_ADMIN: "none", OPERATIONS_ADMIN: "full" } },
  { area: "Support tickets", access: { SUPER_ADMIN: "full", ADMIN: "full", FINANCE_ADMIN: "none", SUPPORT_ADMIN: "full", OPERATIONS_ADMIN: "none" } },
  { area: "Roles & permissions", access: { SUPER_ADMIN: "full", ADMIN: "none", FINANCE_ADMIN: "none", SUPPORT_ADMIN: "none", OPERATIONS_ADMIN: "none" } },
  { area: "Audit logs", access: { SUPER_ADMIN: "full", ADMIN: "read", FINANCE_ADMIN: "read", SUPPORT_ADMIN: "none", OPERATIONS_ADMIN: "none" } },
  { area: "System health & settings", access: { SUPER_ADMIN: "full", ADMIN: "read", FINANCE_ADMIN: "none", SUPPORT_ADMIN: "none", OPERATIONS_ADMIN: "read" } },
];
