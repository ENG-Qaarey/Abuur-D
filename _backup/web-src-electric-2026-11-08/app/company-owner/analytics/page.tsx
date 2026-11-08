"use client";

import { useTheme } from "@/components/theme-provider";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
    CompanyOwnerGlassCard,
    CompanyOwnerMetricsGrid,
    CompanyOwnerPageHeader,
    CompanyOwnerTabBar,
} from "@/components/company-owner/shared/company-owner-layout";
import { companyOwnerToast } from "@/components/company-owner/shared/company-owner-toast";
import {
    ownerAnalyticsMetrics,
    ownerConsumptionChart,
    ownerMeterRows,
    ownerRevenueChart,
} from "@/data/company-owner-mock";
import { StatusBadge } from "@/components/super-admin/shared/admin-page";
import { Activity, MapPin, Users, Zap } from "lucide-react";

const tabs = [
    { id: "usage", label: "Usage analytics" },
    { id: "meters", label: "Live meter status" },
    { id: "load", label: "Electricity load" },
    { id: "alerts", label: "System alerts" },
];

export default function AnalyticsPage() {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [tab, setTab] = useState("usage");
    useEffect(() => setMounted(true), []);

    const gridStroke = mounted && resolvedTheme === "dark" ? "rgba(6, 182, 212, 0.12)" : "#e2e8f0";
    const tickFill = mounted && resolvedTheme === "dark" ? "#94a3b8" : "#64748b";

    return (
        <div className="space-y-6 min-w-0 w-full">
            <CompanyOwnerPageHeader
                title="Analytics & Monitoring"
                description="Live meters, electricity load, usage trends and system performance."
            />
            <CompanyOwnerMetricsGrid stats={ownerAnalyticsMetrics} />
            <CompanyOwnerTabBar tabs={tabs} active={tab} onChange={setTab} />

            {tab === "usage" && (
                <CompanyOwnerGlassCard className="p-5">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Electricity usage trends</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ownerConsumptionChart}>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                                <XAxis dataKey="day" tick={{ fill: tickFill, fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: tickFill, fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ background: "#0a1628", border: "1px solid #1e2d4a", borderRadius: 12 }} />
                                <Bar dataKey="kwh" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CompanyOwnerGlassCard>
            )}

            {tab === "meters" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <CompanyOwnerGlassCard className="p-5">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Activity size={16} className="text-cyan-500" /> Live meter status
                        </h3>
                        <ul className="space-y-2">
                            {ownerMeterRows.map((m) => (
                                <li key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/40">
                                    <div>
                                        <p className="text-xs font-bold text-slate-900 dark:text-white">{m.meterId}</p>
                                        <p className="text-[10px] text-slate-500">{m.customer}</p>
                                    </div>
                                    <StatusBadge status={m.connectivity} />
                                </li>
                            ))}
                        </ul>
                    </CompanyOwnerGlassCard>
                    <CompanyOwnerGlassCard className="p-5 flex flex-col items-center justify-center text-center min-h-[240px]">
                        <MapPin size={32} className="text-cyan-500 mb-2" />
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Electricity usage map</p>
                        <p className="text-xs text-slate-500 mt-1">District-level consumption heatmap (preview)</p>
                    </CompanyOwnerGlassCard>
                </div>
            )}

            {tab === "load" && (
                <CompanyOwnerGlassCard className="p-5">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Revenue & load monitoring</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ownerRevenueChart}>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                                <XAxis dataKey="day" tick={{ fill: tickFill, fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: tickFill, fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ background: "#0a1628", borderRadius: 12 }} />
                                <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CompanyOwnerGlassCard>
            )}

            {tab === "alerts" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                        { icon: Zap, label: "162 meters offline", action: () => companyOwnerToast.info("View offline meters") },
                        { icon: Users, label: "124 churn risk customers", action: () => companyOwnerToast.info("View at-risk list") },
                        { icon: Activity, label: "2 active outages", action: () => companyOwnerToast.info("Open support tickets") },
                    ].map((alert) => (
                        <button
                            key={alert.label}
                            type="button"
                            onClick={alert.action}
                            className="co-owner-card bg-white dark:bg-[#0a1628] border border-slate-100 dark:border-[#1a2744] rounded-2xl p-4 text-left shadow-sm hover:border-emerald-500/30 transition-all"
                        >
                            <alert.icon size={20} className="text-amber-500 mb-2" />
                            <p className="text-xs font-bold text-slate-800 dark:text-white">{alert.label}</p>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
