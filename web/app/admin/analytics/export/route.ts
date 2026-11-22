import { NextRequest, NextResponse } from "next/server";
import { api } from "@/lib/api";
import { requireSuperAdmin } from "@/lib/admin";

function csvCell(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(request: NextRequest) {
  const { token } = await requireSuperAdmin();
  const range = request.nextUrl.searchParams.get("range") ?? "30d";
  const rangeDays: Record<string, number> = { today: 1, yesterday: 2, "7d": 7, "30d": 30, "90d": 90, "6m": 180, "12m": 365 };
  const days = rangeDays[range] ?? 30;
  const months = days >= 180 ? 12 : days > 90 ? 6 : 3;
  const [overview, revenue, growth, subscriptions, modules, support] = await Promise.all([
    api<any>(`/admin/dashboard/overview?days=${days}`, { token }),
    api<any>(`/admin/dashboard/revenue?months=${months}`, { token }),
    api<any>(`/admin/dashboard/business-growth?months=${months}`, { token }),
    api<any>("/admin/dashboard/subscriptions", { token }),
    api<any>("/admin/dashboard/module-activity", { token }),
    api<any>("/admin/dashboard/support-summary", { token }),
  ]);

  await api("/audit-logs", {
    method: "POST",
    token,
    body: { action: "analytics.export", entityType: "AnalyticsReport", metadata: { range, format: "CSV" } },
  });

  const rows: unknown[][] = [
    ["ABUUR DIGITAL Platform Analytics Report"],
    ["Selected range", range],
    ["Generated", new Date().toISOString()],
    [],
    ["Section", "Metric", "Value"],
  ];

  if (overview.ok) {
    const data = overview.data;
    rows.push(
      ["Overview", "Total businesses", data.businesses.total],
      ["Overview", "Active businesses", data.businesses.active],
      ["Overview", "Total users", data.users.total],
      ["Overview", "Active users", data.users.active],
      ["Revenue", "MRR", data.revenue.mrr],
      ["Revenue", "ARR", data.revenue.arr],
      ["Subscriptions", "Active", data.subscriptions.active],
      ["Subscriptions", "Trial", data.subscriptions.trial],
      ["Stores", "Total", data.stores.total],
      ["Payments", "Collected", data.payments.collected],
      ["Payments", "Failed", data.payments.failed],
    );
  }
  if (revenue.ok) {
    rows.push([], ["Revenue month", "Subscription revenue", "Paid payments"]);
    for (const row of revenue.data.trend ?? []) rows.push([row.month, row.subscription, row.payments]);
  }
  if (growth.ok) {
    rows.push([], ["Business month", "Registrations"]);
    for (const row of growth.data.trend ?? []) rows.push([row.month, row.count]);
  }
  if (subscriptions.ok) {
    rows.push([], ["Subscription plan", "Subscribers"]);
    for (const row of subscriptions.data.distribution ?? []) rows.push([row.plan, row.count]);
  }
  if (modules.ok) {
    rows.push([], ["Module", "Metric", "Value"]);
    for (const [moduleName, moduleData] of Object.entries(modules.data)) {
      for (const [metric, value] of Object.entries(moduleData as Record<string, number>)) rows.push([moduleName, metric, value]);
    }
  }
  if (support.ok) {
    rows.push([], ["Support", "Open", support.data.open], ["Support", "Handled", support.data.handled], ["Support", "Archived", support.data.archived]);
  }

  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="abuur-platform-analytics-${range}-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
