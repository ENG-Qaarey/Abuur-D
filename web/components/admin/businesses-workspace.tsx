"use client";

import { useMemo, useState } from "react";
import { Building2, CircleCheck, CirclePause, Download, ShieldCheck } from "lucide-react";
import type { AdminBusiness, AdminUser, Plan } from "@/lib/types";
import { dailyCounts } from "@/components/dashboard/chart-utils";
import { Button, ErrorNote, KpiGrid, PageHeader, Panel } from "@/components/admin/ui";
import { SubTabs } from "@/components/admin/client";
import { TABS } from "@/components/admin/tabs";
import { adminRoutes as r } from "@/lib/routes";
import { AddBusinessModal } from "@/components/admin/add-business-modal";
import { BusinessTable } from "@/components/admin/business-table";

const FILTERS = [
  { key: "", label: "All" },
  { key: "ACTIVE", label: "Active" },
  { key: "PENDING_APPROVAL", label: "Pending" },
  { key: "SUSPENDED", label: "Suspended" },
  { key: "INACTIVE", label: "Inactive" },
] as const;

export function BusinessesWorkspace({
  items,
  total,
  error,
  users,
  plans,
}: {
  items: AdminBusiness[];
  total: number;
  error?: string;
  users: AdminUser[];
  plans: Plan[];
}) {
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const take = 20;

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((business) => {
      if (status && business.status !== status) return false;
      if (industry && business.industry !== industry) return false;
      if (from && new Date(business.createdAt) < new Date(`${from}T00:00:00`)) return false;
      if (to && new Date(business.createdAt) > new Date(`${to}T23:59:59.999`)) return false;
      if (!q) return true;
      const haystack = [
        business.id,
        business.name,
        business.slug,
        business.email,
        business.phone,
        ...business.owners.map((owner) => `${owner.firstName ?? ""} ${owner.lastName ?? ""} ${owner.email ?? ""} ${owner.phone ?? ""}`),
      ].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [items, status, search, industry, from, to]);

  const totalPages = Math.max(1, Math.ceil(shown.length / take));
  const safePage = Math.min(page, totalPages);
  const paged = shown.slice((safePage - 1) * take, safePage * take);
  const count = (value: string) => items.filter((business) => business.status === value).length;

  function changeStatus(value: string) {
    setStatus(value);
    setPage(1);
  }

  function clearFilters() {
    setStatus("");
    setSearch("");
    setIndustry("");
    setFrom("");
    setTo("");
    setPage(1);
  }

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        title="Businesses"
        subtitle="Manage registered companies: approve, suspend and inspect accounts."
        actions={
          <>
            <AddBusinessModal users={users} plans={plans} />
            <Button href={r.exportBusinesses} icon={Download}>Export CSV</Button>
          </>
        }
      />
      <SubTabs tabs={TABS.businesses} />
      <ErrorNote message={error} />
      <KpiGrid
        items={[
          { label: "Total", value: String(total), sub: "registered businesses", icon: Building2, tone: "blue", spark: dailyCounts(items.map((business) => business.createdAt), 30) },
          { label: "Active", value: String(count("ACTIVE")), sub: "approved and live", icon: CircleCheck, tone: "emerald" },
          { label: "Pending", value: String(count("PENDING_APPROVAL")), sub: "awaiting verification", icon: ShieldCheck, tone: "amber" },
          { label: "Suspended", value: String(count("SUSPENDED")), sub: "blocked by an admin", icon: CirclePause, tone: "rose" },
        ]}
      />

      <Panel
        title="All businesses"
        subtitle={`${shown.length} of ${items.length} shown`}
        action={
          <input
            value={search}
            onChange={(event) => { setSearch(event.target.value); setPage(1); }}
            placeholder="Search name, link or email"
            className="h-9 w-56 rounded-lg border border-cl-border bg-cl-bg px-3 text-sm outline-none focus:border-cl-blue"
          />
        }
      >
        <div className="mb-4 grid w-full grid-cols-1 gap-3 rounded-xl border border-cl-border bg-cl-card p-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.4fr)_minmax(180px,.8fr)_minmax(150px,.6fr)_minmax(150px,.6fr)_auto] xl:items-end">
          <label className="block text-[0.68rem] font-semibold uppercase text-cl-muted">
            Search
            <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Name, ID, owner, email or phone" className="mt-1 h-9 w-full rounded-lg border border-cl-border bg-cl-bg px-3 text-sm normal-case text-cl-text outline-none focus:border-cl-blue" />
          </label>
          <label className="block text-[0.68rem] font-semibold uppercase text-cl-muted">
            Category
            <select value={industry} onChange={(event) => { setIndustry(event.target.value); setPage(1); }} className="mt-1 h-9 w-full rounded-lg border border-cl-border bg-cl-bg px-3 text-sm normal-case text-cl-text outline-none focus:border-cl-blue">
              <option value="">All categories</option>
              {[...new Set(items.map((business) => business.industry).filter((value): value is string => !!value))].sort().map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label className="block text-[0.68rem] font-semibold uppercase text-cl-muted">
            From
            <input type="date" value={from} onChange={(event) => { setFrom(event.target.value); setPage(1); }} className="mt-1 h-9 w-full rounded-lg border border-cl-border bg-cl-bg px-2 text-xs normal-case text-cl-text outline-none focus:border-cl-blue" />
          </label>
          <label className="block text-[0.68rem] font-semibold uppercase text-cl-muted">
            To
            <input type="date" value={to} onChange={(event) => { setTo(event.target.value); setPage(1); }} className="mt-1 h-9 w-full rounded-lg border border-cl-border bg-cl-bg px-2 text-xs normal-case text-cl-text outline-none focus:border-cl-blue" />
          </label>
          <button type="button" onClick={clearFilters} className="h-9 self-end rounded-lg border border-cl-border px-4 text-sm font-semibold transition hover:border-cl-blue/50 hover:text-cl-blue">Clear</button>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Business status">
          {FILTERS.map((filter) => (
            <button
              key={filter.label}
              type="button"
              role="tab"
              aria-selected={status === filter.key}
              onClick={() => changeStatus(filter.key)}
              className={`h-8 rounded-md px-3 text-xs font-semibold transition ${status === filter.key ? "bg-cl-blue text-white" : "text-cl-muted hover:bg-cl-blue-light hover:text-cl-blue"}`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <BusinessTable items={paged} />
        <div className="mt-4 flex items-center justify-between border-t border-cl-border pt-3">
          <p className="text-xs text-cl-muted">{shown.length === 0 ? "0 records" : `${(safePage - 1) * take + 1}-${Math.min(safePage * take, shown.length)} of ${shown.length}`}</p>
          <div className="flex items-center gap-2">
            <button type="button" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)} className="h-8 rounded-md border border-cl-border px-3 text-xs font-semibold disabled:pointer-events-none disabled:opacity-40">Previous</button>
            <span className="text-xs text-cl-muted">{safePage} / {totalPages}</span>
            <button type="button" disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)} className="h-8 rounded-md border border-cl-border px-3 text-xs font-semibold disabled:pointer-events-none disabled:opacity-40">Next</button>
          </div>
        </div>
      </Panel>
    </div>
  );
}
