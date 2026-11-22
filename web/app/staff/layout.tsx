import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RoleShell } from "@/components/role-shell";
import { getCurrentUser } from "@/lib/session";
import { roleRoutes } from "@/lib/routes";
import { ArrowRight, Boxes, Building2, Clipboard, Users, Palette } from "lucide-react";

export const metadata: Metadata = {
  title: "Staff Dashboard | ABUUR Digital",
  robots: { index: false, follow: false },
};

const ROLE_LABEL = { SUPER_ADMIN: "Super Admin", OWNER: "Business Owner", STAFF: "Staff", DESIGNER: "Designer", MARKETING_MANAGER: "Marketing Manager", STORE_MANAGER: "Store Manager", FINANCE_MANAGER: "Finance Manager" } as const;

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if ((user.platformRole as any) !== "STAFF" && (user.platformRole as any) !== "SUPER_ADMIN" && (user.platformRole as any) !== "OWNER") {
    redirect(roleRoutes[user.platformRole as keyof typeof roleRoutes]);
  }

  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email || "Account";
  const initials = (user.firstName?.[0] ?? "") + (user.lastName?.[0] ?? "") || (user.email?.[0] ?? "A").toUpperCase();
  const today = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Mogadishu" }).format(new Date());

  return (
    <RoleShell
      user={{ name, email: user.email, roleLabel: (ROLE_LABEL as any)[user.platformRole], initials: initials.toUpperCase() }}
      today={today}
      navGroups={staffNavGroups}
    >
      {children}
    </RoleShell>
  );
}

const staffNavGroups = [
  { title: "Overview", items: [{ label: "Dashboard", icon: Building2, href: roleRoutes.STAFF }] },
  { title: "Tasks", items: [{ label: "Assigned Tasks", icon: Clipboard }] },
  { title: "Customers", items: [{ label: "Customers", icon: Users }] },
  { title: "Leads", items: [{ label: "Leads", icon: Users }] },
  { title: "Creative", items: [{ label: "Creative Projects", icon: Palette, href: roleRoutes.DESIGNER }] },
  { title: "Orders", items: [{ label: "Orders", icon: Boxes }] },
  { title: "Products", items: [{ label: "Products", icon: Boxes }] },
  { title: "Notifications", items: [{ label: "Notifications", icon: ArrowRight }] },
  { title: "Profile", items: [{ label: "My Profile", icon: Users }] },
];
