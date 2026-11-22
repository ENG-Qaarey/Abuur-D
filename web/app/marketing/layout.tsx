import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RoleShell } from "@/components/role-shell";
import { getCurrentUser } from "@/lib/session";
import { roleRoutes } from "@/lib/routes";
import { ArrowRight, Users, Clock, Inbox, Palette, BarChart3, Settings } from "lucide-react";

export const metadata: Metadata = {
  title: "Marketing Dashboard | ABUUR Digital",
  robots: { index: false, follow: false },
};

const ROLE_LABEL = { SUPER_ADMIN: "Super Admin", OWNER: "Business Owner", STAFF: "Staff", DESIGNER: "Designer", MARKETING_MANAGER: "Marketing Manager", STORE_MANAGER: "Store Manager", FINANCE_MANAGER: "Finance Manager" } as const;

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if ((user.platformRole as any) !== "MARKETING_MANAGER" && (user.platformRole as any) !== "SUPER_ADMIN" && (user.platformRole as any) !== "OWNER") {
    redirect(roleRoutes[user.platformRole as keyof typeof roleRoutes]);
  }

  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email || "Account";
  const initials = (user.firstName?.[0] ?? "") + (user.lastName?.[0] ?? "") || (user.email?.[0] ?? "A").toUpperCase();
  const today = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Mogadishu" }).format(new Date());

  return (
    <RoleShell
      user={{ name, email: user.email, roleLabel: (ROLE_LABEL as any)[user.platformRole], initials: initials.toUpperCase() }}
      today={today}
      navGroups={marketingNavGroups}
    >
      {children}
    </RoleShell>
  );
}

const marketingNavGroups = [
  { title: "Overview", items: [{ label: "Dashboard", icon: BarChart3, href: roleRoutes.MARKETING_MANAGER }] },
  { title: "Campaigns", items: [{ label: "Campaigns", icon: Palette }, { label: "WhatsApp Marketing", icon: ArrowRight }, { label: "SMS Marketing", icon: ArrowRight }] },
  { title: "Contacts", items: [{ label: "Contacts & Segments", icon: Users }] },
  { title: "Templates", items: [{ label: "Message Templates", icon: Inbox }] },
  { title: "Automation", items: [{ label: "Campaign Schedule", icon: Clock }, { label: "Automation", icon: ArrowRight }] },
  { title: "Analytics", items: [{ label: "Campaign Analytics", icon: BarChart3 }] },
  { title: "Settings", items: [{ label: "Settings", icon: Settings }] },
];
