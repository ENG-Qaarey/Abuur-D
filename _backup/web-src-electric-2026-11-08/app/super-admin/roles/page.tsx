"use client";

import React, { useState } from "react";
import RolesTable from "../../../components/super-admin/roles/RolesTable";
import AddRoleModal from "../../../components/super-admin/roles/AddRoleModal";
import PermissionsGrid from "../../../components/super-admin/roles/PermissionsGrid";
import { ShieldCheck, Search, SlidersHorizontal, Plus, ArrowUpRight } from "lucide-react";
import { superAdminToast } from "@/components/super-admin/shared/super-admin-toast";

export default function RolesPage() {
    const [openAdd, setOpenAdd] = useState(false);
    const [activeTab, setActiveTab] = useState<"roles" | "permissions">("roles");
    const [searchQuery, setSearchQuery] = useState("");

    // Sample statistics data
    const stats = [
        {
            title: "Total Roles",
            value: "12",
            trend: "2 New this month",
            color: "text-blue-500 dark:text-blue-400",
            glowColor: "blueGlow",
            sparklinePath: "M 0 15 Q 10 5, 20 12 T 40 8 T 60 4",
            stroke: "#3b82f6"
        },
        {
            title: "Permissions",
            value: "128",
            trend: "8 New this month",
            color: "text-emerald-500 dark:text-emerald-400",
            glowColor: "greenGlow",
            sparklinePath: "M 0 18 Q 15 15, 30 8 T 60 2",
            stroke: "#10b981"
        },
        {
            title: "Assigned Users",
            value: "2,847",
            trend: "12.5% from last month",
            color: "text-purple-500 dark:text-purple-400",
            glowColor: "purpleGlow",
            sparklinePath: "M 0 14 Q 10 18, 25 10 T 50 6 T 60 12",
            stroke: "#8b5cf6"
        }
    ];

    return (
        <div className="space-y-6 min-w-0 w-full">
            {/* ── Page Header ───────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Roles & Permissions</h1>
                    <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5 font-medium">Manage roles, assign permissions and review access across the system.</p>
                </div>
            </div>

            {/* ── Metrics Grid ──────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <div key={stat.title} className="bg-white dark:bg-[#0a1628] border border-slate-100 dark:border-[#1a2744] rounded-2xl p-5 flex items-center justify-between shadow-sm hover:border-slate-200 dark:hover:border-[#1e2d4a] transition-all">
                        <div className="space-y-1">
                            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{stat.title}</span>
                            <h3 className="text-slate-900 dark:text-white text-2xl font-black">{stat.value}</h3>
                            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                                <ArrowUpRight size={12} className="shrink-0" />
                                <span>{stat.trend}</span>
                            </div>
                        </div>
                        {/* Sparkline Graph */}
                        <div className="w-16 h-10 flex items-center shrink-0">
                            <svg className="w-full h-full overflow-visible" viewBox="0 0 60 20">
                                <defs>
                                    <linearGradient id={stat.glowColor} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={stat.stroke} stopOpacity="0.3" />
                                        <stop offset="100%" stopColor={stat.stroke} stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <path d={`${stat.sparklinePath} L 60 20 L 0 20 Z`} fill={`url(#${stat.glowColor})`} />
                                <path d={stat.sparklinePath} fill="none" stroke={stat.stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>
                ))}

                {/* Card 4: System Security */}
                <div className="bg-white dark:bg-[#0a1628] border border-slate-100 dark:border-[#1a2744] rounded-2xl p-5 flex items-center justify-between shadow-sm hover:border-slate-200 dark:hover:border-[#1e2d4a] transition-all">
                    <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">System Security</span>
                        <h3 className="text-slate-900 dark:text-white text-2xl font-black">High</h3>
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>All systems are secure</span>
                        </div>
                    </div>
                    {/* Glowing Shield Logo */}
                    <div className="relative w-12 h-12 rounded-full border border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/10 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.25)] shrink-0">
                        <ShieldCheck className="w-6 h-6 text-amber-500" />
                        <div className="absolute inset-0 rounded-full border border-amber-500/20 animate-ping opacity-30" style={{ animationDuration: "3s" }} />
                    </div>
                </div>
            </div>

            {/* ── Main Roles Management Container ───────────────────────── */}
            <div className="bg-white dark:bg-[#0a1628] border border-slate-100 dark:border-[#1a2744] rounded-2xl overflow-hidden shadow-sm min-w-0">
                
                {/* ── Top Bar: Tabs & Controls ── */}
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-4 sm:p-5 border-b border-slate-100 dark:border-[#1a2744]">
                    {/* Navigation Tabs */}
                    <div className="flex border-b border-transparent shrink-0 max-w-full max-md:overflow-x-auto md:overflow-visible">
                        <button
                            onClick={() => setActiveTab("roles")}
                            className={`px-4 py-2 text-sm font-bold border-b-2 transition-all relative ${
                                activeTab === "roles"
                                    ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-500"
                                    : "text-slate-400 dark:text-slate-500 border-transparent hover:text-slate-600 dark:hover:text-slate-300"
                            }`}
                        >
                            Roles
                        </button>
                        <button
                            onClick={() => setActiveTab("permissions")}
                            className={`px-4 py-2 text-sm font-bold border-b-2 transition-all relative ${
                                activeTab === "permissions"
                                    ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-500"
                                    : "text-slate-400 dark:text-slate-500 border-transparent hover:text-slate-600 dark:hover:text-slate-300"
                            }`}
                        >
                            Permissions
                        </button>
                    </div>

                    {/* Filter and Add controls */}
                    <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full xl:w-auto min-w-0">
                        <div className="relative w-full sm:w-64 min-w-0">
                            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={`Search ${activeTab}...`}
                                className="w-full h-10 pl-11 pr-4 rounded-xl bg-slate-50 dark:bg-[#0f1629] border border-slate-200 dark:border-[#1e2d4a] text-slate-900 dark:text-slate-100 text-sm font-medium outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                            />
                        </div>
                        
                        <button
                            type="button"
                            onClick={() => superAdminToast.info("Filters applied")}
                            className="h-10 flex items-center gap-2 px-4 border border-slate-200 dark:border-[#1e2d4a] text-slate-600 dark:text-slate-300 font-bold text-sm rounded-xl bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                        >
                            <SlidersHorizontal size={14} />
                            Filter
                        </button>
                        
                        <button
                            onClick={() => setOpenAdd(true)}
                            className="h-10 flex items-center gap-2 px-5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-lg shadow-blue-500/5 hover:shadow-blue-500/10 shrink-0"
                        >
                            <Plus size={16} />
                            Add Role
                        </button>
                    </div>
                </div>

                {/* ── Table Content ── */}
                <div className="p-4 sm:p-5 min-w-0">
                    {activeTab === "roles" ? (
                        <RolesTable searchQuery={searchQuery} />
                    ) : (
                        <PermissionsGrid searchQuery={searchQuery} />
                    )}
                </div>
            </div>

            <AddRoleModal open={openAdd} onClose={() => setOpenAdd(false)} />
        </div>
    );
}
