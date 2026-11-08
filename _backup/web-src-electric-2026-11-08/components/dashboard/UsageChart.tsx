"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import { useTheme } from "@/components/theme-provider";
import { useState, useEffect } from "react";

const data = [
    { name: "Mon", usage: 12 },
    { name: "Tue", usage: 15 },
    { name: "Wed", usage: 10 },
    { name: "Thu", usage: 18 },
    { name: "Fri", usage: 22 },
    { name: "Sat", usage: 25 },
    { name: "Sun", usage: 14 },
];

export function UsageChart() {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isDark = mounted && resolvedTheme === "dark";

    return (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/80 shadow-sm dark:shadow-none h-[400px] w-full flex flex-col transition-colors duration-300">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Electricity Usage</h3>
                    <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Last 7 Days (kWh)</p>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1.5">
                        <div className="w-2.5 h-2.5 bg-primary rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Current Week</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={isDark ? 0.4 : 0.2} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#f1f5f9"} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: isDark ? "#64748b" : "#94a3b8", fontSize: 12, fontWeight: 700 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: isDark ? "#64748b" : "#94a3b8", fontSize: 12, fontWeight: 700 }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: isDark ? "#1e293b" : "#fff",
                                borderRadius: "16px",
                                border: isDark ? "1px solid #334155" : "none",
                                boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                                color: isDark ? "#f8fafc" : "#0f172a"
                            }}
                            labelStyle={{ fontWeight: 800, marginBottom: "4px", color: isDark ? "#94a3b8" : "#64748b" }}
                            itemStyle={{ color: isDark ? "#3b82f6" : "#2563eb" }}
                        />
                        <Area
                            type="monotone"
                            dataKey="usage"
                            stroke="#3b82f6"
                            strokeWidth={4}
                            fillOpacity={1}
                            fill="url(#colorUsage)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
