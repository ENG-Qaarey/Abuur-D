import { NotificationsWorkspace } from "@/components/admin/notifications-workspace";
import { requireSuperAdmin } from "@/lib/admin";
import { api } from "@/lib/api";

export default async function NotificationsPage() {
  const { token } = await requireSuperAdmin();
  const [overview, campaigns, templates] = await Promise.all([
    api<any>("/notifications/overview", { token }),
    api<any>("/notifications?limit=100", { token }),
    api<any[]>("/notifications/templates/list", { token }),
  ]);

  return (
    <NotificationsWorkspace
      overview={overview.ok ? overview.data : { total: 0, sent: 0, scheduled: 0, drafts: 0, failed: 0, reached: 0 }}
      campaigns={campaigns.ok ? campaigns.data.items ?? [] : []}
      templates={templates.ok ? templates.data : []}
    />
  );
}
