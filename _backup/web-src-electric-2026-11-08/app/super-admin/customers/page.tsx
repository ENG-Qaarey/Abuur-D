"use client";

import { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { ResponsiveTableShell } from "@/components/ui/ResponsiveTableShell";
import { AvatarInitials, StatusBadge } from "@/components/super-admin/shared/admin-page";
import { EntityTableActions } from "@/components/super-admin/shared/EntityTableActions";
import { CustomerModals } from "@/components/super-admin/shared/modals/customers/CustomerModals";
import { copyToClipboard, superAdminToast } from "@/components/super-admin/shared/super-admin-toast";
import {
    SuperAdminAddButton,
    SuperAdminCardBody,
    SuperAdminFilterButton,
    SuperAdminMainCard,
    SuperAdminMetricsGrid,
    SuperAdminPageHeader,
    SuperAdminSearchInput,
    SuperAdminSelect,
    SuperAdminTablePagination,
    superAdminTableHeadClass,
    superAdminTableRowClass,
    SuperAdminToolbar,
} from "@/components/super-admin/shared/super-admin-layout";
import { customerMetrics, customerRows, type CustomerRow } from "@/data/super-admin-mock";
import { useSuperAdminCrud } from "@/hooks/useSuperAdminCrud";

export default function CustomersPage() {
    const crud = useSuperAdminCrud<CustomerRow>(customerRows);
    const [search, setSearch] = useState("");
    const [company, setCompany] = useState("All Companies");
    const [status, setStatus] = useState("All Status");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const filtered = useMemo(() => {
        return crud.items.filter((row) => {
            const q = search.toLowerCase();
            const matchSearch = !q || row.name.toLowerCase().includes(q) || row.email.toLowerCase().includes(q);
            const matchCompany = company === "All Companies" || row.company === company;
            const matchStatus = status === "All Status" || row.status === status;
            return matchSearch && matchCompany && matchStatus;
        });
    }, [crud.items, search, company, status]);

    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

    return (
        <div className="space-y-6 min-w-0 w-full">
            <SuperAdminPageHeader title="Customers (All)" description="View and manage all customers across the platform." />

            <SuperAdminMetricsGrid stats={customerMetrics} />

            <SuperAdminMainCard>
                <SuperAdminToolbar
                    actions={
                        <>
                            <SuperAdminSearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search customers..." />
                            <SuperAdminSelect value={company} onChange={(v) => { setCompany(v); setPage(1); }}>
                                <option>All Companies</option>
                                <option>Somali Electric Co.</option>
                                <option>Som Power</option>
                                <option>HECO</option>
                                <option>Telesom Electric</option>
                                <option>NECSOM</option>
                            </SuperAdminSelect>
                            <SuperAdminSelect value={status} onChange={(v) => { setStatus(v); setPage(1); }}>
                                <option>All Status</option>
                                <option>Active</option>
                                <option>Inactive</option>
                            </SuperAdminSelect>
                            <SuperAdminFilterButton onClick={() => superAdminToast.info("Advanced filters applied")} />
                            <SuperAdminAddButton label="Add Customer" onClick={() => crud.setCreating(true)} />
                        </>
                    }
                />

                <SuperAdminCardBody>
                    <div className="space-y-4">
                        <ResponsiveTableShell>
                            <table className="w-full text-left text-sm border-collapse max-xl:min-w-[900px] xl:min-w-0 xl:table-fixed">
                                <thead>
                                    <tr className={superAdminTableHeadClass}>
                                        <th className="py-4 px-4 w-12">#</th>
                                        <th className="py-4 px-4">Customer</th>
                                        <th className="py-4 px-4 hidden md:table-cell">Phone</th>
                                        <th className="py-4 px-4 hidden lg:table-cell">Email</th>
                                        <th className="py-4 px-4 hidden sm:table-cell">Company</th>
                                        <th className="py-4 px-4 hidden xl:table-cell">Meter Number</th>
                                        <th className="py-4 px-4 text-center">Status</th>
                                        <th className="py-4 px-4 hidden lg:table-cell">Joined Date</th>
                                        <th className="py-4 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-[#1a2744]">
                                    {paginated.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="py-12 text-center text-sm font-semibold text-slate-400 dark:text-slate-500">
                                                No customers match your filters.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginated.map((row, i) => (
                                            <tr key={row.id} className={superAdminTableRowClass}>
                                                <td className="py-4 px-4 text-slate-400 dark:text-slate-500 font-semibold">{(page - 1) * pageSize + i + 1}</td>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <AvatarInitials name={row.name} color={row.color} />
                                                        <span className="font-bold text-slate-900 dark:text-slate-100">{row.name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-slate-600 dark:text-slate-300 hidden md:table-cell">{row.phone}</td>
                                                <td className="py-4 px-4 text-slate-600 dark:text-slate-300 hidden lg:table-cell">{row.email}</td>
                                                <td className="py-4 px-4 text-slate-600 dark:text-slate-300 hidden sm:table-cell">{row.company}</td>
                                                <td className="py-4 px-4 text-slate-600 dark:text-slate-300 hidden xl:table-cell">{row.meter}</td>
                                                <td className="py-4 px-4 text-center"><StatusBadge status={row.status} /></td>
                                                <td className="py-4 px-4 text-slate-500 dark:text-slate-400 text-xs hidden lg:table-cell">{row.joined}</td>
                                                <td className="py-4 px-4 text-right">
                                                    <EntityTableActions
                                                        viewLabel="View Details"
                                                        editLabel="Edit Customer"
                                                        deleteLabel="Delete Customer"
                                                        onView={() => crud.setViewing(row)}
                                                        onEdit={() => crud.setEditing(row)}
                                                        onDelete={() => crud.setDeleting(row)}
                                                        moreItems={[
                                                            {
                                                                label: "Copy Meter ID",
                                                                icon: Copy,
                                                                onClick: () => copyToClipboard(row.meter, "Meter ID copied"),
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
                        <SuperAdminTablePagination
                            page={page}
                            pageSize={pageSize}
                            total={filtered.length}
                            entityLabel="customers"
                            onPageChange={setPage}
                            onPageSizeChange={(n) => { setPageSize(n); setPage(1); }}
                        />
                    </div>
                </SuperAdminCardBody>
            </SuperAdminMainCard>

            <CustomerModals crud={crud} />
        </div>
    );
}
