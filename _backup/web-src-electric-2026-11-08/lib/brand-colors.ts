import type { CSSProperties } from "react";

/** Company brand color helpers — used by company-owner settings & theme */

export type CompanyBrandColors = {
    primaryColor: string;
    secondaryColor: string;
    sidebarDepthColor: string;
};

export const DEFAULT_COMPANY_BRAND_COLORS: CompanyBrandColors = {
    primaryColor: "#059669",
    secondaryColor: "#0891b2",
    sidebarDepthColor: "#0f172a",
};

export const BRAND_COLOR_PRESETS: { name: string; colors: CompanyBrandColors }[] = [
    { name: "Emerald Electric", colors: { primaryColor: "#059669", secondaryColor: "#0891b2", sidebarDepthColor: "#0f172a" } },
    { name: "Ocean Blue", colors: { primaryColor: "#2563eb", secondaryColor: "#06b6d4", sidebarDepthColor: "#0c1222" } },
    { name: "Royal Purple", colors: { primaryColor: "#7c3aed", secondaryColor: "#ec4899", sidebarDepthColor: "#1e1033" } },
    { name: "Sunset Orange", colors: { primaryColor: "#ea580c", secondaryColor: "#f59e0b", sidebarDepthColor: "#1c1410" } },
    { name: "Forest Green", colors: { primaryColor: "#166534", secondaryColor: "#84cc16", sidebarDepthColor: "#0a1a0f" } },
    { name: "Corporate Navy", colors: { primaryColor: "#1e40af", secondaryColor: "#38bdf8", sidebarDepthColor: "#0f172a" } },
];

const HEX_RE = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

export function normalizeHex(hex: string, fallback: string): string {
    const trimmed = hex.trim();
    if (!HEX_RE.test(trimmed)) return fallback;
    if (trimmed.length === 4) {
        const r = trimmed[1];
        const g = trimmed[2];
        const b = trimmed[3];
        return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
    }
    return trimmed.toLowerCase();
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const normalized = normalizeHex(hex, "");
    if (!normalized) return null;
    const h = normalized.slice(1);
    const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    const n = parseInt(full, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function hexToRgba(hex: string, alpha: number): string {
    const rgb = hexToRgb(hex);
    if (!rgb) return `rgba(16, 185, 129, ${alpha})`;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

/** Darken hex for sidebar header tint */
export function darkenHex(hex: string, amount = 0.35): string {
    const rgb = hexToRgb(hex);
    if (!rgb) return "#064e3b";
    const f = (c: number) => Math.max(0, Math.round(c * (1 - amount)));
    return `#${[f(rgb.r), f(rgb.g), f(rgb.b)].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

export function companyBrandColorsFromStore(branding: {
    primaryColor?: string;
    secondaryColor?: string;
    sidebarDepthColor?: string;
    accentColor?: string;
}): CompanyBrandColors {
    const primary = branding.primaryColor || branding.accentColor || DEFAULT_COMPANY_BRAND_COLORS.primaryColor;
    return {
        primaryColor: normalizeHex(primary, DEFAULT_COMPANY_BRAND_COLORS.primaryColor),
        secondaryColor: normalizeHex(
            branding.secondaryColor || DEFAULT_COMPANY_BRAND_COLORS.secondaryColor,
            DEFAULT_COMPANY_BRAND_COLORS.secondaryColor,
        ),
        sidebarDepthColor: normalizeHex(
            branding.sidebarDepthColor || DEFAULT_COMPANY_BRAND_COLORS.sidebarDepthColor,
            DEFAULT_COMPANY_BRAND_COLORS.sidebarDepthColor,
        ),
    };
}

export function companyBrandCssVars(colors: CompanyBrandColors): CSSProperties {
    const headerTint = darkenHex(colors.primaryColor, 0.25);
    return {
        ["--co-owner-primary" as string]: colors.primaryColor,
        ["--co-owner-secondary" as string]: colors.secondaryColor,
        ["--co-owner-depth" as string]: colors.sidebarDepthColor,
        ["--co-owner-header-tint" as string]: headerTint,
        ["--co-owner-primary-muted" as string]: hexToRgba(colors.primaryColor, 0.12),
        ["--co-owner-primary-glow" as string]: hexToRgba(colors.primaryColor, 0.35),
        ["--co-owner-secondary-muted" as string]: hexToRgba(colors.secondaryColor, 0.15),
    };
}
