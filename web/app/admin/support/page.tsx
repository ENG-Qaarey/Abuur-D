import Link from "next/link";
import { Archive, CircleCheck, Inbox, LifeBuoy } from "lucide-react";
import { MessageActions } from "@/components/admin/status-actions";
import { EmptyRow, ErrorNote, KpiGrid, PageHeader, Panel, StatusPill, Table } from "@/components/admin/ui";
import { dailyCounts } from "@/components/dashboard/chart-utils";
import { fmtDate, loadMessages, requireSuperAdmin } from "@/lib/admin";
import { adminRoutes as r } from "@/lib/routes";

const FILTERS = ["NEW", "HANDLED", "ARCHIVED", ""];

export default async function SupportPage({ searchParams }: PageProps<"/admin/support">) {
  const { token } = await requireSuperAdmin();
  const { status: raw } = await searchParams;
  const status = FILTERS.includes(raw as string) ? (raw as string) : "NEW";

  const all = await loadMessages(token);
  const msgs = all.data;
  const count = (s: string) => msgs.filter((m) => m.status === s).length;
  const shown = msgs.filter((m) => !status || m.status === status);

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <PageHeader title="Support & Tickets" subtitle="Customer complaints, questions and requests from the ABUUR contact form." />
      <ErrorNote message={all.error} />
      <KpiGrid
        items={[
          { label: "Open", value: String(count("NEW")), sub: "waiting for a reply", icon: Inbox, tone: "rose", spark: dailyCounts(msgs.filter((m) => m.status === "NEW").map((m) => m.createdAt), 30) },
          { label: "Handled", value: String(count("HANDLED")), sub: "resolved tickets", icon: CircleCheck, tone: "emerald" },
          { label: "Archived", value: String(count("ARCHIVED")), sub: "closed without action", icon: Archive, tone: "sky" },
          { label: "This week", value: String(dailyCounts(msgs.map((m) => m.createdAt), 7).reduce((a, b) => a + b, 0)), sub: "new tickets in 7 days", icon: LifeBuoy, tone: "blue" },
        ]}
      />
      <Panel title="Tickets" subtitle={`${shown.length} shown`}>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <Link
              key={f || "all"}
              href={`${r.support}?status=${f}`}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                f === status ? "bg-cl-blue text-white" : "text-cl-muted hover:bg-cl-blue-light hover:text-cl-blue"
              }`}
            >
              {f ? (f === "NEW" ? "Open" : f.charAt(0) + f.slice(1).toLowerCase()) : "All"}
            </Link>
          ))}
        </div>
        <Table head={["From", "Topic", "Message", "Received", "Status", { label: "Actions", className: "text-right" }]} minWidth={920}>
          {shown.length === 0 ? (
            <EmptyRow cols={6}>No tickets here.</EmptyRow>
          ) : (
            shown.map((m) => (
              <tr key={m.id} className="align-top">
                <td>
                  <p className="font-semibold">{m.name}</p>
                  <p className="text-xs text-cl-muted">{[m.businessName, m.email, m.phone].filter(Boolean).join(" · ")}</p>
                </td>
                <td>
                  <span className="rounded bg-cl-blue-light px-1.5 py-0.5 text-[0.7rem] font-semibold text-cl-blue">{m.topic}</span>
                </td>
                <td className="max-w-md text-cl-muted">
                  <p className="line-clamp-3">{m.message}</p>
                </td>
                <td className="whitespace-nowrap text-cl-muted">{fmtDate(m.createdAt)}</td>
                <td>
                  <StatusPill status={m.status} label={m.status === "NEW" ? "Open" : undefined} />
                </td>
                <td>
                  <MessageActions id={m.id} status={m.status} />
                </td>
              </tr>
            ))
          )}
        </Table>
      </Panel>
    </div>
  );
}
