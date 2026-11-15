import { SubTabs } from "@/components/admin/client";
import { TABS } from "@/components/admin/tabs";
import { NotConnected, PageHeader } from "@/components/admin/ui";
import { requireSuperAdmin } from "@/lib/admin";

export default async function TransactionsPage() {
  await requireSuperAdmin();
  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <PageHeader title="Transactions" subtitle="Finance transactions recorded across businesses." />
      <SubTabs tabs={TABS.payments} />
      <NotConnected endpoint="GET /finance-transactions" what="The finance transactions endpoint has no access policy yet. Once enabled, this shows income and expense entries across the platform." items={["Income entries", "Expense entries", "Category totals", "References"]} />
    </div>
  );
}
