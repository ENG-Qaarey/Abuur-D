"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    BarChart3,
    LayoutDashboard,
    Users,
    Receipt,
    CreditCard,
    LightbulbOff,
    MessageSquare,
    Settings,
    LogOut,
    Zap,
    ChevronLeft,
    Menu,
    X,
    Building2,
    Lock,
    Activity,
    Megaphone,
    UserCircle,
    ShieldCheck,
    PanelLeft,
    PanelLeftClose,
    UserCog,
    Gauge,
    ClipboardList,
    FileText,
    LineChart,
    Bell
} from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import Image from "next/image";
import { useSidebarStore } from "@/store/sidebar.store";
import { useBrandSettings } from "@/store/brand-settings.store";
import { useCompactDisplay } from "@/hooks/useCompactDisplay";
import { getSidebarAsideWidthClass } from "@/lib/sidebar-layout";

const customerMenuItems = [
    { name: "Dashboard", href: "/customer/dashboard", icon: LayoutDashboard },
    { name: "Usage", href: "/customer/usage", icon: BarChart3 },
    { name: "Bills", href: "/customer/bills", icon: Receipt },
    { name: "Payments", href: "/customer/payments", icon: CreditCard },
    { name: "Outages", href: "/customer/outages", icon: LightbulbOff },
    { name: "Support", href: "/customer/chats", icon: MessageSquare },
    { name: "Settings", href: "/customer/settings", icon: Settings },
];

const companyOwnerMenuItems = [
    { name: "Dashboard", href: "/company-owner/dashboard", icon: LayoutDashboard },
    { name: "Customers", href: "/company-owner/customers", icon: Users },
    { name: "Meters", href: "/company-owner/meters", icon: Gauge },
    { name: "Billing", href: "/company-owner/billing", icon: FileText },
    { name: "Payments", href: "/company-owner/payments", icon: CreditCard },
    { name: "Staff", href: "/company-owner/staff", icon: UserCog },
    { name: "Reports", href: "/company-owner/reports", icon: BarChart3 },
    { name: "Analytics", href: "/company-owner/analytics", icon: LineChart },
    { name: "Support Tickets", href: "/company-owner/support-tickets", icon: MessageSquare },
    { name: "Notifications", href: "/company-owner/notifications", icon: Bell },
    { name: "Settings", href: "/company-owner/settings", icon: Settings },
];

