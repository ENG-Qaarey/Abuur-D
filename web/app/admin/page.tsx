import Link from "next/link";
import {
  Building2,
  CreditCard,
  Download,
  FileClock,
  LifeBuoy,
  Megaphone,
  ShieldCheck,
  Tags,
  UserCog,
  Users,
  WalletCards,
} from "lucide-react";
import { ActivityChart, Donut } from "@/components/dashboard/charts";
import { dailyCounts } from "@/components/dashboard/chart-utils";
import { BusinessActions } from "@/components/admin/status-actions";
import {
  Button,
  ErrorNote,
  KpiGrid,
  PageHeader,
  Panel,
  QuickActions,
  STATUS_COLOR,
  StatusPill,
  Table,
  EmptyRow,
  ViewAll,
  statusLabel,
} from "@/components/admin/ui";
import { fmtDate, fullName, greeting, loadBusinesses, loadMessages, loadUsers, requireSuperAdmin } from "@/lib/admin";
import { adminRoutes as r } from "@/lib/routes";

const month = new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "Africa/Mogadishu" });
const day = new Intl.DateTimeFormat("en-GB", { day: "numeric", timeZone: "Africa/Mogadishu" });

export default async function AdminDashboardPage() {
  const { user, token } = await requireSuperAdmin();
  const [biz, users, messages] = await Promise.all([loadBusinesses(token), loadUsers(token), loadMessages(token, "NEW")]);

  const items = biz.data.items;
  const count = (s: string) => items.filter((b) => b.status === s).length;
  const pending = items.filter((b) => b.status === "PENDING_APPROVAL");
  const activeUsers = users.data.filter((u) => u.status === "ACTIVE").length;

  const kpis = [
    {
      label: "Total businesses",
      value: String(biz.data.total),
      sub: `${count("ACTIVE")} active · ${count("SUSPENDED")} suspended`,
      icon: Building2,
      tone: "blue" as const,
      spark: dailyCounts(items.map((b) => b.createdAt), 30),
    },
    {
      label: "Total users",
      value: String(users.data.length),
      sub: `${activeUsers} active accounts`,
      icon: Users,
      tone: "violet" as const,
      spark: dailyCounts(users.data.map((u) => u.createdAt), 30),
    },
    { label: "Monthly revenue", value: "—", sub: "payments API not enabled", icon: CreditCard, tone: "emerald" as const },
    { label: "Subscriptions", value: "—", sub: "subscriptions API not enabled", icon: WalletCards, tone: "sky" as const },
    {
      label: "Pending review",
      value: String(pending.length),
      sub: pending.length ? "businesses awaiting review" : "all caught up",
      icon: ShieldCheck,
      tone: "amber" as const,
      spark: dailyCounts(pending.map((b) => b.createdAt), 30),
    },
    {
      label: "Open tickets",
      value: String(messages.data.length),
      sub: "new support messages",
      icon: LifeBuoy,
      tone: "rose" as const,
      spark: dailyCounts(messages.data.map((m) => m.createdAt), 30),
    },
  ];

  const segments = ["ACTIVE", "PENDING_APPROVAL", "SUSPENDED", "INACTIVE"].map((s) => ({
    label: statusLabel(s),
    value: count(s),
    color: STATUS_COLOR[s],
  }));
  const recent = [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <PageHeader
        title={`${greeting()}, ${user.firstName || fullName(user)}`}
        subtitle="Here is what is happening across the ABUUR platform today."
        actions={
          <>
            <Button href={r.verification} icon={ShieldCheck} primary>
              Review Businesses
            </Button>
            <Button href={r.notifications} icon={Megaphone}>
              Announcement
            </Button>
            <Button href={r.exportBusinesses} icon={Download}>
              Export
            </Button>
          </>
        }
      />

      <ErrorNote message={biz.error ?? users.error} />
      <KpiGrid items={kpis} />

      <QuickActions
        items={[
          { label: "Verify Businesses", icon: ShieldCheck, href: r.verification },
          { label: "Manage Users", icon: UserCog, href: r.users },
          { label: "Plans & Pricing", icon: Tags, href: r.plans },
          { label: "Announcement", icon: Megaphone, href: r.notifications },
          { label: "Support Tickets", icon: LifeBuoy, href: r.support },
          { label: "Audit Logs", icon: FileClock, href: r.auditLogs },
        ]}
      />

      <div className="grid gap-5 xl:grid-cols-3">
        <Panel className="xl:col-span-2" title="Platform Activity" subtitle="New businesses and user sign-ups over time.">
          <ActivityChart
            series={[
              { label: "Businesses", color: "#0d6efd", dates: items.map((b) => b.createdAt) },
              { label: "Users", color: "#10b981", dates: users.data.map((u) => u.createdAt) },
            ]}
          />
        </Panel>

        <Panel title="Business Overview" subtitle="Distribution of businesses by status.">
          <div className="flex flex-col items-center gap-6 py-4">
            <Donut
              size={168}
              thickness={26}
              segments={segments}
              center={
                <>
                  <span className="text-2xl font-bold">{items.length}</span>
                  <span className="text-xs text-cl-muted">businesses</span>
                </>
              }
            />
            <ul className="grid w-full grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {segments.map((s) => (
                <li key={s.label} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                  <span className="text-cl-muted">{s.label}</span>
                  <span className="ml-auto font-semibold">{s.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Recently Registered Businesses"
          subtitle="Newest companies on the ABUUR platform."
          action={<ViewAll href={r.businesses} />}
        >
          <Table head={["Business", "Owner", "Registered", "Status"]}>
            {recent.length === 0 ? (
              <EmptyRow cols={4}>No businesses yet.</EmptyRow>
            ) : (
              recent.map((b) => (
                <tr key={b.id}>
                  <td>
                    <Link href={r.business(b.id)} className="font-semibold hover:text-cl-blue">
                      {b.name}
                    </Link>
                    <p className="text-xs text-cl-muted">abuur.so/{b.slug}</p>
                  </td>
                  <td className="text-cl-muted">{b.owners.map(fullName).join(", ") || "—"}</td>
                  <td className="text-cl-muted">{fmtDate(b.createdAt)}</td>
                  <td>
                    <StatusPill status={b.status} />
                  </td>
                </tr>
              ))
            )}
          </Table>
        </Panel>

        <Panel title="Verification Queue" subtitle="Businesses waiting for approval." action={<ViewAll href={r.verification} />}>
          {pending.length === 0 ? (
            <p className="py-6 text-center text-sm text-cl-muted">Nothing waiting. All caught up.</p>
          ) : (
            <ul className="space-y-4">
              {pending.slice(0, 5).map((b) => {
                const d = new Date(b.createdAt);
                return (
                  <li key={b.id} className="flex items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-cl-blue-light leading-none text-cl-blue">
                      <span className="text-[0.58rem] font-bold uppercase">{month.format(d)}</span>
                      <span className="mt-0.5 text-base font-bold">{day.format(d)}</span>
                    </span>
                    <Link href={r.business(b.id)} className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold hover:text-cl-blue">{b.name}</span>
                      <span className="block truncate text-xs text-cl-muted">{b.owners.map(fullName).join(", ") || `abuur.so/${b.slug}`}</span>
                    </Link>
                    <BusinessActions id={b.id} name={b.name} status={b.status} />
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
