import { Building2, Gauge, TrendingUp, Users } from "lucide-react";
import { ActivityChart, Donut } from "@/components/dashboard/charts";
import { dailyCounts } from "@/components/dashboard/chart-utils";
import { ErrorNote, KpiGrid, PageHeader, Panel, STATUS_COLOR, statusLabel } from "@/components/admin/ui";
import { ROLE_NAME, loadBusinesses, loadUsers, requireSuperAdmin } from "@/lib/admin";

const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);

function Legend({ items }: { items: { label: string; value: number; color: string }[] }) {
  return (
    <ul className="grid w-full grid-cols-2 gap-x-4 gap-y-2 text-sm">
      {items.map((s) => (
        <li key={s.label} className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
          <span className="text-cl-muted">{s.label}</span>
          <span className="ml-auto font-semibold">{s.value}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function AnalyticsPage() {
  const { token } = await requireSuperAdmin();
  const [biz, users] = await Promise.all([loadBusinesses(token), loadUsers(token)]);
  const b = biz.data.items;
  const u = users.data;

  const bizDates = b.map((x) => x.createdAt);
  const userDates = u.map((x) => x.createdAt);
  const b30 = sum(dailyCounts(bizDates, 30));
  const bPrev = sum(dailyCounts(bizDates, 60)) - b30;
  const u30 = sum(dailyCounts(userDates, 30));
  const approved = b.filter((x) => x.status === "ACTIVE").length;
  const growth = (now: number, prev: number) => (prev === 0 ? (now > 0 ? "new this month" : "no change") : `${now >= prev ? "+" : ""}${Math.round(((now - prev) / prev) * 100)}% vs last 30 days`);

  const bizSeg = ["ACTIVE", "PENDING_APPROVAL", "SUSPENDED", "INACTIVE"].map((s) => ({ label: statusLabel(s), value: b.filter((x) => x.status === s).length, color: STATUS_COLOR[s] }));
  const roleSeg = (["USER", "ABUUR_STAFF", "SUPER_ADMIN"] as const).map((r, i) => ({ label: ROLE_NAME[r], value: u.filter((x) => x.platformRole === r).length, color: ["#0d6efd", "#8b5cf6", "#f43f5e"][i] }));

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <PageHeader title="Platform Analytics" subtitle="Growth and adoption across the ABUUR platform." />
      <ErrorNote message={biz.error ?? users.error} />
      <KpiGrid
        items={[
          { label: "New businesses (30d)", value: String(b30), sub: growth(b30, bPrev), icon: Building2, tone: "blue", spark: dailyCounts(bizDates, 30) },
          { label: "New users (30d)", value: String(u30), sub: `${u.length} accounts in total`, icon: Users, tone: "violet", spark: dailyCounts(userDates, 30) },
          { label: "Approval rate", value: b.length ? `${Math.round((approved / b.length) * 100)}%` : "—", sub: `${approved} of ${b.length} businesses live`, icon: Gauge, tone: "emerald" },
          { label: "Users per business", value: b.length ? (u.length / b.length).toFixed(1) : "—", sub: "accounts ÷ businesses", icon: TrendingUp, tone: "amber" },
        ]}
      />
      <Panel title="Growth" subtitle="New businesses and users over time.">
        <ActivityChart
          series={[
            { label: "Businesses", color: "#0d6efd", dates: bizDates },
            { label: "Users", color: "#10b981", dates: userDates },
          ]}
        />
      </Panel>
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Businesses by status">
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <Donut size={150} segments={bizSeg} center={<span className="text-xl font-bold">{b.length}</span>} />
            <Legend items={bizSeg} />
          </div>
        </Panel>
        <Panel title="Users by role">
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <Donut size={150} segments={roleSeg} center={<span className="text-xl font-bold">{u.length}</span>} />
            <Legend items={roleSeg} />
          </div>
        </Panel>
      </div>
    </div>
  );
}
