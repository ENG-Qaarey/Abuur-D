"use client";

import {
    CompanyOwnerMetricsGrid,
    CompanyOwnerPageHeader,
    CompanyOwnerSecondaryButton,
    CompanyOwnerTabBar,
} from "@/components/company-owner/shared/company-owner-layout";
import { companyOwnerToast } from "@/components/company-owner/shared/company-owner-toast";
import { ownerAnalyticsMetrics, ownerDistrictShare, ownerReportMetrics, ownerRevenueChart } from "@/data/company-owner-mock";
import { Download } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const reportTabs = [
    { id: "revenue", label: "Revenue" },
    { id: "usage", label: "Usage" },
    { id: "peak", label: "Peak usage" },
    { id: "growth", label: "Customer growth" },
];

export default function ReportsPage() {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [tab, setTab] = useState("revenue");
    useEffect(() => setMounted(true), []);
    const gridStroke = mounted && resolvedTheme === "dark" ? "#1e2d4a" : "#e2e8f0";
    const tickFill = mounted && resolvedTheme === "dark" ? "#94a3b8" : "#64748b";

    return (
        <div className="space-y-6 min-w-0 w-full">
            <CompanyOwnerPageHeader title="Reports & Analytics" description="Revenue, usage, peak load, customer growth — export PDF or Excel." />
            <CompanyOwnerMetricsGrid stats={tab === "growth" ? ownerAnalyticsMetrics : ownerReportMetrics} />
            <CompanyOwnerTabBar tabs={reportTabs} active={tab} onChange={setTab} />
            <div className="flex flex-wrap gap-2">
                <CompanyOwnerSecondaryButton label="Export PDF" icon={Download} onClick={() => companyOwnerToast.success("PDF report generated")} />
                <CompanyOwnerSecondaryButton label="Export Excel" icon={Download} onClick={() => companyOwnerToast.success("Excel downloaded")} />
                <CompanyOwnerSecondaryButton label="Export CSV" icon={Download} onClick={() => companyOwnerToast.success("CSV downloaded")} />
                <CompanyOwnerSecondaryButton label="Print" onClick={() => companyOwnerToast.info("Opening print dialog")} />
            </div>
            <div className="bg-white dark:bg-[#0a1628] border border-slate-100 dark:border-[#1a2744] rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Revenue trend</h3>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={ownerRevenueChart}>
                            <defs>
                                <linearGradient id="ownerRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                            <XAxis dataKey="day" tick={{ fill: tickFill, fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: tickFill, fontSize: 11 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ background: "#0a1628", border: "1px solid #1e2d4a", borderRadius: 12, fontSize: 12 }} />
                            <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="url(#ownerRevenue)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
