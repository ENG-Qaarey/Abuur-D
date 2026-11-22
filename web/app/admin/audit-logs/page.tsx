import { EmptyRow, ErrorNote, PageHeader, Panel, Table } from "@/components/admin/ui";
import { fmtDate, loadAuditLogs, requireSuperAdmin } from "@/lib/admin";

export default async function AuditLogsPage() {
  const { token } = await requireSuperAdmin();
  const logs = await loadAuditLogs(token);
  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader title="Audit Logs" subtitle="Track administrative actions and security events." />
      <ErrorNote message={logs.error} />
      <Panel title="Administrative activity" subtitle={`${logs.data.length} recent entries`}>
        <Table head={["Action", "Entity", "IP address", "Recorded"]} minWidth={820}>
          {logs.data.length === 0 ? (
            <EmptyRow cols={4}>No audit entries recorded yet.</EmptyRow>
          ) : logs.data.map((log) => (
            <tr key={log.id}>
              <td className="font-semibold">{log.action}</td>
              <td>
                <p>{log.entityType}</p>
                <p className="max-w-xs truncate font-mono text-xs text-cl-muted">{log.entityId ?? "—"}</p>
              </td>
              <td className="text-cl-muted">{log.ipAddress ?? "—"}</td>
              <td className="text-cl-muted">{fmtDate(log.createdAt)}</td>
            </tr>
          ))}
        </Table>
      </Panel>
    </div>
  );
}
