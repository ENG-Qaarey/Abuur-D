"use client";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { useSidebarStore } from "@/store/sidebar.store";
import { cn } from "@/lib/utils";
export default function CustomerDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isCollapsed } = useSidebarStore();

    return (
        <div className="flex min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300">
            <Sidebar />
            <div className={cn("flex-1 transition-all duration-300", isCollapsed ? "lg:ml-20" : "lg:ml-64")}>
                <Topbar />
                <main className="p-6 lg:p-10 max-w-[1600px] mx-auto min-w-0 overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}
