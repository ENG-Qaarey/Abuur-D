"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type SuperAdminModalVariant = "default" | "danger" | "form";

const headerAccent: Record<SuperAdminModalVariant, string> = {
    default: "from-blue-500/10 to-violet-500/10 border-blue-500/20",
    danger: "from-red-500/10 to-orange-500/10 border-red-500/20",
    form: "from-violet-500/10 to-blue-500/10 border-violet-500/20",
};

export function SuperAdminModalShell({
    title,
    subtitle,
    onClose,
    children,
    footer,
    icon,
    maxWidth = "max-w-2xl",
    variant = "default",
    bodyClassName,
    compact = false,
    maxHeight,
}: {
    title: string;
    subtitle?: string;
    onClose: () => void;
    children: ReactNode;
    footer?: ReactNode;
    icon?: ReactNode;
    maxWidth?: string;
    variant?: SuperAdminModalVariant;
    bodyClassName?: string;
    /** Smaller header and outer padding */
    compact?: boolean;
    /** Override modal max height, e.g. `max-h-[460px]` */
    maxHeight?: string;
}) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [onClose]);

    return (
        <div className={cn("fixed inset-0 z-50 flex items-center justify-center", compact ? "p-3" : "p-4")}>
            <button
                type="button"
                aria-label="Close modal"
                className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
                onClick={onClose}
            />
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="super-admin-modal-title"
                className={cn(
                    "relative z-10 flex w-full flex-col overflow-hidden border border-slate-200 bg-white shadow-2xl shadow-black/20 dark:border-[#1a2744] dark:bg-[#0a1628]",
                    maxHeight ?? (compact ? "max-h-[min(80dvh,520px)]" : "max-h-[min(90dvh,880px)]"),
                    compact ? "rounded-xl" : "rounded-2xl",
                    maxWidth,
                )}
            >
                <div
                    className={cn(
                        "flex shrink-0 items-start border-b border-slate-100 dark:border-[#1a2744] bg-gradient-to-r",
                        compact ? "gap-2.5 px-4 py-3" : "gap-4 px-6 py-5",
                        headerAccent[variant],
                    )}
                >
                    {icon ? (
                        <div
                            className={cn(
                                "flex shrink-0 items-center justify-center rounded-lg border border-inherit bg-white/80 dark:bg-[#0a1628]/80",
                                compact ? "h-8 w-8" : "h-11 w-11 rounded-xl",
                            )}
                        >
                            {icon}
                        </div>
                    ) : null}
                    <div className="min-w-0 flex-1">
                        <h3
                            id="super-admin-modal-title"
                            className={cn(
                                "font-black tracking-tight text-slate-900 dark:text-white truncate",
                                compact ? "text-base" : "text-lg",
                            )}
                        >
                            {title}
                        </h3>
                        {subtitle ? (
                            <p className={cn("font-medium text-slate-500 dark:text-slate-400", compact ? "mt-0.5 text-xs" : "mt-1 text-sm")}>
                                {subtitle}
                            </p>
                        ) : null}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className={cn(
                            "inline-flex shrink-0 items-center justify-center rounded-lg border border-slate-200/80 bg-white/90 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:border-[#1e2d4a] dark:bg-[#0f1629] dark:text-slate-400 dark:hover:bg-[#141f38] dark:hover:text-white",
                            compact ? "h-7 w-7" : "h-9 w-9 rounded-xl",
                        )}
                    >
                        <X size={compact ? 14 : 16} className="stroke-[2.5]" />
                    </button>
                </div>
                <div className={cn("min-h-0 flex-1 overflow-y-auto", bodyClassName)}>{children}</div>
                {footer}
            </div>
        </div>
    );
}
