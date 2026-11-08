"use client";

import { Building2, Plus, Search, SlidersHorizontal } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { COMPANY_OWNER_NAME } from "@/data/company-owner-mock";

export {
    TableRowActions,
    TableActionButton,
    ActionTip,
    SuperAdminMetricsGrid as CompanyOwnerMetricsGrid,
    SuperAdminToolbar as CompanyOwnerToolbar,
    SuperAdminCardBody as CompanyOwnerCardBody,
    SuperAdminTablePagination as CompanyOwnerTablePagination,
    superAdminTableHeadClass as companyOwnerTableHeadClass,
    superAdminTableRowClass as companyOwnerTableRowClass,
} from "@/components/super-admin/shared/super-admin-layout";

export type { SuperAdminMetric as CompanyOwnerMetric } from "@/components/super-admin/shared/super-admin-layout";

export {
    CompanyOwnerDashboardStats,
    CompanyOwnerQuickActions,
    CompanyOwnerActivityFeed,
} from "./owner-dashboard-widgets";

import { SuperAdminMainCard } from "@/components/super-admin/shared/super-admin-layout";

/** Page header with company badge */
export function CompanyOwnerPageHeader({
    title,
    description,
    hideTitle,
}: {
    title: string;
    description: string;
    /** Hide h1 when topbar already shows the page title (avoids duplicate at 125–150% zoom) */
    hideTitle?: boolean;
}) {
    return (
        <div className="co-page-header flex flex-col min-w-0 max-w-full gap-2 pr-1">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 co-page-header-badge max-w-full min-w-0">
                <Building2 size={11} className="shrink-0" />
                <span className="truncate">{COMPANY_OWNER_NAME}</span>
            </div>
            <div className="min-w-0">
                {!hideTitle ? (
                    <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight truncate">{title}</h1>
                ) : null}
                <p
                    className={cn(
                        "text-slate-400 dark:text-slate-500 text-xs font-medium co-page-header-desc line-clamp-2",
                        !hideTitle && "mt-0.5",
                    )}
                >
                    {description}
                </p>
            </div>
        </div>
    );
}

export function CompanyOwnerMainCard({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <SuperAdminMainCard className={cn("co-owner-card", className)}>
            {children}
        </SuperAdminMainCard>
    );
}

export const CompanyOwnerGlassCard = CompanyOwnerMainCard;

export function CompanyOwnerTabBar({
    tabs,
    active,
    onChange,
}: {
    tabs: { id: string; label: string }[];
    active: string;
    onChange: (id: string) => void;
}) {
    return (
        <div className="flex flex-wrap border-b border-slate-100 dark:border-[#1a2744] gap-0">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    type="button"
                    onClick={() => onChange(tab.id)}
                    className={cn(
                        "px-3.5 py-1.5 text-xs font-bold border-b-2 transition-all relative",
                        active === tab.id
                            ? "co-owner-tab-active text-emerald-600 dark:text-emerald-400 border-emerald-500"
                            : "text-slate-400 dark:text-slate-500 border-transparent hover:text-slate-600 dark:hover:text-slate-300",
                    )}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}

export function CompanyOwnerSearchInput({
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
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={cn(
                    "w-full h-9 pl-10 pr-3 rounded-xl bg-slate-50 dark:bg-[#0f1629] border border-slate-200 dark:border-[#1e2d4a]",
                    "text-slate-900 dark:text-slate-100 text-xs font-medium outline-none transition",
                    "focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 placeholder:text-slate-400 dark:placeholder:text-slate-600",
                )}
            />
        </div>
    );
}

export function CompanyOwnerSelect({
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
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
                "h-9 rounded-xl bg-slate-50 dark:bg-[#0f1629] border border-slate-200 dark:border-[#1e2d4a] px-3",
                "text-slate-900 dark:text-slate-100 text-xs font-medium outline-none transition",
                "focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20",
                className,
            )}
        >
            {children}
        </select>
    );
}

export function CompanyOwnerAddButton({ label, onClick }: { label: string; onClick?: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="co-owner-btn-primary h-9 flex items-center gap-1.5 px-4 text-white font-bold text-xs rounded-xl transition-all shrink-0"
        >
            <Plus size={14} />
            {label}
        </button>
    );
}

export function CompanyOwnerSecondaryButton({
    label,
    onClick,
    icon: Icon,
}: {
    label: string;
    onClick?: () => void;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="h-9 flex items-center gap-2 px-3.5 border border-slate-200 dark:border-[#1e2d4a] text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-emerald-500/5 hover:border-emerald-500/30 transition-all shrink-0"
        >
            {Icon && <Icon size={13} />}
            {label}
        </button>
    );
}

export function CompanyOwnerFilterButton({ onClick }: { onClick?: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="h-9 flex items-center gap-2 px-3.5 border border-slate-200 dark:border-[#1e2d4a] text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-emerald-500/5 hover:border-emerald-500/30 transition-all shrink-0"
        >
            <SlidersHorizontal size={13} />
            Filter
        </button>
    );
}
