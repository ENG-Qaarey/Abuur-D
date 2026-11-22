import { SubTabs } from "@/components/admin/client";
import { TABS } from "@/components/admin/tabs";
import { EmptyRow, ErrorNote, KpiGrid, PageHeader, Panel, StatusPill, Table } from "@/components/admin/ui";
import { fmtDate, loadPayments, requireSuperAdmin } from "@/lib/admin";
import { CreditCard, CircleCheck, CircleX, Clock3 } from "lucide-react";
import Link from "next/link";
import { adminRoutes as r } from "@/lib/routes";

export default async function PaymentsPage({ searchParams }: PageProps<"/admin/payments">) {
  const { token } = await requireSuperAdmin();
  const payments = await loadPayments(token);
  const { status: raw } = await searchParams;
  const status = typeof raw === "string" ? raw : "";
  const rows = payments.data.filter((item) => !status || item.status === status);
  const count = (value: string) => payments.data.filter((item) => item.status === value).length;
  const paid = payments.data.filter((item) => item.status === "PAID");
  const paidTotal = paid.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader title="Payments" subtitle="Track business payments and their status." />
      <SubTabs tabs={TABS.payments} />
      <ErrorNote message={payments.error} />
      <KpiGrid
        items={[
          { label: "Collected", value: paidTotal ? `${paid[0]?.currency ?? "USD"} ${paidTotal.toLocaleString("en-US", { maximumFractionDigits: 2 })}` : "0", sub: `${paid.length} successful payments`, icon: CircleCheck, tone: "emerald" },
          { label: "Pending", value: String(count("PENDING")), sub: "awaiting settlement", icon: Clock3, tone: "amber" },
          { label: "Failed", value: String(count("FAILED")), sub: "provider or verification failures", icon: CircleX, tone: "rose" },
          { label: "Refunded", value: String(count("REFUNDED")), sub: "returned to customers", icon: CreditCard, tone: "sky" },
        ]}
      />
      <Panel title="Payment transactions" subtitle={`${rows.length} shown`}>
        <Table head={["Business", "Amount", "Status", "Method", "Provider", "Reference", "Date"]} minWidth={940}>
          {rows.length === 0 ? (
            <EmptyRow cols={7}>No payments found.</EmptyRow>
          ) : rows.map((item) => (
            <tr key={item.id}>
              <td>
                <Link href={r.business(item.business.id)} className="font-semibold hover:text-cl-blue">{item.business.name}</Link>
                {item.invoice && <p className="text-xs text-cl-muted">Invoice {item.invoice.invoiceNumber}</p>}
              </td>
              <td className="font-semibold">{item.currency} {Number(item.amount).toLocaleString("en-US", { maximumFractionDigits: 2 })}</td>
              <td><StatusPill status={item.status} /></td>
              <td className="text-cl-muted">{item.method ?? "—"}</td>
              <td className="text-cl-muted">{item.provider ?? "—"}</td>
              <td className="font-mono text-xs text-cl-muted">{item.reference ?? "—"}</td>
              <td className="text-cl-muted">{fmtDate(item.paidAt ?? item.createdAt)}</td>
            </tr>
          ))}
        </Table>
      </Panel>
    </div>
  );
}
