"use client";

import { useMemo, useState } from "react";
import { ResponsiveTableShell } from "@/components/ui/ResponsiveTableShell";
import { StatusBadge } from "@/components/super-admin/shared/admin-page";
import { EntityTableActions } from "@/components/super-admin/shared/EntityTableActions";
import { CompanyOwnerCrudModals } from "@/components/company-owner/shared/CompanyOwnerCrudModals";
import {
    CompanyOwnerAddButton,
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
import { ownerBillingMetrics, ownerBillingRows, type OwnerBillingRow } from "@/data/company-owner-mock";
import { useSuperAdminCrud } from "@/hooks/useSuperAdminCrud";

export default function BillingPage() {
    const crud = useSuperAdminCrud<OwnerBillingRow>(ownerBillingRows);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All Status");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return crud.items.filter((r) => {
            const matchSearch = !q || r.billId.toLowerCase().includes(q) || r.customer.toLowerCase().includes(q);
            const matchStatus = status === "All Status" || r.status === status;
            return matchSearch && matchStatus;
        });
    }, [crud.items, search, status]);

    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

    return (
        <div className="space-y-6 min-w-0 w-full">
            <CompanyOwnerPageHeader title="Billing" description="Generate and track customer bills." />
            <CompanyOwnerMetricsGrid stats={ownerBillingMetrics} />
            <CompanyOwnerMainCard>
                <CompanyOwnerToolbar
                    actions={
                        <>
                            <CompanyOwnerSearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search bills..." />
                            <CompanyOwnerSelect value={status} onChange={(v) => { setStatus(v); setPage(1); }}>
                                <option>All Status</option>
                                <option>Paid</option>
                                <option>Pending</option>
                                <option>Overdue</option>
                            </CompanyOwnerSelect>
                            <CompanyOwnerSecondaryButton label="Export" icon={Download} onClick={() => companyOwnerToast.success("Bills exported")} />
                            <CompanyOwnerAddButton label="Generate bills" onClick={() => companyOwnerToast.success("Monthly bills generated")} />
                            <CompanyOwnerSecondaryButton label="Send reminders" onClick={() => companyOwnerToast.success("Payment reminders sent")} />
                        </>
                    }
                />
                <CompanyOwnerCardBody>
                    <ResponsiveTableShell>
                        <table className="w-full text-sm border-collapse max-xl:min-w-[800px] xl:min-w-0">
                            <thead>
                                <tr className={companyOwnerTableHeadClass}>
                                    <th className="py-4 px-4 w-12">#</th>
                                    <th className="py-4 px-4">Bill ID</th>
                                    <th className="py-4 px-4">Customer</th>
                                    <th className="py-4 px-4">Amount</th>
                                    <th className="py-4 px-4 hidden md:table-cell">Due</th>
                                    <th className="py-4 px-4 text-center">Status</th>
                                    <th className="py-4 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-[#1a2744]">
                                {paginated.map((row, i) => (
                                    <tr key={row.id} className={companyOwnerTableRowClass}>
                                        <td className="py-4 px-4 text-slate-400 font-semibold">{(page - 1) * pageSize + i + 1}</td>
                                        <td className="py-4 px-4 font-semibold text-blue-600 dark:text-blue-400">{row.billId}</td>
                                        <td className="py-4 px-4">{row.customer}</td>
                                        <td className="py-4 px-4 font-bold">{row.amount}</td>
                                        <td className="py-4 px-4 hidden md:table-cell text-slate-500">{row.dueDate}</td>
                                        <td className="py-4 px-4 text-center"><StatusBadge status={row.status} /></td>
                                        <td className="py-4 px-4">
                                            <EntityTableActions onView={() => crud.setViewing(row)} onEdit={() => crud.setEditing(row)} onDelete={() => crud.setDeleting(row)} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </ResponsiveTableShell>
                    <CompanyOwnerTablePagination entityLabel="bills" page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />
                </CompanyOwnerCardBody>
            </CompanyOwnerMainCard>
            <CompanyOwnerCrudModals
                crud={crud}
                entityLabel="Bill"
                formFields={[
                    { key: "billId", label: "Bill ID", required: true },
                    { key: "customer", label: "Customer", required: true },
                    { key: "amount", label: "Amount", required: true },
                    { key: "status", label: "Status", type: "select", options: ["Paid", "Pending", "Overdue"], required: true },
                ]}
                rowToForm={(row) => ({
                    billId: row?.billId ?? "",
                    customer: row?.customer ?? "",
                    amount: row?.amount ?? "",
                    status: row?.status ?? "Pending",
                })}
                formToRow={(v, existing, nextId) => ({
                    id: existing?.id ?? nextId,
                    billId: v.billId,
                    customer: v.customer,
                    amount: v.amount,
                    status: v.status,
                    dueDate: existing?.dueDate ?? "—",
                    period: existing?.period ?? "May 2026",
                })}
                detailFields={(row) => [
                    { label: "Bill ID", value: row.billId },
                    { label: "Customer", value: row.customer },
                    { label: "Amount", value: row.amount },
                    { label: "Period", value: row.period },
                    { label: "Due date", value: row.dueDate },
                    { label: "Status", value: row.status },
                ]}
            />
        </div>
    );
}
