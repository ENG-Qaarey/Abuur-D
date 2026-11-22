import Link from "next/link";
import { WalletCards } from "lucide-react";
import { EmptyRow, ErrorNote, KpiGrid, PageHeader, Panel, StatusPill, Table } from "@/components/admin/ui";
import { fmtDate, loadSubscriptions, requireSuperAdmin } from "@/lib/admin";
import { adminRoutes as r } from "@/lib/routes";

const FILTERS = ["", "TRIALING", "ACTIVE", "PAST_DUE", "CANCELLED", "EXPIRED", "SUSPENDED"];

export default async function SubscriptionsPage({ searchParams }: PageProps<"/admin/subscriptions">) {
  const { token } = await requireSuperAdmin();
  const subscriptions = await loadSubscriptions(token);
  const { status: raw } = await searchParams;
  const status = typeof raw === "string" && FILTERS.includes(raw) ? raw : "";
  const rows = subscriptions.data.filter((item) => !status || item.status === status);
  const count = (value: string) => subscriptions.data.filter((item) => item.status === value).length;

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader title="Subscriptions" subtitle="Monitor trial, active, past-due, cancelled and expired subscriptions." />
      <ErrorNote message={subscriptions.error} />
      <KpiGrid
        items={[
          { label: "All subscriptions", value: String(subscriptions.data.length), sub: "across every business", icon: WalletCards, tone: "blue" },
          { label: "Active", value: String(count("ACTIVE")), sub: "currently active", icon: WalletCards, tone: "emerald" },
          { label: "Trial", value: String(count("TRIALING")), sub: "trial periods", icon: WalletCards, tone: "sky" },
          { label: "Past due", value: String(count("PAST_DUE")), sub: "requires renewal attention", icon: WalletCards, tone: "rose" },
        ]}
      />
      <Panel title="Platform subscriptions" subtitle={`${rows.length} shown`}>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {FILTERS.map((filter) => (
            <Link
              key={filter || "all"}
              href={`${r.subscriptions}${filter ? `?status=${filter}` : ""}`}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold ${filter === status ? "bg-cl-blue text-white" : "text-cl-muted hover:bg-cl-blue-light hover:text-cl-blue"}`}
            >
              {filter ? filter.replaceAll("_", " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase()) : "All"}
            </Link>
          ))}
        </div>
        <Table head={["Business", "Plan", "Status", "Next billing", "Started", "Reference"]} minWidth={900}>
          {rows.length === 0 ? (
            <EmptyRow cols={6}>No subscriptions found.</EmptyRow>
          ) : rows.map((item) => (
            <tr key={item.id}>
              <td>
                <Link href={r.business(item.business.id)} className="font-semibold hover:text-cl-blue">{item.business.name}</Link>
                <p className="text-xs text-cl-muted">abuur.so/{item.business.slug}</p>
              </td>
              <td><p className="font-medium">{item.plan.name}</p><p className="text-xs text-cl-muted">{item.plan.currency} {item.plan.price} / {item.plan.interval.toLowerCase()}</p></td>
              <td><StatusPill status={item.status} /></td>
              <td className="text-cl-muted">{item.nextBillingAt ? fmtDate(item.nextBillingAt) : "—"}</td>
              <td className="text-cl-muted">{fmtDate(item.startDate)}</td>
              <td className="font-mono text-xs text-cl-muted">{item.externalSubscriptionId ?? "—"}</td>
            </tr>
          ))}
        </Table>
      </Panel>
    </div>
  );
}
