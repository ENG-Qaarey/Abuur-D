import { ArrowRight, CreditCard, Clock, BarChart3, Inbox, Building2 } from "lucide-react";
import { api } from "@/lib/api";
import { getToken } from "@/lib/session";

export default async function FinanceDashboard() {
  const token = (await getToken()) as string;
  const businesses = await api<any[]>("/businesses", { token });
  const business = businesses.ok ? businesses.data.find((item) => item.status === "ACTIVE") ?? businesses.data[0] : null;
  const businessId = business?.id;
  const [invoices, payments, transactions, subscriptions] = businessId ? await Promise.all([
    api<any[]>("/invoices", { token, businessId }),
    api<any[]>("/payments", { token, businessId }),
    api<any[]>("/finance-transactions", { token, businessId }),
    api<any[]>("/subscriptions", { token, businessId }),
  ]) : [null, null, null, null];
  const invoiceRows = invoices?.ok ? invoices.data : [];
  const paymentRows = payments?.ok ? payments.data : [];
  const transactionRows = transactions?.ok ? transactions.data : [];
  const subscriptionRows = subscriptions?.ok ? subscriptions.data : [];
  const paidRevenue = paymentRows.filter((item) => item.status === "PAID").reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const expenses = transactionRows.filter((item) => item.type === "EXPENSE").reduce((sum, item) => sum + Number(item.amount || 0), 0);
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-[1.7rem]">Finance Dashboard</h1>
          <p className="mt-1 text-sm text-cl-muted">Manage invoices, payments, expenses, and financial reports.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <div className="cl-card cl-panel flex flex-col p-4">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-cl-muted">Invoices</p>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600"><Inbox size={16} /></span>
          <p className="mt-2 text-2xl font-bold">{invoiceRows.length}</p>
          <p className="mt-0.5 text-xs text-cl-muted">{invoiceRows.filter((item) => item.status === "PAID").length} paid</p>
        </div>
        <div className="cl-card cl-panel flex flex-col p-4">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-cl-muted">Payments</p>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600"><CreditCard size={16} /></span>
          <p className="mt-2 text-2xl font-bold">{paymentRows.length}</p>
          <p className="mt-0.5 text-xs text-cl-muted">USD {paidRevenue.toLocaleString("en-US", { maximumFractionDigits: 2 })} collected</p>
        </div>
        <div className="cl-card cl-panel flex flex-col p-4">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-cl-muted">Expenses</p>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600"><Clock size={16} /></span>
          <p className="mt-2 text-2xl font-bold">{transactionRows.filter((item) => item.type === "EXPENSE").length}</p>
          <p className="mt-0.5 text-xs text-cl-muted">USD {expenses.toLocaleString("en-US", { maximumFractionDigits: 2 })}</p>
        </div>
        <div className="cl-card cl-panel flex flex-col p-4">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-cl-muted">Revenue</p>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600"><BarChart3 size={16} /></span>
          <p className="mt-2 text-2xl font-bold">{paidRevenue.toLocaleString("en-US", { maximumFractionDigits: 2 })}</p>
          <p className="mt-0.5 text-xs text-cl-muted">paid payments</p>
        </div>
        <div className="cl-card cl-panel flex flex-col p-4">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-cl-muted">Financial Reports</p>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600"><Building2 size={16} /></span>
          <p className="mt-2 text-2xl font-bold">{subscriptionRows.length}</p>
          <p className="mt-0.5 text-xs text-cl-muted">subscription records</p>
        </div>
        <div className="cl-card cl-panel flex flex-col p-4">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-cl-muted">Transactions</p>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600"><ArrowRight size={16} /></span>
          <p className="mt-2 text-2xl font-bold">{transactionRows.length}</p>
          <p className="mt-0.5 text-xs text-cl-muted">{transactionRows.filter((item) => item.type === "INCOME").length} income entries</p>
        </div>
      </div>

      <div className="cl-card cl-panel p-6">
        <h2 className="text-lg font-semibold text-cl-text mb-4">Recent invoices</h2>
        {invoiceRows.length === 0 ? (
          <p className="rounded-lg border border-dashed border-cl-border py-8 text-center text-sm text-cl-muted">No invoices found for {business?.name ?? "this account"}.</p>
        ) : (
          <div className="-mx-6 overflow-x-auto"><table className="w-full min-w-[720px] text-sm"><thead><tr className="border-b border-cl-border text-left text-xs text-cl-muted"><th className="px-6 py-3">Invoice</th><th>Status</th><th>Total</th><th>Paid</th><th>Due</th></tr></thead><tbody>{invoiceRows.slice(0,10).map((invoice) => <tr key={invoice.id} className="border-b border-cl-border last:border-0"><td className="px-6 py-3 font-semibold">{invoice.invoiceNumber}</td><td>{invoice.status}</td><td>{invoice.currency} {Number(invoice.total).toLocaleString()}</td><td>{invoice.currency} {Number(invoice.amountPaid).toLocaleString()}</td><td className="text-cl-muted">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "—"}</td></tr>)}</tbody></table></div>
        )}
      </div>
    </div>
  );
}
