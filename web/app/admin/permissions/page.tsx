import { Check, Eye, Minus } from "lucide-react";
import { ADMIN_ROLES, PERMISSIONS } from "@/components/admin/rbac";
import { CARD, PageHeader, Panel, StatusPill, Table } from "@/components/admin/ui";
import { requireSuperAdmin } from "@/lib/admin";

const ICON = {
  full: <Check size={16} className="text-emerald-500" aria-label="Full access" />,
  read: <Eye size={16} className="text-sky-500" aria-label="Read only" />,
  none: <Minus size={16} className="text-cl-muted/60" aria-label="No access" />,
};

export default async function PermissionsPage() {
  await requireSuperAdmin();
  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <PageHeader title="Roles & Permissions" subtitle="Role-based access for the ABUUR team. Business users never see another business's data." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {ADMIN_ROLES.map((role) => (
          <div key={role.key} className={`${CARD} p-4`}>
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold">{role.name}</p>
              <StatusPill status={role.live ? "LIVE" : "PLANNED"} label={role.live ? "Live" : "Planned"} />
            </div>
            <p className="mt-2 text-sm text-cl-muted">{role.about}</p>
          </div>
        ))}
      </div>

      <Panel
        title="Permission matrix"
        subtitle="Target access per admin role. Today only Super Admin exists, and the API allows only Super Admin into admin endpoints."
      >
        <Table head={["Area", ...ADMIN_ROLES.map((r) => ({ label: r.name, className: "text-center" }))]} minWidth={820}>
          {PERMISSIONS.map((p) => (
            <tr key={p.area}>
              <td className="font-medium">{p.area}</td>
              {ADMIN_ROLES.map((r) => (
                <td key={r.key}>
                  <span className="flex justify-center">{ICON[p.access[r.key]]}</span>
                </td>
              ))}
            </tr>
          ))}
        </Table>
        <p className="mt-4 flex flex-wrap gap-4 text-xs text-cl-muted">
          <span className="inline-flex items-center gap-1.5">{ICON.full} Full access</span>
          <span className="inline-flex items-center gap-1.5">{ICON.read} Read only</span>
          <span className="inline-flex items-center gap-1.5">{ICON.none} No access</span>
        </p>
      </Panel>
    </div>
  );
}
