import { SubTabs } from "@/components/admin/client";
import { TABS } from "@/components/admin/tabs";
import { EmptyRow, ErrorNote, KpiGrid, PageHeader, Panel, StatusPill, Table } from "@/components/admin/ui";
import { fmtDate, loadFinanceTransactions, requireSuperAdmin } from "@/lib/admin";
import { CircleDollarSign, TrendingDown, TrendingUp } from "lucide-react";

export default async function TransactionsPage() {
  const { token } = await requireSuperAdmin();
  const transactions = await loadFinanceTransactions(token);
  const income = transactions.data.filter((transaction) => transaction.type === "INCOME");
  const expense = transactions.data.filter((transaction) => transaction.type === "EXPENSE");
  const sum = (rows: typeof transactions.data) => rows.reduce((total, row) => total + Number(row.amount || 0), 0);
  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader title="Transactions" subtitle="Finance transactions recorded across businesses." />
      <SubTabs tabs={TABS.payments} />
      <ErrorNote message={transactions.error} />
      <KpiGrid
        items={[
          { label: "Income", value: String(income.length), sub: `${income[0]?.currency ?? "USD"} ${sum(income).toLocaleString("en-US", { maximumFractionDigits: 2 })}`, icon: TrendingUp, tone: "emerald" },
          { label: "Expenses", value: String(expense.length), sub: `${expense[0]?.currency ?? "USD"} ${sum(expense).toLocaleString("en-US", { maximumFractionDigits: 2 })}`, icon: TrendingDown, tone: "rose" },
          { label: "All entries", value: String(transactions.data.length), sub: "platform finance records", icon: CircleDollarSign, tone: "blue" },
        ]}
      />
      <Panel title="Finance transactions" subtitle={`${transactions.data.length} entries`}>
        <Table head={["Type", "Amount", "Category", "Description", "Reference", "Date"]} minWidth={900}>
          {transactions.data.length === 0 ? (
            <EmptyRow cols={6}>No finance transactions found.</EmptyRow>
          ) : transactions.data.map((transaction) => (
            <tr key={transaction.id}>
              <td><StatusPill status={transaction.type} /></td>
              <td className="font-semibold">{transaction.currency} {Number(transaction.amount).toLocaleString("en-US", { maximumFractionDigits: 2 })}</td>
              <td className="text-cl-muted">{transaction.category ?? "—"}</td>
              <td className="text-cl-muted">{transaction.description ?? "—"}</td>
              <td className="font-mono text-xs text-cl-muted">{transaction.reference ?? "—"}</td>
              <td className="text-cl-muted">{fmtDate(transaction.transactionDate)}</td>
            </tr>
          ))}
        </Table>
      </Panel>
    </div>
  );
}
