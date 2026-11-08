"use client";

import { useMemo, useState } from "react";
import { ResponsiveTableShell } from "@/components/ui/ResponsiveTableShell";
import { AvatarInitials, StatusBadge } from "@/components/super-admin/shared/admin-page";
import { EntityTableActions } from "@/components/super-admin/shared/EntityTableActions";
import { CompanyOwnerStaffModals } from "@/components/company-owner/staff/CompanyOwnerStaffModals";
import {
    CompanyOwnerAddButton,
    CompanyOwnerCardBody,
    CompanyOwnerMainCard,
    CompanyOwnerMetricsGrid,
    CompanyOwnerPageHeader,
    CompanyOwnerSearchInput,
    CompanyOwnerTabBar,
    CompanyOwnerToolbar,
    companyOwnerTableHeadClass,
    companyOwnerTableRowClass,
} from "@/components/company-owner/shared/company-owner-layout";
import { ownerActivityLogs, ownerEmployeeMetrics, ownerAdminRows, ownerEmployeeRows, ownerStaffPermissions, type OwnerStaffRow } from "@/data/company-owner-mock";
import { CompanyOwnerGlassCard } from "@/components/company-owner/shared/company-owner-layout";
import { useSuperAdminCrud } from "@/hooks/useSuperAdminCrud";

const tabs = [
    { id: "technicians", label: "Technicians" },
    { id: "cashiers", label: "Cashiers" },
    { id: "operators", label: "Operators" },
    { id: "admins", label: "Admins" },
    { id: "permissions", label: "Permissions" },
    { id: "logs", label: "Activity logs" },
];

const initialStaff: OwnerStaffRow[] = [
    ...ownerEmployeeRows,
    ...ownerAdminRows.map((a) => ({ ...a, role: a.role.includes("Admin") ? a.role : `Admin · ${a.role}` })),
];

const staffMetrics = ownerEmployeeMetrics;

export default function StaffPage() {
    const crud = useSuperAdminCrud<OwnerStaffRow>(initialStaff);
    const [tab, setTab] = useState("technicians");
    const [search, setSearch] = useState("");

    const filtered = useMemo(() => {
        if (tab === "permissions" || tab === "logs") return [];
        const q = search.toLowerCase();
        return crud.items.filter((r) => {
            const matchSearch = !q || r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q);
            const matchTab =
                tab === "admins"
                    ? r.role.toLowerCase().includes("admin")
                    : tab === "cashiers"
                      ? r.role.toLowerCase().includes("billing") || r.role.toLowerCase().includes("cashier")
                      : tab === "operators"
                        ? r.role.toLowerCase().includes("support") || r.role.toLowerCase().includes("operator")
                        : r.role.toLowerCase().includes("meter") || r.role.toLowerCase().includes("technician") || r.role.toLowerCase().includes("reader");
            return matchSearch && matchTab;
        });
    }, [crud.items, search, tab]);

    return (
        <div className="space-y-6 min-w-0 w-full">
            <CompanyOwnerPageHeader
                title="Staff Management"
                description="Technicians, cashiers, operators, permissions and team activity."
                hideTitle
            />
            <CompanyOwnerMetricsGrid stats={staffMetrics} />
            <CompanyOwnerTabBar tabs={tabs} active={tab} onChange={setTab} />
            {tab === "permissions" && (
                <CompanyOwnerGlassCard className="p-5 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-[10px] font-bold uppercase text-slate-400">
                                <th className="text-left py-2">Module</th>
                                <th className="text-center py-2">Create</th>
                                <th className="text-center py-2">Read</th>
                                <th className="text-center py-2">Update</th>
                                <th className="text-center py-2">Delete</th>
                                <th className="text-center py-2">Export</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ownerStaffPermissions.map((p) => (
                                <tr key={p.module} className="border-t border-slate-100 dark:border-cyan-500/10">
                                    <td className="py-3 font-bold">{p.module}</td>
                                    {(["create", "read", "update", "delete", "export"] as const).map((k) => (
                                        <td key={k} className="py-3 text-center">{p[k] ? "✓" : "—"}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CompanyOwnerGlassCard>
            )}
            {tab === "logs" && (
                <CompanyOwnerGlassCard className="p-5">
                    <ul className="space-y-3">
                        {ownerActivityLogs.map((log) => (
                            <li key={log.id} className="flex justify-between gap-4 text-sm border-b border-slate-100 dark:border-cyan-500/10 pb-2">
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white">{log.user}</p>
                                    <p className="text-slate-500 text-xs">{log.action}</p>
                                </div>
                                <span className="text-[10px] text-slate-400 shrink-0">{log.time}</span>
                            </li>
                        ))}
                    </ul>
                </CompanyOwnerGlassCard>
            )}
            {tab !== "permissions" && tab !== "logs" && (
            <CompanyOwnerMainCard>
                <CompanyOwnerToolbar
                    actions={
                        <>
                            <CompanyOwnerSearchInput value={search} onChange={setSearch} placeholder="Search staff..." />
                            <CompanyOwnerAddButton label="Add Staff" onClick={() => crud.setCreating(true)} />
                        </>
                    }
                />
                <CompanyOwnerCardBody>
                    <ResponsiveTableShell>
                        <table className="w-full text-sm border-collapse max-xl:min-w-[800px] xl:min-w-0">
                            <thead>
                                <tr className={companyOwnerTableHeadClass}>
                                    <th className="py-4 px-4">Staff member</th>
                                    <th className="py-4 px-4">Role</th>
                                    <th className="py-4 px-4 hidden md:table-cell">Department</th>
                                    <th className="py-4 px-4 text-center">Status</th>
                                    <th className="py-4 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-[#1a2744]">
                                {filtered.map((row) => (
                                    <tr key={row.id} className={companyOwnerTableRowClass}>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <AvatarInitials name={row.name} color={row.color} />
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white">{row.name}</p>
                                                    <p className="text-xs text-slate-400">{row.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 font-medium">{row.role}</td>
                                        <td className="py-4 px-4 hidden md:table-cell text-slate-500">{row.department}</td>
                                        <td className="py-4 px-4 text-center"><StatusBadge status={row.status} /></td>
                                        <td className="py-4 px-4">
                                            <EntityTableActions onView={() => crud.setViewing(row)} onEdit={() => crud.setEditing(row)} onDelete={() => crud.setDeleting(row)} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </ResponsiveTableShell>
                </CompanyOwnerCardBody>
            </CompanyOwnerMainCard>
            )}
            {tab !== "permissions" && tab !== "logs" && (
            <CompanyOwnerStaffModals crud={crud} />
            )}
        </div>
    );
}
