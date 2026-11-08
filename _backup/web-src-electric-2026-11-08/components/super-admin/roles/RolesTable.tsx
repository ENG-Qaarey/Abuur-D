"use client";

import React, { useState } from "react";
import { Trash2, Crown, Shield, Briefcase, Wrench, Headset, DollarSign, Eye as EyeIcon, FileText, ChevronLeft, ChevronRight, User, Copy, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { ResponsiveTableShell } from "@/components/ui/ResponsiveTableShell";
import { EntityTableActions } from "@/components/super-admin/shared/EntityTableActions";
import { superAdminToast } from "@/components/super-admin/shared/super-admin-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = {
    id: number;
    name: string;
    desc: string;
    users: number;
    perms: number;
    status: "Active" | "Inactive";
    createdAt: string;
    icon: React.ElementType;
    iconColor: string;
    isSystem?: boolean;
};

// ─── Sort Icon SVG ────────────────────────────────────────────────────────────

function SortIcon() {
    return (
        <svg className="w-2.5 h-2.5 text-slate-400 dark:text-slate-500 shrink-0 select-none ml-1.5 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M7 15l5 5 5-5M7 9l5-5 5 5" />
        </svg>
    );
}

// ─── Sample Role Data ─────────────────────────────────────────────────────────

const sample: Role[] = [
    { id: 1, name: "Super Admin", desc: "Full system access and control", users: 3, perms: 128, status: "Active", createdAt: "Jan 12, 2024", icon: Crown, iconColor: "from-purple-500/10 to-indigo-500/15 border-purple-500/30 text-purple-500 dark:text-purple-400", isSystem: true },
    { id: 2, name: "Company Admin", desc: "Manage company and its resources", users: 28, perms: 86, status: "Active", createdAt: "Jan 18, 2024", icon: User, iconColor: "from-blue-500/10 to-sky-500/15 border-blue-500/30 text-blue-500 dark:text-blue-400", isSystem: true },
    { id: 3, name: "Manager", desc: "Manage staff, customers and reports", users: 145, perms: 64, status: "Active", createdAt: "Feb 02, 2024", icon: Briefcase, iconColor: "from-emerald-500/10 to-teal-500/15 border-emerald-500/30 text-emerald-500 dark:text-emerald-400" },
    { id: 4, name: "Technician", desc: "Access to field operations only", users: 856, perms: 32, status: "Active", createdAt: "Feb 10, 2024", icon: Wrench, iconColor: "from-amber-500/10 to-orange-500/15 border-amber-500/30 text-amber-500 dark:text-amber-400" },
    { id: 5, name: "Customer Support", desc: "Handle customer inquiries and issues", users: 42, perms: 28, status: "Active", createdAt: "Mar 03, 2024", icon: Headset, iconColor: "from-cyan-500/10 to-blue-400/15 border-cyan-500/30 text-cyan-500 dark:text-cyan-400" },
    { id: 6, name: "Accountant", desc: "Access financial and billing data", users: 18, perms: 40, status: "Active", createdAt: "Mar 15, 2024", icon: DollarSign, iconColor: "from-yellow-500/10 to-amber-500/15 border-yellow-500/30 text-yellow-500 dark:text-yellow-400" },
    { id: 7, name: "Read Only", desc: "View only access", users: 5, perms: 8, status: "Inactive", createdAt: "Apr 20, 2024", icon: EyeIcon, iconColor: "from-rose-500/10 to-red-500/15 border-rose-500/30 text-rose-500 dark:text-rose-400" },
    { id: 8, name: "Auditor", desc: "Audit logs and report access", users: 7, perms: 26, status: "Active", createdAt: "May 01, 2024", icon: FileText, iconColor: "from-slate-500/10 to-slate-600/15 border-slate-500/30 text-slate-500 dark:text-slate-400" },
];

