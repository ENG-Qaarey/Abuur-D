import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type ResponsiveTableShellProps = {
    children: ReactNode;
    className?: string;
};

/**
 * Horizontal scroll only below xl; full-width table on xl+ (no scrollbar).
 */
export function ResponsiveTableShell({ children, className }: ResponsiveTableShellProps) {
    return (
        <div
            className={cn(
                "w-full min-w-0",
                "max-xl:overflow-x-auto xl:overflow-x-visible",
                "max-xl:overscroll-x-contain",
                "table-scroll-mobile",
                className,
            )}
        >
            {children}
        </div>
    );
}
