import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RoleShell } from "@/components/role-shell";
import { getCurrentUser } from "@/lib/session";
import { roleRoutes } from "@/lib/routes";
import { ArrowRight, Boxes, Building2, Users, CreditCard, Clock, BarChart3, Settings, Store, Clipboard } from "lucide-react";

export const metadata: Metadata = {
  title: "Store Dashboard | ABUUR Digital",
  robots: { index: false, follow: false },
};

const ROLE_LABEL = { SUPER_ADMIN: "Super Admin", OWNER: "Business Owner", STAFF: "Staff", DESIGNER: "Designer", MARKETING_MANAGER: "Marketing Manager", STORE_MANAGER: "Store Manager", FINANCE_MANAGER: "Finance Manager" } as const;

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if ((user.platformRole as any) !== "STORE_MANAGER" && (user.platformRole as any) !== "SUPER_ADMIN" && (user.platformRole as any) !== "OWNER") {
    redirect(roleRoutes[user.platformRole as keyof typeof roleRoutes]);
  }

  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email || "Account";
  const initials = (user.firstName?.[0] ?? "") + (user.lastName?.[0] ?? "") || (user.email?.[0] ?? "A").toUpperCase();
  const today = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Mogadishu" }).format(new Date());

  return (
    <RoleShell
      user={{ name, email: user.email, roleLabel: (ROLE_LABEL as any)[user.platformRole], initials: initials.toUpperCase() }}
      today={today}
      navGroups={storeNavGroups}
    >
      {children}
    </RoleShell>
  );
}

const storeNavGroups = [
  { title: "Overview", items: [{ label: "Dashboard", icon: Building2, href: roleRoutes.STORE_MANAGER }] },
  { title: "Store", items: [{ label: "My Store", icon: Store }, { label: "Products", icon: Boxes }, { label: "Categories", icon: Boxes }] },
  { title: "Orders", items: [{ label: "Orders", icon: Clipboard }] },
  { title: "Customers", items: [{ label: "Customers", icon: Users }] },
  { title: "Inventory", items: [{ label: "Inventory", icon: Boxes }] },
  { title: "Discounts", items: [{ label: "Discounts", icon: CreditCard }] },
  { title: "Analytics", items: [{ label: "Store Analytics", icon: BarChart3 }] },
  { title: "Settings", items: [{ label: "Store Settings", icon: Settings }, { label: "Subscription", icon: CreditCard }] },
];
