"use client";

import { ArrowUpRight, ChevronLeft, ChevronRight, Plus, Search, SlidersHorizontal } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AnimatedSparkline } from "@/components/ui/AnimatedSparkline";

export type TableActionVariant = "view" | "edit" | "delete" | "more";

const tableActionVariantClass: Record<TableActionVariant, string> = {
    view: "hover:text-blue-500 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-500/30 hover:bg-blue-50/50 dark:hover:bg-blue-500/5",
    edit: "hover:text-amber-500 dark:hover:text-amber-400 hover:border-amber-200 dark:hover:border-amber-500/30 hover:bg-amber-50/50 dark:hover:bg-amber-500/5",
    delete: "hover:text-red-500 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-500/30 hover:bg-red-50/50 dark:hover:bg-red-500/5",
    more: "hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-white/5",
};

export const tableActionButtonClass =
    "p-2 border border-slate-200 dark:border-[#1e2d4a] text-slate-400 rounded-xl bg-transparent transition-all";

/** Hover label tooltip — matches Roles & Permissions table actions */
export function ActionTip({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="group/tip relative">
            {children}
            <div className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 dark:bg-slate-800 border border-slate-700/50 px-2.5 py-1.5 text-[10px] font-bold text-white opacity-0 shadow-xl transition-all duration-150 group-hover/tip:opacity-100 z-[9999]">
                {label}
                <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-800" />
            </div>
        </div>
    );
}

export function TableActionButton({
    label,
    variant,
    icon: Icon,
    onClick,
    className,
}: {
    label: string;
    variant: TableActionVariant;
    icon: LucideIcon;
    onClick?: () => void;
    className?: string;
}) {
    return (
        <ActionTip label={label}>
            <button type="button" onClick={onClick} className={cn(tableActionButtonClass, tableActionVariantClass[variant], className)}>
                <Icon size={14} className="stroke-[2.5]" />
            </button>
        </ActionTip>
    );
}

export function TableRowActions({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={cn("flex items-center gap-2 justify-end", className)}>{children}</div>;
}

export type SuperAdminMetric = {
    title: string;
    value: string;
    trend: string;
    glowColor: string;
    sparklinePath: string;
    stroke: string;
};

export function SuperAdminPageHeader({ title, description }: { title: string; description: string }) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
                <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h1>
                <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5 font-medium">{description}</p>
            </div>
        </div>
    );
}

export function SuperAdminMetricsGrid({ stats, fourthCard }: { stats: SuperAdminMetric[]; fourthCard?: ReactNode }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.map((stat, index) => (
                <div
                    key={stat.title}
                    className="bg-white dark:bg-[#0a1628] border border-slate-100 dark:border-[#1a2744] rounded-2xl p-4 flex items-center justify-between shadow-sm hover:border-slate-200 dark:hover:border-[#1e2d4a] transition-all"
                >
                    <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{stat.title}</span>
                        <h3 className="text-slate-900 dark:text-white text-xl font-black">{stat.value}</h3>
                        <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                            <ArrowUpRight size={12} className="shrink-0" />
                            <span>{stat.trend}</span>
                        </div>
                    </div>
                    <div className="w-16 h-10 flex items-center shrink-0">
                        <AnimatedSparkline gradientId={stat.glowColor} path={stat.sparklinePath} stroke={stat.stroke} delay={index * 120} />
                    </div>
                </div>
            ))}
            {fourthCard}
        </div>
    );
}

export function SuperAdminMainCard({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div className={cn("bg-white dark:bg-[#0a1628] border border-slate-100 dark:border-[#1a2744] rounded-2xl overflow-hidden shadow-sm min-w-0", className)}>
            {children}
        </div>
    );
}

export function SuperAdminToolbar({ tabs, actions }: { tabs?: ReactNode; actions: ReactNode }) {
    return (
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 p-3 sm:p-4 border-b border-slate-100 dark:border-[#1a2744]">
            {tabs ? <div className="flex border-b border-transparent shrink-0 max-w-full max-md:overflow-x-auto md:overflow-visible">{tabs}</div> : null}
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full xl:w-auto min-w-0">{actions}</div>
        </div>
    );
}

export function SuperAdminTab({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "px-3.5 py-1.5 text-xs font-bold border-b-2 transition-all relative",
                active
                    ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-500"
                    : "text-slate-400 dark:text-slate-500 border-transparent hover:text-slate-600 dark:hover:text-slate-300",
            )}
        >
            {children}
        </button>
    );
}

export function SuperAdminCardBody({ children }: { children: ReactNode }) {
    return <div className="p-3 sm:p-4 min-w-0">{children}</div>;
}

export const superAdminSearchInputClass =
    "w-full h-9 pl-10 pr-3 rounded-xl bg-slate-50 dark:bg-[#0f1629] border border-slate-200 dark:border-[#1e2d4a] text-slate-900 dark:text-slate-100 text-xs font-medium outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400 dark:placeholder:text-slate-600";

