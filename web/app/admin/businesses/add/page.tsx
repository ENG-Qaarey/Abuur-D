import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { loadPlans, loadUsers, requireSuperAdmin } from "@/lib/admin";
import { adminRoutes as r } from "@/lib/routes";
import { PageHeader, Panel } from "@/components/admin/ui";
import { AddBusinessForm } from "./add-business-form";

export default async function AddBusinessPage() {
  const { token } = await requireSuperAdmin();
  const [users, plans] = await Promise.all([loadUsers(token), loadPlans()]);

  return (
    <div className="w-full min-w-0 space-y-6">
      <Link href={r.businesses} className="inline-flex items-center gap-1.5 text-sm text-cl-muted hover:text-cl-blue">
        <ArrowLeft size={15} /> All businesses
      </Link>
      <PageHeader title="Add Business" subtitle="Create a business and assign an existing owner account." />
      <Panel title="Business information" subtitle="All fields marked required must be valid before submission." bodyClassName="mt-5">
        <AddBusinessForm users={users.data} plans={plans.data} />
      </Panel>
    </div>
  );
}
