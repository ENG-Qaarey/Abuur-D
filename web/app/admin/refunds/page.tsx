import { SubTabs } from "@/components/admin/client";
import { TABS } from "@/components/admin/tabs";
import { EmptyRow, ErrorNote, PageHeader, Panel, StatusPill, Table } from "@/components/admin/ui";
import { fmtDate, loadPayments, requireSuperAdmin } from "@/lib/admin";
import { adminRoutes as r } from "@/lib/routes";
import Link from "next/link";

export default async function RefundsPage() {
  const { token } = await requireSuperAdmin();
  const payments = await loadPayments(token);
  const refunds = payments.data.filter((payment) => payment.status === "REFUNDED");
  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader title="Refunds" subtitle="Refunds issued to businesses." />
      <SubTabs tabs={TABS.payments} />
      <ErrorNote message={payments.error} />
      <Panel title="Refunded payments" subtitle={`${refunds.length} refunds`}>
        <Table head={["Business", "Amount", "Status", "Reference", "Refund date"]} minWidth={820}>
          {refunds.length === 0 ? (
            <EmptyRow cols={5}>No refunded payments found.</EmptyRow>
          ) : refunds.map((refund) => (
            <tr key={refund.id}>
              <td><Link href={r.business(refund.business.id)} className="font-semibold hover:text-cl-blue">{refund.business.name}</Link></td>
              <td className="font-semibold">{refund.currency} {Number(refund.amount).toLocaleString("en-US", { maximumFractionDigits: 2 })}</td>
              <td><StatusPill status={refund.status} /></td>
              <td className="font-mono text-xs text-cl-muted">{refund.reference ?? "—"}</td>
              <td className="text-cl-muted">{fmtDate(refund.paidAt ?? refund.createdAt)}</td>
            </tr>
          ))}
        </Table>
      </Panel>
    </div>
  );
}
