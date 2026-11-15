import {
  Activity,
  BarChart3,
  Bell,
  Building2,
  CreditCard,
  FileClock,
  KeyRound,
  LayoutGrid,
  LifeBuoy,
  Megaphone,
  Palette,
  Plug,
  Puzzle,
  Settings,
  Store,
  Tags,
  Users,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { adminRoutes as r } from "@/lib/routes";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Extra paths that should highlight this item (sub-pages without their own sidebar entry). */
  also?: string[];
};
export type AdminNavGroup = { title: string; items: AdminNavItem[] };

export const ADMIN_NAV: AdminNavGroup[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: r.dashboard, icon: LayoutGrid },
      { label: "Platform Analytics", href: r.analytics, icon: BarChart3 },
      { label: "Notifications", href: r.notifications, icon: Bell },
    ],
  },
  {
    title: "Platform Management",
    items: [
      { label: "Businesses", href: r.businesses, icon: Building2 },
      { label: "Users", href: r.users, icon: Users },
      { label: "Subscriptions", href: r.subscriptions, icon: WalletCards },
      { label: "Plans & Pricing", href: r.plans, icon: Tags, also: [r.discounts] },
      { label: "Payments & Billing", href: r.payments, icon: CreditCard, also: [r.transactions, r.refunds] },
      { label: "Modules & Features", href: r.modules, icon: Puzzle, also: [r.features] },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Creative Management", href: r.creative, icon: Palette },
      { label: "Marketing Management", href: r.marketing, icon: Megaphone },
      { label: "Store Management", href: r.stores, icon: Store },
      { label: "Integrations", href: r.integrations, icon: Plug },
      { label: "Support & Tickets", href: r.support, icon: LifeBuoy },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Roles & Permissions", href: r.permissions, icon: KeyRound },
      { label: "Audit Logs", href: r.auditLogs, icon: FileClock },
      { label: "System Health", href: r.system, icon: Activity },
      { label: "Platform Settings", href: r.settings, icon: Settings },
    ],
  },
];

/** The sidebar item that owns a pathname (exact, prefix or `also` match). */
export function activeHref(pathname: string): string | undefined {
  let best: string | undefined;
  let bestLen = -1;
  for (const group of ADMIN_NAV) {
    for (const item of group.items) {
      for (const p of [item.href, ...(item.also ?? [])]) {
        const hit = p === r.dashboard ? pathname === p : pathname === p || pathname.startsWith(`${p}/`);
        if (hit && p.length > bestLen) {
          best = item.href;
          bestLen = p.length;
        }
      }
    }
  }
  return best;
}
