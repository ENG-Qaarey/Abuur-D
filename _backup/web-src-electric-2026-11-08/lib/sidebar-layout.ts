/** Tailwind width classes — keep in sync with SIDEBAR_WIDTH_PX */
export const SIDEBAR_WIDTH_CLASS = {
    expanded: "w-56",
    expandedCompact: "w-48",
    collapsed: "w-16",
    collapsedCompact: "w-14",
} as const;

/** Pixel widths (14rem / 16rem etc.) for positioning the collapse toggle */
export const SIDEBAR_WIDTH_PX = {
    expanded: 224,
    expandedCompact: 192,
    collapsed: 64,
    collapsedCompact: 56,
} as const;

export function getSidebarAsideWidthClass(collapsed: boolean, compact: boolean) {
    if (collapsed) return compact ? SIDEBAR_WIDTH_CLASS.collapsedCompact : SIDEBAR_WIDTH_CLASS.collapsed;
    return compact ? SIDEBAR_WIDTH_CLASS.expandedCompact : SIDEBAR_WIDTH_CLASS.expanded;
}

export function getSidebarMainMarginClass(collapsed: boolean, compact: boolean) {
    if (collapsed) {
        return compact ? "lg:ml-14" : "lg:ml-16";
    }
    return compact ? "lg:ml-48" : "lg:ml-56";
}
