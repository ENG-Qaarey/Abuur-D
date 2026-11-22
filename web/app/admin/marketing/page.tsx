import { NotConnected, PageHeader } from "@/components/admin/ui";
import { requireSuperAdmin } from "@/lib/admin";

export default async function MarketingManagementPage() {
  await requireSuperAdmin();
  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader title="Marketing Management" subtitle="Monitor WhatsApp and SMS campaigns across businesses." />
      <NotConnected endpoint="GET /campaigns" what="Campaigns exist in the backend but have no Super Admin access policy yet. Once enabled, this shows every campaign with its channel, reach and delivery rates." items={["Campaigns by channel", "Sent and delivered", "Read and reply rates", "Failed messages"]} />
    </div>
  );
}