export default function RolesTable({ searchQuery = "" }: { searchQuery?: string }) {
    const [roles, setRoles] = useState<Role[]>(sample);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const filteredRoles = roles.filter(role =>
        role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.desc.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.max(1, Math.ceil(filteredRoles.length / pageSize));
    const paginatedRoles = filteredRoles.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="space-y-4">
            {/* ── Table Container ───────────────────────────────────────── */}
            <ResponsiveTableShell>
                <table className="w-full text-left text-sm border-collapse max-xl:min-w-[720px] xl:min-w-0 xl:table-fixed">
                    <thead>
                        <tr className="border-b border-slate-100 dark:border-[#1a2744] text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">
                            <th className="py-4 px-2 sm:px-4 w-10 sm:w-12">#</th>
                            <th className="py-4 px-2 sm:px-4 min-w-[140px]">Role Name <SortIcon /></th>
                            <th className="py-4 px-2 sm:px-4 hidden md:table-cell">Description <SortIcon /></th>
                            <th className="py-4 px-2 sm:px-4 w-20 sm:w-28">Users <SortIcon /></th>
                            <th className="py-4 px-2 sm:px-4 w-24 sm:w-32 hidden sm:table-cell">Permissions <SortIcon /></th>
                            <th className="py-4 px-2 sm:px-4 w-24">Status <SortIcon /></th>
                            <th className="py-4 px-2 sm:px-4 w-28 hidden lg:table-cell">Created At <SortIcon /></th>
                            <th className="py-4 px-2 sm:px-4 w-28 sm:w-32 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#1a2744]">
                        {paginatedRoles.map((r, idx) => {
                            const IconComponent = r.icon;
                            return (
                                <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                                    <td className="py-4 px-2 sm:px-4 text-slate-400 dark:text-slate-500 font-semibold">{(currentPage - 1) * pageSize + idx + 1}</td>

                                    {/* Role Identity */}
                                    <td className="py-4 px-2 sm:px-4">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("w-9 h-9 rounded-xl bg-gradient-to-br border flex items-center justify-center shrink-0 shadow-sm", r.iconColor)}>
                                                <IconComponent size={16} className="stroke-[2]" />
                                            </div>
                                            <div>
                                                <div className="text-slate-900 dark:text-slate-100 font-bold flex items-center gap-1.5">
                                                    {r.name}
                                                    {r.isSystem && (
                                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50">
                                                            System
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-wider">
                                                    ID: ROL-{String(r.id).padStart(3, "0")}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Description */}
                                    <td className="py-4 px-2 sm:px-4 text-slate-600 dark:text-slate-300 font-medium max-w-xs truncate hidden md:table-cell">{r.desc}</td>

                                    {/* Users count */}
                                    <td className="py-4 px-2 sm:px-4">
                                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
                                            <User size={14} className="text-slate-400 dark:text-slate-500 shrink-0 stroke-[2.5]" />
                                            <span>{r.users}</span>
                                        </div>
                                    </td>

                                    {/* Permissions count */}
                                    <td className="py-4 px-2 sm:px-4 hidden sm:table-cell">
                                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
                                            <Shield size={14} className="text-slate-400 dark:text-slate-500 shrink-0 stroke-[2.5]" />
                                            <span>{r.perms}</span>
                                        </div>
                                    </td>

                                    {/* Status Badge */}
                                    <td className="py-4 px-2 sm:px-4">
                                        <div className={cn(
                                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-extrabold uppercase tracking-wider",
                                            r.status === "Active"
                                                ? "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                                : "bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
                                        )}>
                                            <span className={cn(
                                                "w-1.5 h-1.5 rounded-full shrink-0",
                                                r.status === "Active" ? "bg-emerald-500" : "bg-amber-500"
                                            )} />
                                            <span>{r.status}</span>
                                        </div>
                                    </td>

                                    {/* Created At */}
                                    <td className="py-4 px-2 sm:px-4 text-slate-500 dark:text-slate-400 font-semibold text-xs hidden lg:table-cell">{r.createdAt}</td>

                                    <td className="py-4 px-2 sm:px-4 text-right">
                                        <EntityTableActions
                                            viewLabel="View Details"
                                            editLabel="Edit Role"
                                            showDelete={false}
                                            onView={() => superAdminToast.info(`Viewing role: ${r.name}`)}
                                            onEdit={() => superAdminToast.info(`Edit role: ${r.name}`)}
                                            moreItems={[
                                                {
                                                    label: "Manage Permissions",
                                                    icon: Settings,
                                                    onClick: () => superAdminToast.info(`Managing permissions for ${r.name}`),
                                                },
                                                {
                                                    label: "Duplicate Role",
                                                    icon: Copy,
                                                    onClick: () => superAdminToast.success(`Duplicated ${r.name}`),
                                                },
                                                ...(!r.isSystem
                                                    ? [
                                                          {
                                                              label: "Delete Role",
                                                              icon: Trash2,
                                                              variant: "danger" as const,
                                                              onClick: () => {
                                                                  setRoles((prev) => prev.filter((role) => role.id !== r.id));
                                                                  superAdminToast.success(`${r.name} deleted`);
                                                              },
                                                          },
                                                      ]
                                                    : []),
                                            ]}
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </ResponsiveTableShell>

            {/* ── Table Pagination Footer ────────────────────────────── */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-[#1a2744]">
                <div className="text-slate-400 dark:text-slate-500 text-xs font-semibold">
                    Showing {filteredRoles.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredRoles.length)} of {filteredRoles.length} roles
                </div>

                <div className="flex items-center gap-2.5">
                    {/* Pagination Buttons */}
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-xl border border-slate-200 dark:border-[#1e2d4a] text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-[#0f1d35] transition-all bg-transparent disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={14} className="stroke-[2.5]" />
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={cn(
                                    "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all",
                                    page === currentPage
                                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                                        : "border border-slate-200 dark:border-[#1e2d4a] text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#0f1d35] bg-transparent"
                                )}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-xl border border-slate-200 dark:border-[#1e2d4a] text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-[#0f1d35] transition-all bg-transparent disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={14} className="stroke-[2.5]" />
                        </button>
                    </div>

                    {/* Page Size Dropdown */}
                    <div className="relative">
                        <select
                            value={pageSize}
                            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                            className="bg-transparent border border-slate-200 dark:border-[#1e2d4a] text-slate-600 dark:text-slate-300 text-xs font-semibold pl-3 pr-8 py-2 rounded-xl outline-none transition-all cursor-pointer focus:border-blue-500 appearance-none"
                        >
                            <option value="10">10 / page</option>
                            <option value="20">20 / page</option>
                            <option value="50">50 / page</option>
                        </select>
                        <ChevronRight size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none rotate-90 stroke-[2.5]" />
                    </div>
                </div>
            </div>
        </div>
    );
}
