import { adminRoutes as r } from "@/lib/routes";

/** Sub-pages that share one sidebar entry. */
export const TABS = {
  businesses: [
    { label: "All businesses", href: r.businesses },
    { label: "Verification", href: r.verification },
  ],
  users: [
    { label: "All users", href: r.users },
    { label: "User roles", href: r.userRoles },
  ],
  plans: [
    { label: "Plans & pricing", href: r.plans },
    { label: "Coupons & discounts", href: r.discounts },
  ],
  payments: [
    { label: "Payments", href: r.payments },
    { label: "Transactions", href: r.transactions },
    { label: "Refunds", href: r.refunds },
  ],
  modules: [
    { label: "Modules", href: r.modules },
    { label: "Feature flags", href: r.features },
  ],
};
