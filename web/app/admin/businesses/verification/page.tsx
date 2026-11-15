import { Clock, ShieldCheck } from "lucide-react";
import { BusinessTable } from "@/components/admin/business-table";
import { SubTabs } from "@/components/admin/client";
import { TABS } from "@/components/admin/tabs";
import { ErrorNote, KpiGrid, PageHeader, Panel } from "@/components/admin/ui";
import { dailyCounts } from "@/components/dashboard/chart-utils";
import { daysSince, loadBusinesses, requireSuperAdmin } from "@/lib/admin";

export default async function VerificationPage() {
  const { token } = await requireSuperAdmin();
  const pending = await loadBusinesses(token, "PENDING_APPROVAL");
  const items = [...pending.data.items].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const oldestDays = items[0] ? daysSince(items[0].createdAt) : 0;

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <PageHeader title="Business Verification" subtitle="Review new businesses before they can open a store. Oldest first." />
      <SubTabs tabs={TABS.businesses} />
      <ErrorNote message={pending.error} />
      <KpiGrid
        items={[
          { label: "Awaiting review", value: String(pending.data.total), sub: "pending businesses", icon: ShieldCheck, tone: "amber", spark: dailyCounts(items.map((b) => b.createdAt), 30) },
          { label: "Oldest request", value: items.length ? `${oldestDays}d` : "—", sub: items.length ? "waiting in the queue" : "queue is empty", icon: Clock, tone: "rose" },
        ]}
      />
      <Panel title="Verification queue" subtitle="Approve to let the owner build their store, or reject the request.">
        <BusinessTable items={items} empty="Nothing waiting. All caught up." />
      </Panel>
    </div>
  );
}
