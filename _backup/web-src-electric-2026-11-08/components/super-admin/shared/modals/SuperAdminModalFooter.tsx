"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SuperAdminModalFooter({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div
            className={cn(
                "flex shrink-0 flex-col-reverse gap-3 border-t border-slate-100 bg-white p-5 sm:flex-row sm:justify-end dark:border-[#1a2744] dark:bg-[#0a1628]",
                className,
            )}
        >
            {children}
        </div>
    );
}

export function SuperAdminModalButton({
    children,
    onClick,
    type = "button",
    form,
    variant = "secondary",
    className,
}: {
    children: ReactNode;
    onClick?: () => void;
    type?: "button" | "submit";
    form?: string;
    variant?: "secondary" | "primary" | "danger";
    className?: string;
}) {
    return (
        <button
            type={type}
            form={form}
            onClick={onClick}
            className={cn(
                "h-11 min-w-[120px] rounded-xl px-5 text-sm font-bold transition-all",
                variant === "secondary" &&
                    "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-[#1e2d4a] dark:bg-[#0f1629] dark:text-slate-200 dark:hover:bg-[#141f38]",
                variant === "primary" &&
                    "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-md shadow-blue-500/10 hover:from-violet-500 hover:to-blue-500",
                variant === "danger" && "bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-500/20",
                className,
            )}
        >
            {children}
        </button>
    );
}
