"use client";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { useSidebarStore } from "@/store/sidebar.store";
import { useCompactDisplay } from "@/hooks/useCompactDisplay";
import { getSidebarMainMarginClass } from "@/lib/sidebar-layout";
import { cn } from "@/lib/utils";

export default function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isCollapsed } = useSidebarStore();
    const compactDisplay = useCompactDisplay();

    return (
        <div className="flex min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300">
            <Sidebar />
            <div className={cn("flex-1 min-w-0 transition-all duration-300", getSidebarMainMarginClass(isCollapsed, compactDisplay))}>
                <Topbar />
                <main className="p-3 sm:p-4 lg:p-6 max-w-[1480px] mx-auto w-full min-w-0 overflow-x-hidden text-[13px]">
                    {children}
                </main>
            </div>
        </div>
    );
}
