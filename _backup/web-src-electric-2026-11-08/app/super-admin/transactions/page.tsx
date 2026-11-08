"use client";

import { useMemo, useState } from "react";
import { Copy, Download } from "lucide-react";
import { ResponsiveTableShell } from "@/components/ui/ResponsiveTableShell";
import { AvatarInitials, StatusBadge } from "@/components/super-admin/shared/admin-page";
import { EntityTableActions } from "@/components/super-admin/shared/EntityTableActions";
import { TransactionModals } from "@/components/super-admin/shared/modals/transactions/TransactionModals";
import { copyToClipboard, exportTableCsv } from "@/components/super-admin/shared/super-admin-toast";
import {
    SuperAdminCardBody,
    SuperAdminMainCard,
    SuperAdminMetricsGrid,
    SuperAdminPageHeader,
    SuperAdminSearchInput,
    SuperAdminSecondaryButton,
    SuperAdminSelect,
    SuperAdminTablePagination,
    superAdminTableHeadClass,
    superAdminTableRowClass,
    SuperAdminToolbar,
} from "@/components/super-admin/shared/super-admin-layout";
import { transactionMetrics, transactionRows, type TransactionRow } from "@/data/super-admin-mock";
import { useSuperAdminCrud } from "@/hooks/useSuperAdminCrud";

export default function TransactionsPage() {
    const crud = useSuperAdminCrud<TransactionRow>(transactionRows);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("All Types");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return crud.items.filter((r) => {
            const matchSearch = !q || r.trxId.toLowerCase().includes(q) || r.customer.toLowerCase().includes(q);
            const matchType = typeFilter === "All Types" || r.type === typeFilter;
            const matchStatus = statusFilter === "All Status" || r.status === statusFilter;
            return matchSearch && matchType && matchStatus;
        });
    }, [crud.items, search, typeFilter, statusFilter]);

    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

    const exportRows = () => {
        exportTableCsv(
            "transactions.csv",
            ["ID", "Customer", "Type", "Company", "Amount", "Status", "Date"],
            filtered.map((r) => [r.trxId, r.customer, r.type, r.company, r.amount, r.status, r.date]),
        );
    };

    return (
        <div className="space-y-6 min-w-0 w-full">
            <SuperAdminPageHeader title="Transactions (All)" description="View and manage all transactions across the platform." />

            <SuperAdminMetricsGrid stats={transactionMetrics} />

            <SuperAdminMainCard>
                <SuperAdminToolbar
                    actions={
                        <>
                            <SuperAdminSearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search transactions..." className="sm:flex-1 sm:max-w-md" />
                            <SuperAdminSelect value={typeFilter} onChange={(v) => { setTypeFilter(v); setPage(1); }}>
                                <option>All Types</option>
                                <option>Payment</option>
                                <option>Refund</option>
                            </SuperAdminSelect>
                            <SuperAdminSelect value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1); }}>
                                <option>All Status</option>
                                <option>Success</option>
                                <option>Failed</option>
                                <option>Pending</option>
                            </SuperAdminSelect>
                            <SuperAdminSecondaryButton label="Export" icon={Download} onClick={exportRows} />
                        </>
                    }
                />

                <SuperAdminCardBody>
                    <div className="space-y-4">
                        <ResponsiveTableShell>
                            <table className="w-full text-sm border-collapse max-xl:min-w-[960px] xl:min-w-0">
                                <thead>
                                    <tr className={superAdminTableHeadClass}>
                                        <th className="py-4 px-4 w-12">#</th>
                                        <th className="py-4 px-4">Transaction ID</th>
                                        <th className="py-4 px-4">Customer</th>
                                        <th className="py-4 px-4 hidden sm:table-cell">Type</th>
                                        <th className="py-4 px-4 hidden md:table-cell">Company</th>
                                        <th className="py-4 px-4 text-right">Amount</th>
                                        <th className="py-4 px-4 text-center">Status</th>
                                        <th className="py-4 px-4 hidden lg:table-cell">Date & Time</th>
                                        <th className="py-4 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-[#1a2744]">
                                    {paginated.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="py-12 text-center text-sm font-semibold text-slate-400 dark:text-slate-500">
                                                No transactions match your search.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginated.map((row, i) => (
                                            <tr key={row.id} className={superAdminTableRowClass}>
                                                <td className="py-4 px-4 text-slate-400 font-semibold">{(page - 1) * pageSize + i + 1}</td>
                                                <td className="py-4 px-4 font-semibold text-blue-600 dark:text-blue-400">{row.trxId}</td>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <AvatarInitials name={row.customer} color={row.color} />
                                                        <span className="font-bold text-slate-900 dark:text-slate-100">{row.customer}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 hidden sm:table-cell text-slate-600 dark:text-slate-300">{row.type}</td>
                                                <td className="py-4 px-4 hidden md:table-cell text-slate-600 dark:text-slate-300">{row.company}</td>
                                                <td className={`py-4 px-4 text-right font-bold ${row.amount.startsWith("-") ? "text-red-500" : "text-slate-900 dark:text-slate-100"}`}>{row.amount}</td>
                                                <td className="py-4 px-4 text-center"><StatusBadge status={row.status} /></td>
                                                <td className="py-4 px-4 text-slate-500 text-xs hidden lg:table-cell">{row.date}</td>
                                                <td className="py-4 px-4 text-right">
                                                    <EntityTableActions
                                                        viewLabel="View Details"
                                                        editLabel="Edit Transaction"
                                                        deleteLabel="Delete Transaction"
                                                        onView={() => crud.setViewing(row)}
                                                        onEdit={() => crud.setEditing(row)}
                                                        onDelete={() => crud.setDeleting(row)}
                                                        moreItems={[
                                                            {
                                                                label: "Copy Transaction ID",
                                                                icon: Copy,
                                                                onClick: () => copyToClipboard(row.trxId),
                                                            },
                                                        ]}
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </ResponsiveTableShell>
                        <SuperAdminTablePagination page={page} pageSize={pageSize} total={filtered.length} entityLabel="transactions" onPageChange={setPage} onPageSizeChange={(n) => { setPageSize(n); setPage(1); }} />
                    </div>
                </SuperAdminCardBody>
            </SuperAdminMainCard>

            <TransactionModals crud={crud} />
        </div>
    );
}