const superAdminMenuItems = [
    { name: "Dashboard", href: "/super-admin/dashboard", icon: LayoutDashboard },
    { name: "Companies", href: "/super-admin/companies", icon: Building2 },
    { name: "Users Management", href: "/super-admin/users", icon: Users },
    { name: "Permissions & Roles", href: "/super-admin/roles", icon: Lock },
    { name: "Customers (All)", href: "/super-admin/customers", icon: Users },
    { name: "Transactions (All)", href: "/super-admin/transactions", icon: Receipt },
    { name: "Reports & Analytics", href: "/super-admin/reports", icon: BarChart3 },
    { name: "System Monitoring", href: "/super-admin/monitoring", icon: Activity },
    { name: "Subscriptions & Plans", href: "/super-admin/subscriptions", icon: CreditCard },
    { name: "Announcements", href: "/super-admin/announcements", icon: Megaphone },
    { name: "Support & Tickets", href: "/super-admin/support", icon: MessageSquare },
    { name: "System Settings", href: "/super-admin/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();
    const { isCollapsed, toggleCollapse } = useSidebarStore();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const compactDisplay = useCompactDisplay();
    const { branding } = useBrandSettings();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <aside aria-hidden="true" className="hidden" />;
    }

    const isSuperAdmin = pathname.startsWith("/super-admin");
    const isCompanyOwner = pathname.startsWith("/company-owner");
    const isAdminSidebar = isSuperAdmin || isCompanyOwner;
    const menuItems = isSuperAdmin ? superAdminMenuItems : isCompanyOwner ? companyOwnerMenuItems : customerMenuItems;
    const brandName = branding.brandName || APP_NAME;
    const sidebarLogo = branding.logoDark || branding.logoLight || "/iconDark.png";
    const adminPanelBadge = isSuperAdmin ? "SUPER ADMIN" : "COMPANY OWNER";
    const adminPanelSubtitle = isSuperAdmin ? "Owner Panel" : "Company Panel";
    const adminDisplayName = isSuperAdmin ? "System Owner" : "Ahmed Mohamed";
    const adminInitials = isSuperAdmin ? "SO" : "AM";
    const adminProfileHref = isSuperAdmin ? "/super-admin/profile" : "/company-owner/profile";

    const sidebarSurfaceClass = isCompanyOwner
        ? "co-owner-sidebar border-teal-800/40 shadow-emerald-950/20"
        : "bg-[#0B3A82] border-blue-800/50";
    const sidebarHeaderClass = isCompanyOwner ? "co-owner-sidebar-header" : "bg-[#082E6E]";
    const sidebarFooterClass = isCompanyOwner ? "co-owner-sidebar-footer" : "bg-[#082E6E]";
    const navSectionLabelClass = isCompanyOwner ? "co-owner-nav-label" : "text-blue-300";
    const navActiveClass = isCompanyOwner
        ? "co-owner-nav-active text-white font-bold"
        : "bg-blue-600 text-white font-bold shadow-lg shadow-blue-900/40";
    const navIdleClass = isCompanyOwner
        ? "co-owner-nav-idle font-medium"
        : "text-blue-100 hover:bg-blue-800/50 hover:text-white font-medium hover:translate-x-[2px]";
    const navIconIdleClass = isCompanyOwner
        ? "co-owner-nav-icon-idle group-hover:text-white group-hover:bg-emerald-700/30"
        : "text-blue-300 group-hover:text-white group-hover:bg-blue-700/40";

    return (
        <div className="relative">
            {/* Mobile Menu Toggle */}
            <div className="lg:hidden absolute top-4 left-4 z-50">
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="p-2 bg-white rounded-lg shadow-md border border-slate-100"
                >
                    {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Backdrop for mobile */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar Content */}
            <aside
                className={cn(
                    "fixed top-0 left-0 h-screen text-white border-r transition-all duration-300 z-50 flex flex-col backdrop-blur-md overflow-visible shadow-2xl shadow-blue-950/25",
                    isAdminSidebar
                        ? sidebarSurfaceClass
                        : "bg-gradient-to-b from-primary-800 to-primary-600 dark:from-slate-900 dark:to-slate-800 border-primary/20 dark:border-slate-700",
                    getSidebarAsideWidthClass(isCollapsed, compactDisplay),
                    mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                {/* Brand / Logo & Profile section */}
                {isAdminSidebar ? (
                    !isCollapsed ? (
                        <div className={cn("flex flex-col p-3 pb-3 border-b border-blue-800/40", sidebarHeaderClass)}>
                            <div className="flex items-center gap-1.5 mb-2.5">
                                <div className="bg-white p-1.5 rounded-lg flex items-center justify-center shadow-sm">
                                    <Image src={sidebarLogo} alt={brandName} width={14} height={14} className="h-3.5 w-3.5 object-contain" unoptimized />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[10px] font-black tracking-tight text-white uppercase leading-none truncate">
                                        {brandName} {adminPanelBadge}
                                    </span>
                                    <span
                                        className={cn(
                                            "text-[7px] uppercase tracking-widest font-semibold mt-0.5",
                                            isCompanyOwner ? "text-emerald-200" : "text-blue-300",
                                        )}
                                    >
                                        {adminPanelSubtitle}
                                    </span>
                                </div>
                            </div>
                            <div
                                className={cn(
                                    "flex items-center gap-2 p-1.5 rounded-xl border",
                                    isCompanyOwner
                                        ? "co-owner-sidebar-profile"
                                        : "bg-[#0B3A82]/40 border-blue-700/20",
                                )}
                            >
                                <div
                                    className={cn(
                                        "relative w-8 h-8 rounded-full overflow-hidden shrink-0",
                                        isCompanyOwner ? "border border-emerald-400/50" : "border border-blue-400/40",
                                    )}
                                >
                                    <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-900 text-xs font-bold">
                                        {adminInitials}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-[10px] text-white truncate">{adminDisplayName}</h4>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.5)]" />
                                        <span className="text-[7px] uppercase font-bold tracking-wider text-green-400">Online</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={cn("flex flex-col items-center gap-3 py-4 border-b border-blue-800/40", sidebarHeaderClass)}>
                            <div className="bg-white p-1.5 rounded-lg shrink-0 flex items-center justify-center shadow-sm">
                                <Image src={sidebarLogo} alt={brandName} width={13} height={13} className="h-3.5 w-3.5 object-contain" unoptimized />
                            </div>
                            <div className="relative w-8 h-8 rounded-full border border-blue-400/40 overflow-hidden shrink-0 shadow-sm">
                                <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-900 text-xs font-bold">
                                    {adminInitials}
                                </div>
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border border-[#082E6E] rounded-full" />
                            </div>
                        </div>
                    )
                ) : (
                    /* Customer Header */
                    <div className={cn(
                        "flex items-center p-6 pb-4",
                        isCollapsed ? "flex-col gap-4 justify-center" : "justify-between"
                    )}>
                        {!isCollapsed ? (
                            <div className="flex items-center gap-3">
                                <div className="bg-white p-2.5 rounded-xl shrink-0 flex items-center justify-center shadow-md">
                                    <Image src={sidebarLogo} alt={brandName} width={20} height={20} className="h-5 w-5 object-contain" unoptimized />
                                </div>
                                <span className="text-lg font-black tracking-tight text-white leading-tight">
                                    {brandName}
                                </span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4">
                                <div className="bg-white p-2.5 rounded-xl shrink-0 flex items-center justify-center shadow-md">
                                    <Image src={sidebarLogo} alt={brandName} width={20} height={20} className="h-5 w-5 object-contain" unoptimized />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Menu Items */}
                <nav
                    className={cn(
                        "flex-1 py-4 space-y-1 overflow-y-scroll overflow-x-hidden custom-scrollbar scroll-smooth",
                        isCollapsed ? "pl-2 pr-1" : "px-3",
                    )}
                >
                    {!isCollapsed && (
                        <p className={cn("text-[10px] font-black uppercase tracking-[0.1em] px-3 mb-2 mt-2", navSectionLabelClass)}>
                            Main Navigation
                        </p>
                    )}
                    {menuItems.map((item, index) => {
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "relative flex items-center rounded-xl transition-all duration-300 group overflow-hidden",
                                    isCollapsed ? "justify-center px-0 py-2" : "space-x-2.5 px-2 py-2",
                                    isActive ? navActiveClass : navIdleClass,
                                )}
                                style={{ transitionDelay: `${Math.min(index * 12, 120)}ms` }}
                                onClick={() => setMobileOpen(false)}
                            >
                                <span
                                    className={cn(
                                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
                                        isActive ? "bg-white/20 text-white" : navIconIdleClass,
                                    )}
                                >
                                    <item.icon size={16} className="shrink-0" />
                                </span>
                                {!isCollapsed && (
                                    <span className="text-[12px] truncate tracking-tight">{item.name}</span>
                                )}
                                {isActive && (
                                    <span
                                        className={cn(
                                            "absolute right-1.5 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full",
                                            isCompanyOwner ? "bg-emerald-200" : "bg-white/80",
                                        )}
                                    />
                                )}
                            </Link>
                        );
                    })}

                    {/* Account Section — Super Admin & Company Owner */}
                    {isAdminSidebar && !isCollapsed && (
                        <>
                            <p className={cn("text-[10px] font-black uppercase tracking-[0.1em] px-3 mt-6 mb-2", navSectionLabelClass)}>
                                Account
                            </p>
                            <Link
                                href={adminProfileHref}
                                className={cn(
                                    "flex items-center space-x-2.5 px-2 py-2 rounded-xl font-medium transition-all group",
                                    isCompanyOwner
                                        ? "co-owner-nav-idle hover:bg-emerald-800/30 hover:text-white"
                                        : "text-blue-100 hover:bg-blue-800/50 hover:text-white",
                                )}
                            >
                                <UserCircle
                                    size={16}
                                    className={cn("shrink-0 group-hover:text-white", isCompanyOwner ? "text-emerald-300" : "text-blue-300")}
                                />
                                <span className="text-[12px] truncate">Profile Settings</span>
                            </Link>
                            <button
                                type="button"
                                className={cn(
                                    "w-full flex items-center space-x-2.5 px-2 py-2 rounded-xl font-medium transition-all group",
                                    isCompanyOwner
                                        ? "co-owner-nav-idle hover:bg-emerald-800/30 hover:text-white"
                                        : "text-blue-100 hover:bg-blue-800/50 hover:text-white",
                                )}
                            >
                                <LogOut
                                    size={16}
                                    className={cn("shrink-0 group-hover:text-white", isCompanyOwner ? "text-emerald-300" : "text-blue-300")}
                                />
                                <span className="text-[12px] truncate">Logout</span>
                            </button>
                        </>
                    )}
                </nav>

                {/* Footer Section */}
                <div className={cn("p-3 border-t border-blue-800/50", sidebarFooterClass)}>
                    {isAdminSidebar && !isCollapsed ? (
                        <div
                            className={cn(
                                "flex items-start gap-2.5 p-2.5 rounded-xl border shadow-inner",
                                isCompanyOwner
                                    ? "co-owner-sidebar-footer-card"
                                    : "bg-[#0B3A82] border-blue-700/50",
                            )}
                        >
                            <div
                                className={cn(
                                    "p-1.5 rounded-lg shrink-0 mt-0.5",
                                    isCompanyOwner ? "bg-emerald-500/25" : "bg-green-500/20",
                                )}
                            >
                                <ShieldCheck size={16} className={isCompanyOwner ? "text-emerald-300" : "text-green-400"} />
                            </div>
                            <div>
                                <h4 className="text-[11px] font-bold text-white mb-0.5">{brandName}</h4>
                                <p className="text-[9px] text-blue-200 leading-tight">{branding.brandTagline}</p>
                            </div>
                        </div>
                    ) : !isAdminSidebar ? (
                        <button
                            type="button"
                            className="w-full flex items-center space-x-3 px-3 py-3 rounded-2xl text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                        >
                            <LogOut size={22} className="shrink-0" />
                            {!isCollapsed && <span className="font-bold text-[15px]">Sign Out</span>}
                        </button>
                    ) : null}
                </div>

                {/* Collapse toggle — centered on sidebar right edge (tracks rem width / zoom) */}
                <button
                    type="button"
                    onClick={toggleCollapse}
                    className={cn(
                        "absolute top-12 right-0 translate-x-1/2 z-[100] w-7 h-7 text-blue-300 hover:text-white rounded-full border shadow-[0_4px_10px_rgba(0,0,0,0.15)] hover:shadow-[0_4px_12px_rgba(59,130,246,0.3)] transition-all duration-300 cursor-pointer hidden lg:flex items-center justify-center group hover:scale-105",
                        compactDisplay && "w-6 h-6 top-11",
                        isCompanyOwner
                            ? "co-owner-collapse-btn text-emerald-200 hover:text-white"
                            : isAdminSidebar
                              ? "bg-[#082E6E] hover:bg-blue-600 border-blue-700/60 text-blue-300 hover:text-white"
                              : "bg-[#0c4093] hover:bg-blue-700 border-blue-600/40 text-blue-300 hover:text-white",
                    )}
                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {isCollapsed ? (
                        <PanelLeft size={13} className={cn("group-hover:text-white", isAdminSidebar ? "text-blue-400" : "text-blue-300")} />
                    ) : (
                        <PanelLeftClose size={13} className="group-hover:text-white" />
                    )}
                </button>
            </aside>
        </div>
    );
}
