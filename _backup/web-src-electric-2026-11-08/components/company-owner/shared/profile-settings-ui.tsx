"use client";

import { ChevronDown, RotateCcw } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const coInputCls =
    "w-full px-4 py-3 rounded-xl bg-white dark:bg-[#0f1629] border border-slate-200 dark:border-[#1e2d4a] text-slate-900 dark:text-slate-100 text-sm font-medium outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 placeholder:text-slate-400 dark:placeholder:text-slate-600";

export const coSelectCls =
    "w-full px-4 py-3 rounded-xl bg-white dark:bg-[#0f1629] border border-slate-200 dark:border-[#1e2d4a] text-slate-900 dark:text-slate-100 text-sm font-medium outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer appearance-none pr-10";

export function CoField({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
    return (
        <div className="space-y-2">
            <label className="block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</label>
            {children}
            {hint && <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">{hint}</p>}
        </div>
    );
}

export function CoSelectWrapper({ children }: { children: ReactNode }) {
    return (
        <div className="relative">
            {children}
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
    );
}

export function CoToggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            onClick={() => onChange(!checked)}
            className={cn(
                "relative h-6 w-11 rounded-full transition-colors outline-none shrink-0",
                checked ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700",
            )}
        >
            <span
                className={cn(
                    "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                    checked ? "translate-x-5" : "translate-x-0",
                )}
            />
        </button>
    );
}

export function CoPrimaryButton({
    children,
    type = "button",
    onClick,
    className,
}: {
    children: ReactNode;
    type?: "button" | "submit";
    onClick?: () => void;
    className?: string;
}) {
    return (
        <button
            type={type}
            onClick={onClick}
            className={cn(
                "co-owner-btn-primary px-8 py-3 text-white font-bold text-sm rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20",
                className,
            )}
        >
            {children}
        </button>
    );
}

export function CoSecondaryButton({
    children,
    onClick,
    className,
}: {
    children: ReactNode;
    onClick?: () => void;
    className?: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "px-5 py-2.5 border border-slate-200 dark:border-[#1e2d4a] text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl hover:bg-emerald-500/5 hover:border-emerald-500/30 transition-all",
                className,
            )}
        >
            {children}
        </button>
    );
}

export function VerifiedBadge({ className }: { className?: string }) {
    return (
        <svg className={cn("w-4.5 h-4.5 text-emerald-500 fill-current shrink-0", className)} viewBox="0 0 24 24">
            <path d="M23 12l-2.44-2.78.34-3.68-3.61-.82-1.89-3.18L12 3 8.6 1.54 6.71 4.72l-3.61.81.34 3.68L1 12l2.44 2.78-.34 3.69 3.61.82 1.89 3.18L12 21l3.4 1.46 1.89-3.18 3.61-.82-.34-3.68L23 12zm-13 5l-4-4 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
    );
}

export function CoCard({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div className={cn("co-owner-card bg-white dark:bg-[#0a1628] border border-slate-100 dark:border-[#1a2744] rounded-2xl shadow-sm", className)}>
            {children}
        </div>
    );
}

export function CoSectionHeader({
    title,
    description,
    icon: Icon,
}: {
    title: string;
    description: string;
    icon?: LucideIcon;
}) {
    return (
        <div className="flex items-start gap-3">
            {Icon && (
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-emerald-600 dark:text-emerald-400" />
                </div>
            )}
            <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
                <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5 font-medium">{description}</p>
            </div>
        </div>
    );
}

