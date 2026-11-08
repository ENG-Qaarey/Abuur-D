"use client";

import Link from "next/link";
import {
    ArrowUpRight,
    BarChart3,
    Bell,
    Gauge,
    Megaphone,
    Receipt,
    UserPlus,
    Users,
    UserCog,
    Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedSparkline } from "@/components/ui/AnimatedSparkline";
import type { OwnerActivityItem } from "@/data/company-owner-mock";
import type { CompanyOwnerMetric } from "./company-owner-layout";
import { CompanyOwnerMainCard } from "./company-owner-layout";

const activityIcon: Record<OwnerActivityItem["type"], { icon: LucideIcon; color: string }> = {
    customer: { icon: Users, color: "text-blue-500" },
    payment: { icon: Receipt, color: "text-emerald-500" },
    meter: { icon: Gauge, color: "text-cyan-500" },
    ticket: { icon: Zap, color: "text-amber-500" },
    staff: { icon: UserCog, color: "text-violet-500" },
    alert: { icon: Bell, color: "text-rose-500" },
};

function OwnerMetricCard({ stat, index }: { stat: CompanyOwnerMetric; index: number }) {
    return (
        <div className="co-owner-metric-card bg-white dark:bg-[#0a1628] border border-slate-100 dark:border-[#1a2744] rounded-2xl p-4 flex items-center justify-between shadow-sm transition-all">
            <div className="space-y-1 min-w-0">
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{stat.title}</span>
                <h3 className="text-slate-900 dark:text-white text-xl font-black truncate">{stat.value}</h3>
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <ArrowUpRight size={12} className="shrink-0" />
                    <span className="truncate">{stat.trend}</span>
                </div>
            </div>
            <div className="w-16 h-10 flex items-center shrink-0">
                <AnimatedSparkline gradientId={stat.glowColor} path={stat.sparklinePath} stroke={stat.stroke} delay={index * 120} />
            </div>
        </div>
    );
}

export function CompanyOwnerDashboardStats({ stats }: { stats: CompanyOwnerMetric[] }) {
    return (
        <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {stats.slice(0, 4).map((stat, index) => (
                    <OwnerMetricCard key={stat.title} stat={stat} index={index} />
                ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {stats.slice(4).map((stat, index) => (
                    <div
                        key={stat.title}
                        className="co-owner-metric-card bg-white dark:bg-[#0a1628] border border-slate-100 dark:border-[#1a2744] rounded-2xl p-3 shadow-sm transition-all"
                    >
                        <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate">{stat.title}</p>
                        <p className="text-base font-black text-slate-900 dark:text-white mt-1 truncate">{stat.value}</p>
                        <p className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 truncate">{stat.trend}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

const quickActions = [
    { label: "Add Customer", href: "/company-owner/customers", icon: UserPlus },
    { label: "Assign Meter", href: "/company-owner/meters", icon: Gauge },
    { label: "Generate Bill", href: "/company-owner/billing", icon: Receipt },
    { label: "Send Notification", href: "/company-owner/notifications", icon: Bell },
    { label: "Add Staff", href: "/company-owner/staff", icon: UserCog },
    { label: "Announcement", href: "/company-owner/notifications", icon: Megaphone },
    { label: "View Reports", href: "/company-owner/reports", icon: BarChart3 },
];

export function CompanyOwnerQuickActions() {
    return (
        <CompanyOwnerMainCard className="p-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white mb-3">Quick actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2">
                {quickActions.map((action) => (
                    <Link
                        key={action.label}
                        href={action.href}
                        className={cn(
                            "flex flex-col items-center gap-2 p-3 rounded-xl border border-transparent",
                            "text-center transition-all hover:border-emerald-500/25 hover:bg-emerald-500/5",
                        )}
                    >
                        <action.icon size={18} className="text-emerald-600 dark:text-emerald-400" />
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 leading-tight">{action.label}</span>
                    </Link>
                ))}
            </div>
        </CompanyOwnerMainCard>
    );
}

export function CompanyOwnerActivityFeed({ items }: { items: OwnerActivityItem[] }) {
    return (
        <CompanyOwnerMainCard className="p-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white mb-3">Activity feed</h3>
            <ul className="space-y-3 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
                {items.map((item) => {
                    const meta = activityIcon[item.type];
                    const Icon = meta.icon;
                    return (
                        <li
                            key={item.id}
                            className="flex gap-3 p-2 rounded-xl transition-colors hover:bg-emerald-500/5"
                        >
                            <div className={cn("w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#0f1629] flex items-center justify-center shrink-0", meta.color)}>
                                <Icon size={14} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{item.description}</p>
                            </div>
                            <span className="text-[10px] font-semibold text-slate-400 shrink-0">{item.time}</span>
                        </li>
                    );
                })}
            </ul>
        </CompanyOwnerMainCard>
    );
}
