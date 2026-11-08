"use client";

import { AlertTriangle, RefreshCw, Server } from "lucide-react";
import {
    SuperAdminCardBody,
    SuperAdminMainCard,
    SuperAdminMetricsGrid,
    SuperAdminPageHeader,
    SuperAdminSecondaryButton,
    SuperAdminToolbar,
    superAdminSelectClass,
} from "@/components/super-admin/shared/super-admin-layout";
import { StatusBadge } from "@/components/super-admin/shared/admin-page";
import { superAdminToast } from "@/components/super-admin/shared/super-admin-toast";
import { monitoringMetrics, monitoringServices } from "@/data/super-admin-mock";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const perfData = [
    { t: "00:00", cpu: 32, mem: 48, disk: 22 },
    { t: "04:00", cpu: 28, mem: 52, disk: 24 },
    { t: "08:00", cpu: 45, mem: 58, disk: 26 },
    { t: "12:00", cpu: 52, mem: 62, disk: 28 },
    { t: "16:00", cpu: 38, mem: 55, disk: 27 },
    { t: "20:00", cpu: 30, mem: 50, disk: 25 },
    { t: "24:00", cpu: 24, mem: 46, disk: 23 },
];

const alerts = [
    { title: "High Memory Usage", time: "2 min ago", warning: true },
    { title: "Disk Space Low", time: "15 min ago", warning: true },
    { title: "Backup Completed", time: "1 hour ago", warning: false },
];

export default function MonitoringPage() {
    return (
        <div className="space-y-6 min-w-0 w-full">
            <SuperAdminPageHeader title="System Monitoring" description="Real-time monitoring of system performance and infrastructure." />

            <SuperAdminMetricsGrid stats={monitoringMetrics} />

            <SuperAdminMainCard>
                <SuperAdminToolbar
                    actions={
                        <>
                            <select
                                className={superAdminSelectClass}
                                onChange={(e) => superAdminToast.info(`Showing data for: ${e.target.value}`)}
                                defaultValue="Last 24 Hours"
                            >
                                <option>Last 24 Hours</option>
                                <option>Last 7 Days</option>
                                <option>Last 30 Days</option>
                            </select>
                            <SuperAdminSecondaryButton label="Refresh" icon={RefreshCw} onClick={() => superAdminToast.success("Metrics refreshed")} />
                        </>
                    }
                />
                <SuperAdminCardBody>
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
                        <div className="xl:col-span-2 rounded-2xl border border-slate-100 dark:border-[#1a2744] p-5 bg-slate-50/50 dark:bg-white/[0.02]">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">Server Performance</h3>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={perfData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                                        <XAxis dataKey="t" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                                        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} unit="%" />
                                        <Tooltip contentStyle={{ background: "#0a1628", border: "1px solid #1a2744", borderRadius: 12 }} />
                                        <Legend />
                                        <Line type="monotone" dataKey="cpu" name="CPU Usage" stroke="#3b82f6" strokeWidth={2} dot={false} />
                                        <Line type="monotone" dataKey="mem" name="Memory Usage" stroke="#10b981" strokeWidth={2} dot={false} />
                                        <Line type="monotone" dataKey="disk" name="Disk Usage" stroke="#ef4444" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-slate-100 dark:border-[#1a2744] p-5 bg-slate-50/50 dark:bg-white/[0.02]">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">System Services</h3>
                            <div className="space-y-3">
                                {monitoringServices.map((svc) => (
                                    <div key={svc.name} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-[#1a2744] last:border-0">
                                        <div className="flex items-center gap-2">
                                            <Server size={14} className="text-slate-400" />
                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{svc.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <StatusBadge status="Operational" />
                                            <p className="text-[10px] text-slate-400 mt-1">{svc.uptime} uptime</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="rounded-2xl border border-slate-100 dark:border-[#1a2744] p-5 bg-slate-50/50 dark:bg-white/[0.02]">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">Server Information</h3>
                            <dl className="space-y-2 text-sm">
                                <div><dt className="text-slate-400 text-xs">Server Name</dt><dd className="font-semibold text-slate-800 dark:text-slate-200">som-electric-server-01</dd></div>
                                <div><dt className="text-slate-400 text-xs">IP Address</dt><dd className="font-semibold text-slate-800 dark:text-slate-200">192.168.1.10</dd></div>
                                <div><dt className="text-slate-400 text-xs">Location</dt><dd className="font-semibold text-slate-800 dark:text-slate-200">Mogadishu, Somalia</dd></div>
                            </dl>
                        </div>
                        <div className="rounded-2xl border border-slate-100 dark:border-[#1a2744] p-5 bg-slate-50/50 dark:bg-white/[0.02]">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">Database Information</h3>
                            <dl className="space-y-2 text-sm">
                                <div><dt className="text-slate-400 text-xs">Database</dt><dd className="font-semibold text-slate-800 dark:text-slate-200">som_electric_db</dd></div>
                                <div><dt className="text-slate-400 text-xs">Connections</dt><dd className="font-semibold text-slate-800 dark:text-slate-200">24 / 150</dd></div>
                                <div><dt className="text-slate-400 text-xs">Size</dt><dd className="font-semibold text-slate-800 dark:text-slate-200">12.4 GB</dd></div>
                            </dl>
                        </div>
                        <div className="rounded-2xl border border-slate-100 dark:border-[#1a2744] p-5 bg-slate-50/50 dark:bg-white/[0.02]">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">System Alerts</h3>
                            <ul className="space-y-3">
                                {alerts.map((a) => (
                                    <li key={a.title} className="flex gap-3">
                                        <AlertTriangle size={16} className={a.warning ? "text-amber-500 shrink-0" : "text-blue-500 shrink-0"} />
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{a.title}</p>
                                            <p className="text-xs text-slate-400">{a.time}</p>
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
