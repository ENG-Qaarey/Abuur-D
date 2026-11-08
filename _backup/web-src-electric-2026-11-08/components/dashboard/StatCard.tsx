"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
    title: string;
    value: string;
    subValue?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        isUp: boolean;
        label?: string;
    };
    color?: "primary" | "emerald" | "purple" | "blue" | "orange" | "rose" | "indigo" | "gray" | string;
}

export function StatCard({ title, value, subValue, icon: Icon, trend, color = "primary" }: StatCardProps) {
    const colorStyles = {
        primary: "bg-blue-500/10 text-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.15)]",
        emerald: "bg-emerald-500/10 text-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.15)]",
        purple: "bg-purple-500/10 text-purple-600 shadow-[0_0_15px_rgba(168,85,247,0.15)]",
        blue: "bg-blue-500/10 text-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.15)]",
        orange: "bg-orange-500/10 text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.15)]",
        rose: "bg-rose-500/10 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.15)]",
        indigo: "bg-indigo-500/10 text-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.15)]",
        gray: "bg-slate-500/10 text-slate-600 shadow-[0_0_15px_rgba(100,116,139,0.15)]",
    };

    const gradientStyles = {
        primary: "from-blue-50 to-white dark:from-slate-900 dark:to-slate-950",
        emerald: "from-emerald-50 to-white dark:from-slate-900 dark:to-slate-950",
        purple: "from-purple-50 to-white dark:from-slate-900 dark:to-slate-950",
        blue: "from-blue-50 to-white dark:from-slate-900 dark:to-slate-950",
        orange: "from-orange-50 to-white dark:from-slate-900 dark:to-slate-950",
        rose: "from-rose-50 to-white dark:from-slate-900 dark:to-slate-950",
        indigo: "from-indigo-50 to-white dark:from-slate-900 dark:to-slate-950",
        gray: "from-slate-50 to-white dark:from-slate-900 dark:to-slate-950",
    };

    const bgGradient = gradientStyles[color as keyof typeof gradientStyles] || gradientStyles.primary;
    const iconStyle = colorStyles[color as keyof typeof colorStyles] || colorStyles.primary;

    const glowColors = {
        primary: {
            "--glow-color-1": "rgba(59, 130, 246, 0.22)",
            "--glow-color-2": "rgba(99, 102, 241, 0.45)",
            "--glow-color-shadow-2": "rgba(99, 102, 241, 0.1)"
        },
        emerald: {
            "--glow-color-1": "rgba(16, 185, 129, 0.22)",
            "--glow-color-2": "rgba(52, 211, 153, 0.45)",
            "--glow-color-shadow-2": "rgba(52, 211, 153, 0.1)"
        },
        purple: {
            "--glow-color-1": "rgba(168, 85, 247, 0.22)",
            "--glow-color-2": "rgba(192, 132, 252, 0.45)",
            "--glow-color-shadow-2": "rgba(192, 132, 252, 0.1)"
        },
        blue: {
            "--glow-color-1": "rgba(59, 130, 246, 0.22)",
            "--glow-color-2": "rgba(147, 197, 253, 0.45)",
            "--glow-color-shadow-2": "rgba(147, 197, 253, 0.1)"
        },
        orange: {
            "--glow-color-1": "rgba(249, 115, 22, 0.22)",
            "--glow-color-2": "rgba(253, 186, 116, 0.45)",
            "--glow-color-shadow-2": "rgba(253, 186, 116, 0.1)"
        },
        rose: {
            "--glow-color-1": "rgba(244, 63, 94, 0.22)",
            "--glow-color-2": "rgba(251, 113, 133, 0.45)",
            "--glow-color-shadow-2": "rgba(251, 113, 133, 0.1)"
        },
        indigo: {
            "--glow-color-1": "rgba(99, 102, 241, 0.22)",
            "--glow-color-2": "rgba(165, 180, 252, 0.45)",
            "--glow-color-shadow-2": "rgba(165, 180, 252, 0.1)"
        },
        gray: {
            "--glow-color-1": "rgba(100, 116, 139, 0.15)",
            "--glow-color-2": "rgba(148, 163, 184, 0.35)",
            "--glow-color-shadow-2": "rgba(148, 163, 184, 0.06)"
        }
    };

    const glowStyle = (glowColors[color as keyof typeof glowColors] || glowColors.primary) as React.CSSProperties;

    return (
        <div 
            style={glowStyle}
            className={cn(
                "relative overflow-hidden p-4.5 rounded-[24px] border border-white/60 dark:border-slate-800/80 shadow-sm dark:shadow-none transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-2xl dark:hover:shadow-slate-950/20 hover:border-slate-200/60 dark:hover:border-slate-700/80 transition-colors duration-300 dark:bg-slate-900 dark:text-slate-200 animate-glow-border",
                `bg-gradient-to-br ${bgGradient}`
            )}
        >
            {/* Subtle Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(15,23,42,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.1)_1px,transparent_1px)] bg-[size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 dark:opacity-40 pointer-events-none" />
            
            <div className="relative z-10 flex items-start justify-between mb-3">
                <div className={cn(
                    "p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
                    iconStyle
                )}>
                    <Icon size={18} strokeWidth={2.5} />
                </div>
                {trend && (
                    <div className="flex flex-col items-end">
                        <div className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase flex items-center gap-1 shadow-sm transition-colors",
                            trend.isUp 
                                ? "bg-emerald-100 text-emerald-700 border border-emerald-200/50 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/40" 
                                : "bg-red-100 text-red-700 border border-red-200/50 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/40"
                        )}>
                            <span>{trend.isUp ? "↑" : "↓"}</span>
                            {Math.abs(trend.value)}{trend.value === 0 ? "" : "%"}
                        </div>
                    </div>
                )}
            </div>
            
            <div className="relative z-10">
                <h4 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-0.5">{title}</h4>
                <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{value}</span>
                    {subValue && <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">{subValue}</span>}
                </div>
                {trend && trend.label && (
                    <p className="text-[10px] font-bold text-slate-455 dark:text-slate-500 mt-1.5">{trend.label}</p>
                )}
            </div>
        </div>
    );
}
