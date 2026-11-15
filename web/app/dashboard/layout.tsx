import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Dashboard | ABUUR Digital",
  robots: { index: false, follow: false },
};

const ROLE_LABEL = { USER: "Business owner", ABUUR_STAFF: "ABUUR staff", SUPER_ADMIN: "Super admin" } as const;

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email || "Account";
  const initials =
    (user.firstName?.[0] ?? "") + (user.lastName?.[0] ?? "") || (user.email?.[0] ?? "A").toUpperCase();
  const today = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Mogadishu",
  }).format(new Date());

  return (
    <DashboardShell
      user={{ name, email: user.email, roleLabel: ROLE_LABEL[user.platformRole], initials: initials.toUpperCase() }}
      isAdmin={user.platformRole === "SUPER_ADMIN"}
      today={today}
    >
      {children}
    </DashboardShell>
  );
}
