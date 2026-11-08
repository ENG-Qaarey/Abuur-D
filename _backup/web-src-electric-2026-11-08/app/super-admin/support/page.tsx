"use client";

import { useMemo, useState } from "react";
import { Filter } from "lucide-react";
import { ResponsiveTableShell } from "@/components/ui/ResponsiveTableShell";
import { StatusBadge } from "@/components/super-admin/shared/admin-page";
import { EntityTableActions } from "@/components/super-admin/shared/EntityTableActions";
import { TicketModals } from "@/components/super-admin/shared/modals/support/TicketModals";
import { superAdminToast } from "@/components/super-admin/shared/super-admin-toast";
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
import { supportMetrics, ticketRows, type TicketRow } from "@/data/super-admin-mock";
import { useSuperAdminCrud } from "@/hooks/useSuperAdminCrud";

export default function SupportPage() {
    const crud = useSuperAdminCrud<TicketRow>(ticketRows);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [priorityFilter, setPriorityFilter] = useState("All Priority");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return crud.items.filter((t) => {
            const matchSearch =
                !q || t.ticketId.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q) || t.customer.toLowerCase().includes(q);
            const matchStatus = statusFilter === "All Status" || t.status === statusFilter;
            const matchPriority = priorityFilter === "All Priority" || t.priority === priorityFilter;
            return matchSearch && matchStatus && matchPriority;
        });
    }, [crud.items, search, statusFilter, priorityFilter]);

    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

    return (
        <div className="space-y-6 min-w-0 w-full">
            <SuperAdminPageHeader title="Support & Tickets" description="Manage customer support tickets and requests." />

            <SuperAdminMetricsGrid stats={supportMetrics} />

            <SuperAdminMainCard>
                <SuperAdminToolbar
                    actions={
                        <>
                            <SuperAdminSearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search tickets..." className="sm:flex-1 sm:max-w-md" />
                            <SuperAdminSelect value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1); }}>
                                <option>All Status</option>
                                <option>Open</option>
                                <option>In Progress</option>
                                <option>Resolved</option>
                            </SuperAdminSelect>
                            <SuperAdminSelect value={priorityFilter} onChange={(v) => { setPriorityFilter(v); setPage(1); }}>
                                <option>All Priority</option>
                                <option>High</option>
                                <option>Medium</option>
                                <option>Low</option>
                            </SuperAdminSelect>
                            <SuperAdminSecondaryButton label="Filter" icon={Filter} onClick={() => superAdminToast.info("Filters applied")} />
                        </>
                    }
                />
                <SuperAdminCardBody>
                    <div className="space-y-4">
                        <ResponsiveTableShell>
                            <table className="w-full text-sm border-collapse max-xl:min-w-[900px] xl:min-w-0">
                                <thead>
                                    <tr className={superAdminTableHeadClass}>
                                        <th className="py-4 px-4 w-12">#</th>
                                        <th className="py-4 px-4">Ticket ID</th>
                                        <th className="py-4 px-4">Subject</th>
                                        <th className="py-4 px-4 hidden sm:table-cell">Customer</th>
                                        <th className="py-4 px-4 text-center">Priority</th>
                                        <th className="py-4 px-4 text-center">Status</th>
                                        <th className="py-4 px-4 hidden lg:table-cell">Created At</th>
                                        <th className="py-4 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-[#1a2744]">
                                    {paginated.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="py-12 text-center text-sm font-semibold text-slate-400 dark:text-slate-500">
                                                No tickets match your search.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginated.map((row, i) => (
                                            <tr key={row.id} className={superAdminTableRowClass}>
                                                <td className="py-4 px-4 text-slate-400 font-semibold">{(page - 1) * pageSize + i + 1}</td>
                                                <td className="py-4 px-4 font-semibold text-blue-600 dark:text-blue-400">{row.ticketId}</td>
                                                <td className="py-4 px-4 font-bold text-slate-900 dark:text-slate-100">{row.subject}</td>
                                                <td className="py-4 px-4 hidden sm:table-cell text-slate-600 dark:text-slate-300">{row.customer}</td>
                                                <td className="py-4 px-4 text-center"><StatusBadge status={row.priority} /></td>
                                                <td className="py-4 px-4 text-center"><StatusBadge status={row.status} /></td>
                                                <td className="py-4 px-4 text-slate-500 text-xs hidden lg:table-cell">{row.created}</td>
                                                <td className="py-4 px-4 text-right">
                                                    <EntityTableActions
                                                        viewLabel="View Ticket"
                                                        editLabel="Edit Ticket"
                                                        deleteLabel="Delete Ticket"
                                                        onView={() => crud.setViewing(row)}
                                                        onEdit={() => crud.setEditing(row)}
                                                        onDelete={() => crud.setDeleting(row)}
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </ResponsiveTableShell>
                        <SuperAdminTablePagination page={page} pageSize={pageSize} total={filtered.length} entityLabel="tickets" onPageChange={setPage} onPageSizeChange={(n) => { setPageSize(n); setPage(1); }} />
                    </div>
                </SuperAdminCardBody>
            </SuperAdminMainCard>

            <TicketModals crud={crud} />
        </div>
    );
}
