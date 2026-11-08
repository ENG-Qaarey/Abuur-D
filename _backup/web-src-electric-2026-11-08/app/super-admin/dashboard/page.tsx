"use client";

import { StatCard } from "@/components/dashboard/StatCard";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useTheme } from "@/components/theme-provider";
import {
    Building2,
    Users,
    DollarSign,
    Activity,
    Plus,
    Search,
    MoreHorizontal,
    ArrowRightLeft,
    Gauge,
    ShieldCheck,
    ChevronDown,
    Eye,
    Edit,
    FileText,
    UserPlus,
    CreditCard,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import Image from "next/image";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

// Mock Data
const revenueData = [
    { name: "Jan", value: 50 },
    { name: "Feb", value: 80 },
    { name: "Mar", value: 120 },
    { name: "Apr", value: 150 },
    { name: "May", value: 110 },
    { name: "Jun", value: 130 },
    { name: "Jul", value: 160 },
    { name: "Aug", value: 140 },
    { name: "Sep", value: 180 },
    { name: "Oct", value: 150 },
    { name: "Nov", value: 200 },
    { name: "Dec", value: 240 },
];

const registrationData = [
    { name: "Jan", value: 10 },
    { name: "Feb", value: 5 },
    { name: "Mar", value: 14 },
    { name: "Apr", value: 22 },
    { name: "May", value: 15 },
    { name: "Jun", value: 12 },
    { name: "Jul", value: 14 },
    { name: "Aug", value: 18 },
    { name: "Sep", value: 10 },
    { name: "Oct", value: 23 },
    { name: "Nov", value: 14 },
    { name: "Dec", value: 10 },
];

const userRoleData = [
    { name: "Company Owners", value: 24, color: "#3b82f6" },
    { name: "Company Admins", value: 96, color: "#10b981" },
    { name: "Employees", value: 1248, color: "#f59e0b" },
    { name: "Meter Readers", value: 1156, color: "#8b5cf6" },
    { name: "Customers", value: 128560, color: "#0ea5e9" },
];

const topCompanies = [
    { rank: 1, name: "BECO (Benaadir Electric)", customers: "28,450", revenue: "$285,450", growth: "+15.6%" },
    { rank: 2, name: "Daha Electric Company", customers: "22,150", revenue: "$198,670", growth: "+12.3%" },
    { rank: 3, name: "SomPower Electric", customers: "18,890", revenue: "$162,340", growth: "+10.8%" },
    { rank: 4, name: "Nugaal Electric", customers: "12,230", revenue: "$98,120", growth: "+8.2%" },
    { rank: 5, name: "GEDO Electric", customers: "9,420", revenue: "$72,440", growth: "+6.7%" },
];

const systemStatus = [
    { name: "API Services", status: "Operational" },
    { name: "Database", status: "Operational" },
    { name: "Payment Gateway", status: "Operational" },
    { name: "File Storage", status: "Operational" },
    { name: "Backup System", status: "Operational" },
    { name: "Notifications", status: "Operational" },
    { name: "Chat Service", status: "Operational" },
];

const recentActivities = [
    { icon: Building2, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-950/40", title: "New company \"Kismayo Electric\" registered", desc: "by System Owner", time: "10:30 AM" },
    { icon: UserPlus, color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-950/40", title: "New customer (CUST123456) registered", desc: "by BECO Admin", time: "10:15 AM" },
    { icon: CreditCard, color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-950/40", title: "Payment of $27.50 received from customer", desc: "Company: SomPower Electric", time: "09:58 AM" },
    { icon: UserPlus, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-950/40", title: "New meter reader (Ahmed Hassan) added", desc: "Company: Daha Electric", time: "09:40 AM" },
    { icon: FileText, color: "text-yellow-500", bg: "bg-yellow-100 dark:bg-yellow-950/40", title: "System backup completed successfully", desc: "by System", time: "02:00 AM" },
];

const allCompanies = [
    { id: "COMP001", name: "BECO (Benaadir Electric)", owner: "Abdi Hassan", email: "admin@beco.so", customers: "28,450", meters: "30,250", status: "Active", plan: "Premium", joined: "12 Jan 2024", logo: "B" },
    { id: "COMP002", name: "Daha Electric Company", owner: "Mohamed Ali", email: "info@dahaelectric.so", customers: "22,150", meters: "23,120", status: "Active", plan: "Premium", joined: "08 Feb 2024", logo: "D" },
    { id: "COMP003", name: "SomPower Electric", owner: "Ahmed Ibrahim", email: "contact@sompower.so", customers: "18,890", meters: "19,870", status: "Active", plan: "Standard", joined: "15 Mar 2024", logo: "S" },
    { id: "COMP004", name: "Nugaal Electric", owner: "Hassan Omar", email: "admin@nugaalelectric.so", customers: "12,230", meters: "13,450", status: "Active", plan: "Standard", joined: "22 Apr 2024", logo: "N" },
    { id: "COMP005", name: "GEDO Electric", owner: "Yusuf Ahmed", email: "info@gedoelectric.so", customers: "9,420", meters: "10,250", status: "Active", plan: "Basic", joined: "10 May 2024", logo: "G" },
];

export default function SuperAdminDashboard() {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        setMounted(true);
    }, []);

    const isDark = mounted && resolvedTheme === "dark";

    const filteredCompanies = allCompanies
        .filter(co => 
            co.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            co.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
            co.id.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 5);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
                <StatCard title="Total Companies" value="24" icon={Building2} color="blue" trend={{ value: 2, isUp: true, label: "New this month" }} />
                <StatCard title="Total Customers" value="128,560" icon={Users} color="emerald" trend={{ value: 5230, isUp: true, label: "This month" }} />
                <StatCard title="Total Revenue" value="$1,248,560" icon={DollarSign} color="purple" trend={{ value: 12.5, isUp: true, label: "From last month" }} />
                <StatCard title="Total Transactions" value="45,632" icon={ArrowRightLeft} color="orange" trend={{ value: 8.7, isUp: true, label: "From last month" }} />
                <StatCard title="Active Meters" value="136,890" icon={Gauge} color="blue" trend={{ value: 6.3, isUp: true, label: "From last month" }} />
                <StatCard title="System Uptime" value="99.9%" icon={ShieldCheck} color="emerald" trend={{ value: 0, isUp: true, label: "Excellent" }} />
            </div>

            {/* Row 2: Charts & Status */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-5 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950/80 rounded-[32px] border border-white dark:border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none p-7 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-2xl dark:hover:shadow-slate-950/20 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <div className="relative z-10 flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-[16px] font-black text-slate-900 dark:text-slate-100 tracking-tight">Revenue Overview</h3>
                            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-505 mt-1 uppercase tracking-widest">All Companies</p>
                        </div>
                        <button className="flex items-center gap-1.5 text-[11px] font-black text-slate-550 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm px-4 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all uppercase tracking-widest cursor-pointer">
                            This Year <ChevronDown size={14} />
                        </button>
                    </div>
                    <div className="h-[250px] w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#f1f5f9"} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: isDark ? "#64748b" : "#94a3b8", fontWeight: 700 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: isDark ? "#64748b" : "#94a3b8", fontWeight: 700 }} tickFormatter={(val) => `$${val}K`} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: isDark ? "#1e293b" : "#fff",
                                        borderRadius: "16px",
                                        border: isDark ? "1px solid #334155" : "none",
                                        boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.1)",
                                        fontWeight: 800,
                                        color: isDark ? "#f8fafc" : "#0f172a"
                                    }}
                                    labelStyle={{ color: isDark ? "#94a3b8" : "#64748b" }}
                                    itemStyle={{ color: isDark ? "#3b82f6" : "#2563eb" }}
                                    formatter={(value: any) => [`$${value}K`, 'Revenue']}
                                    cursor={{ stroke: isDark ? "#475569" : "#cbd5e1", strokeWidth: 1, strokeDasharray: '3 3' }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke="url(#colorRevenue)" 
                                    strokeWidth={4} 
                                    dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#3b82f6' }} 
                                    activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }} 
                                />
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#3b82f6" />
                                        <stop offset="100%" stopColor="#8b5cf6" />
                                    </linearGradient>
                                </defs>
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Performing Companies */}
                <div className="lg:col-span-4 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950/80 rounded-[32px] border border-white dark:border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none p-7 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-2xl dark:hover:shadow-slate-950/20">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[16px] font-black text-slate-900 dark:text-slate-100 tracking-tight">Top Performing</h3>
                        <button className="text-[11px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 rounded-lg transition-colors cursor-pointer">View All</button>
                    </div>
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100/60 dark:border-slate-800">
                                    <th className="pb-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">#</th>
                                    <th className="pb-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Company</th>
                                    <th className="pb-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Rev</th>
                                    <th className="pb-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Growth</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                {topCompanies.map((co) => (
                                    <tr key={co.rank} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="py-3.5 text-xs font-black text-slate-400 dark:text-slate-500 group-hover:text-blue-500 transition-colors">{co.rank}</td>
                                        <td className="py-3.5 text-xs font-bold text-slate-800 dark:text-slate-300 pr-4">
                                            <span className="line-clamp-1">{co.name}</span>
                                        </td>
                                        <td className="py-3.5 text-xs font-black text-slate-900 dark:text-slate-100 text-right">{co.revenue}</td>
                                        <td className="py-3.5 text-xs font-bold text-emerald-500 text-right">
                                            <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-md">{co.growth}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* System Live Status */}
                <div className="lg:col-span-3 bg-[#0B1527] text-white rounded-[32px] border border-slate-800 shadow-2xl p-7 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
                    
                    <div className="relative z-10 flex items-center justify-between mb-8">
                        <h3 className="text-[16px] font-black tracking-tight">System Status</h3>
                        <div className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Live</span>
                        </div>
                    </div>
                    <div className="space-y-4.5 relative z-10">
                        {systemStatus.map((sys, idx) => (
                            <div key={idx} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] group-hover:scale-125 transition-transform" />
                                    <span className="text-[13px] font-bold text-slate-300 group-hover:text-white transition-colors">{sys.name}</span>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400/80 group-hover:text-emerald-400 transition-colors">OK</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Row 3: Registrations, Roles, Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Registration Trend */}
                <div className="lg:col-span-4 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950/80 rounded-[32px] border border-white dark:border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none p-7 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-2xl dark:hover:shadow-slate-950/20">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-[16px] font-black text-slate-900 dark:text-slate-100 tracking-tight">Registration Trend</h3>
                            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest">Monthly Onboarding</p>
                        </div>
                        <button className="flex items-center gap-1.5 text-[11px] font-black text-slate-550 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm px-3 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all uppercase tracking-widest cursor-pointer">
                            2025 <ChevronDown size={14} />
                        </button>
                    </div>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={registrationData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#f1f5f9"} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: isDark ? "#64748b" : "#94a3b8", fontWeight: 700 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: isDark ? "#64748b" : "#94a3b8", fontWeight: 700 }} />
                                <Tooltip
                                    cursor={{ fill: isDark ? "rgba(255, 255, 255, 0.05)" : "#f8fafc" }}
                                    contentStyle={{
                                        backgroundColor: isDark ? "#1e293b" : "#fff",
                                        borderRadius: '16px',
                                        border: isDark ? "1px solid #334155" : "none",
                                        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.1)',
                                        fontWeight: 800,
                                        color: isDark ? "#f8fafc" : "#0f172a"
                                    }}
                                />
                                <Bar dataKey="value" fill="url(#colorReg)" radius={[6, 6, 0, 0]} />
                                <defs>
                                    <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" />
                                        <stop offset="100%" stopColor="#60a5fa" />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* User Distribution */}
                <div className="lg:col-span-4 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950/80 rounded-[32px] border border-white dark:border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none p-7 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-2xl dark:hover:shadow-slate-950/20 flex flex-col">
                    <div>
                        <h3 className="text-[16px] font-black text-slate-900 dark:text-slate-100 tracking-tight">User Distribution</h3>
                        <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest">By Account Role</p>
                    </div>
                    <div className="flex-1 flex items-center justify-center gap-8 mt-6">
                        <div className="w-[140px] h-[140px] relative">
                            <div className="absolute inset-0 bg-blue-500/5 rounded-full blur-2xl" />
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={userRoleData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={48}
                                        outerRadius={70}
                                        paddingAngle={3}
                                        dataKey="value"
                                        stroke="none"
                                        cornerRadius={4}
                                    >
                                        {userRoleData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: isDark ? "#1e293b" : "#fff",
                                            borderRadius: '12px',
                                            border: isDark ? "1px solid #334155" : "none",
                                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                                            fontWeight: 700,
                                            color: isDark ? "#f8fafc" : "#0f172a"
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-3.5">
                            {userRoleData.map((role, idx) => (
                                <div key={idx} className="flex items-center gap-3 group">
                                    <div className="w-2.5 h-2.5 rounded-full shadow-sm group-hover:scale-125 transition-transform" style={{ backgroundColor: role.color, boxShadow: `0 0 10px ${role.color}66` }} />
                                    <div className="flex flex-col">
                                        <span className="text-[12px] font-black text-slate-700 dark:text-slate-300 leading-none mb-1.5 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">{role.name}</span>
                                        <span className="text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500 leading-none">
                                            {role.value.toLocaleString()} <span className="text-slate-350 dark:text-slate-600">({((role.value / 131084) * 100).toFixed(1)}%)</span>
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Activities */}
                <div className="lg:col-span-4 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950/80 rounded-[32px] border border-white dark:border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none p-7 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:hover:shadow-2xl dark:hover:shadow-slate-950/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-slate-100 to-transparent dark:from-slate-800/20 opacity-50 rounded-bl-full pointer-events-none" />
                    <div className="relative z-10 flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-[16px] font-black text-slate-900 dark:text-slate-100 tracking-tight">Recent Activities</h3>
                            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest">System Log</p>
                        </div>
                        <button className="text-[11px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 rounded-lg transition-colors cursor-pointer">View All</button>
                    </div>
                    <div className="space-y-5 relative z-10">
                        {recentActivities.map((act, idx) => (
                            <div key={idx} className="flex gap-4 group cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/50 p-2 -mx-2 rounded-2xl transition-all">
                                <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110", act.bg)}>
                                    <act.icon size={18} className={act.color} strokeWidth={2.5} />
                                </div>
                                <div className="flex-1 flex flex-col justify-center">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="text-[13px] font-black text-slate-800 dark:text-slate-100 line-clamp-1 pr-2 group-hover:text-blue-600 dark:group-hover:text-blue-450 transition-colors">{act.title}</p>
                                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-505 whitespace-nowrap bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full shadow-sm">{act.time}</span>
                                    </div>
                                    <p className="text-[11px] font-bold text-slate-505 dark:text-slate-400">{act.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Row 4: All Registered Companies */}
            <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden transition-colors duration-300">
                <div className="p-8 border-b border-slate-50/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950/50">
                    <div>
                        <h3 className="text-[18px] font-black text-slate-900 dark:text-slate-100 tracking-tight">Registered Companies</h3>
                        <p className="text-[12px] font-bold text-slate-400 dark:text-slate-505 mt-1 uppercase tracking-widest">TOP REGISTERED ENTITIES</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-505 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search companies..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-[13px] font-bold outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all w-72 shadow-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-505"
                            />
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-100/80 dark:border-slate-800">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">ID</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">Company Name</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">Owner Name</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] text-right">Customers</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] text-right">Meters</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] text-center">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] text-center">Plan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50/80 dark:divide-slate-800/50">
                            {filteredCompanies.map((co, i) => (
                                <tr key={i} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group">
                                    <td className="px-8 py-5 text-[13px] font-black text-slate-400 dark:text-slate-500 group-hover:text-blue-500 transition-colors">{co.id}</td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border border-blue-200/50 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-sm shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform">
                                                {co.logo}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-black text-slate-900 dark:text-slate-100 text-[14px]">{co.name}</span>
                                                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-450">{co.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-400">
                                                {co.owner.charAt(0)}
                                            </div>
                                            <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300">{co.owner}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-[14px] font-black text-slate-800 dark:text-slate-200 text-right">{co.customers}</td>
                                    <td className="px-8 py-5 text-[14px] font-black text-slate-800 dark:text-slate-200 text-right">{co.meters}</td>
                                    <td className="px-8 py-5 text-center">
                                        <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 text-[10px] font-black uppercase tracking-widest shadow-sm">
                                            {co.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <span className={cn(
                                            "text-[12px] font-black px-3 py-1 rounded-xl",
                                            co.plan === "Premium" ? "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400" : (co.plan === "Standard" ? "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400" : "bg-slate-50 dark:bg-slate-850 text-slate-600 dark:text-slate-400")
                                        )}>
                                            {co.plan}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
