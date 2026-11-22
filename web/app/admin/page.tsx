import { api } from "@/lib/api";
import { requireSuperAdmin, greeting } from "@/lib/admin";
import { DashboardClient } from "./dashboard";

export const metadata = {
  title: "Platform Overview | ABUUR Admin",
  robots: { index: false, follow: false },
};

/** GET /admin — Platform Admin command center. */
export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string; category?: string; page?: string }>;
}) {
  const { user, token } = await requireSuperAdmin();
  const { days = "30", category, page = "1" } = await searchParams;

  const [overview, revenue, growth, subs, modules, activity, alerts, support] = await Promise.all([
    api<any>("/admin/dashboard/overview", { token, days } as any),
    api<any>("/admin/dashboard/revenue", { token }),
    api<any>("/admin/dashboard/business-growth", { token }),
    api<any>("/admin/dashboard/subscriptions", { token }),
    api<any>("/admin/dashboard/module-activity", { token }),
    api<any>(`/admin/dashboard/recent-activity${category ? `?category=${category}` : ""}`, { token }),
    api<any>("/admin/dashboard/alerts", { token }),
    api<any>("/admin/dashboard/support-summary", { token }),
  ]);

  const data = {
    overview: overview.ok ? overview.data : null,
    overviewError: overview.ok ? undefined : overview.message,
    revenue: revenue.ok ? revenue.data : { trend: [], currency: "USD" },
    revenueError: revenue.ok ? undefined : revenue.message,
    growth: growth.ok ? growth.data : null,
    growthError: growth.ok ? undefined : growth.message,
    subs: subs.ok ? subs.data : null,
    subsError: subs.ok ? undefined : subs.message,
    modules: modules.ok ? modules.data : null,
    modulesError: modules.ok ? undefined : modules.message,
    activity: activity.ok ? activity.data : { events: [], categories: [] },
    activityError: activity.ok ? undefined : activity.message,
    alerts: alerts.ok ? alerts.data.alerts : [],
    alertsError: alerts.ok ? undefined : alerts.message,
    support: support.ok ? support.data : null,
    supportError: support.ok ? undefined : support.message,
  };

  return (
    <DashboardClient
      user={{ name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email || "Admin", email: user.email }}
      greeting={greeting()}
      days={days}
      category={category ?? null}
      page={page}
      data={data}
    />
  );
}
