"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

export const filterSelectClass =
    "h-10 rounded-xl bg-slate-50 dark:bg-[#0f1629] border border-slate-200 dark:border-[#1e2d4a] px-3 text-slate-900 dark:text-slate-100 text-sm font-medium outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

export const searchInputClass =
    "w-full h-10 pl-11 pr-4 rounded-xl bg-slate-50 dark:bg-[#0f1629] border border-slate-200 dark:border-[#1e2d4a] text-slate-900 dark:text-slate-100 text-sm font-medium outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400 dark:placeholder:text-slate-600";

const statusStyles: Record<string, string> = {
    Active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    Inactive: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    Success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    Failed: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    Open: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    "In Progress": "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    Resolved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    Published: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    Scheduled: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    Draft: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
    High: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    Medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    Low: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    Premium: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
    Standard: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    Basic: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
    Operational: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    Healthy: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
};

export function StatusBadge({ status }: { status: string }) {
    return (
        <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold", statusStyles[status] || statusStyles.Active)}>
            {status}
        </span>
    );
}

export function AdminPanel({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div className={cn("bg-white dark:bg-[#0a1628] border border-slate-100 dark:border-[#1a2744] rounded-2xl overflow-hidden shadow-sm min-w-0", className)}>
            {children}
        </div>
    );
}

export function AdminPagination({
    page,
    perPage,
    total,
    onPageChange,
}: {
    page: number;
    perPage: number;
    total: number;
    onPageChange: (p: number) => void;
}) {
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const start = total === 0 ? 0 : (page - 1) * perPage + 1;
    const end = Math.min(page * perPage, total);

    const pages: number[] = [];
    if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (page <= 3) {
        pages.push(1, 2, 3, 4);
    } else if (page >= totalPages - 2) {
        pages.push(totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
        pages.push(page - 1, page, page + 1, page + 2);
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-[#1a2744]">
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                Showing {start} to {end} of {total.toLocaleString()}
            </p>
            <div className="flex items-center gap-1.5">
                <button type="button" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1} className="p-2 rounded-xl border border-slate-200 dark:border-[#1e2d4a] text-slate-400 disabled:opacity-40">
                    <ChevronLeft size={14} />
                </button>
                {pages.map((p) => (
                    <button key={p} type="button" onClick={() => onPageChange(p)} className={cn("w-8 h-8 rounded-xl text-xs font-bold", p === page ? "bg-blue-600 text-white" : "border border-slate-200 dark:border-[#1e2d4a] text-slate-500 dark:text-slate-400")}>
                        {p}
                    </button>
                ))}
                {totalPages > 5 && page < totalPages - 2 && (
                    <>
                        <span className="text-slate-400 px-1">…</span>
                        <button type="button" onClick={() => onPageChange(totalPages)} className="w-8 h-8 rounded-xl text-xs font-bold border border-slate-200 dark:border-[#1e2d4a] text-slate-500">
                            {totalPages.toLocaleString()}
                        </button>
                    </>
                )}
                <button type="button" onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="p-2 rounded-xl border border-slate-200 dark:border-[#1e2d4a] text-slate-400 disabled:opacity-40">
                    <ChevronRight size={14} />
                </button>
            </div>
        </div>
    );
}

export function AvatarInitials({ name, color }: { name: string; color: string }) {
    return (
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-black text-white", color)}>
            {name.charAt(0).toUpperCase()}
        </div>
    );
}
