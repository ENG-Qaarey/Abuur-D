"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
    Building2, Users, LayoutDashboard, CreditCard, Zap, FileText,
    Settings, Shield, Bell, Database, Globe, Lock,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Action = "view" | "create" | "edit" | "delete";

type Module = {
    id: string;
    name: string;
    description: string;
    icon: React.ElementType;
    iconColor: string;
    category: string;
};

type PermissionState = Record<string, Record<Action, boolean>>;

// ─── Modules config ───────────────────────────────────────────────────────────

const modules: Module[] = [
    { id: "dashboard", name: "Dashboard", description: "System overview & analytics", icon: LayoutDashboard, iconColor: "text-blue-500 bg-blue-500/10 border-blue-500/20", category: "Core" },
    { id: "companies", name: "Companies", description: "Company accounts & profiles", icon: Building2, iconColor: "text-violet-500 bg-violet-500/10 border-violet-500/20", category: "Core" },
    { id: "users", name: "Users", description: "User accounts & authentication", icon: Users, iconColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", category: "Core" },
    { id: "roles", name: "Roles & Permissions", description: "Access control management", icon: Shield, iconColor: "text-red-500 bg-red-500/10 border-red-500/20", category: "Core" },
    { id: "billing", name: "Billing", description: "Plans, invoices & payments", icon: CreditCard, iconColor: "text-amber-500 bg-amber-500/10 border-amber-500/20", category: "Finance" },
    { id: "meters", name: "Meters", description: "Energy meter management", icon: Zap, iconColor: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20", category: "Operations" },
    { id: "reports", name: "Reports", description: "Analytics & export reports", icon: FileText, iconColor: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20", category: "Analytics" },
    { id: "notifications", name: "Notifications", description: "Alerts & notification rules", icon: Bell, iconColor: "text-pink-500 bg-pink-500/10 border-pink-500/20", category: "System" },
    { id: "settings", name: "Settings", description: "Global system configuration", icon: Settings, iconColor: "text-slate-500 bg-slate-500/10 border-slate-500/20", category: "System" },
    { id: "database", name: "Database", description: "Data export & backup ops", icon: Database, iconColor: "text-teal-500 bg-teal-500/10 border-teal-500/20", category: "System" },
    { id: "integrations", name: "Integrations", description: "Third-party API connections", icon: Globe, iconColor: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20", category: "System" },
    { id: "audit", name: "Audit Logs", description: "Activity & security audit trail", icon: Lock, iconColor: "text-orange-500 bg-orange-500/10 border-orange-500/20", category: "Security" },
];

const actions: Action[] = ["view", "create", "edit", "delete"];

const actionColors: Record<Action, string> = {
    view: "text-blue-600 dark:text-blue-400",
    create: "text-emerald-600 dark:text-emerald-400",
    edit: "text-amber-600 dark:text-amber-400",
    delete: "text-red-600 dark:text-red-400",
};

const actionBgActive: Record<Action, string> = {
    view: "bg-blue-600",
    create: "bg-emerald-600",
    edit: "bg-amber-500",
    delete: "bg-red-500",
};

const actionFocusRing: Record<Action, string> = {
    view: "focus:ring-blue-500/30",
    create: "focus:ring-emerald-500/30",
    edit: "focus:ring-amber-500/30",
    delete: "focus:ring-red-500/30",
};

// ─── Build initial state (all enabled for demo) ───────────────────────────────

function buildInitialState(): PermissionState {
    const state: PermissionState = {};
    modules.forEach(m => {
        state[m.id] = {
            view: true,
            create: m.id !== "audit" && m.id !== "database",
            edit: m.id !== "audit" && m.id !== "database",
            delete: m.id !== "audit" && m.id !== "dashboard" && m.id !== "database",
        };
    });
    return state;
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────

function ToggleSwitch({
    checked,
    onChange,
    action,
}: {
    checked: boolean;
    onChange: (v: boolean) => void;
    action: Action;
}) {
    return (
        <button
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={cn(
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1",
                checked
                    ? `${actionBgActive[action]} ${actionFocusRing[action]}`
                    : "bg-slate-200 dark:bg-slate-700 focus:ring-slate-400/30"
            )}
        >
            <span
                className={cn(
                    "pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200",
                    checked ? "translate-x-4" : "translate-x-0"
                )}
            />
        </button>
    );
}

// ─── Category badge ───────────────────────────────────────────────────────────

const categoryColors: Record<string, string> = {
    Core: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    Finance: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    Operations: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
    Analytics: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
    System: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
    Security: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PermissionsGrid({ searchQuery = "" }: { searchQuery?: string }) {
    const [perms, setPerms] = useState<PermissionState>(buildInitialState);
    const [lastSavedPerms, setLastSavedPerms] = useState<PermissionState>(buildInitialState);
    const [saveNotice, setSaveNotice] = useState("");
    const saveNoticeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearSaveNoticeTimeout = () => {
        if (saveNoticeTimeoutRef.current) {
            clearTimeout(saveNoticeTimeoutRef.current);
            saveNoticeTimeoutRef.current = null;
        }
    };

    const scheduleSaveNoticeClear = () => {
        clearSaveNoticeTimeout();
        saveNoticeTimeoutRef.current = setTimeout(() => {
            setSaveNotice("");
            saveNoticeTimeoutRef.current = null;
        }, 4000);
    };

    const toggle = (moduleId: string, action: Action, value: boolean) => {
        setPerms(prev => ({
            ...prev,
            [moduleId]: { ...prev[moduleId], [action]: value },
        }));
    };

    const toggleAll = (moduleId: string, value: boolean) => {
        setPerms(prev => ({
            ...prev,
            [moduleId]: { view: value, create: value, edit: value, delete: value },
        }));
    };

    const filteredModules = modules.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group by category
    const categories = Array.from(new Set(filteredModules.map(m => m.category)));

    const enabledCount = Object.values(perms).reduce((sum, p) =>
        sum + Object.values(p).filter(Boolean).length, 0
    );
    const totalCount = modules.length * actions.length;
    const isDirty = JSON.stringify(perms) !== JSON.stringify(lastSavedPerms);

    const handleReset = () => {
        setPerms(lastSavedPerms);
        setSaveNotice("Changes were reset.");
        scheduleSaveNoticeClear();
    };

    const handleSaveChanges = () => {
        setLastSavedPerms(perms);
        setSaveNotice("Permissions saved.");
        scheduleSaveNoticeClear();
    };

    useEffect(() => {
        setSaveNotice("");
        clearSaveNoticeTimeout();
    }, [perms]);

    useEffect(() => {
        return () => {
            clearSaveNoticeTimeout();
        };
    }, []);

    return (
        <div className="space-y-6">
            {/* ── Summary Bar ─────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-[#1a2744] min-w-0">
                <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Permission Matrix</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {enabledCount} of {totalCount} permissions enabled across {modules.length} modules
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] font-bold text-slate-400 dark:text-slate-500">
                    {actions.map(a => (
                        <span key={a} className={cn("flex items-center gap-1.5 uppercase tracking-wider", actionColors[a])}>
                            <span className={cn("w-2 h-2 rounded-full", actionBgActive[a])} />
                            {a}
                        </span>
                    ))}
                </div>
            </div>

            {/* ── Modules by Category ──────────────────────────────────── */}
            {filteredModules.length === 0 ? (
                <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-sm font-medium">
                    No modules match your search.
                </div>
            ) : (
                <div className="space-y-6">
                    {categories.map(category => (
                        <div key={category}>
                            {/* Category Heading */}
                            <div className="flex items-center gap-2 mb-3">
                                <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border", categoryColors[category] || "bg-slate-100 text-slate-500 border-slate-200")}>
                                    {category}
                                </span>
                                <div className="flex-1 h-px bg-slate-100 dark:bg-[#1a2744]" />
                            </div>

                            {/* Module Rows */}
                            <div className="space-y-2">
                                {filteredModules.filter(m => m.category === category).map(m => {
                                    const IconComp = m.icon;
                                    const allEnabled = actions.every(a => perms[m.id]?.[a]);
                                    const someEnabled = actions.some(a => perms[m.id]?.[a]);

                                    return (
                                        <div
                                            key={m.id}
                                            className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] border border-slate-100 dark:border-[#1a2744] hover:border-slate-200 dark:hover:border-[#1e2d4a] px-4 py-3.5 transition-all"
                                        >
                                            {/* Module Identity */}
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className={cn("w-8 h-8 rounded-lg border flex items-center justify-center shrink-0", m.iconColor)}>
                                                    <IconComp size={15} className="stroke-[2]" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{m.name}</div>
                                                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate">{m.description}</div>
                                                </div>
                                            </div>

                                            {/* Toggle All */}
                                            <div className="flex items-center gap-1.5 shrink-0 mr-4">
                                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">All</span>
                                                <button
                                                    onClick={() => toggleAll(m.id, !allEnabled)}
                                                    className={cn(
                                                        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-all duration-200",
                                                        allEnabled
                                                            ? "bg-violet-600"
                                                            : someEnabled
                                                                ? "bg-violet-400/50"
                                                                : "bg-slate-200 dark:bg-slate-700"
                                                    )}
                                                >
                                                    <span className={cn(
                                                        "pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200",
                                                        allEnabled ? "translate-x-4" : "translate-x-0"
                                                    )} />
                                                </button>
                                            </div>

                                            {/* Per-Action Toggles */}
                                            <div className="flex items-center gap-4 sm:gap-5 shrink-0">
                                                {actions.map(action => (
                                                    <div key={action} className="flex flex-col items-center gap-1.5">
                                                        <span className={cn("text-[9px] font-extrabold uppercase tracking-wider", actionColors[action])}>
                                                            {action}
                                                        </span>
                                                        <ToggleSwitch
                                                            checked={perms[m.id]?.[action] ?? false}
                                                            onChange={(v) => toggle(m.id, action, v)}
                                                            action={action}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Save Bar ─────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-[#1a2744]">
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium min-w-0">
                    Changes apply to all users with this permission set
                </p>
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={handleReset}
                        disabled={!isDirty}
                        className="h-9 px-4 rounded-xl border border-slate-200 dark:border-[#1e2d4a] text-slate-600 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-all bg-transparent disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Reset
                    </button>
                    <button
                        type="button"
                        onClick={handleSaveChanges}
                        disabled={!isDirty}
                        className="h-9 px-5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-sm font-bold transition-all shadow-md shadow-blue-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
            {saveNotice && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{saveNotice}</p>
            )}
        </div>
    );
}
