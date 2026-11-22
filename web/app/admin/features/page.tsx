import { SubTabs } from "@/components/admin/client";
import { FLAGS } from "@/components/admin/modules";
import { TABS } from "@/components/admin/tabs";
import { NotConnected, PageHeader, Panel, StatusPill, Table } from "@/components/admin/ui";
import { requireSuperAdmin } from "@/lib/admin";

export default async function FeatureFlagsPage() {
  await requireSuperAdmin();
  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader title="Feature Flags" subtitle="Turn features on or off for the whole platform or for single businesses." />
      <SubTabs tabs={TABS.modules} />
      <Panel title="Proposed flags" subtitle="Flags this console will manage once the backend stores them.">
        <Table head={["Flag", "Purpose", "State"]} minWidth={620}>
          {FLAGS.map((f) => (
            <tr key={f.key}>
              <td>
                <code className="rounded bg-cl-bg px-1.5 py-0.5 text-[0.8rem]">{f.key}</code>
              </td>
              <td className="text-cl-muted">{f.about}</td>
              <td>
                <StatusPill status="PLANNED" label="Not stored" />
              </td>
            </tr>
          ))}
        </Table>
      </Panel>
      <NotConnected endpoint="/feature-flags" what="There is no feature-flag model yet. Flag changes will need confirmation and will be written to the audit log." />
    </div>
  );
}
