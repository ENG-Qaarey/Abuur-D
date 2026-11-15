import { NotConnected, PageHeader } from "@/components/admin/ui";
import { requireSuperAdmin } from "@/lib/admin";

export default async function SubscriptionsPage() {
  await requireSuperAdmin();
  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <PageHeader title="Subscriptions" subtitle="Monitor trial, active, past-due, cancelled and expired subscriptions." />
      <NotConnected
        endpoint="GET /subscriptions"
        what="The subscriptions endpoint exists but has no access policy, so the API refuses every request. Mark it @PlatformAdmin() and this page shows every business's plan and status."
        items={["Trialing", "Active", "Past due", "Cancelled", "Expired", "Suspended"]}
      />
    </div>
  );
}
