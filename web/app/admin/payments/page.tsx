import { SubTabs } from "@/components/admin/client";
import { TABS } from "@/components/admin/tabs";
import { NotConnected, PageHeader } from "@/components/admin/ui";
import { requireSuperAdmin } from "@/lib/admin";

export default async function PaymentsPage() {
  await requireSuperAdmin();
  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <PageHeader title="Payments" subtitle="Track business payments and their status." />
      <SubTabs tabs={TABS.payments} />
      <NotConnected endpoint="GET /payments" what="The payments endpoint has no access policy yet, so the API refuses it. Once enabled, this lists every payment with business, amount, method and status." items={["Pending", "Paid", "Partially paid", "Failed", "Refunded", "Cancelled"]} />
    </div>
  );
}
