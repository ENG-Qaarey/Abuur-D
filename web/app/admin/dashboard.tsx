"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Building2,
  CreditCard,
  ExternalLink,
  Plus,
  RefreshCw,
  Settings,
  Store,
  Tags,
  UserCog,
  Users,
  WalletCards,
  AlertTriangle,
  AlertCircle,
  Info,
  ArrowUpRight,
  LifeBuoy,
  FileClock,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { Panel, QuickActions, SectionLabel, StatusPill, TONES, type Tone } from "@/components/admin/ui";
import { AreaChart, BarChart, DonutChart, Sparkline, EmptyChart } from "@/components/admin/charts";

type Data = {
  overview: any;
  overviewError?: string;
  revenue: any;
  revenueError?: string;
  growth: any;
  growthError?: string;
  subs: any;
  subsError?: string;
  modules: any;
  modulesError?: string;
  activity: { events: any[]; categories: string[] };
  activityError?: string;
  alerts: { severity: string; title: string; description: string; link: string }[];
  alertsError?: string;
  support: any;
  supportError?: string;
};

const RANGES = [
  { key: "7", label: "7d" },
  { key: "30", label: "30d" },
  { key: "90", label: "90d" },
  { key: "365", label: "1y" },
] as const;

const fmtMoney = (n: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(n);
const fmtNum = (n: number) => new Intl.NumberFormat("en-US").format(n);
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Mogadishu" });

/* ------------------------------------------------------------------ */
/* KPI card                                                            */
/* ------------------------------------------------------------------ */

function Kpi({
  label,
  value,
  sub,
  icon: Icon,
  tone,
  href,
  spark,
}: {
  label: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  tone: Tone;
  href: string;
  spark?: number[];
}) {
  return (
    <Link href={href} className="group block">
      <div className="rounded-xl border border-cl-border bg-cl-card p-4 shadow-[0_1px_3px_rgba(16,24,40,0.05)] transition hover:border-cl-blue/50 hover:shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <p className="pt-1 text-[0.66rem] font-semibold uppercase tracking-[0.08em] text-cl-muted">{label}</p>
          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${TONES[tone]}`}>
            <Icon size={15} />
          </span>
        </div>
        <p className="mt-2 text-[1.5rem] font-bold leading-none tracking-tight">{value}</p>
        <p className="mt-1.5 truncate text-[0.72rem] text-cl-muted">{sub}</p>
        {spark && (
          <div className="mt-3 border-t border-cl-border pt-2.5">
            <Sparkline values={spark} />
          </div>
        )}
      </div>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Small module card                                                   */
/* ------------------------------------------------------------------ */

function ModuleCard({ title, items, href }: { title: string; items: string[]; href: string }) {
  return (
    <Link href={href} className="group block rounded-lg border border-cl-border p-3.5 transition hover:border-cl-blue/50 hover:bg-cl-blue-light/20">
      <div className="flex items-center justify-between">
        <p className="text-[0.82rem] font-semibold">{title}</p>
        <ArrowRight size={13} className="text-cl-muted transition group-hover:translate-x-0.5 group-hover:text-cl-blue" />
      </div>
      <ul className="mt-2.5 space-y-1">
        {items.map((i) => (
          <li key={i} className="text-[0.72rem] text-cl-muted">{i}</li>
        ))}
      </ul>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Main dashboard                                                      */
/* ------------------------------------------------------------------ */

export function DashboardClient({
  user,
  greeting,
  days,
  category,
  page,
  data,
}: {
  user: { name: string; email: string | null };
  greeting: string;
  days: string;
  category: string | null;
  page: string;
  data: Data;
}) {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [revenueFilter, setRevenueFilter] = useState<"total" | "subscription" | "payments">("total");
  const [activityCategory, setActivityCategory] = useState<string | null>(category);
  const [activityPage, setActivityPage] = useState(Math.max(1, parseInt(page, 10) || 1));

  const refresh = () => {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 800);
  };

  const go = (params: Record<string, string | null>) => {
    const sp = new URLSearchParams();
    if (params.days && params.days !== "30") sp.set("days", params.days);
    if (params.category) sp.set("category", params.category);
    if (params.page && params.page !== "1") sp.set("page", params.page);
    router.push(`/admin${sp.toString() ? `?${sp}` : ""}`);
  };

  const o = data.overview;
  const today = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Mogadishu" }).format(new Date());

  const revenueTrend = data.revenue?.trend ?? [];
  const growthTrend = data.growth?.trend ?? [];
  const revenueSpark = [...revenueTrend].reverse().slice(-12).map((t: any) => Math.round((t.subscription + t.payments) * 100) / 100);
  const bizSpark = [...growthTrend].reverse().slice(-12).map((t: any) => t.count);
  const userSpark = bizSpark;
  const activityPageSize = 5;
  const allActivityEvents = data.activity?.events ?? [];
  const activityEvents = activityCategory
    ? allActivityEvents.filter((event: any) => event.type === activityCategory)
    : allActivityEvents;
  const activityTotalPages = Math.max(1, Math.ceil(activityEvents.length / activityPageSize));
  const safeActivityPage = Math.min(activityPage, activityTotalPages);
  const paginatedEvents = activityEvents.slice(
    (safeActivityPage - 1) * activityPageSize,
    safeActivityPage * activityPageSize,
  );

  return (
    <div className="w-full min-w-0 space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cl-blue text-white">
              <Building2 size={18} />
            </span>
            <h1 className="text-[1.55rem] font-bold leading-tight tracking-tight">Platform Overview</h1>
          </div>
          <p className="mt-1.5 text-[0.92rem] text-cl-muted">
            {greeting}, <span className="font-medium text-cl-text">{user.name}</span>. Monitor and manage your entire ABUUR DIGITAL platform.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="hidden h-10 items-center rounded-lg border border-cl-border bg-cl-card px-3.5 text-[0.84rem] font-medium text-cl-muted lg:inline-flex">
            {today}
          </span>
          <div className="flex overflow-hidden rounded-lg border border-cl-border bg-cl-card">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => go({ days: r.key, category })}
                className={`h-10 px-3.5 text-[0.8rem] font-semibold transition ${days === r.key ? "bg-cl-blue text-white" : "text-cl-text hover:bg-cl-blue-light hover:text-cl-blue"}`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button
            onClick={refresh}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-cl-border bg-cl-card px-3.5 text-[0.84rem] font-medium transition hover:bg-cl-blue-light hover:text-cl-blue"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <Link
            href="/admin/notifications"
            aria-label="Notifications"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-cl-border bg-cl-card text-cl-text transition hover:bg-cl-blue-light hover:text-cl-blue"
          >
            <Bell size={17} />
          </Link>
          <span className="inline-flex h-10 items-center gap-2.5 rounded-lg border border-cl-border bg-cl-card px-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cl-blue text-[0.68rem] font-bold text-white">
              {user.name.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
            </span>
            <span className="hidden text-[0.82rem] font-semibold sm:inline">{user.name}</span>
          </span>
        </div>
      </div>

      {data.overviewError && (
        <p role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-600">{data.overviewError}</p>
      )}

      {/* ================= KPI CARDS ================= */}
      <div className="grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Kpi
          label="Total Businesses"
          value={o ? fmtNum(o.businesses.total) : "—"}
          sub={o ? `${o.businesses.active} active · +${o.businesses.newThisPeriod} this period` : ""}
          icon={Building2}
          tone="blue"
          href="/admin/businesses"
          spark={bizSpark}
        />
        <Kpi
          label="Total Users"
          value={o ? fmtNum(o.users.total) : "—"}
          sub={o ? `${o.users.active} active · +${o.users.newThisPeriod} this period` : ""}
          icon={Users}
          tone="violet"
          href="/admin/users"
          spark={userSpark}
        />
        <Kpi
          label="Monthly Revenue"
          value={o ? fmtMoney(o.revenue.mrr, o.revenue.currency) : "—"}
          sub={o ? `ARR ${fmtMoney(o.revenue.arr, o.revenue.currency)}` : ""}
          icon={WalletCards}
          tone="emerald"
          href="/admin/finance"
          spark={revenueSpark}
        />
        <Kpi
          label="Subscriptions"
          value={o ? fmtNum(o.subscriptions.active) : "—"}
          sub={o ? `${o.subscriptions.trial} trial · ${o.subscriptions.pastDue} past due` : ""}
          icon={CreditCard}
          tone="sky"
          href="/admin/subscriptions"
        />
        <Kpi
          label="Payments"
          value={o ? fmtMoney(o.payments.collected) : "—"}
          sub={o ? `${o.payments.successful} paid · ${o.payments.failed} failed` : ""}
          icon={CreditCard}
          tone="amber"
          href="/admin/payments"
        />
        <Kpi
          label="Stores"
          value={o ? fmtNum(o.stores.total) : "—"}
          sub={o ? `${o.stores.active} active · +${o.stores.newThisPeriod} new` : ""}
          icon={Store}
          tone="rose"
          href="/admin/stores"
        />
      </div>

      {/* ================= REVENUE + GROWTH ================= */}
      <div className="grid w-full min-w-0 grid-cols-1 items-stretch gap-5 xl:grid-cols-2">
        <Panel
          className="flex h-full min-w-0 flex-col"
          bodyClassName="mt-4 flex flex-1 flex-col justify-center"
          title="Platform Revenue"
          subtitle={`Subscription billing + collected payments · ${data.revenue?.currency ?? "USD"}`}
          action={
            <div className="flex flex-col items-end gap-2">
              <div className="flex rounded-lg border border-cl-border bg-cl-card p-0.5" role="group" aria-label="Platform revenue filter">
                {([
                  ["total", "All"],
                  ["subscription", "Subscription"],
                  ["payments", "Collected"],
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRevenueFilter(value)}
                    className={`h-7 whitespace-nowrap rounded-md px-2.5 text-[0.68rem] font-semibold transition-all ${
                      revenueFilter === value
                        ? "bg-cl-blue text-white shadow-sm"
                        : "text-cl-muted hover:bg-cl-blue-light hover:text-cl-blue"
                    }`}
                    aria-pressed={revenueFilter === value}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="text-right">
                <p className="text-[0.68rem] uppercase tracking-wide text-cl-muted">MRR</p>
                <p className="text-[1.05rem] font-bold text-cl-blue">{o ? fmtMoney(o.revenue.mrr, o.revenue.currency) : "—"}</p>
              </div>
            </div>
          }
        >
          {data.revenueError ? (
            <p className="text-sm text-cl-muted">{data.revenueError}</p>
          ) : (
            <AreaChart
              key={revenueFilter}
              data={revenueTrend.map((t: any) => ({
                label: t.month.slice(5),
                value: Math.round(
                  (revenueFilter === "subscription"
                    ? t.subscription
                    : revenueFilter === "payments"
                      ? t.payments
                      : t.subscription + t.payments) * 100,
                ) / 100,
              }))}
              height={230}
              formatValue={(v) => fmtMoney(v, data.revenue?.currency ?? "USD")}
            />
          )}
        </Panel>

        <Panel
          className="flex h-full min-w-0 flex-col"
          bodyClassName="mt-4 flex flex-1 flex-col"
          title="Business Growth"
          subtitle="New registrations · last 12 months"
          action={<Link href="/admin/businesses" className="inline-flex items-center gap-1 text-[0.82rem] font-semibold hover:text-cl-blue">All <ArrowUpRight size={14} /></Link>}
        >
          {data.growthError ? (
            <p className="text-sm text-cl-muted">{data.growthError}</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-end gap-3">
                <p className="text-3xl font-bold leading-none">{o ? fmtNum(o.businesses.total) : "—"}</p>
                <p className="pb-0.5 text-[0.74rem] text-cl-muted">total businesses</p>
              </div>
              <BarChart data={growthTrend.map((t: any) => ({ label: t.month.slice(5), value: t.count }))} height={150} color="#10b981" />
              {data.growth?.byIndustry?.length > 0 && (
                <div className="border-t border-cl-border pt-4">
                  <SectionLabel>By industry</SectionLabel>
                  <ul className="space-y-1.5 text-[0.82rem]">
                    {data.growth.byIndustry.slice(0, 5).map((i: any) => (
                      <li key={i.industry} className="flex items-center gap-2">
                        <span className="truncate text-cl-muted">{i.industry}</span>
                        <span className="ml-auto font-semibold">{i.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Panel>
      </div>

      {/* ================= SUBSCRIPTIONS + MODULES ================= */}
      <div className="grid w-full min-w-0 grid-cols-1 items-stretch gap-5 xl:grid-cols-2">
        <Panel
          className="flex h-full min-w-0 flex-col"
          bodyClassName="mt-4 flex flex-1 flex-col justify-center"
          title="Subscription Distribution"
          subtitle="Active subscriptions by plan"
          action={<Link href="/admin/subscriptions" className="inline-flex items-center gap-1 text-[0.82rem] font-semibold hover:text-cl-blue">All <ArrowUpRight size={14} /></Link>}
        >
          {data.subsError ? (
            <p className="text-sm text-cl-muted">{data.subsError}</p>
          ) : data.subs?.distribution?.length ? (
            <div className="space-y-5">
              <DonutChart
                segments={data.subs.distribution.map((d: any, i: number) => ({
                  label: d.plan,
                  value: d.count,
                  color: ["#0d6efd", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#0ea5e9"][i % 6],
                }))}
                centerLabel="subscriptions"
              />
              {data.subs.expiringSoon?.length > 0 && (
                <div className="border-t border-cl-border pt-4">
                  <SectionLabel>Expiring soon</SectionLabel>
                  <ul className="space-y-2 text-[0.82rem]">
                    {data.subs.expiringSoon.slice(0, 4).map((s: any) => (
                      <li key={s.id} className="flex items-center justify-between gap-2">
                        <span className="truncate">{s.business}</span>
                        <span className="shrink-0 text-cl-muted">{s.plan}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <EmptyChart label="No subscriptions yet" height={180} />
          )}
        </Panel>

        <Panel className="flex h-full min-w-0 flex-col" bodyClassName="mt-4 flex flex-1 flex-col" title="Platform Module Activity" subtitle="How businesses use ABUUR services">
          {data.modulesError ? (
            <p className="text-sm text-cl-muted">{data.modulesError}</p>
          ) : data.modules ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <ModuleCard title="CRM & Business" items={[`Businesses: ${data.modules.crm.activeBusinesses}`, `Customers: ${data.modules.crm.customers}`, `Leads: ${data.modules.crm.leads}`]} href="/admin/modules/crm" />
              <ModuleCard title="Creative Production" items={[`Active: ${data.modules.creative.activeProjects}`, `Awaiting: ${data.modules.creative.awaitingApproval}`, `Completed: ${data.modules.creative.completedProjects}`]} href="/admin/modules/creative" />
              <ModuleCard title="WhatsApp & SMS Marketing" items={[`WhatsApp accounts: ${data.modules.whatsapp.connectedAccounts}`, `Campaigns: ${data.modules.whatsapp.campaigns + data.modules.sms.campaigns}`, `Contacts: ${data.modules.whatsapp.contacts}`]} href="/admin/modules/marketing" />
              <ModuleCard title="Stores & E-commerce" items={[`Stores: ${data.modules.store.activeStores}`, `Products: ${data.modules.store.products}`, `Orders: ${data.modules.store.orders}`]} href="/admin/modules/stores" />
              <ModuleCard title="Finance & Reporting" items={[`Invoices: ${data.modules.finance.invoices}`, `Transactions: ${data.modules.finance.transactions}`]} href="/admin/modules/finance" />
            </div>
          ) : (
            <EmptyChart label="Module activity unavailable" height={180} />
          )}
        </Panel>
      </div>

      {/* ================= ACTIVITY + ALERTS + SUPPORT ================= */}
      <div className="grid w-full min-w-0 grid-cols-1 items-stretch gap-5 xl:grid-cols-3">
        <Panel
          className="flex h-full flex-col xl:col-span-2"
          bodyClassName="mt-4 flex flex-1 flex-col"
          title="Recent Platform Activity"
          subtitle="Latest events across the platform"
          action={
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => { setActivityCategory(null); setActivityPage(1); }}
                className={`rounded-md px-2 py-1 text-[0.72rem] font-medium transition ${!activityCategory ? "bg-cl-blue text-white" : "text-cl-muted hover:text-cl-blue"}`}
              >
                All
              </button>
              {(data.activity?.categories ?? []).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => { setActivityCategory(c); setActivityPage(1); }}
                  className={`rounded-md px-2 py-1 text-[0.72rem] font-medium capitalize transition ${activityCategory === c ? "bg-cl-blue text-white" : "text-cl-muted hover:text-cl-blue"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          }
        >
          {data.activityError ? (
            <p className="text-sm text-cl-muted">{data.activityError}</p>
          ) : data.activity?.events?.length === 0 ? (
            <EmptyChart label="No activity in this category" height={180} />
          ) : (
            <>
              <ul className="divide-y divide-cl-border">
                {paginatedEvents.map((e: any) => (
                  <li key={e.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cl-blue-light text-cl-blue">
                      {e.type === "business" ? <Building2 size={15} /> : e.type === "user" ? <Users size={15} /> : e.type === "payment" ? <CreditCard size={15} /> : <FileClock size={15} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[0.86rem] font-medium">{e.description}</p>
                      <p className="text-[0.72rem] text-cl-muted">{e.entity} · {fmtDate(e.createdAt)}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <StatusPill status={e.status} />
                      <Link href={e.link} aria-label="View" className="text-cl-muted hover:text-cl-blue"><ExternalLink size={14} /></Link>
                    </div>
                  </li>
                ))}
              </ul>
            <div className="mt-4 flex items-center justify-between border-t border-cl-border pt-3">
              <p className="text-[0.72rem] text-cl-muted">
                Showing {activityEvents.length === 0 ? 0 : (safeActivityPage - 1) * activityPageSize + 1}-{Math.min(safeActivityPage * activityPageSize, activityEvents.length)} of {activityEvents.length}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActivityPage(safeActivityPage - 1)}
                  disabled={safeActivityPage <= 1}
                  className="h-8 rounded-md border border-cl-border px-3 text-[0.72rem] font-semibold transition hover:border-cl-blue/50 hover:text-cl-blue disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="min-w-16 text-center text-[0.72rem] font-medium text-cl-muted">
                  {safeActivityPage} / {activityTotalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setActivityPage(safeActivityPage + 1)}
                  disabled={safeActivityPage >= activityTotalPages}
                  className="h-8 rounded-md border border-cl-border px-3 text-[0.72rem] font-semibold transition hover:border-cl-blue/50 hover:text-cl-blue disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
            </>
          )}
        </Panel>

        <div className="space-y-5">
          <Panel title="System Alerts" subtitle="Issues requiring attention">
            {data.alertsError ? (
              <p className="text-sm text-cl-muted">{data.alertsError}</p>
            ) : data.alerts.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                  <Info size={18} />
                </span>
                <p className="text-sm font-medium">All clear</p>
                <p className="text-[0.74rem] text-cl-muted">No alerts at this time.</p>
              </div>
            ) : (
              <ul className="space-y-2.5">
                {data.alerts.map((a, i) => (
                  <li key={i}>
                    <Link href={a.link} className="flex items-start gap-3 rounded-lg border border-cl-border p-3 transition hover:border-cl-blue/50">
                      <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${a.severity === "critical" ? "bg-red-500/10 text-red-600" : a.severity === "warning" ? "bg-amber-500/10 text-amber-600" : "bg-blue-500/10 text-blue-600"}`}>
                        {a.severity === "critical" ? <AlertCircle size={15} /> : a.severity === "warning" ? <AlertTriangle size={15} /> : <Info size={15} />}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[0.82rem] font-semibold">{a.title}</span>
                        <span className="block text-[0.72rem] text-cl-muted">{a.description}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel
            title="Support Overview"
            subtitle="Ticket summary"
            action={<Link href="/admin/support" className="inline-flex items-center gap-1 text-[0.82rem] font-semibold hover:text-cl-blue">All <ArrowUpRight size={14} /></Link>}
          >
            {data.supportError ? (
              <p className="text-sm text-cl-muted">{data.supportError}</p>
            ) : (
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg bg-cl-bg p-3">
                  <p className="text-xl font-bold">{data.support?.open ?? 0}</p>
                  <p className="text-[0.68rem] text-cl-muted">Open</p>
                </div>
                <div className="rounded-lg bg-cl-bg p-3">
                  <p className="text-xl font-bold">{data.support?.handled ?? 0}</p>
                  <p className="text-[0.68rem] text-cl-muted">Handled</p>
                </div>
                <div className="rounded-lg bg-cl-bg p-3">
                  <p className="text-xl font-bold">{data.support?.archived ?? 0}</p>
                  <p className="text-[0.68rem] text-cl-muted">Archived</p>
                </div>
              </div>
            )}
          </Panel>
        </div>
      </div>

      {/* ================= QUICK ACTIONS ================= */}
      <QuickActions
        items={[
          { label: "Add New Business", icon: Plus, href: "/admin/businesses" },
          { label: "Create Plan", icon: Tags, href: "/admin/plans" },
          { label: "View All Users", icon: UserCog, href: "/admin/users" },
          { label: "View Payments", icon: CreditCard, href: "/admin/payments" },
          { label: "Integrations", icon: Settings, href: "/admin/integrations" },
          { label: "Support Tickets", icon: LifeBuoy, href: "/admin/support" },
        ]}
      />
    </div>
  );
}
