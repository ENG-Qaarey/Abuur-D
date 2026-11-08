"use client";

import "@/styles/company-owner-theme.css";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { useSidebarStore } from "@/store/sidebar.store";
import { useCompactDisplay } from "@/hooks/useCompactDisplay";
import { getSidebarMainMarginClass } from "@/lib/sidebar-layout";
import { companyBrandColorsFromStore, companyBrandCssVars } from "@/lib/brand-colors";
import { useBrandSettings } from "@/store/brand-settings.store";
import { cn } from "@/lib/utils";

export default function CompanyOwnerLayout({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebarStore();
    const compactDisplay = useCompactDisplay();
    const { branding } = useBrandSettings();
    const brandColors = companyBrandColorsFromStore(branding);

    return (
        <div
            className={cn("company-owner-shell co-shell-bg flex min-h-screen transition-colors duration-300")}
            style={companyBrandCssVars(brandColors)}
        >
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
