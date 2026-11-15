import { Activity, Database, Gauge, Server } from "lucide-react";
import { KpiGrid, PageHeader, Panel, StatusPill, Table } from "@/components/admin/ui";
import { api } from "@/lib/api";
import { requireSuperAdmin } from "@/lib/admin";

/** Times one API call; a fresh check on every page load (no caching). */
async function probe(path: string, token?: string) {
  const start = performance.now();
  const result = await api<unknown>(path, { token });
  return { ok: result.ok, status: result.status, ms: Math.round(performance.now() - start) };
}

export default async function SystemHealthPage() {
  const { token } = await requireSuperAdmin();
  const [root, me, plans] = await Promise.all([probe("/"), probe("/auth/me", token), probe("/plans/public")]);

  const checks = [
    { name: "ABUUR API", detail: "Backend reachable", check: root, icon: Server },
    { name: "Database", detail: "Session lookup reads the users table", check: me, icon: Database },
    { name: "Public catalogue", detail: "GET /plans/public", check: plans, icon: Gauge },
  ];
  const healthy = checks.filter((c) => c.check.ok).length;
  const avg = Math.round(checks.reduce((a, c) => a + c.check.ms, 0) / checks.length);
  const checkedAt = new Intl.DateTimeFormat("en-GB", { timeStyle: "medium", timeZone: "Africa/Mogadishu" }).format(new Date());

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <PageHeader title="System Health" subtitle={`Live checks of the backend, database and services. Checked at ${checkedAt} (Mogadishu).`} />
      <KpiGrid
        items={[
          { label: "Services healthy", value: `${healthy}/${checks.length}`, sub: healthy === checks.length ? "all systems operational" : "some checks failing", icon: Activity, tone: healthy === checks.length ? "emerald" : "rose" },
          { label: "Avg response", value: `${avg} ms`, sub: "from the web server to the API", icon: Gauge, tone: "blue" },
          { label: "Queues", value: "—", sub: "no queue metrics endpoint", icon: Server, tone: "sky" },
          { label: "Error rate", value: "—", sub: "no metrics endpoint", icon: Database, tone: "amber" },
        ]}
      />
      <Panel title="Service checks" subtitle="Refresh the page to run the checks again.">
        <Table head={["Service", "What is checked", "HTTP", "Response time", "Status"]}>
          {checks.map(({ name, detail, check, icon: Icon }) => (
            <tr key={name}>
              <td>
                <span className="flex items-center gap-2.5 font-semibold">
                  <Icon size={16} className="text-cl-muted" />
                  {name}
                </span>
              </td>
              <td className="text-cl-muted">{detail}</td>
              <td className="text-cl-muted">{check.status}</td>
              <td>{check.ms} ms</td>
              <td>
                <StatusPill status={check.ok ? "ACTIVE" : "ERROR"} label={check.ok ? "Operational" : "Down"} />
              </td>
            </tr>
          ))}
        </Table>
      </Panel>
    </div>
  );
}
