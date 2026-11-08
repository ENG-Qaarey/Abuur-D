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
    CompanyOwnerTablePagination,
    CompanyOwnerToolbar,
    companyOwnerTableHeadClass,
    companyOwnerTableRowClass,
} from "@/components/company-owner/shared/company-owner-layout";
import { ownerNotificationMetrics, ownerNotificationRows, type OwnerNotificationRow } from "@/data/company-owner-mock";
import { useSuperAdminCrud } from "@/hooks/useSuperAdminCrud";

export default function NotificationsPage() {
    const crud = useSuperAdminCrud<OwnerNotificationRow>(ownerNotificationRows);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return crud.items.filter((r) => !q || r.title.toLowerCase().includes(q));
    }, [crud.items, search]);

    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

    return (
        <div className="space-y-6 min-w-0 w-full">
            <CompanyOwnerPageHeader
                title="Notifications & Announcements"
                description="Payment reminders, maintenance notices, outage alerts, SMS and scheduled announcements."
            />
            <CompanyOwnerMetricsGrid stats={ownerNotificationMetrics} />
            <CompanyOwnerMainCard>
                <CompanyOwnerToolbar
                    actions={
                        <>
                            <CompanyOwnerSearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search notifications..." />
                            <CompanyOwnerAddButton label="New Notification" onClick={() => crud.setCreating(true)} />
                        </>
                    }
                />
                <CompanyOwnerCardBody>
                    <ResponsiveTableShell>
                        <table className="w-full text-sm border-collapse max-xl:min-w-[700px] xl:min-w-0">
                            <thead>
                                <tr className={companyOwnerTableHeadClass}>
                                    <th className="py-4 px-4 w-12">#</th>
                                    <th className="py-4 px-4">Title</th>
                                    <th className="py-4 px-4">Channel</th>
                                    <th className="py-4 px-4 hidden md:table-cell">Audience</th>
                                    <th className="py-4 px-4 text-center">Status</th>
                                    <th className="py-4 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-[#1a2744]">
                                {paginated.map((row, i) => (
                                    <tr key={row.id} className={companyOwnerTableRowClass}>
                                        <td className="py-4 px-4 text-slate-400 font-semibold">{(page - 1) * pageSize + i + 1}</td>
                                        <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">{row.title}</td>
                                        <td className="py-4 px-4">{row.channel}</td>
                                        <td className="py-4 px-4 hidden md:table-cell text-slate-500">{row.audience}</td>
                                        <td className="py-4 px-4 text-center"><StatusBadge status={row.status} /></td>
                                        <td className="py-4 px-4">
                                            <EntityTableActions onView={() => crud.setViewing(row)} onEdit={() => crud.setEditing(row)} onDelete={() => crud.setDeleting(row)} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </ResponsiveTableShell>
                    <CompanyOwnerTablePagination entityLabel="notifications" page={page} pageSize={pageSize} total={filtered.length} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />
                </CompanyOwnerCardBody>
            </CompanyOwnerMainCard>
            <CompanyOwnerCrudModals
                crud={crud}
                entityLabel="Notification"
                formFields={[
                    { key: "title", label: "Title", required: true },
                    { key: "channel", label: "Channel", type: "select", options: ["SMS", "Email", "Push"], required: true },
                    { key: "audience", label: "Audience", required: true },
                    { key: "status", label: "Status", type: "select", options: ["Sent", "Scheduled", "Draft"], required: true },
                ]}
                rowToForm={(row) => ({
                    title: row?.title ?? "",
                    channel: row?.channel ?? "SMS",
                    audience: row?.audience ?? "",
                    status: row?.status ?? "Draft",
                })}
                formToRow={(v, existing, nextId) => ({
                    id: existing?.id ?? nextId,
                    title: v.title,
                    channel: v.channel,
                    audience: v.audience,
                    status: v.status,
                    sentAt: existing?.sentAt ?? "—",
                })}
                detailFields={(row) => [
                    { label: "Title", value: row.title },
                    { label: "Channel", value: row.channel },
                    { label: "Audience", value: row.audience },
                    { label: "Status", value: row.status },
                    { label: "Sent at", value: row.sentAt },
                ]}
            />
        </div>
    );
}
