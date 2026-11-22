import { NotConnected, PageHeader } from "@/components/admin/ui";
import { requireSuperAdmin } from "@/lib/admin";

export default async function CreativeManagementPage() {
  await requireSuperAdmin();
  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader title="Creative Management" subtitle="Monitor creative projects and service delivery." />
      <NotConnected endpoint="GET /creative-projects" what="Creative projects, requests and tasks exist in the backend but have no Super Admin access policy yet. Once enabled, this tracks every project by stage, deadline and manager." items={["Projects by stage", "Overdue deadlines", "Client reviews", "Assigned managers"]} />
    </div>
  );
}
