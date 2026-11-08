"use client";

import { useMemo, useState } from "react";
import { ResponsiveTableShell } from "@/components/ui/ResponsiveTableShell";
import { StatusBadge } from "@/components/super-admin/shared/admin-page";
import { EntityTableActions } from "@/components/super-admin/shared/EntityTableActions";
import { AnnouncementModals } from "@/components/super-admin/shared/modals/announcements/AnnouncementModals";
import {
    SuperAdminAddButton,
    SuperAdminCardBody,
    SuperAdminMainCard,
    SuperAdminMetricsGrid,
    SuperAdminPageHeader,
    SuperAdminTab,
    SuperAdminToolbar,
    superAdminTableHeadClass,
    superAdminTableRowClass,
} from "@/components/super-admin/shared/super-admin-layout";
import { announcementMetrics, announcementRows, type AnnouncementRow } from "@/data/super-admin-mock";
import { useSuperAdminCrud } from "@/hooks/useSuperAdminCrud";

const tabs = ["All", "Published", "Scheduled", "Drafts"] as const;

export default function AnnouncementsPage() {
    const crud = useSuperAdminCrud<AnnouncementRow>(announcementRows);
    const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("All");

    const filtered = useMemo(() => {
        return crud.items.filter((row) => {
            if (activeTab === "All") return true;
            if (activeTab === "Drafts") return row.status === "Draft";
            return row.status === activeTab;
        });
    }, [crud.items, activeTab]);

    return (
        <div className="space-y-6 min-w-0 w-full">
            <SuperAdminPageHeader title="Announcements" description="Create and manage system-wide announcements." />

            <SuperAdminMetricsGrid stats={announcementMetrics} />

            <SuperAdminMainCard>
                <SuperAdminToolbar
                    tabs={
                        <>
                            {tabs.map((tab) => (
                                <SuperAdminTab key={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)}>
                                    {tab}
                                </SuperAdminTab>
                            ))}
                        </>
                    }
                    actions={<SuperAdminAddButton label="New Announcement" onClick={() => crud.setCreating(true)} />}
                />
                <SuperAdminCardBody>
                    <ResponsiveTableShell>
                        <table className="w-full text-sm border-collapse max-xl:min-w-[720px] xl:min-w-0">
                            <thead>
                                <tr className={superAdminTableHeadClass}>
                                    <th className="py-4 px-4 w-12">#</th>
                                    <th className="py-4 px-4 text-left">Title</th>
                                    <th className="py-4 px-4 hidden sm:table-cell">Audience</th>
                                    <th className="py-4 px-4 text-center">Status</th>
                                    <th className="py-4 px-4 hidden md:table-cell">Published At</th>
                                    <th className="py-4 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-[#1a2744]">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-sm font-semibold text-slate-400 dark:text-slate-500">
                                            No announcements in this tab.
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((row, i) => (
                                        <tr key={row.id} className={superAdminTableRowClass}>
                                            <td className="py-4 px-4 text-slate-400 font-semibold">{i + 1}</td>
                                            <td className="py-4 px-4 font-bold text-slate-900 dark:text-slate-100">{row.title}</td>
                                            <td className="py-4 px-4 text-slate-600 dark:text-slate-300 hidden sm:table-cell">{row.audience}</td>
                                            <td className="py-4 px-4 text-center"><StatusBadge status={row.status} /></td>
                                            <td className="py-4 px-4 text-slate-500 text-xs hidden md:table-cell">{row.publishedAt}</td>
                                            <td className="py-4 px-4 text-right">
                                                <EntityTableActions
                                                    showView={false}
                                                    editLabel="Edit Announcement"
                                                    deleteLabel="Delete Announcement"
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
                </SuperAdminCardBody>
            </SuperAdminMainCard>

            <AnnouncementModals crud={crud} />
        </div>
    );
}
