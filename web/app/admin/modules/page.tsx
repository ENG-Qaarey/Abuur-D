import { SubTabs } from "@/components/admin/client";
import { MODULES } from "@/components/admin/modules";
import { TABS } from "@/components/admin/tabs";
import { PageHeader, Panel, StatusPill, Table } from "@/components/admin/ui";
import { requireSuperAdmin } from "@/lib/admin";

export default async function ModulesPage() {
  await requireSuperAdmin();
  const live = MODULES.filter((m) => m.status === "LIVE").length;
  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <PageHeader title="Modules & Features" subtitle="Which platform modules are available to businesses." />
      <SubTabs tabs={TABS.modules} />
      <Panel title="Platform modules" subtitle={`${live} live of ${MODULES.length}. Read-only until a module toggle API exists.`}>
        <Table head={["Module", "Area", "What it does", "Status"]} minWidth={720}>
          {MODULES.map((m) => (
            <tr key={m.name}>
              <td className="font-semibold">{m.name}</td>
              <td className="text-cl-muted">{m.area}</td>
              <td className="text-cl-muted">{m.about}</td>
              <td>
                <StatusPill status={m.status} />
              </td>
            </tr>
          ))}
        </Table>
      </Panel>
    </div>
  );
}
