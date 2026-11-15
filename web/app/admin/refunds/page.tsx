import { SubTabs } from "@/components/admin/client";
import { TABS } from "@/components/admin/tabs";
import { NotConnected, PageHeader } from "@/components/admin/ui";
import { requireSuperAdmin } from "@/lib/admin";

export default async function RefundsPage() {
  await requireSuperAdmin();
  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <PageHeader title="Refunds" subtitle="Refunds issued to businesses." />
      <SubTabs tabs={TABS.payments} />
      <NotConnected endpoint="GET /payments?status=REFUNDED" what="Refunds are payments with the REFUNDED status. They appear here once the payments endpoint is enabled for Super Admins. Issuing a refund will require confirmation and is written to the audit log." items={["Refunded payments", "Refund reason", "Issued by", "Audit trail"]} />
    </div>
  );
}
