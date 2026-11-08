"use client";

import { StatCard } from "@/components/dashboard/StatCard";
import { UsageChart } from "@/components/dashboard/UsageChart";
import { cn } from "@/lib/utils";
import {
    Zap,
    Receipt,
    CreditCard,
    AlertTriangle,
    ArrowUpRight,
    TrendingUp,
    History
} from "lucide-react";
import Link from "next/link";

export default function CustomerDashboard() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">System Overview</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold">Welcome back, Ahmed! Here's what's happening today.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm font-black border border-emerald-100 dark:border-emerald-900/30 flex items-center">
                        <Zap size={16} className="mr-2 fill-current" />
                        System Online
                    </div>
                    <button className="px-6 py-3 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95">
                        Pay Latest Bill
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Current Balance"
                    value="$45.20"
                    subValue="Due in 5 days"
                    icon={Receipt}
                    color="primary"
                />
                <StatCard
                    title="Usage Today"
                    value="12.4"
                    subValue="kWh"
                    icon={Zap}
                    trend={{ value: 12, isUp: true }}
                    color="emerald"
                />
                <StatCard
                    title="Last Payment"
                    value="$38.00"
                    subValue="May 12, 2026"
                    icon={CreditCard}
                    color="purple"
                />
                <StatCard
                    title="Active Alerts"
                    value="None"
                    icon={AlertTriangle}
                    color="gray"
                />
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Usage Chart */}
                <div className="lg:col-span-2">
                    <UsageChart />
                </div>

                {/* Sidebar Cards */}
                <div className="space-y-8">
                    {/* Recent Activity */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/80 shadow-sm dark:shadow-none flex flex-col transition-colors duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center">
                                <History size={18} className="mr-2 text-primary" />
                                Recent Activity
                            </h3>
                            <Link href="#" className="text-xs font-black text-primary uppercase tracking-widest hover:underline">
                                View All
                            </Link>
                        </div>
                        <div className="space-y-4 flex-1">
                            {[
                                { type: "Payment", desc: "Payment processed via EVC Plus", date: "2 days ago", amount: "$38.00", status: "success" },
                                { type: "Alert", desc: "Scheduled maintenance in Mogadishu", date: "4 days ago", amount: null, status: "warning" },
                                { type: "Billing", desc: "Monthly bill generated for April", date: "1 week ago", amount: "$42.50", status: "info" },
                            ].map((activity, i) => (
                                <div key={i} className="flex items-start space-x-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer group">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl shrink-0 flex items-center justify-center transition-colors",
                                        activity.status === "success" ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400" :
                                            activity.status === "warning" ? "bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400" :
                                                "bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                                    )}>
                                        {activity.type === "Payment" ? <CreditCard size={18} /> :
                                            activity.type === "Alert" ? <AlertTriangle size={18} /> : <Receipt size={18} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{activity.desc}</p>
                                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{activity.date}</p>
                                    </div>
                                    {activity.amount && (
                                        <p className="text-sm font-black text-slate-900 dark:text-slate-100">{activity.amount}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Tips */}
                    <div className="bg-gradient-to-br from-primary to-blue-600 p-8 rounded-[2.5rem] shadow-xl shadow-primary/20 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform" />
                        <TrendingUp size={40} className="mb-6 opacity-80" />
                        <h4 className="text-xl font-black mb-2">Save on energy!</h4>
                        <p className="text-blue-100 text-sm font-medium mb-6 leading-relaxed">
                            Switching to LED bulbs and managing peak load can reduce your monthly bill by up to 15%.
                        </p>
                        <button className="flex items-center space-x-2 text-xs font-black uppercase tracking-widest bg-white text-primary px-6 py-3 rounded-xl hover:bg-blue-50 transition-all">
                            <span>See Tips</span>
                            <ArrowUpRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
