"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    ArrowUpRight,
    ChevronLeft,
    ChevronRight,
    Copy,
    CreditCard,
    Edit,
    Edit2,
    ExternalLink,
    Eye,
    MoreVertical,
    Plus,
    Search,
    SlidersHorizontal,
    Trash2,
    ToggleLeft,
    ToggleRight,
} from "lucide-react";
import { allCompanies, regions, statuses } from "@/components/super-admin/companies/constants";
import { formatCurrency as fmtUSD, formatNumber as fmt } from "@/components/super-admin/companies/formatters";
import { Tip } from "@/components/super-admin/companies/Tip";
import { RegionBadge } from "@/components/super-admin/companies/RegionBadge";
import { PlanBadge } from "@/components/super-admin/companies/PlanBadge";
import { StatusDot } from "@/components/super-admin/companies/StatusDot";
import { ViewModal } from "@/components/super-admin/companies/ViewModal";
import { EditModal } from "@/components/super-admin/companies/EditModal";
import { DeleteModal } from "@/components/super-admin/companies/DeleteModal";
import { ChangePlanModal } from "@/components/super-admin/companies/ChangePlanModal";
import { AddCompanyModal } from "@/components/super-admin/companies/AddCompanyModal";
import type { Company, SortDir, SortKey } from "@/components/super-admin/companies/types";
import { AnimatedSparkline } from "@/components/ui/AnimatedSparkline";
import { ResponsiveTableShell } from "@/components/ui/ResponsiveTableShell";

