"use client";

import { useMemo, useState } from "react";
import { ResponsiveTableShell } from "@/components/ui/ResponsiveTableShell";
import { AvatarInitials, StatusBadge } from "@/components/super-admin/shared/admin-page";
import { EntityTableActions } from "@/components/super-admin/shared/EntityTableActions";
import { CompanyOwnerCrudModals } from "@/components/company-owner/shared/CompanyOwnerCrudModals";
import {
    CompanyOwnerCardBody,
    CompanyOwnerSecondaryButton,
    CompanyOwnerMainCard,
    CompanyOwnerMetricsGrid,
    CompanyOwnerPageHeader,
    CompanyOwnerSearchInput,
    CompanyOwnerSelect,
    CompanyOwnerTablePagination,
    CompanyOwnerToolbar,
    companyOwnerTableHeadClass,
    companyOwnerTableRowClass,
} from "@/components/company-owner/shared/company-owner-layout";
import { companyOwnerToast } from "@/components/company-owner/shared/company-owner-toast";
import { Download } from "lucide-react";
import { ownerPaymentMetrics, ownerPaymentRows, type OwnerPaymentRow } from "@/data/company-owner-mock";
import { useSuperAdminCrud } from "@/hooks/useSuperAdminCrud";

export default function PaymentsPage() {
    const crud = useSuperAdminCrud<OwnerPaymentRow>(ownerPaymentRows);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All Status");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return crud.items.filter((r) => {
            const matchSearch = !q || r.trxId.toLowerCase().includes(q) || r.customer.toLowerCase().includes(q);
            const matchStatus = status === "All Status" || r.status === status;
            return matchSearch && matchStatus;
        });
    }, [crud.items, search, status]);

    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

    return (
        <div className="space-y-6 min-w-0 w-full">
            <CompanyOwnerPageHeader title="Payments" description="Track customer payments and transactions." />
            <CompanyOwnerMetricsGrid stats={ownerPaymentMetrics} />
            <CompanyOwnerMainCard>
                <CompanyOwnerToolbar
                    actions={
                        <>
                            <CompanyOwnerSearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search payments..." />
                            <CompanyOwnerSelect value={status} onChange={(v) => { setStatus(v); setPage(1); }}>
                                <option>All Status</option>
                                <option>Success</option>
                                <option>Failed</option>
                                <option>Pending</option>
                            </CompanyOwnerSelect>
                            <CompanyOwnerSecondaryButton label="Export" icon={Download} onClick={() => companyOwnerToast.success("Payments exported")} />
                        </>
                    }
                />
                <CompanyOwnerCardBody>
                    <ResponsiveTableShell>
                        <table className="w-full text-sm border-collapse max-xl:min-w-[800px] xl:min-w-0">
                            <thead>
                                <tr className={companyOwnerTableHeadClass}>
                                    <th className="py-4 px-4 w-12">#</th>
                                    <th className="py-4 px-4">Transaction</th>
                                    <th className="py-4 px-4">Amount</th>
                                    <th className="py-4 px-4 hidden md:table-cell">Method</th>
                                    <th className="py-4 px-4 text-center">Status</th>
                                    <th className="py-4 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-[#1a2744]">
                                {paginated.map((row, i) => (
                                    <tr key={row.id} className={companyOwnerTableRowClass}>
                                        <td className="py-4 px-4 text-slate-400 font-semibold">{(page - 1) * pageSize + i + 1}</td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <AvatarInitials name={row.customer} color={row.color} />
                                                <div>
                                                    <p className="font-semibold text-blue-600 dark:text-blue-400">{row.trxId}</p>
                                                    <p className="text-xs text-slate-400">{row.customer}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 font-bold">{row.amount}</td>
                                        <td className="py-4 px-4 hidden md:table-cell">{row.method}</td>
                                        <td className="py-4 px-4 text-center"><StatusBadge status={row.status} /></td>
                                        <td className="py-4 px-4">
                                            <EntityTableActions
                                                onView={() => crud.setViewing(row)}
                                                onEdit={() => crud.setEditing(row)}
                                                onDelete={() => crud.setDeleting(row)}
                                                moreItems={[
                                                    { label: "Confirm payment", onClick: () => { crud.update(row.id, { status: "Success" }); companyOwnerToast.success("Payment confirmed"); } },
                                                    { label: "Refund", onClick: () => { crud.update(row.id, { status: "Refunded" }); companyOwnerToast.success("Refund processed"); }, variant: "danger" },
                                                ]}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </ResponsiveTableShell>
                    <CompanyOwnerTablePagination entityLabel="payments" page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />
                </CompanyOwnerCardBody>
            </CompanyOwnerMainCard>
            <CompanyOwnerCrudModals
                crud={crud}
                entityLabel="Payment"
                formFields={[
                    { key: "trxId", label: "Transaction ID", required: true },
                    { key: "customer", label: "Customer", required: true },
                    { key: "amount", label: "Amount", required: true },
                    { key: "method", label: "Method", required: true },
                    { key: "status", label: "Status", type: "select", options: ["Success", "Failed", "Pending"], required: true },
                ]}
                rowToForm={(row) => ({
                    trxId: row?.trxId ?? "",
                    customer: row?.customer ?? "",
                    amount: row?.amount ?? "",
                    method: row?.method ?? "",
                    status: row?.status ?? "Success",
                })}
                formToRow={(v, existing, nextId) => ({
                    id: existing?.id ?? nextId,
                    trxId: v.trxId,
                    customer: v.customer,
                    amount: v.amount,
                    method: v.method,
                    status: v.status,
                    date: existing?.date ?? "Today",
                    color: existing?.color ?? "from-blue-500 to-blue-600",
                })}
                detailFields={(row) => [
                    { label: "Transaction", value: row.trxId },
                    { label: "Customer", value: row.customer },
                    { label: "Amount", value: row.amount },
                    { label: "Method", value: row.method },
                    { label: "Status", value: row.status },
                    { label: "Date", value: row.date },
                ]}
            />
        </div>
    );
}
