import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RoleShell } from "@/components/role-shell";
import { getCurrentUser } from "@/lib/session";
import { roleRoutes } from "@/lib/routes";
import { ArrowRight, CreditCard, Clock, BarChart3, Inbox, Building2, Settings } from "lucide-react";

export const metadata: Metadata = {
  title: "Finance Dashboard | ABUUR Digital",
  robots: { index: false, follow: false },
};

const ROLE_LABEL = { SUPER_ADMIN: "Super Admin", OWNER: "Business Owner", STAFF: "Staff", DESIGNER: "Designer", MARKETING_MANAGER: "Marketing Manager", STORE_MANAGER: "Store Manager", FINANCE_MANAGER: "Finance Manager" } as const;

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if ((user.platformRole as any) !== "FINANCE_MANAGER" && (user.platformRole as any) !== "SUPER_ADMIN" && (user.platformRole as any) !== "OWNER") {
    redirect(roleRoutes[user.platformRole as keyof typeof roleRoutes]);
  }

  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email || "Account";
  const initials = (user.firstName?.[0] ?? "") + (user.lastName?.[0] ?? "") || (user.email?.[0] ?? "A").toUpperCase();
  const today = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Mogadishu" }).format(new Date());

  return (
    <RoleShell
      user={{ name, email: user.email, roleLabel: (ROLE_LABEL as any)[user.platformRole], initials: initials.toUpperCase() }}
      today={today}
      navGroups={financeNavGroups}
    >
      {children}
    </RoleShell>
  );
}

const financeNavGroups = [
  { title: "Overview", items: [{ label: "Dashboard", icon: Building2, href: roleRoutes.FINANCE_MANAGER }] },
  { title: "Invoices", items: [{ label: "Invoices", icon: Inbox }] },
  { title: "Payments", items: [{ label: "Payments", icon: CreditCard }] },
  { title: "Expenses", items: [{ label: "Expenses", icon: Clock }] },
  { title: "Revenue", items: [{ label: "Revenue", icon: BarChart3 }] },
  { title: "Reports", items: [{ label: "Financial Reports", icon: Building2 }] },
  { title: "Transactions", items: [{ label: "Transactions", icon: ArrowRight }] },
];
