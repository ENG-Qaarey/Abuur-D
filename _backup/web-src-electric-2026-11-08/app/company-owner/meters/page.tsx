"use client";

import { useMemo, useState } from "react";
import { ResponsiveTableShell } from "@/components/ui/ResponsiveTableShell";
import { StatusBadge } from "@/components/super-admin/shared/admin-page";
import { EntityTableActions } from "@/components/super-admin/shared/EntityTableActions";
import { CompanyOwnerCrudModals } from "@/components/company-owner/shared/CompanyOwnerCrudModals";
import {
    CompanyOwnerAddButton,
    CompanyOwnerCardBody,
    CompanyOwnerMainCard,
    CompanyOwnerMetricsGrid,
    CompanyOwnerPageHeader,
    CompanyOwnerSearchInput,
    CompanyOwnerSelect,
    CompanyOwnerTabBar,
    CompanyOwnerTablePagination,
    CompanyOwnerToolbar,
    companyOwnerTableHeadClass,
    companyOwnerTableRowClass,
} from "@/components/company-owner/shared/company-owner-layout";
import { ownerMeterMetrics, ownerMeterRows, ownerReadingRows, type OwnerMeterRow } from "@/data/company-owner-mock";
import { useSuperAdminCrud } from "@/hooks/useSuperAdminCrud";

const formFields = [
    { key: "meterId", label: "Meter ID", required: true },
    { key: "customer", label: "Customer", required: true },
    { key: "type", label: "Type", type: "select" as const, options: ["Smart", "Analog"], required: true },
    { key: "district", label: "District", required: true },
    { key: "capacity", label: "Capacity", required: true },
    { key: "status", label: "Status", type: "select" as const, options: ["Active", "Offline", "Suspended", "Faulty", "Maintenance"], required: true },
    { key: "connectivity", label: "Connectivity", type: "select" as const, options: ["Online", "Offline"], required: true },
];

const meterTabs = [
    { id: "meters", label: "Smart meters" },
    { id: "readings", label: "Energy readings" },
    { id: "history", label: "Consumption history" },
];

