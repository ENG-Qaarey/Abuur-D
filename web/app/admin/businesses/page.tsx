import { loadBusinesses, loadPlans, loadUsers, requireSuperAdmin } from "@/lib/admin";
import { ErrorNote } from "@/components/admin/ui";
import { BusinessesWorkspace } from "@/components/admin/businesses-workspace";

export default async function BusinessesPage({ searchParams }: PageProps<"/admin/businesses">) {
  const { token } = await requireSuperAdmin();
  await searchParams;
  const all = await loadBusinesses(token, undefined, { take: 200 });
  const [users, plans] = await Promise.all([loadUsers(token), loadPlans()]);
  return (
    <BusinessesWorkspace
      items={all.data.items}
      total={all.data.total}
      error={all.error}
      users={users.data}
      plans={plans.data}
    />
  );
}