export const superAdminSelectClass =
    "h-9 rounded-xl bg-slate-50 dark:bg-[#0f1629] border border-slate-200 dark:border-[#1e2d4a] px-3 text-slate-900 dark:text-slate-100 text-xs font-medium outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

export function SuperAdminSearchInput({
    value,
    onChange,
    placeholder,
    className,
}: {
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    className?: string;
}) {
    return (
        <div className={cn("relative w-full sm:w-60 min-w-0", className)}>
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={superAdminSearchInputClass} />
        </div>
    );
}

export function SuperAdminFilterButton({ onClick }: { onClick?: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="h-9 flex items-center gap-2 px-3.5 border border-slate-200 dark:border-[#1e2d4a] text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 transition-all shrink-0"
        >
            <SlidersHorizontal size={13} />
            Filter
        </button>
    );
}

export function SuperAdminSelect({
    value,
    onChange,
    children,
    className,
}: {
    value: string;
    onChange: (value: string) => void;
    children: ReactNode;
    className?: string;
}) {
    return (
        <select value={value} onChange={(e) => onChange(e.target.value)} className={cn(superAdminSelectClass, className)}>
            {children}
        </select>
    );
}

export function SuperAdminAddButton({ label, onClick }: { label: string; onClick?: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="h-9 flex items-center gap-1.5 px-4 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-md hover:shadow-lg shadow-blue-500/5 hover:shadow-blue-500/10 shrink-0"
        >
            <Plus size={14} />
            {label}
        </button>
    );
}

export function SuperAdminSecondaryButton({ label, onClick, icon: Icon }: { label: string; onClick?: () => void; icon?: React.ComponentType<{ size?: number; className?: string }> }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="h-9 flex items-center gap-2 px-3.5 border border-slate-200 dark:border-[#1e2d4a] text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all shrink-0"
        >
            {Icon && <Icon size={13} />}
            {label}
        </button>
    );
}

export function SuperAdminTablePagination({
    page,
    pageSize,
    total,
    entityLabel,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [10, 20, 50],
}: {
    page: number;
    pageSize: number;
    total: number;
    entityLabel: string;
    onPageChange: (p: number) => void;
    onPageSizeChange?: (n: number) => void;
    pageSizeOptions?: number[];
}) {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);

    useEffect(() => {
        if (page > totalPages) onPageChange(totalPages);
    }, [page, totalPages, onPageChange]);

    const start = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
    const end = Math.min(safePage * pageSize, total);

    const pages: number[] = [];
    if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (safePage <= 3) {
        pages.push(1, 2, 3, 4);
    } else if (safePage >= totalPages - 2) {
        pages.push(totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
        pages.push(safePage - 1, safePage, safePage + 1, safePage + 2);
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-[#1a2744]">
            <div className="text-slate-400 dark:text-slate-500 text-xs font-semibold">
                Showing {start}–{end} of {total.toLocaleString()} {entityLabel}
            </div>
            <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={() => onPageChange(Math.max(1, safePage - 1))}
                        disabled={safePage === 1}
                        className="p-2 rounded-xl border border-slate-200 dark:border-[#1e2d4a] text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-[#0f1d35] transition-all bg-transparent disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={14} className="stroke-[2.5]" />
                    </button>
                    {pages.map((p) => (
                        <button
                            key={p}
                            type="button"
                            onClick={() => onPageChange(p)}
                            className={cn(
                                "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all",
                                p === safePage
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                                    : "border border-slate-200 dark:border-[#1e2d4a] text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#0f1d35] bg-transparent",
                            )}
                        >
                            {p}
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
                        disabled={safePage === totalPages}
                        className="p-2 rounded-xl border border-slate-200 dark:border-[#1e2d4a] text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-[#0f1d35] transition-all bg-transparent disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <ChevronRight size={14} className="stroke-[2.5]" />
                    </button>
                </div>
                {onPageSizeChange && (
                    <div className="relative">
                        <select
                            value={pageSize}
                            onChange={(e) => onPageSizeChange(Number(e.target.value))}
                            className="bg-transparent border border-slate-200 dark:border-[#1e2d4a] text-slate-600 dark:text-slate-300 text-xs font-semibold pl-3 pr-8 py-2 rounded-xl outline-none transition-all cursor-pointer focus:border-blue-500 appearance-none"
                        >
                            {pageSizeOptions.map((n) => (
                                <option key={n} value={n}>
                                    {n} / page
                                </option>
                            ))}
                        </select>
                        <ChevronRight size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none rotate-90 stroke-[2.5]" />
                    </div>
                )}
            </div>
        </div>
    );
}

export const superAdminTableHeadClass =
    "border-b border-slate-100 dark:border-[#1a2744] text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider";

export const superAdminTableRowClass = "hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group";
