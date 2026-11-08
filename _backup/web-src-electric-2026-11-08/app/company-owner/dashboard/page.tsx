"use client";

import { useTheme } from "@/components/theme-provider";
import { useEffect, useState } from "react";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    Pie,
    PieChart,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import {
    CompanyOwnerActivityFeed,
    CompanyOwnerDashboardStats,
    CompanyOwnerGlassCard,
    CompanyOwnerPageHeader,
    CompanyOwnerQuickActions,
} from "@/components/company-owner/shared/company-owner-layout";
import {
    COMPANY_OWNER_NAME,
    ownerActivityFeed,
    ownerConsumptionChart,
    ownerCustomerGrowthChart,
    ownerDashboardAllStats,
    ownerMonthlyRevenueChart,
    ownerPaymentAnalytics,
    ownerPaymentSuccessChart,
    ownerRecentTransactions,
    ownerRevenueChart,
} from "@/data/company-owner-mock";
import { StatusBadge } from "@/components/super-admin/shared/admin-page";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const chartTooltip = {
    contentStyle: {
        background: "rgba(10, 22, 40, 0.92)",
        border: "1px solid rgba(6, 182, 212, 0.3)",
        borderRadius: 12,
        fontSize: 12,
    },
};

export default function CompanyOwnerDashboardPage() {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const gridStroke = mounted && resolvedTheme === "dark" ? "rgba(6, 182, 212, 0.12)" : "#e2e8f0";
    const tickFill = mounted && resolvedTheme === "dark" ? "#94a3b8" : "#64748b";

    return (
        <div className="space-y-6 min-w-0 w-full">
            <CompanyOwnerPageHeader
                title="Dashboard"
                description={`${COMPANY_OWNER_NAME} — manage customers, meters, billing, staff & operations.`}
            />

            <CompanyOwnerDashboardStats stats={ownerDashboardAllStats} />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <CompanyOwnerGlassCard className="xl:col-span-2 p-5">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Daily revenue</h3>
                    <div className="h-52">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ownerRevenueChart}>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                                <XAxis dataKey="day" tick={{ fill: tickFill, fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: tickFill, fontSize: 10 }} axisLine={false} tickLine={false} />
                                <Tooltip {...chartTooltip} />
                                <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CompanyOwnerGlassCard>
                <CompanyOwnerGlassCard className="p-5">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Payment success rate</h3>
                    <div className="h-52">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={ownerPaymentSuccessChart}>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                                <XAxis dataKey="week" tick={{ fill: tickFill, fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis domain={[90, 100]} tick={{ fill: tickFill, fontSize: 10 }} axisLine={false} tickLine={false} />
                                <Tooltip {...chartTooltip} />
                                <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CompanyOwnerGlassCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                <CompanyOwnerGlassCard className="p-5">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Monthly revenue</h3>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={ownerMonthlyRevenueChart}>
                                <defs>
                                    <linearGradient id="monthRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                                <XAxis dataKey="month" tick={{ fill: tickFill, fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: tickFill, fontSize: 10 }} axisLine={false} tickLine={false} />
                                <Tooltip {...chartTooltip} />
                                <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="url(#monthRev)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CompanyOwnerGlassCard>
                <CompanyOwnerGlassCard className="p-5">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Power consumption</h3>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={ownerConsumptionChart}>
                                <defs>
                                    <linearGradient id="consGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                                <XAxis dataKey="day" tick={{ fill: tickFill, fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: tickFill, fontSize: 10 }} axisLine={false} tickLine={false} />
                                <Tooltip {...chartTooltip} />
                                <Area type="monotone" dataKey="kwh" stroke="#06b6d4" fill="url(#consGrad)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CompanyOwnerGlassCard>
                <CompanyOwnerGlassCard className="p-5">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Customer growth</h3>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={ownerCustomerGrowthChart}>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                                <XAxis dataKey="month" tick={{ fill: tickFill, fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: tickFill, fontSize: 10 }} axisLine={false} tickLine={false} />
                                <Tooltip {...chartTooltip} />
                                <Line type="monotone" dataKey="customers" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CompanyOwnerGlassCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <CompanyOwnerGlassCard className="lg:col-span-2 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white">Recent payments</h3>
                        <Link href="/company-owner/payments" className="text-xs font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1 hover:underline">
                            View all <ArrowRight size={12} />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100 dark:border-cyan-500/10">
                                    <th className="pb-2 text-left">Transaction</th>
                                    <th className="pb-2 text-left">Customer</th>
                                    <th className="pb-2 text-left">Amount</th>
                                    <th className="pb-2 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-cyan-500/10">
                                {ownerRecentTransactions.map((row) => (
                                    <tr key={row.id} className="hover:bg-cyan-500/5 transition-colors duration-300">
                                        <td className="py-2.5 font-semibold text-cyan-600 dark:text-cyan-400">{row.trxId}</td>
                                        <td className="py-2.5">{row.customer}</td>
                                        <td className="py-2.5 font-bold">{row.amount}</td>
                                        <td className="py-2.5 text-center"><StatusBadge status={row.status} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CompanyOwnerGlassCard>
                <CompanyOwnerGlassCard className="p-5">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Payment breakdown</h3>
                    <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={ownerPaymentAnalytics} dataKey="value" innerRadius={40} outerRadius={65}>
                                    {ownerPaymentAnalytics.map((e) => (
                                        <Cell key={e.label} fill={e.color} />
                                    ))}
                                </Pie>
                                <Tooltip {...chartTooltip} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CompanyOwnerGlassCard>
            </div>

            <CompanyOwnerQuickActions />

            <CompanyOwnerActivityFeed items={ownerActivityFeed} />
        </div>
    );
}
