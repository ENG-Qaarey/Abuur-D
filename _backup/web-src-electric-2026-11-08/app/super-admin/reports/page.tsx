"use client";

import { Calendar, Download } from "lucide-react";
import {
    SuperAdminCardBody,
    SuperAdminMainCard,
    SuperAdminMetricsGrid,
    SuperAdminPageHeader,
    SuperAdminSecondaryButton,
    SuperAdminToolbar,
    superAdminSelectClass,
} from "@/components/super-admin/shared/super-admin-layout";
import { superAdminToast } from "@/components/super-admin/shared/super-admin-toast";
import { companyRevenueShare, reportMetrics, revenueChartData } from "@/data/super-admin-mock";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

const customersGrowth = revenueChartData.map((d, i) => ({ day: d.day, count: 120 + i * 18 }));
const transactionsBars = revenueChartData.map((d, i) => ({ day: d.day, count: 800 + i * 45 }));
const topCompanies = [
    { name: "Somali Electric Co.", pct: 92, amount: "$945,200" },
    { name: "Som Power", pct: 78, amount: "$712,400" },
    { name: "HECO", pct: 65, amount: "$534,100" },
    { name: "Telesom Electric", pct: 54, amount: "$421,800" },
];

export default function ReportsPage() {
    return (
        <div className="space-y-6 min-w-0 w-full">
            <SuperAdminPageHeader title="Reports & Analytics" description="Comprehensive analytics and insights about system performance." />

            <SuperAdminMetricsGrid stats={reportMetrics} />

            <SuperAdminMainCard>
                <SuperAdminToolbar
                    actions={
                        <>
                            <button
                                type="button"
                                onClick={() => superAdminToast.info("Date range picker coming soon")}
                                className={`${superAdminSelectClass} flex items-center gap-2 min-w-[200px]`}
                            >
                                <Calendar size={14} className="text-slate-400" />
                                May 19, 2024 – May 25, 2024
                            </button>
                            <SuperAdminSecondaryButton label="Export Report" icon={Download} onClick={() => superAdminToast.success("Report export started")} />
                        </>
                    }
                />
                <SuperAdminCardBody>
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
                        <div className="xl:col-span-2 rounded-2xl border border-slate-100 dark:border-[#1a2744] p-5 bg-slate-50/50 dark:bg-white/[0.02]">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">Revenue Overview</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={revenueChartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                                        <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                                        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v) => `$${v}K`} />
                                        <Tooltip contentStyle={{ background: "#0a1628", border: "1px solid #1a2744", borderRadius: 12 }} />
                                        <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, fill: "#3b82f6" }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-slate-100 dark:border-[#1a2744] p-5 bg-slate-50/50 dark:bg-white/[0.02]">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">Revenue by Company</h3>
                            <div className="h-48 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={companyRevenueShare} dataKey="value" innerRadius={55} outerRadius={75} paddingAngle={2}>
                                            {companyRevenueShare.map((e) => <Cell key={e.name} fill={e.color} />)}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <span className="text-lg font-black text-slate-900 dark:text-white">$2.8M</span>
                                </div>
                            </div>
                            <ul className="mt-4 space-y-2">
                                {companyRevenueShare.map((c) => (
                                    <li key={c.name} className="flex justify-between text-xs">
                                        <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                            <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                                            {c.name}
                                        </span>
                                        <span className="font-bold">{c.value}%</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="rounded-2xl border border-slate-100 dark:border-[#1a2744] p-5 bg-slate-50/50 dark:bg-white/[0.02]">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">Customers Growth</h3>
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={customersGrowth}><Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} /><XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94a3b8" }} /></BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-slate-100 dark:border-[#1a2744] p-5 bg-slate-50/50 dark:bg-white/[0.02]">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">Transactions Overview</h3>
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={transactionsBars}><Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} /><XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94a3b8" }} /></BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-slate-100 dark:border-[#1a2744] p-5 bg-slate-50/50 dark:bg-white/[0.02]">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">Top Performing Companies</h3>
                            <ul className="space-y-4">
                                {topCompanies.map((co) => (
                                    <li key={co.name}>
                                        <div className="flex justify-between text-xs font-semibold mb-1">
                                            <span className="text-slate-700 dark:text-slate-200">{co.name}</span>
                                            <span>{co.amount}</span>
                                        </div>
                                        <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                            <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: `${co.pct}%` }} />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </SuperAdminCardBody>
            </SuperAdminMainCard>
        </div>
    );
}