export function CoHeroBanner({
    badge,
    title,
    description,
    graphic,
    actions,
}: {
    badge: string;
    title: string;
    description: string;
    graphic?: ReactNode;
    actions?: ReactNode;
}) {
    return (
        <div className="relative min-h-[9rem] overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800 dark:from-[#064e3b] dark:via-[#0c4a6e] dark:to-[#0a1628] border border-emerald-500/10 dark:border-[#1a2744]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.12),transparent_55%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(0,0,0,0.08),transparent_50%)]" />
            <svg className="absolute bottom-0 right-0 opacity-20 w-full max-w-md h-24" viewBox="0 0 300 100" fill="none" preserveAspectRatio="none">
                <path d="M0 50 Q75 0 150 50 Q225 100 300 50" stroke="#6ee7b7" strokeWidth="2" />
                <path d="M0 70 Q75 20 150 70 Q225 120 300 70" stroke="#34d399" strokeWidth="1.5" opacity="0.6" />
            </svg>
            {graphic}
            <div className="relative z-10 p-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/15 backdrop-blur-sm text-[9px] font-black uppercase tracking-wider text-emerald-50 border border-white/10">
                        {badge}
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">{title}</h1>
                    <p className="text-emerald-100/90 dark:text-slate-400 text-sm mt-1 font-medium max-w-xl">{description}</p>
                </div>
                {actions && <div className="flex flex-wrap gap-2 shrink-0">{actions}</div>}
            </div>
        </div>
    );
}

export function CoStatPill({ label, value, trend }: { label: string; value: string; trend?: string }) {
    return (
        <div className="co-owner-card bg-white dark:bg-[#0a1628] border border-slate-100 dark:border-[#1a2744] rounded-2xl p-4 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{value}</p>
            {trend && <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">{trend}</p>}
        </div>
    );
}

export function PasswordStrengthBar({ password }: { password: string }) {
    const score =
        !password ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) ? 4 : 3;
    const labels = ["", "Weak", "Fair", "Good", "Strong"];
    const colors = ["bg-slate-200", "bg-red-500", "bg-amber-500", "bg-emerald-400", "bg-emerald-600"];

    if (!password) return null;

    return (
        <div className="space-y-1.5">
            <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={cn("h-1 flex-1 rounded-full transition-colors", i <= score ? colors[score] : "bg-slate-200 dark:bg-slate-700")} />
                ))}
            </div>
            <p className="text-[10px] font-bold text-slate-500">
                Strength: <span className={score >= 3 ? "text-emerald-600" : score === 2 ? "text-amber-600" : "text-red-500"}>{labels[score]}</span>
            </p>
        </div>
    );
}

export function ProfileCompletionBar({ percent }: { percent: number }) {
    return (
        <div className="w-full">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                <span>Profile completion</span>
                <span className="text-emerald-600 dark:text-emerald-400">{percent}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 dark:bg-[#1a2744] overflow-hidden">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500"
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
}

export function CoSaveBar({
    saved,
    savedMessage,
    actionMessage,
    onSave,
    onReset,
    resetLabel = "Reset",
}: {
    saved: boolean;
    savedMessage: string;
    actionMessage?: string;
    onSave: () => void;
    onReset?: () => void;
    resetLabel?: string;
}) {
    return (
        <div className="sticky bottom-0 z-20 -mx-1 px-1 pt-4 pb-1 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent dark:from-slate-950 dark:via-slate-950/95">
            <div className="co-owner-card bg-white/95 dark:bg-[#0a1628]/95 backdrop-blur-md border border-slate-200 dark:border-[#1a2744] rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex-1 w-full min-h-[2.5rem] flex items-center">
                    {actionMessage && (
                        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            {actionMessage}
                        </p>
                    )}
                    {saved && !actionMessage && (
                        <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">✓ {savedMessage}</p>
                    )}
                    {!saved && !actionMessage && (
                        <p className="text-xs text-slate-400 font-medium">Changes are saved to your company workspace.</p>
                    )}
                </div>
                <div className="flex w-full sm:w-auto gap-2 shrink-0">
                    {onReset && (
                        <CoSecondaryButton onClick={onReset} className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5">
                            <RotateCcw size={14} />
                            {resetLabel}
                        </CoSecondaryButton>
                    )}
                    <CoPrimaryButton onClick={onSave} className="flex-1 sm:flex-none">
                        Save changes
                    </CoPrimaryButton>
                </div>
            </div>
        </div>
    );
}
