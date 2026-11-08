"use client";

import { useMemo, useState } from "react";
import { Ban, CheckCircle, Copy, Download, KeyRound, Download as DownloadIcon } from "lucide-react";
import { ResponsiveTableShell } from "@/components/ui/ResponsiveTableShell";
import { AvatarInitials, StatusBadge } from "@/components/super-admin/shared/admin-page";
import { EntityTableActions } from "@/components/super-admin/shared/EntityTableActions";
import { CompanyOwnerCustomerModals } from "@/components/company-owner/customers/CompanyOwnerCustomerModals";
import { companyOwnerToast, copyToClipboard } from "@/components/company-owner/shared/company-owner-toast";
import {
    CompanyOwnerAddButton,
    CompanyOwnerCardBody,
    CompanyOwnerFilterButton,
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
import { COMPANY_OWNER_NAME, ownerCustomerMetrics, ownerCustomerRows } from "@/data/company-owner-mock";
import type { CustomerRow } from "@/data/super-admin-mock";
import { useSuperAdminCrud } from "@/hooks/useSuperAdminCrud";
function toCustomerRow(row: (typeof ownerCustomerRows)[0]): CustomerRow {
    return { ...row, company: COMPANY_OWNER_NAME };
}

const initialCustomers = ownerCustomerRows.map(toCustomerRow);

export default function CustomersPage() {
    const crud = useSuperAdminCrud<CustomerRow>(initialCustomers);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All Status");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return crud.items.filter((row) => {
            const matchSearch = !q || row.name.toLowerCase().includes(q) || row.email.toLowerCase().includes(q) || row.meter.toLowerCase().includes(q);
            const matchStatus = status === "All Status" || row.status === status;
            return matchSearch && matchStatus;
        });
    }, [crud.items, search, status]);

    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

    const toggleSuspend = (row: CustomerRow) => {
        const next = row.status === "Active" ? "Inactive" : "Active";
        crud.update(row.id, { status: next });
        companyOwnerToast.success(next === "Active" ? "Customer activated" : "Customer suspended");
    };

    return (
        <div className="space-y-6 min-w-0 w-full">
            <CompanyOwnerPageHeader
                title="Customers Management"
                description="Create, edit, suspend customers — assign meters, export data, reset passwords."
            />
            <CompanyOwnerMetricsGrid stats={ownerCustomerMetrics} />
            <CompanyOwnerMainCard>
                <CompanyOwnerToolbar
                    actions={
                        <>
                            <CompanyOwnerSearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by name, email, meter..." />
                            <CompanyOwnerSelect value={status} onChange={(v) => { setStatus(v); setPage(1); }}>
                                <option>All Status</option>
                                <option>Active</option>
                                <option>Inactive</option>
                            </CompanyOwnerSelect>
                            <CompanyOwnerFilterButton onClick={() => companyOwnerToast.info("Advanced filters applied")} />
                            <CompanyOwnerSecondaryButton label="Export" icon={DownloadIcon} onClick={() => companyOwnerToast.success("Customer data exported")} />
                            <CompanyOwnerAddButton label="Add Customer" onClick={() => crud.setCreating(true)} />
                        </>
                    }
                />
                <CompanyOwnerCardBody>
                    <ResponsiveTableShell>
                        <table className="w-full text-left text-sm border-collapse max-xl:min-w-[960px] xl:min-w-0">
                            <thead>
                                <tr className={companyOwnerTableHeadClass}>
                                    <th className="py-4 px-4 w-12">#</th>
                                    <th className="py-4 px-4">Customer</th>
                                    <th className="py-4 px-4 hidden md:table-cell">District</th>
                                    <th className="py-4 px-4">Meter</th>
                                    <th className="py-4 px-4 text-center">Status</th>
                                    <th className="py-4 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-[#1a2744]">
                                {paginated.map((row, i) => {
                                    const district = ownerCustomerRows.find((c) => c.id === row.id)?.district ?? "—";
                                    return (
                                        <tr key={row.id} className={companyOwnerTableRowClass}>
                                            <td className="py-4 px-4 text-slate-400 font-semibold">{(page - 1) * pageSize + i + 1}</td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <AvatarInitials name={row.name} color={row.color} />
                                                    <div>
                                                        <p className="font-bold text-slate-900 dark:text-white">{row.name}</p>
                                                        <p className="text-xs text-slate-400">{row.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 hidden md:table-cell">{district}</td>
                                            <td className="py-4 px-4 font-semibold text-cyan-600 dark:text-cyan-400">{row.meter}</td>
                                            <td className="py-4 px-4 text-center"><StatusBadge status={row.status} /></td>
                                            <td className="py-4 px-4">
                                                <EntityTableActions
                                                    onView={() => crud.setViewing(row)}
                                                    onEdit={() => crud.setEditing(row)}
                                                    onDelete={() => crud.setDeleting(row)}
                                                    moreItems={[
                                                        { label: "Copy email", icon: Copy, onClick: () => copyToClipboard(row.email, "Email copied") },
                                                        { label: "Reset password", icon: KeyRound, onClick: () => companyOwnerToast.success("Password reset link sent") },
                                                        {
                                                            label: row.status === "Active" ? "Suspend" : "Activate",
                                                            icon: row.status === "Active" ? Ban : CheckCircle,
                                                            onClick: () => toggleSuspend(row),
                                                        },
                                                        { label: "Assign meter", icon: Download, onClick: () => companyOwnerToast.info("Open meter assignment") },
                                                    ]}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </ResponsiveTableShell>
                    <CompanyOwnerTablePagination entityLabel="customers" page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />
                </CompanyOwnerCardBody>
            </CompanyOwnerMainCard>
            <CompanyOwnerCustomerModals crud={crud} />
        </div>
    );
}
