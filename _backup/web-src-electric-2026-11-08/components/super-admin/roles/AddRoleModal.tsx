"use client";

import React, { useState } from "react";
import { ModalShell } from "../companies/ModalShell";
import { cn } from "@/lib/utils";
import {
    Crown, User, Briefcase, Wrench, Headset, DollarSign,
    Shield, Eye, FileText, Check, ChevronRight, ChevronDown,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Action = "view" | "create" | "edit" | "delete";

type PermModule = {
    id: string;
    name: string;
};

const permModules: PermModule[] = [
    { id: "dashboard", name: "Dashboard" },
    { id: "companies", name: "Companies" },
    { id: "users", name: "Users" },
    { id: "billing", name: "Billing" },
    { id: "meters", name: "Meters" },
    { id: "reports", name: "Reports" },
    { id: "settings", name: "Settings" },
    { id: "audit", name: "Audit Logs" },
];

const actions: Action[] = ["view", "create", "edit", "delete"];

const actionColors: Record<Action, string> = {
    view: "bg-blue-500",
    create: "bg-emerald-500",
    edit: "bg-amber-500",
    delete: "bg-red-500",
};

type PermState = Record<string, Record<Action, boolean>>;

function buildDefault(): PermState {
    const state: PermState = {};
    permModules.forEach(m => {
        state[m.id] = { view: false, create: false, edit: false, delete: false };
    });
    return state;
}

// ─── Icon options ────────────────────────────────────────────────────────────

const iconOptions = [
    { icon: Crown, label: "Crown", color: "text-purple-500 bg-purple-500/10 border-purple-500/25" },
    { icon: Shield, label: "Shield", color: "text-blue-500 bg-blue-500/10 border-blue-500/25" },
    { icon: Briefcase, label: "Manager", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/25" },
    { icon: Wrench, label: "Tech", color: "text-amber-500 bg-amber-500/10 border-amber-500/25" },
    { icon: Headset, label: "Support", color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/25" },
    { icon: DollarSign, label: "Finance", color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/25" },
    { icon: Eye, label: "Viewer", color: "text-rose-500 bg-rose-500/10 border-rose-500/25" },
    { icon: FileText, label: "Auditor", color: "text-slate-500 bg-slate-500/10 border-slate-500/25" },
    { icon: User, label: "Default", color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/25" },
];

// ─── Steps ───────────────────────────────────────────────────────────────────

type Step = "details" | "permissions" | "review";
const steps: Step[] = ["details", "permissions", "review"];

// ─── Props ───────────────────────────────────────────────────────────────────

type Props = { open: boolean; onClose: () => void };

// ─── Component ───────────────────────────────────────────────────────────────

export default function AddRoleModal({ open, onClose }: Props) {
    const [step, setStep] = useState<Step>("details");
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    const [selectedIconIdx, setSelectedIconIdx] = useState(1);
    const [perms, setPerms] = useState<PermState>(buildDefault);
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(permModules.map(m => m.id)));

    if (!open) return null;

    const stepIdx = steps.indexOf(step);

    function toggleAction(moduleId: string, action: Action) {
        setPerms(prev => ({
            ...prev,
            [moduleId]: { ...prev[moduleId], [action]: !prev[moduleId][action] },
        }));
    }

    function toggleAll(moduleId: string) {
        const allOn = actions.every(a => perms[moduleId][a]);
        setPerms(prev => ({
            ...prev,
            [moduleId]: { view: !allOn, create: !allOn, edit: !allOn, delete: !allOn },
        }));
    }

    function toggleExpand(moduleId: string) {
        setExpandedModules(prev => {
            const next = new Set(prev);
            next.has(moduleId) ? next.delete(moduleId) : next.add(moduleId);
            return next;
        });
    }

    function save() {
        console.log("Create role", { name, desc, selectedIconIdx, perms });
        // Reset
        setStep("details");
        setName("");
        setDesc("");
        setSelectedIconIdx(1);
        setPerms(buildDefault());
        onClose();
    }

    const totalPerms = Object.values(perms).reduce((sum, p) => sum + Object.values(p).filter(Boolean).length, 0);
    const SelectedIcon = iconOptions[selectedIconIdx].icon;

    return (
        <ModalShell
            title="Add New Role"
            subtitle="Define role details, assign permissions, then review"
            onClose={onClose}
            maxWidth="max-w-xl"
        >
            {/* ── Step Indicator ─────────────────────────────────────────── */}
            <div className="flex items-center gap-0 px-6 pt-2 pb-5 border-b border-slate-100 dark:border-[#1a2744]">
                {(["details", "permissions", "review"] as Step[]).map((s, i) => (
                    <React.Fragment key={s}>
                        <button
                            onClick={() => {
                                if (i <= stepIdx || (i === 1 && name.trim())) setStep(s);
                            }}
                            className={cn(
                                "flex items-center gap-2 text-xs font-bold transition-all",
                                step === s
                                    ? "text-blue-600 dark:text-blue-400"
                                    : i < stepIdx
                                        ? "text-emerald-600 dark:text-emerald-400"
                                        : "text-slate-400 dark:text-slate-600"
                            )}
                        >
                            <span className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold border-2",
                                step === s
                                    ? "bg-blue-600 border-blue-600 text-white"
                                    : i < stepIdx
                                        ? "bg-emerald-500 border-emerald-500 text-white"
                                        : "border-slate-200 dark:border-slate-700 text-slate-400"
                            )}>
                                {i < stepIdx ? <Check size={10} /> : i + 1}
                            </span>
                            <span className="capitalize hidden sm:block">{s}</span>
                        </button>
                        {i < 2 && (
                            <div className={cn(
                                "flex-1 h-px mx-3",
                                i < stepIdx ? "bg-emerald-400" : "bg-slate-100 dark:bg-[#1a2744]"
                            )} />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* ── Step: Details ─────────────────────────────────────────── */}
            {step === "details" && (
                <div className="p-6 space-y-5">
                    {/* Icon Picker */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
                            Role Icon
                        </label>
                        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Role icon">
                            {iconOptions.map((opt, i) => {
                                const Icon = opt.icon;
                                return (
                                    <button
                                        key={opt.label}
                                        onClick={() => setSelectedIconIdx(i)}
                                        type="button"
                                        role="radio"
                                        aria-checked={i === selectedIconIdx}
                                        aria-label={opt.label}
                                        className={cn(
                                            "w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all",
                                            opt.color,
                                            i === selectedIconIdx ? "border-current shadow-md scale-110" : "border-transparent opacity-60 hover:opacity-100"
                                        )}
                                        title={opt.label}
                                    >
                                        <Icon size={17} className="stroke-[2]" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Role Name */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                            Role Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Field Supervisor"
                            className="w-full h-10 px-4 rounded-xl bg-slate-50 dark:bg-[#0f1629] border border-slate-200 dark:border-[#1e2d4a] text-slate-900 dark:text-slate-100 text-sm font-medium outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                            Description
                        </label>
                        <textarea
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            placeholder="Describe what this role can do..."
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#0f1629] border border-slate-200 dark:border-[#1e2d4a] text-slate-900 dark:text-slate-100 text-sm font-medium outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none"
                        />
                    </div>

                    {/* Preview */}
                    {name && (
                        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20">
                            <div className={cn("w-9 h-9 rounded-xl border flex items-center justify-center shrink-0", iconOptions[selectedIconIdx].color)}>
                                <SelectedIcon size={16} className="stroke-[2]" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{name}</div>
                                {desc && <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</div>}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── Step: Permissions ─────────────────────────────────────── */}
            {step === "permissions" && (
                <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                            {totalPerms} permission{totalPerms !== 1 ? "s" : ""} selected
                        </p>
                        <div className="flex gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {actions.map(a => (
                                <span key={a} className="flex items-center gap-1">
                                    <span className={cn("w-2 h-2 rounded-full", actionColors[a])} />
                                    {a}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                        {permModules.map(m => {
                            const expanded = expandedModules.has(m.id);
                            const allOn = actions.every(a => perms[m.id][a]);
                            const someOn = actions.some(a => perms[m.id][a]);

                            return (
                                <div key={m.id} className="rounded-xl border border-slate-100 dark:border-[#1a2744] overflow-hidden">
                                    {/* Module header row */}
                                    <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50/80 dark:bg-white/[0.02]">
                                        <button
                                            onClick={() => toggleExpand(m.id)}
                                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                        >
                                            {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                                        </button>
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex-1">{m.name}</span>
                                        {/* Toggle all */}
                                        <button
                                            onClick={() => toggleAll(m.id)}
                                            className={cn(
                                                "text-[10px] font-extrabold px-2.5 py-1 rounded-lg border transition-all",
                                                allOn
                                                    ? "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20"
                                                    : someOn
                                                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"
                                            )}
                                        >
                                            {allOn ? "All On" : someOn ? "Partial" : "None"}
                                        </button>
                                    </div>

                                    {/* Action toggles */}
                                    {expanded && (
                                        <div className="grid grid-cols-4 gap-1 px-4 py-3">
                                            {actions.map(action => {
                                                const on = perms[m.id][action];
                                                return (
                                                    <button
                                                        key={action}
                                                        onClick={() => toggleAction(m.id, action)}
                                                        className={cn(
                                                            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-bold capitalize transition-all",
                                                            on
                                                                ? `${actionColors[action]} text-white border-transparent`
                                                                : "bg-transparent text-slate-400 border-slate-200 dark:border-[#1e2d4a] hover:border-slate-300"
                                                        )}
                                                    >
                                                        {on && <Check size={10} className="shrink-0" />}
                                                        {action}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Step: Review ─────────────────────────────────────────── */}
            {step === "review" && (
                <div className="p-6 space-y-4">
                    {/* Role Preview */}
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-[#1a2744]">
                        <div className={cn("w-11 h-11 rounded-xl border-2 flex items-center justify-center shrink-0", iconOptions[selectedIconIdx].color)}>
                            <SelectedIcon size={20} className="stroke-[2]" />
                        </div>
                        <div>
                            <div className="text-base font-black text-slate-900 dark:text-slate-100">{name || "(unnamed)"}</div>
                            <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{desc || "No description"}</div>
                        </div>
                        <div className="ml-auto text-right">
                            <div className="text-xl font-black text-violet-600 dark:text-violet-400">{totalPerms}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">permissions</div>
                        </div>
                    </div>

                    {/* Permission Summary */}
                    <div className="space-y-1.5">
                        {permModules.map(m => {
                            const enabled = actions.filter(a => perms[m.id][a]);
                            if (enabled.length === 0) return null;
                            return (
                                <div key={m.id} className="flex items-center gap-2 text-xs">
                                    <span className="font-bold text-slate-700 dark:text-slate-300 w-32 shrink-0">{m.name}</span>
                                    <div className="flex gap-1 flex-wrap">
                                        {enabled.map(a => (
                                            <span key={a} className={cn(
                                                "px-1.5 py-0.5 rounded text-[10px] font-extrabold capitalize text-white",
                                                actionColors[a]
                                            )}>{a}</span>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                        {totalPerms === 0 && (
                            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                                ⚠ No permissions selected. The role will have no access.
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* ── Footer ───────────────────────────────────────────────── */}
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 dark:border-[#1a2744] bg-slate-50/50 dark:bg-white/[0.01]">
                <button
                    onClick={() => stepIdx === 0 ? onClose() : setStep(steps[stepIdx - 1])}
                    className="h-10 px-4 rounded-xl border border-slate-200 dark:border-[#1e2d4a] text-slate-600 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-white/5 transition-all bg-transparent"
                >
                    {stepIdx === 0 ? "Cancel" : "Back"}
                </button>

                {step !== "review" ? (
                    <button
                        disabled={step === "details" && !name.trim()}
                        onClick={() => setStep(steps[stepIdx + 1])}
                        className="h-10 px-5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-sm font-bold transition-all shadow-md shadow-blue-500/10 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Continue →
                    </button>
                ) : (
                    <button
                        onClick={save}
                        className="h-10 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold transition-all shadow-md shadow-emerald-500/10 flex items-center gap-2"
                    >
                        <Check size={15} /> Create Role
                    </button>
                )}
            </div>
        </ModalShell>
    );
}