export default function CompaniesPage() {
    const [companies, setCompanies] = useState<Company[]>(allCompanies);
    const [searchQuery, setSearchQuery] = useState("");
    const [regionFilter, setRegionFilter] = useState("All Regions");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(6);
    const [sortKey, setSortKey] = useState<SortKey>("id");
    const [sortDir, setSortDir] = useState<SortDir>("asc");
    const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null);
    const [viewingCompany, setViewingCompany] = useState<Company | null>(null);
    const [editingCompany, setEditingCompany] = useState<Company | null>(null);
    const [deletingCompany, setDeletingCompany] = useState<Company | null>(null);
    const [planCompany, setPlanCompany] = useState<Company | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const onMouseDown = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setActiveDropdownId(null);
            }
        };

        const onEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setActiveDropdownId(null);
            }
        };

        document.addEventListener("mousedown", onMouseDown);
        window.addEventListener("keydown", onEscape);
        return () => {
            document.removeEventListener("mousedown", onMouseDown);
            window.removeEventListener("keydown", onEscape);
        };
    }, []);

    const filtered = useMemo(() => {
        let data = [...companies];
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            data = data.filter((company) => company.name.toLowerCase().includes(q) || company.domain.toLowerCase().includes(q) || company.region.toLowerCase().includes(q));
        }
        if (regionFilter !== "All Regions") data = data.filter((company) => company.region === regionFilter);
        if (statusFilter !== "All Status") data = data.filter((company) => company.status === statusFilter);

        data.sort((a, b) => {
            let cmp = 0;
            switch (sortKey) {
                case "id": cmp = a.id - b.id; break;
                case "name": cmp = a.name.localeCompare(b.name); break;
                case "customers": cmp = a.customers - b.customers; break;
                case "meters": cmp = a.meters - b.meters; break;
                case "revenue": cmp = a.revenue - b.revenue; break;
                case "joined": cmp = new Date(a.joined).getTime() - new Date(b.joined).getTime(); break;
            }
            return sortDir === "asc" ? cmp : -cmp;
        });

        return data;
    }, [companies, searchQuery, regionFilter, statusFilter, sortKey, sortDir]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    const paginatedData = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

    useEffect(() => {
        setCurrentPage((page) => Math.min(page, totalPages));
    }, [totalPages]);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
        else {
            setSortKey(key);
            setSortDir("asc");
        }
        setCurrentPage(1);
    };

    const getPageNumbers = () => {
        const pages: number[] = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else if (currentPage <= 3) {
            pages.push(1, 2, 3, 4);
        } else if (currentPage >= totalPages - 2) {
            pages.push(totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
        } else {
            pages.push(currentPage - 1, currentPage, currentPage + 1, currentPage + 2);
        }
        return pages;
    };

    const updateCompany = (updated: Company) => {
        setCompanies((list) => list.map((company) => (company.id === updated.id ? updated : company)));
        setEditingCompany(null);
        setViewingCompany(null);
    };

    const toggleStatus = (id: number) => {
        setCompanies((list) => list.map((company) => company.id === id ? { ...company, status: company.status === "Active" ? "Inactive" : "Active" } : company));
        setActiveDropdownId(null);
    };

    const handleDelete = (id: number) => {
        setCompanies((list) => list.filter((company) => company.id !== id));
        setDeletingCompany(null);
    };

    const handleAddCompany = (company: Omit<Company, "id" | "logo" | "logoColor">) => {
        const nextId = Math.max(...companies.map((item) => item.id), 0) + 1;
        const initials = company.name.trim().charAt(0).toUpperCase() || "N";
        const palette = [
            "from-blue-500 to-blue-600",
            "from-emerald-500 to-emerald-600",
            "from-purple-500 to-purple-600",
            "from-orange-500 to-orange-600",
            "from-cyan-500 to-cyan-600",
            "from-rose-500 to-rose-600",
        ];
        const newCompany = { ...company, id: nextId, logo: initials, logoColor: palette[nextId % palette.length] } as Company;
        setCompanies((list) => [newCompany, ...list]);
        setIsAddModalOpen(false);
    };

    const copyCompanyId = async (id: number) => {
        await navigator.clipboard.writeText(String(id));
        setActiveDropdownId(null);
    };

    const SortIcon = ({ column }: { column: SortKey }) => {
        if (sortKey !== column) return <ArrowUpDown size={12} className="text-slate-300 dark:text-slate-600" />;
        return sortDir === "asc" ? <ArrowUp size={12} className="text-blue-500" /> : <ArrowDown size={12} className="text-blue-500" />;
    };

    const activeCount = companies.filter((company) => company.status === "Active").length;
    const totalCustomers = companies.reduce((sum, company) => sum + company.customers, 0);
    const totalRevenue = companies.reduce((sum, company) => sum + company.revenue, 0);

    const stats = [
        {
            title: "Total Companies",
            value: String(companies.length),
            trend: `${activeCount} active`,
            glowColor: "companiesBlueGlow",
            sparklinePath: "M 0 15 Q 10 5, 20 12 T 40 8 T 60 4",
            stroke: "#3b82f6",
        },
        {
            title: "Active",
            value: String(activeCount),
            trend: `${Math.round((activeCount / Math.max(companies.length, 1)) * 100)}% of total`,
            glowColor: "companiesGreenGlow",
            sparklinePath: "M 0 18 Q 15 15, 30 8 T 60 2",
            stroke: "#10b981",
        },
        {
            title: "Customers",
            value: fmt(totalCustomers),
            trend: "Across all companies",
            glowColor: "companiesPurpleGlow",
            sparklinePath: "M 0 14 Q 10 18, 25 10 T 50 6 T 60 12",
            stroke: "#8b5cf6",
        },
        {
            title: "Revenue",
            value: fmtUSD(totalRevenue),
            trend: "Total platform revenue",
            glowColor: "companiesAmberGlow",
            sparklinePath: "M 0 16 Q 20 10, 35 14 T 60 6",
            stroke: "#f59e0b",
        },
    ];

    const filterSelectClass =
        "h-10 rounded-xl bg-slate-50 dark:bg-[#0f1629] border border-slate-200 dark:border-[#1e2d4a] px-3 text-slate-900 dark:text-slate-100 text-sm font-medium outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

    return (
        <div className="space-y-6 min-w-0 w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Companies Management</h1>
                    <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5 font-medium">Manage company records, view details, edit profiles, and open more actions.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <div key={stat.title} className="bg-white dark:bg-[#0a1628] border border-slate-100 dark:border-[#1a2744] rounded-2xl p-5 flex items-center justify-between shadow-sm hover:border-slate-200 dark:hover:border-[#1e2d4a] transition-all">
                        <div className="space-y-1">
                            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{stat.title}</span>
                            <h3 className="text-slate-900 dark:text-white text-2xl font-black">{stat.value}</h3>
                            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                                <ArrowUpRight size={12} className="shrink-0" />
                                <span>{stat.trend}</span>
                            </div>
                        </div>
                        <div className="w-16 h-10 flex items-center shrink-0">
                            <AnimatedSparkline
                                gradientId={stat.glowColor}
                                path={stat.sparklinePath}
                                stroke={stat.stroke}
                                delay={index * 120}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-[#0a1628] border border-slate-100 dark:border-[#1a2744] rounded-2xl overflow-hidden shadow-sm min-w-0">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-4 sm:p-5 border-b border-slate-100 dark:border-[#1a2744]">
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-300 shrink-0">All Companies</p>
                    <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full xl:w-auto min-w-0">
                        <div className="relative w-full sm:w-64 min-w-0">
                            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                placeholder="Search companies..."
                                className="w-full h-10 pl-11 pr-4 rounded-xl bg-slate-50 dark:bg-[#0f1629] border border-slate-200 dark:border-[#1e2d4a] text-slate-900 dark:text-slate-100 text-sm font-medium outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                            />
                        </div>
                        <select value={regionFilter} onChange={(e) => { setRegionFilter(e.target.value); setCurrentPage(1); }} className={filterSelectClass}>
                            {regions.map((region) => <option key={region}>{region}</option>)}
                        </select>
                        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} className={filterSelectClass}>
                            {statuses.map((status) => <option key={status}>{status}</option>)}
                        </select>
                        <button
                            type="button"
                            disabled
                            aria-disabled="true"
                            title="Filter panel is not available yet"
                            className="h-10 flex items-center gap-2 px-4 border border-slate-200 dark:border-[#1e2d4a] text-slate-400 dark:text-slate-500 font-bold text-sm rounded-xl bg-transparent cursor-not-allowed"
                        >
                            <SlidersHorizontal size={14} />
                            Filter
                        </button>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="h-10 flex items-center gap-2 px-5 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-lg shadow-blue-500/5 hover:shadow-blue-500/10 shrink-0"
                        >
                            <Plus size={16} />
                            Add Company
                        </button>
                    </div>
                </div>

                <div className="p-4 sm:p-5 space-y-4 min-w-0">
                    <ResponsiveTableShell>
                        <table className="w-full text-left text-sm border-collapse max-xl:min-w-[880px] xl:min-w-0 xl:table-fixed">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-[#1a2744] text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">
                                    <th className="py-4 px-2 sm:px-4 w-10 sm:w-12">#</th>
                                    <th className="py-4 px-2 sm:px-4 min-w-[160px] cursor-pointer" onClick={() => handleSort("name")}>Company <SortIcon column="name" /></th>
                                    <th className="py-4 px-2 sm:px-4 hidden md:table-cell">Region</th>
                                    <th className="py-4 px-2 sm:px-4 text-right cursor-pointer" onClick={() => handleSort("customers")}>Customers <SortIcon column="customers" /></th>
                                    <th className="py-4 px-2 sm:px-4 text-right cursor-pointer hidden lg:table-cell" onClick={() => handleSort("meters")}>Meters <SortIcon column="meters" /></th>
                                    <th className="py-4 px-2 sm:px-4 text-right cursor-pointer hidden xl:table-cell" onClick={() => handleSort("revenue")}>Revenue <SortIcon column="revenue" /></th>
                                    <th className="py-4 px-2 sm:px-4 text-center hidden sm:table-cell">Plan</th>
                                    <th className="py-4 px-2 sm:px-4 text-center">Status</th>
                                    <th className="py-4 px-2 sm:px-4 cursor-pointer hidden lg:table-cell" onClick={() => handleSort("joined")}>Joined <SortIcon column="joined" /></th>
                                    <th className="py-4 px-2 sm:px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-[#1a2744]">
                                {paginatedData.map((company, index) => (
                                    <tr key={company.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                                        <td className="py-4 px-2 sm:px-4 text-slate-400 dark:text-slate-500 font-semibold">{(currentPage - 1) * perPage + index + 1}</td>
                                        <td className="py-4 px-2 sm:px-4">
                                            <div className="flex items-center gap-3">
                                                <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-black text-white shadow-sm shrink-0", company.logoColor)}>{company.logo}</div>
                                                <div>
                                                    <div className="text-slate-900 dark:text-slate-100 font-bold">{company.name}</div>
                                                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-wider">{company.domain}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-2 sm:px-4 hidden md:table-cell"><RegionBadge region={company.region} /></td>
                                        <td className="py-4 px-2 sm:px-4 text-right text-slate-700 dark:text-slate-300 font-semibold">{fmt(company.customers)}</td>
                                        <td className="py-4 px-2 sm:px-4 text-right text-slate-700 dark:text-slate-300 font-semibold hidden lg:table-cell">{fmt(company.meters)}</td>
                                        <td className="py-4 px-2 sm:px-4 text-right text-slate-900 dark:text-slate-100 font-bold hidden xl:table-cell">{fmtUSD(company.revenue)}</td>
                                        <td className="py-4 px-2 sm:px-4 text-center hidden sm:table-cell"><PlanBadge plan={company.plan} /></td>
                                        <td className="py-4 px-2 sm:px-4 text-center"><div className="inline-flex justify-center"><StatusDot status={company.status} /></div></td>
                                        <td className="py-4 px-2 sm:px-4 text-slate-500 dark:text-slate-400 font-semibold text-xs whitespace-nowrap hidden lg:table-cell">{company.joined}</td>
                                        <td className="py-4 px-2 sm:px-4 text-right">
                                            <div className="flex items-center gap-2 justify-end">
                                                <Tip label="View Details">
                                                    <button onClick={() => setViewingCompany(company)} className="p-2 border border-slate-200 dark:border-[#1e2d4a] text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-500/30 hover:bg-blue-50/50 dark:hover:bg-blue-500/5 rounded-xl bg-transparent transition-all">
                                                        <Eye size={14} className="stroke-[2.5]" />
                                                    </button>
                                                </Tip>
                                                <Tip label="Edit Company">
                                                    <button onClick={() => setEditingCompany(company)} className="p-2 border border-slate-200 dark:border-[#1e2d4a] text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:border-amber-200 dark:hover:border-amber-500/30 hover:bg-amber-50/50 dark:hover:bg-amber-500/5 rounded-xl bg-transparent transition-all">
                                                        <Edit2 size={14} className="stroke-[2.5]" />
                                                    </button>
                                                </Tip>
                                                <div className="relative" ref={activeDropdownId === company.id ? dropdownRef : null}>
                                                    <Tip label="More Actions">
                                                        <button onClick={() => setActiveDropdownId((prev) => prev === company.id ? null : company.id)} className="p-2 border border-slate-200 dark:border-[#1e2d4a] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl bg-transparent transition-all">
                                                            <MoreVertical size={14} className="stroke-[2.5]" />
                                                        </button>
                                                    </Tip>
                                                    {activeDropdownId === company.id && (
                                                        <div className="absolute right-0 top-full z-[9999] mt-1 w-52 overflow-hidden rounded-2xl border border-slate-100 dark:border-[#1e2d4a] bg-white dark:bg-[#0a1628] p-1.5 shadow-2xl shadow-black/10">
                                                            <button onClick={() => copyCompanyId(company.id)} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[12px] font-semibold text-slate-700 dark:text-slate-200 transition-all hover:bg-slate-50 dark:hover:bg-white/5">
                                                                <Copy size={13} className="shrink-0" /> Copy ID
                                                            </button>
                                                            <button onClick={() => { window.open(`https://${company.domain}`, "_blank", "noopener,noreferrer"); setActiveDropdownId(null); }} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[12px] font-semibold text-slate-700 dark:text-slate-200 transition-all hover:bg-slate-50 dark:hover:bg-white/5">
                                                                <ExternalLink size={13} className="shrink-0" /> Visit Domain
                                                            </button>
                                                            <button onClick={() => { setPlanCompany(company); setActiveDropdownId(null); }} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[12px] font-semibold text-slate-700 dark:text-slate-200 transition-all hover:bg-slate-50 dark:hover:bg-white/5">
                                                                <CreditCard size={13} className="text-blue-500 shrink-0" /> Change Plan
                                                            </button>
                                                            <button onClick={() => { setEditingCompany(company); setActiveDropdownId(null); }} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[12px] font-semibold text-slate-700 dark:text-slate-200 transition-all hover:bg-slate-50 dark:hover:bg-white/5">
                                                                <Edit2 size={13} className="text-slate-400 shrink-0" /> Edit Details
                                                            </button>
                                                            <button onClick={() => toggleStatus(company.id)} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[12px] font-semibold text-slate-700 dark:text-slate-200 transition-all hover:bg-slate-50 dark:hover:bg-white/5">
                                                                {company.status === "Active" ? <ToggleLeft size={13} className="text-slate-400 shrink-0" /> : <ToggleRight size={13} className="text-emerald-500 shrink-0" />}
                                                                {company.status === "Active" ? "Deactivate" : "Activate"}
                                                            </button>
                                                            <div className="my-1 border-t border-slate-100 dark:border-[#1a2744]" />
                                                            <button onClick={() => { setDeletingCompany(company); setActiveDropdownId(null); }} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[12px] font-semibold text-red-500 transition-all hover:bg-red-50 dark:hover:bg-red-500/10">
                                                                <Trash2 size={13} className="shrink-0" /> Delete Company
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </ResponsiveTableShell>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-[#1a2744]">
                        <div className="text-slate-400 dark:text-slate-500 text-xs font-semibold">
                            Showing {filtered.length === 0 ? 0 : (currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filtered.length)} of {filtered.length} companies
                        </div>
                        <div className="flex items-center gap-2.5">
                            <div className="flex items-center gap-1.5">
                                <button onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1} className="p-2 rounded-xl border border-slate-200 dark:border-[#1e2d4a] text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-[#0f1d35] transition-all bg-transparent disabled:opacity-40 disabled:cursor-not-allowed">
                                    <ChevronLeft size={14} className="stroke-[2.5]" />
                                </button>
                                {getPageNumbers().map((page) => (
                                    <button key={page} onClick={() => setCurrentPage(page)} className={cn("w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all", page === currentPage ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "border border-slate-200 dark:border-[#1e2d4a] text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#0f1d35] bg-transparent")}>{page}</button>
                                ))}
                                <button onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-2 rounded-xl border border-slate-200 dark:border-[#1e2d4a] text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-[#0f1d35] transition-all bg-transparent disabled:opacity-40 disabled:cursor-not-allowed">
                                    <ChevronRight size={14} className="stroke-[2.5]" />
                                </button>
                            </div>
                            <div className="relative">
                                <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setCurrentPage(1); }} className="bg-transparent border border-slate-200 dark:border-[#1e2d4a] text-slate-600 dark:text-slate-300 text-xs font-semibold pl-3 pr-8 py-2 rounded-xl outline-none transition-all cursor-pointer focus:border-blue-500 appearance-none">
                                    <option value={6}>6 / page</option>
                                    <option value={10}>10 / page</option>
                                    <option value={20}>20 / page</option>
                                    <option value={50}>50 / page</option>
                                </select>
                                <ChevronRight size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none rotate-90 stroke-[2.5]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isAddModalOpen && <AddCompanyModal onClose={() => setIsAddModalOpen(false)} onAdd={handleAddCompany} />}
            {viewingCompany && <ViewModal company={viewingCompany} onClose={() => setViewingCompany(null)} onEdit={() => { setEditingCompany(viewingCompany); setViewingCompany(null); }} />}
            {editingCompany && <EditModal company={editingCompany} onClose={() => setEditingCompany(null)} onSave={updateCompany} />}
            {deletingCompany && <DeleteModal company={deletingCompany} onClose={() => setDeletingCompany(null)} onConfirm={() => handleDelete(deletingCompany.id)} />}
            {planCompany && <ChangePlanModal company={planCompany} onClose={() => setPlanCompany(null)} onSave={(plan) => { setCompanies((list) => list.map((company) => company.id === planCompany.id ? { ...company, plan } : company)); setPlanCompany(null); }} />}
        </div>
    );
}