export default function MetersPage() {
    const crud = useSuperAdminCrud<OwnerMeterRow>(ownerMeterRows);
    const [view, setView] = useState("meters");
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("All Status");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return crud.items.filter((r) => {
            const matchSearch = !q || r.meterId.toLowerCase().includes(q) || r.customer.toLowerCase().includes(q);
            const matchStatus = status === "All Status" || r.status === status;
            return matchSearch && matchStatus;
        });
    }, [crud.items, search, status]);

    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

    return (
        <div className="space-y-6 min-w-0 w-full">
            <CompanyOwnerPageHeader title="Meter Management" description="Smart meters, online status, readings and consumption history." />
            <CompanyOwnerMetricsGrid stats={ownerMeterMetrics} />
            <CompanyOwnerTabBar tabs={meterTabs} active={view} onChange={setView} />
            {view === "readings" || view === "history" ? (
                <CompanyOwnerMainCard>
                    <CompanyOwnerCardBody>
                        <ResponsiveTableShell>
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className={companyOwnerTableHeadClass}>
                                        <th className="py-4 px-4">Reading ID</th>
                                        <th className="py-4 px-4">Meter</th>
                                        <th className="py-4 px-4">Customer</th>
                                        <th className="py-4 px-4">Usage</th>
                                        <th className="py-4 px-4 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-[#1a2744]">
                                    {ownerReadingRows.map((row) => (
                                        <tr key={row.id} className={companyOwnerTableRowClass}>
                                            <td className="py-4 px-4 font-semibold text-cyan-600 dark:text-cyan-400">{row.readingId}</td>
                                            <td className="py-4 px-4">{row.meterId}</td>
                                            <td className="py-4 px-4">{row.customer}</td>
                                            <td className="py-4 px-4 font-bold">{row.usage}</td>
                                            <td className="py-4 px-4 text-center"><StatusBadge status={row.status} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </ResponsiveTableShell>
                    </CompanyOwnerCardBody>
                </CompanyOwnerMainCard>
            ) : null}
            {view === "meters" ? (
            <CompanyOwnerMainCard>
                <CompanyOwnerToolbar
                    actions={
                        <>
                            <CompanyOwnerSearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search meters..." />
                            <CompanyOwnerSelect value={status} onChange={(v) => { setStatus(v); setPage(1); }}>
                                <option>All Status</option>
                                <option>Active</option>
                                <option>Maintenance</option>
                                <option>Faulty</option>
                            </CompanyOwnerSelect>
                            <CompanyOwnerAddButton label="Register Meter" onClick={() => crud.setCreating(true)} />
                        </>
                    }
                />
                <CompanyOwnerCardBody>
                    <ResponsiveTableShell>
                        <table className="w-full text-sm border-collapse max-xl:min-w-[800px] xl:min-w-0">
                            <thead>
                                <tr className={companyOwnerTableHeadClass}>
                                    <th className="py-4 px-4 w-12">#</th>
                                    <th className="py-4 px-4">Meter ID</th>
                                    <th className="py-4 px-4">Customer</th>
                                    <th className="py-4 px-4">Type</th>
                                    <th className="py-4 px-4 text-center">Online</th>
                                    <th className="py-4 px-4 hidden md:table-cell">District</th>
                                    <th className="py-4 px-4 text-center">Status</th>
                                    <th className="py-4 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-[#1a2744]">
                                {paginated.map((row, i) => (
                                    <tr key={row.id} className={companyOwnerTableRowClass}>
                                        <td className="py-4 px-4 text-slate-400 font-semibold">{(page - 1) * pageSize + i + 1}</td>
                                        <td className="py-4 px-4 font-semibold text-blue-600 dark:text-blue-400">{row.meterId}</td>
                                        <td className="py-4 px-4 font-medium">{row.customer}</td>
                                        <td className="py-4 px-4">{row.type}</td>
                                        <td className="py-4 px-4 text-center"><StatusBadge status={row.connectivity} /></td>
                                        <td className="py-4 px-4 hidden md:table-cell text-slate-500">{row.district}</td>
                                        <td className="py-4 px-4 text-center"><StatusBadge status={row.status} /></td>
                                        <td className="py-4 px-4">
                                            <EntityTableActions onView={() => crud.setViewing(row)} onEdit={() => crud.setEditing(row)} onDelete={() => crud.setDeleting(row)} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </ResponsiveTableShell>
                    <CompanyOwnerTablePagination entityLabel="meters" page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />
                </CompanyOwnerCardBody>
            </CompanyOwnerMainCard>
            ) : null}
            {view === "meters" ? (
            <CompanyOwnerCrudModals
                crud={crud}
                entityLabel="Meter"
                formFields={formFields}
                rowToForm={(row) => ({
                    meterId: row?.meterId ?? "",
                    customer: row?.customer ?? "",
                    type: row?.type ?? "Smart",
                    district: row?.district ?? "",
                    capacity: row?.capacity ?? "60A",
                    status: row?.status ?? "Active",
                    connectivity: row?.connectivity ?? "Online",
                })}
                formToRow={(v, existing, nextId) => ({
                    id: existing?.id ?? nextId,
                    meterId: v.meterId,
                    customer: v.customer,
                    type: v.type,
                    capacity: v.capacity,
                    district: v.district,
                    status: v.status,
                    connectivity: v.connectivity,
                    installed: existing?.installed ?? "Today",
                })}
                detailFields={(row) => [
                    { label: "Meter ID", value: row.meterId },
                    { label: "Customer", value: row.customer },
                    { label: "Type / Capacity", value: `${row.type} · ${row.capacity}` },
                    { label: "District", value: row.district },
                    { label: "Status", value: row.status },
                    { label: "Connectivity", value: row.connectivity },
                    { label: "Installed", value: row.installed },
                ]}
            />
            ) : null}
        </div>
    );
}
