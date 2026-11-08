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
    CompanyOwnerToolbar,
    companyOwnerTableHeadClass,
    companyOwnerTableRowClass,
} from "@/components/company-owner/shared/company-owner-layout";
import { companyOwnerToast } from "@/components/company-owner/shared/company-owner-toast";
import { ownerChatMetrics, ownerOutageRows, ownerTicketRows, type OwnerTicketRow } from "@/data/company-owner-mock";
import { useSuperAdminCrud } from "@/hooks/useSuperAdminCrud";

const tabs = [
    { id: "tickets", label: "Customer tickets" },
    { id: "outages", label: "Power outages" },
    { id: "live", label: "Live support" },
];

const ticketCategories = ["Power Outage", "Meter Fault", "Billing Issue", "Payment Issue", "New Connection", "Technical Support"];
const priorities = ["Low", "Medium", "High", "Critical"];

export default function SupportTicketsPage() {
    const crud = useSuperAdminCrud<OwnerTicketRow>(ownerTicketRows);
    const [tab, setTab] = useState("tickets");
    const [search, setSearch] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("All Priority");

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        if (tab === "outages") return ownerOutageRows;
        if (tab === "live") return crud.items.filter((t) => t.status === "Open" || t.status === "In Progress");
        return crud.items.filter((t) => {
            const matchSearch = !q || t.ticketId.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q);
            const matchPriority = priorityFilter === "All Priority" || t.priority === priorityFilter;
            return matchSearch && matchPriority;
        });
    }, [crud.items, search, priorityFilter, tab]);

    return (
        <div className="space-y-6 min-w-0 w-full">
            <CompanyOwnerPageHeader
                title="Support & Complaints"
                description="View tickets, assign technicians, prioritize issues, outage reports and live support."
            />
            <CompanyOwnerMetricsGrid stats={ownerChatMetrics} />
            <CompanyOwnerTabBar tabs={tabs} active={tab} onChange={setTab} />
            <CompanyOwnerMainCard>
                <CompanyOwnerToolbar
                    actions={
                        <>
                            <CompanyOwnerSearchInput value={search} onChange={setSearch} placeholder="Search tickets..." />
                            {tab === "tickets" && (
                                <>
                                    <CompanyOwnerSelect value={priorityFilter} onChange={setPriorityFilter}>
                                        <option>All Priority</option>
                                        {priorities.map((p) => (
                                            <option key={p}>{p}</option>
                                        ))}
                                    </CompanyOwnerSelect>
                                    <CompanyOwnerAddButton label="New ticket" onClick={() => crud.setCreating(true)} />
                                </>
                            )}
                        </>
                    }
                />
                <CompanyOwnerCardBody>
                    <ResponsiveTableShell>
                        <table className="w-full text-sm border-collapse max-xl:min-w-[900px] xl:min-w-0">
                            <thead>
                                <tr className={companyOwnerTableHeadClass}>
                                    <th className="py-4 px-4">Ticket</th>
                                    <th className="py-4 px-4">Subject</th>
                                    <th className="py-4 px-4 hidden md:table-cell">Category</th>
                                    <th className="py-4 px-4 text-center">Priority</th>
                                    <th className="py-4 px-4 text-center">Status</th>
                                    <th className="py-4 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-[#1a2744]">
                                {tab === "outages"
                                    ? ownerOutageRows.map((row) => (
                                          <tr key={row.id} className={companyOwnerTableRowClass}>
                                              <td className="py-4 px-4 font-semibold text-rose-500">{row.outageId}</td>
                                              <td className="py-4 px-4">{row.cause}</td>
                                              <td className="py-4 px-4 hidden md:table-cell">Power Outage</td>
                                              <td className="py-4 px-4 text-center"><StatusBadge status="Critical" /></td>
                                              <td className="py-4 px-4 text-center"><StatusBadge status={row.status} /></td>
                                              <td className="py-4 px-4">
                                                  <EntityTableActions
                                                      onView={() => companyOwnerToast.info(`Outage ${row.district}`)}
                                                      onEdit={() => companyOwnerToast.info("Assign crew")}
                                                  />
                                              </td>
                                          </tr>
                                      ))
                                    : (filtered as OwnerTicketRow[]).map((row) => (
                                          <tr key={row.id} className={companyOwnerTableRowClass}>
                                              <td className="py-4 px-4 font-semibold text-cyan-600 dark:text-cyan-400">{row.ticketId}</td>
                                              <td className="py-4 px-4">
                                                  <p className="font-medium">{row.subject}</p>
                                                  <p className="text-xs text-slate-400">{row.customer}</p>
                                              </td>
                                              <td className="py-4 px-4 hidden md:table-cell">{row.category}</td>
                                              <td className="py-4 px-4 text-center"><StatusBadge status={row.priority} /></td>
                                              <td className="py-4 px-4 text-center"><StatusBadge status={row.status} /></td>
                                              <td className="py-4 px-4">
                                                  <EntityTableActions
                                                      onView={() => crud.setViewing(row)}
                                                      onEdit={() => crud.setEditing(row)}
                                                      onDelete={() => crud.setDeleting(row)}
                                                      moreItems={[
                                                          { label: "Assign technician", onClick: () => companyOwnerToast.success("Technician assigned") },
                                                          { label: "Close ticket", onClick: () => { crud.update(row.id, { status: "Resolved" }); companyOwnerToast.success("Ticket closed"); } },
                                                          { label: "Reopen", onClick: () => { crud.update(row.id, { status: "Open" }); companyOwnerToast.info("Ticket reopened"); } },
                                                      ]}
                                                  />
                                              </td>
                                          </tr>
                                      ))}
                            </tbody>
                        </table>
                    </ResponsiveTableShell>
                </CompanyOwnerCardBody>
            </CompanyOwnerMainCard>
            {tab === "tickets" && (
                <CompanyOwnerCrudModals
                    crud={crud}
                    entityLabel="Ticket"
                    formFields={[
                        { key: "subject", label: "Subject", required: true },
                        { key: "customer", label: "Customer", required: true },
                        { key: "category", label: "Category", type: "select", options: ticketCategories, required: true },
                        { key: "priority", label: "Priority", type: "select", options: priorities, required: true },
                        { key: "assignee", label: "Assignee", required: true },
                    ]}
                    rowToForm={(row) => ({
                        subject: row?.subject ?? "",
                        customer: row?.customer ?? "",
                        category: row?.category ?? ticketCategories[0],
                        priority: row?.priority ?? "Medium",
                        assignee: row?.assignee ?? "",
                    })}
                    formToRow={(v, existing, nextId) => ({
                        id: existing?.id ?? nextId,
                        ticketId: existing?.ticketId ?? `TK-2026-${String(nextId).padStart(4, "0")}`,
                        subject: v.subject,
                        customer: v.customer,
                        category: v.category,
                        priority: v.priority,
                        status: existing?.status ?? "Open",
                        assignee: v.assignee,
                        created: existing?.created ?? "Now",
                    })}
                    detailFields={(row) => [
                        { label: "Ticket ID", value: row.ticketId },
                        { label: "Customer", value: row.customer },
                        { label: "Category", value: row.category },
                        { label: "Priority", value: row.priority },
                        { label: "Assignee", value: row.assignee },
                        { label: "Status", value: row.status },
                    ]}
                />
            )}
        </div>
    );
}
