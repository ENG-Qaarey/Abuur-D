import Link from "next/link";
import { Building2, CirclePause, CircleCheck, Download, ShieldCheck } from "lucide-react";
import { BusinessTable } from "@/components/admin/business-table";
import { SubTabs } from "@/components/admin/client";
import { TABS } from "@/components/admin/tabs";
import { Button, ErrorNote, KpiGrid, PageHeader, Panel } from "@/components/admin/ui";
import { dailyCounts } from "@/components/dashboard/chart-utils";
import { loadBusinesses, requireSuperAdmin } from "@/lib/admin";
import { adminRoutes as r } from "@/lib/routes";

const FILTERS = [
  { key: "", label: "All" },
  { key: "ACTIVE", label: "Active" },
  { key: "PENDING_APPROVAL", label: "Pending" },
  { key: "SUSPENDED", label: "Suspended" },
  { key: "INACTIVE", label: "Inactive" },
];

export default async function BusinessesPage({ searchParams }: PageProps<"/admin/businesses">) {
  const { token } = await requireSuperAdmin();
  const { status: raw, q: rawQ } = await searchParams;
  const status = FILTERS.some((f) => f.key === raw) ? (raw as string) : "";
  const q = typeof rawQ === "string" ? rawQ.trim().toLowerCase() : "";

  const all = await loadBusinesses(token);
  const items = all.data.items;
  const count = (s: string) => items.filter((b) => b.status === s).length;
  const shown = items
    .filter((b) => !status || b.status === status)
    .filter((b) => !q || `${b.name} ${b.slug} ${b.owners.map((o) => o.email).join(" ")}`.toLowerCase().includes(q));

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <PageHeader
        title="Businesses"
        subtitle="Manage registered companies: approve, suspend and inspect accounts."
        actions={
          <Button href={r.exportBusinesses} icon={Download}>
            Export CSV
          </Button>
        }
      />
      <SubTabs tabs={TABS.businesses} />
      <ErrorNote message={all.error} />
      <KpiGrid
        items={[
          { label: "Total", value: String(all.data.total), sub: "registered businesses", icon: Building2, tone: "blue", spark: dailyCounts(items.map((b) => b.createdAt), 30) },
          { label: "Active", value: String(count("ACTIVE")), sub: "approved and live", icon: CircleCheck, tone: "emerald" },
          { label: "Pending", value: String(count("PENDING_APPROVAL")), sub: "awaiting verification", icon: ShieldCheck, tone: "amber" },
          { label: "Suspended", value: String(count("SUSPENDED")), sub: "blocked by an admin", icon: CirclePause, tone: "rose" },
        ]}
      />
      <Panel
        title="All businesses"
        subtitle={`${shown.length} of ${items.length} shown`}
        action={
          <form className="flex items-center gap-2" action={r.businesses}>
            {status && <input type="hidden" name="status" value={status} />}
            <input
              name="q"
              defaultValue={q}
              placeholder="Search name, link or email"
              className="h-9 w-56 rounded-lg border border-cl-border bg-cl-bg px-3 text-sm outline-none focus:border-cl-blue"
            />
          </form>
        }
      >
        <div className="mb-3 flex flex-wrap gap-1.5">
          {FILTERS.map((f) => {
            const params = new URLSearchParams();
            if (f.key) params.set("status", f.key);
            if (q) params.set("q", q);
            const active = f.key === status;
            return (
              <Link
                key={f.label}
                href={`${r.businesses}${params.size ? `?${params}` : ""}`}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  active ? "bg-cl-blue text-white" : "text-cl-muted hover:bg-cl-blue-light hover:text-cl-blue"
                }`}
              >
                {f.label}
              </Link>
            );
          })}
        </div>
        <BusinessTable items={shown} />
      </Panel>
    </div>
  );
}
