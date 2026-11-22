import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RoleShell } from "@/components/role-shell";
import { getCurrentUser } from "@/lib/session";
import { roleRoutes } from "@/lib/routes";
import { Building2, Boxes, Clipboard, CreditCard, Store, Users, ArrowRight, Palette, LayoutGrid, Settings } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard | ABUUR Digital",
  robots: { index: false, follow: false },
};

const ROLE_LABEL = { SUPER_ADMIN: "Super Admin", OWNER: "Business Owner", STAFF: "Staff", DESIGNER: "Designer", MARKETING_MANAGER: "Marketing Manager", STORE_MANAGER: "Store Manager", FINANCE_MANAGER: "Finance Manager" } as const;

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if ((user.platformRole as any) !== "OWNER" && (user.platformRole as any) !== "SUPER_ADMIN") {
    redirect(roleRoutes[user.platformRole as keyof typeof roleRoutes]);
  }

  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email || "Account";
  const initials = (user.firstName?.[0] ?? "") + (user.lastName?.[0] ?? "") || (user.email?.[0] ?? "A").toUpperCase();
  const today = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Mogadishu" }).format(new Date());

  return (
    <RoleShell
      user={{ name, email: user.email, roleLabel: (ROLE_LABEL as any)[user.platformRole], initials: initials.toUpperCase() }}
      today={today}
      navGroups={ownerNavGroups}
    >
      {children}
    </RoleShell>
  );
}

const ownerNavGroups = [
  { title: "Overview", items: [{ label: "Dashboard", icon: LayoutGrid, href: roleRoutes.OWNER }] },
  {
    title: "Business",
    items: [
      { label: "My Business", icon: Building2 },
      { label: "CRM", icon: Users },
      { label: "Customers", icon: Users },
      { label: "Leads", icon: Users },
      { label: "Sales Pipeline", icon: ArrowRight },
    ],
  },
  {
    title: "Creative",
    items: [
      { label: "Creative Projects", icon: Palette, href: roleRoutes.DESIGNER },
    ],
  },
  {
    title: "Marketing",
    items: [
      { label: "Marketing", icon: Boxes, href: roleRoutes.MARKETING_MANAGER },
      { label: "WhatsApp Campaigns", icon: ArrowRight },
      { label: "SMS Campaigns", icon: ArrowRight },
    ],
  },
  {
    title: "Store",
    items: [
      { label: "Store", icon: Store, href: roleRoutes.STORE_MANAGER },
      { label: "Products", icon: Boxes },
      { label: "Orders", icon: Clipboard },
    ],
  },
  {
    title: "Finance",
    items: [
      { label: "Invoices", icon: Clipboard },
      { label: "Payments", icon: CreditCard },
      { label: "Business Finance", icon: CreditCard, href: roleRoutes.FINANCE_MANAGER },
    ],
  },
  { title: "Analytics", items: [{ label: "Analytics", icon: Boxes }] },
  { title: "Team", items: [{ label: "Team Management", icon: Users }] },
  { title: "Subscription", items: [{ label: "Subscription", icon: CreditCard }] },
  { title: "Settings", items: [{ label: "Settings", icon: Settings }] },
];
