import { NotConnected, PageHeader } from "@/components/admin/ui";
import { requireSuperAdmin } from "@/lib/admin";

export default async function AuditLogsPage() {
  await requireSuperAdmin();
  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <PageHeader title="Audit Logs" subtitle="Track administrative actions and security events." />
      <NotConnected endpoint="GET /audit-logs" what="The backend already records audit entries (for example when you approve or suspend a business), but the list endpoint has no access policy yet. Once enabled, every entry shows who did what, when and from where." items={["Who made the change", "Action and entity", "IP address and device", "Timestamp"]} />
    </div>
  );
}
