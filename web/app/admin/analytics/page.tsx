import Link from "next/link";
import { Building2, CreditCard, Download, Gauge, LifeBuoy, Megaphone, RefreshCw, Store, TrendingUp, Users, WalletCards } from "lucide-react";
import { api } from "@/lib/api";
import { loadBusinesses, loadPayments, loadSubscriptions, loadUsers, requireSuperAdmin } from "@/lib/admin";
import { adminRoutes as r } from "@/lib/routes";
import { ActivityChart, Donut } from "@/components/dashboard/charts";
import { Button, EmptyRow, ErrorNote, KpiGrid, PageHeader, Panel, STATUS_COLOR, StatusPill, Table, statusLabel } from "@/components/admin/ui";

const RANGE_DAYS: Record<string, number> = { today: 1, yesterday: 2, "7d": 7, "30d": 30, "90d": 90, "6m": 180, "12m": 365 };

function change(current: number, previous: number) {
  if (previous <= 0) return current > 0 ? "No previous-period baseline" : "No change";
  const value = ((current - previous) / previous) * 100;
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}% vs previous period`;
}

export default async function AnalyticsPage({ searchParams }: PageProps<"/admin/analytics">) {
  const { token } = await requireSuperAdmin();
  const raw = await searchParams;
  const range = typeof raw.range === "string" ? raw.range : "30d";
  const businessFilter = typeof raw.business === "string" ? raw.business : "";
  const planFilter = typeof raw.plan === "string" ? raw.plan : "";
  const compare = raw.compare !== "0";
  const days = RANGE_DAYS[range] ?? 30;

  const [overviewR, previousR, revenueR, growthR, subscriptionR, moduleR, supportR, businesses, users, payments, subscriptions] =
    await Promise.all([
      api<any>(`/admin/dashboard/overview?days=${days}`, { token }),
      api<any>(`/admin/dashboard/overview?days=${days * 2}`, { token }),
      api<any>(`/admin/dashboard/revenue?months=${days >= 180 ? 12 : days > 90 ? 6 : 3}`, { token }),
      api<any>(`/admin/dashboard/business-growth?months=${days >= 180 ? 12 : days > 90 ? 6 : 3}`, { token }),
      api<any>(`/admin/dashboard/subscriptions`, { token }),
      api<any>(`/admin/dashboard/module-activity`, { token }),
      api<any>(`/admin/dashboard/support-summary`, { token }),
      loadBusinesses(token),
      loadUsers(token),
      loadPayments(token),
      loadSubscriptions(token),
    ]);

  const overview = overviewR.ok ? overviewR.data : null;
  const previous = previousR.ok ? previousR.data : null;
  const revenue = revenueR.ok ? revenueR.data : null;
  const growth = growthR.ok ? growthR.data : null;
  const subscriptionHealth = subscriptionR.ok ? subscriptionR.data : null;
  const modules = moduleR.ok ? moduleR.data : null;
  const support = supportR.ok ? supportR.data : null;

  const businessItems = businesses.data.items;
  const userItems = users.data;
  const paymentItems = payments.data.filter((item) => !businessFilter || item.business.id === businessFilter);
  const subscriptionItems = subscriptions.data.filter((item) =>
    (!businessFilter || item.business.id === businessFilter) && (!planFilter || item.plan.id === planFilter));

  const paid = paymentItems.filter((item) => item.status === "PAID");
  const collected = paid.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const refunded = paymentItems.filter((item) => item.status === "REFUNDED").reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const failed = paymentItems.filter((item) => item.status === "FAILED").reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const pending = paymentItems.filter((item) => item.status === "PENDING").reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const mrr = subscriptionItems.filter((item) => ["ACTIVE", "TRIALING", "PAST_DUE"].includes(item.status)).reduce((sum, item) => {
    const price = Number(item.plan.price);
    return sum + (item.plan.interval === "YEARLY" ? price / 12 : item.plan.interval === "QUARTERLY" ? price / 3 : price);
  }, 0);

  const currentNewBusinesses = overview?.businesses?.newThisPeriod ?? 0;
  const previousNewBusinesses = previous ? Math.max(0, previous.businesses.newThisPeriod - currentNewBusinesses) : 0;
  const currentNewUsers = overview?.users?.newThisPeriod ?? 0;
  const previousNewUsers = previous ? Math.max(0, previous.users.newThisPeriod - currentNewUsers) : 0;

  const bizSegments = ["ACTIVE", "PENDING_APPROVAL", "SUSPENDED", "INACTIVE"].map((status) => ({
    label: statusLabel(status), value: businessItems.filter((item) => item.status === status).length, color: STATUS_COLOR[status],
  }));
  const roleCounts = userItems.reduce<Record<string, number>>((result, user) => {
    result[user.platformRole] = (result[user.platformRole] ?? 0) + 1;
    return result;
  }, {});
  const roleSegments = Object.entries(roleCounts).map(([role, value], index) => ({
    label: role.replaceAll("_", " ").toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase()),
    value,
    color: ["#0d6efd", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4"][index % 6],
  }));
  const planOptions = [...new Map(subscriptionItems.map((item) => [item.plan.id, item.plan])).values()];
  const apiError = [overviewR, revenueR, growthR].filter((result) => !result.ok).map((result) => result.message).join(" ");

  return (
    <div className="w-full min-w-0 space-y-8">
      <PageHeader
        title="Platform Analytics"
        subtitle="Monitor platform growth, collected revenue, subscription health, and real module activity."
        actions={
          <>
            <Button href={`/admin/analytics/export?range=${range}`} icon={Download}>Export CSV</Button>
            <Button href={`/admin/analytics?range=${range}`} icon={RefreshCw}>Refresh</Button>
          </>
        }
      />

      <form className="flex flex-wrap items-end gap-3 rounded-xl border border-cl-border bg-cl-card p-3" action={r.reports}>
        <label className="text-xs font-semibold text-cl-muted">Date range
          <select name="range" defaultValue={range} className="mt-1 block h-9 rounded-lg border border-cl-border bg-cl-bg px-3 text-sm">
            <option value="today">Today</option><option value="yesterday">Yesterday</option><option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option><option value="90d">Last 90 days</option><option value="6m">Last 6 months</option><option value="12m">Last 12 months</option>
          </select>
        </label>
        <label className="text-xs font-semibold text-cl-muted">Business
          <select name="business" defaultValue={businessFilter} className="mt-1 block h-9 min-w-44 rounded-lg border border-cl-border bg-cl-bg px-3 text-sm">
            <option value="">All businesses</option>
            {businessItems.map((business) => <option key={business.id} value={business.id}>{business.name}</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold text-cl-muted">Plan
          <select name="plan" defaultValue={planFilter} className="mt-1 block h-9 min-w-36 rounded-lg border border-cl-border bg-cl-bg px-3 text-sm">
            <option value="">All plans</option>
            {planOptions.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}
          </select>
        </label>
        <label className="flex h-9 items-center gap-2 text-sm text-cl-muted"><input type="checkbox" name="compare" value="1" defaultChecked={compare} />Compare previous period</label>
        <Link href={r.reports} className="h-9 rounded-lg border border-cl-border px-4 py-2 text-sm font-semibold">Reset</Link>
        <button type="submit" className="h-9 rounded-lg bg-cl-blue px-4 text-sm font-semibold text-white">Apply</button>
      </form>

      <ErrorNote message={apiError || businesses.error || users.error || payments.error || subscriptions.error} />

      <section className="space-y-4">
        <div><h2 className="text-lg font-bold">Platform performance</h2><p className="text-sm text-cl-muted">Real totals and changes for the selected period.</p></div>
        <KpiGrid items={[
          { label: "Total businesses", value: String(businesses.data.total), sub: compare ? change(currentNewBusinesses, previousNewBusinesses) : "Comparison disabled", icon: Building2, tone: "blue" },
          { label: "Total users", value: String(userItems.length), sub: compare ? change(currentNewUsers, previousNewUsers) : "Comparison disabled", icon: Users, tone: "violet" },
          { label: "Monthly recurring revenue", value: `USD ${mrr.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, sub: "Normalized active, trial, and past-due subscriptions", icon: WalletCards, tone: "emerald" },
          { label: "Annual recurring revenue", value: `USD ${(mrr * 12).toLocaleString("en-US", { maximumFractionDigits: 2 })}`, sub: "MRR × 12", icon: TrendingUp, tone: "sky" },
          { label: "Collected revenue", value: `USD ${collected.toLocaleString("en-US", { maximumFractionDigits: 2 })}`, sub: "Paid payments only", icon: CreditCard, tone: "emerald" },
          { label: "Active stores", value: String(overview?.stores?.active ?? 0), sub: `${overview?.stores?.newThisPeriod ?? 0} new in the selected period`, icon: Store, tone: "blue" },
        ]} />
      </section>

      <div className="grid items-stretch gap-5 xl:grid-cols-3">
        <Panel className="flex h-full flex-col xl:col-span-2" bodyClassName="mt-4 flex flex-1 flex-col justify-center" title="Revenue trend" subtitle="Paid payment totals and normalized subscription revenue.">
          {revenue?.trend?.length ? (
            <div>
              <ActivityChart series={[{ label: "Collected payments", color: "#10b981", dates: paid.map((item) => item.paidAt ?? item.createdAt) }]} />
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {revenue.trend.slice(-8).map((row: any) => (
                  <div key={row.month} className="rounded-lg border border-cl-border p-2 text-xs"><p className="text-cl-muted">{row.month}</p><p className="mt-1 font-bold">USD {(Number(row.subscription) + Number(row.payments)).toLocaleString("en-US", { maximumFractionDigits: 2 })}</p></div>
                ))}
              </div>
            </div>
          ) : <p className="py-10 text-center text-sm text-cl-muted">No revenue activity in the selected period.</p>}
        </Panel>
        <Panel className="flex h-full flex-col" bodyClassName="mt-4 flex flex-1 items-center justify-center" title="Revenue status" subtitle="Payment classifications.">
          <Donut size={168} segments={[
            { label: "Collected", value: collected, color: "#10b981" }, { label: "Refunded", value: refunded, color: "#8b5cf6" },
            { label: "Pending", value: pending, color: "#f59e0b" }, { label: "Failed", value: failed, color: "#ef4444" },
          ]} center={<><span className="text-xl font-bold">{paymentItems.length}</span><span className="text-xs text-cl-muted">payments</span></>} />
        </Panel>
      </div>

      <div className="grid items-stretch gap-5 lg:grid-cols-2">
        <Panel className="flex h-full flex-col" bodyClassName="mt-4 flex flex-1 flex-col justify-center" title="Business growth" subtitle="New registrations over time.">
          <ActivityChart series={[{ label: "Businesses", color: "#0d6efd", dates: businessItems.map((item) => item.createdAt) }]} />
        </Panel>
        <Panel className="flex h-full flex-col" bodyClassName="mt-4 flex flex-1 items-center" title="Business and user distribution">
          <div className="grid w-full gap-6 sm:grid-cols-2">
            <div className="flex flex-col items-center"><p className="mb-3 w-full text-xs font-semibold uppercase text-cl-muted">Businesses</p><Donut size={150} segments={bizSegments} center={<span className="text-xl font-bold">{businessItems.length}</span>} /></div>
            <div className="flex flex-col items-center"><p className="mb-3 w-full text-xs font-semibold uppercase text-cl-muted">Users</p><Donut size={150} segments={roleSegments} center={<span className="text-xl font-bold">{userItems.length}</span>} /></div>
          </div>
        </Panel>
      </div>

      <section className="space-y-4">
        <div><h2 className="text-lg font-bold">Subscription analytics</h2><p className="text-sm text-cl-muted">Cancelled and expired subscriptions are excluded from active totals.</p></div>
        <div className="grid gap-5 lg:grid-cols-3">
          <Panel title="Subscription status" subtitle={`${subscriptionItems.length} matching records`}>
            {["ACTIVE", "TRIALING", "PAST_DUE", "EXPIRED", "CANCELLED", "SUSPENDED"].map((status) => (
              <div key={status} className="flex items-center justify-between border-b border-cl-border py-2 last:border-0">
                <span className="text-sm text-cl-muted">{statusLabel(status)}</span>
                <StatusPill status={status} label={String(subscriptionItems.filter((item) => item.status === status).length)} />
              </div>
            ))}
          </Panel>
          <Panel className="lg:col-span-2" title="Expiring soon" subtitle="Subscriptions requiring renewal attention.">
            <Table head={["Business", "Plan", "Status", "Next billing"]}>
              {!subscriptionHealth?.expiringSoon?.length ? <EmptyRow cols={4}>No subscriptions expire within the next 14 days.</EmptyRow> :
                subscriptionHealth.expiringSoon.map((item: any) => (
                  <tr key={item.id}><td className="font-semibold">{item.business}</td><td>{item.plan}</td><td><StatusPill status="ACTIVE" /></td><td className="text-cl-muted">{item.date ? new Date(item.date).toLocaleDateString("en-GB") : "—"}</td></tr>
                ))}
            </Table>
          </Panel>
        </div>
      </section>

      <section className="space-y-4">
        <div><h2 className="text-lg font-bold">Module usage</h2><p className="text-sm text-cl-muted">Counts come from database records. Session activity and DAU/MAU are not available.</p></div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {modules ? [["CRM", modules.crm, r.users], ["Creative", modules.creative, r.creative], ["WhatsApp", modules.whatsapp, r.integrations], ["SMS", modules.sms, r.integrations], ["Store", modules.store, r.stores], ["Finance", modules.finance, r.platformFinance]].map(([title, data, href]) => (
            <Panel key={String(title)} title={`${title} usage`} action={<Link href={String(href)} className="text-xs font-semibold text-cl-blue">View</Link>}>
              <dl className="space-y-1 text-sm">{Object.entries(data as Record<string, number>).map(([key, value]) => (
                <div key={key} className="flex justify-between border-b border-cl-border py-2 last:border-0"><dt className="capitalize text-cl-muted">{key.replaceAll(/([A-Z])/g, " $1")}</dt><dd className="font-semibold">{value}</dd></div>
              ))}</dl>
            </Panel>
          )) : <Panel title="Module usage"><p className="text-sm text-cl-muted">Module activity could not be loaded.</p></Panel>}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Customer support" subtitle="Live contact-message records.">
          {support ? <KpiGrid items={[
            { label: "Open", value: String(support.open), sub: "new tickets", icon: LifeBuoy, tone: "rose" },
            { label: "Handled", value: String(support.handled), sub: "resolved tickets", icon: Gauge, tone: "emerald" },
            { label: "Archived", value: String(support.archived), sub: "closed tickets", icon: Megaphone, tone: "sky" },
          ]} /> : <p className="text-sm text-cl-muted">Support totals could not be loaded.</p>}
        </Panel>
        <Panel title="Operational metrics" subtitle="Only real monitoring data is shown.">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between border-b border-cl-border py-2"><dt className="text-cl-muted">API uptime</dt><dd>Not instrumented</dd></div>
            <div className="flex justify-between border-b border-cl-border py-2"><dt className="text-cl-muted">API latency</dt><dd>Not instrumented</dd></div>
            <div className="flex justify-between border-b border-cl-border py-2"><dt className="text-cl-muted">Background jobs</dt><dd>No metrics endpoint</dd></div>
            <div className="flex justify-between py-2"><dt className="text-cl-muted">Database pool</dt><dd>No metrics endpoint</dd></div>
          </dl>
          <Link href={r.system} className="mt-3 inline-block text-xs font-semibold text-cl-blue">Open System Health</Link>
        </Panel>
      </div>
    </div>
  );
}
