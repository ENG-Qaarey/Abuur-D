"use client";

import { Palette, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    BRAND_COLOR_PRESETS,
    DEFAULT_COMPANY_BRAND_COLORS,
    type CompanyBrandColors,
    normalizeHex,
} from "@/lib/brand-colors";
import { CoField } from "./profile-settings-ui";

type ColorKey = keyof CompanyBrandColors;

const COLOR_FIELDS: { key: ColorKey; label: string; hint: string }[] = [
    { key: "primaryColor", label: "Primary brand color", hint: "Buttons, active nav, main accents" },
    { key: "secondaryColor", label: "Secondary accent", hint: "Gradients, links, highlights" },
    { key: "sidebarDepthColor", label: "Sidebar depth", hint: "Bottom of sidebar gradient" },
];

export function CompanyBrandColorsEditor({
    colors,
    onChange,
    onApplyPreset,
    className,
}: {
    colors: CompanyBrandColors;
    onChange: (colors: CompanyBrandColors) => void;
    onApplyPreset?: (colors: CompanyBrandColors) => void;
    className?: string;
}) {
    const update = (key: ColorKey, raw: string) => {
        const fallback = DEFAULT_COMPANY_BRAND_COLORS[key];
        onChange({ ...colors, [key]: normalizeHex(raw, fallback) });
    };

    const applyPreset = (preset: CompanyBrandColors) => {
        onChange(preset);
        onApplyPreset?.(preset);
    };

    return (
        <div className={cn("space-y-5", className)}>
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <Palette size={16} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Company colors</p>
                        <p className="text-[11px] text-slate-500">Applied to your dashboard, bills, and customer touchpoints.</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => applyPreset(DEFAULT_COMPANY_BRAND_COLORS)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#1e2d4a] rounded-lg hover:bg-slate-50 dark:hover:bg-white/5"
                >
                    <RotateCcw size={12} /> Reset defaults
                </button>
            </div>

            <div className="flex gap-2 p-3 rounded-xl bg-slate-50 dark:bg-[#0f1629] border border-slate-100 dark:border-[#1e2d4a]">
                <div
                    className="h-12 flex-1 rounded-lg shadow-inner"
                    style={{ background: `linear-gradient(135deg, ${colors.primaryColor}, ${colors.secondaryColor})` }}
                />
                <div className="w-12 h-12 rounded-lg border border-slate-200 dark:border-[#1e2d4a]" style={{ backgroundColor: colors.sidebarDepthColor }} title="Sidebar depth" />
            </div>

            <div className="space-y-4">
                {COLOR_FIELDS.map(({ key, label, hint }) => (
                    <CoField key={key} label={label} hint={hint}>
                        <div className="flex items-center gap-3">
                            <label className="relative w-12 h-12 rounded-xl border-2 border-slate-200 dark:border-[#1e2d4a] overflow-hidden cursor-pointer shadow-sm shrink-0 hover:ring-2 hover:ring-emerald-500/30 transition-shadow">
                                <input
                                    type="color"
                                    value={colors[key]}
                                    onChange={(e) => update(key, e.target.value)}
                                    className="absolute inset-0 w-[150%] h-[150%] -translate-x-1/4 -translate-y-1/4 cursor-pointer border-0 p-0"
                                    aria-label={label}
                                />
                            </label>
                            <input
                                type="text"
                                value={colors[key]}
                                onChange={(e) => update(key, e.target.value)}
                                className="flex-1 font-mono text-sm uppercase tracking-wide px-3 py-2.5 rounded-xl bg-white dark:bg-[#0f1629] border border-slate-200 dark:border-[#1e2d4a] outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                placeholder="#000000"
                                maxLength={7}
                            />
                        </div>
                    </CoField>
                ))}
            </div>

            <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Color presets</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {BRAND_COLOR_PRESETS.map((preset) => {
                        const active =
                            preset.colors.primaryColor === colors.primaryColor &&
                            preset.colors.secondaryColor === colors.secondaryColor;
                        return (
                            <button
                                key={preset.name}
                                type="button"
                                onClick={() => applyPreset(preset.colors)}
                                className={cn(
                                    "flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all",
                                    active
                                        ? "border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/30"
                                        : "border-slate-200 dark:border-[#1e2d4a] hover:border-emerald-500/40",
                                )}
                            >
                                <span className="flex shrink-0 overflow-hidden rounded-md w-8 h-8 border border-white/20">
                                    <span className="w-1/2 h-full" style={{ backgroundColor: preset.colors.primaryColor }} />
                                    <span className="w-1/2 h-full" style={{ backgroundColor: preset.colors.secondaryColor }} />
                                </span>
                                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 leading-tight">{preset.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
