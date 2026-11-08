"use client";

import { Bell, Search, User, ChevronDown, Settings, LogOut, Shield, Calendar, Download, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { useCompactDisplay } from "@/hooks/useCompactDisplay";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
import { useBrandSettings } from "@/store/brand-settings.store";
import { useTheme } from "@/components/theme-provider";

export function Topbar() {
    const [profileOpen, setProfileOpen] = useState(false);
    const [liveClock, setLiveClock] = useState("");
    const pathname = usePathname();
    const isSuperAdmin = pathname.startsWith("/super-admin");
    const isCompanyOwner = pathname.startsWith("/company-owner");
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const compactDisplay = useCompactDisplay();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const formatClock = () =>
            new Intl.DateTimeFormat("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            }).format(new Date());

        setLiveClock(formatClock());

        const timer = window.setInterval(() => {
            setLiveClock(formatClock());
        }, 1000);

        return () => window.clearInterval(timer);
    }, []);

    const { user, logout } = useAuth();
    const { branding } = useBrandSettings();
    const currentTheme = mounted && resolvedTheme ? resolvedTheme : "light";
    const isDark = currentTheme === "dark";
    const brandLogo = isDark ? (branding.logoDark || "/iconDark.png") : (branding.logoLight || "/iconLight.png");

    const renderLeftSection = () => {
        if (!mounted) return null;

        if (isCompanyOwner) {
            if (pathname === "/company-owner/dashboard") {
                return (
                    <div className="flex flex-col justify-center gap-1">
                        <span className="inline-flex w-fit items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                            Company operations
                        </span>
                        <h2 className="text-base font-black text-slate-900 dark:text-slate-100 leading-none">Company Dashboard</h2>
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-none">
                            Welcome back! Here&apos;s your company overview.
                        </p>
                    </div>
                );
            }

            const ownerPathMap: Record<string, { title: string; label: string }> = {
                customers: { title: "Customers Management", label: "Customers" },
                meters: { title: "Meter Management", label: "Meters" },
                billing: { title: "Billing & Invoices", label: "Billing" },
                payments: { title: "Payments", label: "Payments" },
                staff: { title: "Staff Management", label: "Staff" },
                reports: { title: "Reports & Analytics", label: "Reports" },
                analytics: { title: "Analytics & Monitoring", label: "Analytics" },
                "support-tickets": { title: "Support & Complaints", label: "Support" },
                notifications: { title: "Notifications", label: "Notifications" },
                settings: { title: "Company Settings", label: "Settings" },
                profile: { title: "Profile Settings", label: "Profile" },
            };

            const segment = pathname.split("/").filter(Boolean)[1] || "";
            const mapping = ownerPathMap[segment] || {
                title: segment.charAt(0).toUpperCase() + segment.slice(1),
                label: segment.charAt(0).toUpperCase() + segment.slice(1),
            };

            return (
                <div className="flex flex-col justify-center min-w-0 max-w-[min(100%,28rem)] pr-2">
                    <h2
                        className={cn(
                            "font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-tight truncate",
                            compactDisplay ? "text-base" : "text-xl",
                        )}
                    >
                        {mapping.title}
                    </h2>
                    <div className="flex items-center text-xs mt-1 font-semibold leading-none select-none flex-wrap">
                        <Link href="/company-owner/dashboard" className="co-owner-crumb hover:underline">
                            Dashboard
                        </Link>
                        <span className="text-slate-400 dark:text-slate-600 mx-1.5 font-normal">›</span>
                        <span className="text-slate-500 dark:text-slate-400 font-semibold">{mapping.label}</span>
                    </div>
                </div>
            );
        }

        if (isSuperAdmin) {
            if (pathname === "/super-admin/dashboard") {
                return (
                    <div className="flex flex-col justify-center">
                        <h2 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5 leading-none">
                            Dashboard Overview
                        </h2>
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 leading-none">
                            Welcome back, System Owner! Here's what's happening on your platform.
                        </p>
                    </div>
                );
            }

            const adminPathMap: Record<string, { title: string; label: string }> = {
                "companies": { title: "Companies", label: "Companies" },
                "users": { title: "Users Management", label: "Users" },
                "roles": { title: "Roles & Permissions", label: "Roles" },
                "customers": { title: "Customers (All)", label: "Customers" },
                "transactions": { title: "Transactions (All)", label: "Transactions" },
                "reports": { title: "Reports & Analytics", label: "Reports" },
                "monitoring": { title: "System Monitoring", label: "Monitoring" },
                "subscriptions": { title: "Subscriptions & Plans", label: "Subscriptions" },
                "announcements": { title: "Announcements", label: "Announcements" },
                "support": { title: "Support & Tickets", label: "Support" },
                "settings": { title: "System Settings", label: "Settings" }
            };

            const segment = pathname.split("/").filter(Boolean)[1] || "";
            const mapping = adminPathMap[segment] || { 
                title: segment.charAt(0).toUpperCase() + segment.slice(1), 
                label: segment.charAt(0).toUpperCase() + segment.slice(1) 
            };

            return (
                <div className="flex flex-col justify-center">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-none">
                        {mapping.title}
                    </h2>
                    <div className="flex items-center text-xs mt-1.5 font-semibold leading-none select-none">
                        <Link href="/super-admin/dashboard" className="text-blue-600 dark:text-blue-400 hover:underline">
                            Dashboard
                        </Link>
                        <span className="text-slate-400 dark:text-slate-600 mx-1.5 font-normal">›</span>
                        <span className="text-slate-500 dark:text-slate-400 font-semibold">{mapping.label}</span>
                    </div>
                </div>
            );
        }

        // Customer and fallback
        return (
            <div className="hidden md:flex flex-1 max-w-md relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors">
                    <Search size={16} />
                </div>
                <input
                    type="text"
                    placeholder="Search for bills, support tickets..."
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border-0 ring-1 ring-slate-100 dark:ring-slate-700/50 focus:ring-2 focus:ring-primary dark:focus:ring-primary h-9 pl-10 pr-4 rounded-xl transition-all outline-none text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                />
            </div>
        );
    };

    return (
        <header
            className={cn(
                "min-h-14 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between gap-3 transition-colors duration-300",
                isCompanyOwner && "co-owner-topbar",
                compactDisplay ? "h-auto py-2 px-3 sm:px-4 lg:px-5" : "h-16 px-4 sm:px-6 lg:px-8 lg:pl-6",
            )}
        >
            {/* Left Section */}
            {renderLeftSection()}

            {/* Right Actions */}
            <div className="flex items-center space-x-3 ml-auto">
                {(isSuperAdmin || isCompanyOwner) && (
                    <div className="hidden md:flex items-center gap-2 mr-1">
                        {/* Date Picker Button */}
                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                            <Calendar size={14} className="text-slate-500 dark:text-slate-400" />
                            <span>{liveClock}</span>
                            <ChevronDown size={12} className="text-slate-400 dark:text-slate-500 ml-0.5" />
                        </button>
                        
                        {/* Export Report Button */}
                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                            <Download size={14} className="text-slate-500 dark:text-slate-400" />
                            <span>Export Report</span>
                        </button>
                    </div>
                )}

                {/* Theme Toggle */}
                <button
                    onClick={() => setTheme(isDark ? "light" : "dark")}
                    className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl transition-all text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-primary cursor-pointer"
                    title={isDark ? "Switch to light mode" : "Switch to dark mode"}
                    aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                >
                    {mounted ? (isDark ? <Sun size={18} /> : <Moon size={18} />) : <Moon size={18} />}
                </button>

                {/* Notifications */}
                <button className="relative p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl transition-all group cursor-pointer">
                    <Bell size={18} className="text-slate-600 dark:text-slate-300 group-hover:text-primary transition-colors" />
                    {isSuperAdmin ? (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white dark:border-slate-800 rounded-full flex items-center justify-center text-[8px] font-black text-white shadow-sm">
                            8
                        </span>
                    ) : (
                        <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 border border-white dark:border-slate-800 rounded-full" />
                    )}
                </button>

                {/* Vertical divider */}
                <div className="w-px h-6 bg-slate-200 dark:bg-slate-600 mx-1" />

                {/* User Profile */}
                <div className="relative">
                    <button
                        onClick={() => setProfileOpen(!profileOpen)}
                        className="flex items-center space-x-2 p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-colors cursor-pointer"
                    >
                        {isSuperAdmin ? (
                            <>
                                <div className="relative">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border border-slate-200 dark:border-slate-700">
                                        <Image src={brandLogo} alt="Profile" width={32} height={32} className="object-cover" unoptimized />
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full" />
                                </div>
                                <div className="hidden lg:flex flex-col text-left">
                                    <span className="text-xs font-black text-slate-900 dark:text-slate-100 leading-none mb-0.5">{(user as any)?.fullName || "System Owner"}</span>
                                    <span className="text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">{((user as any)?.role || "Super Admin").toString()}</span>
                                </div>
                            </>
                        ) : isCompanyOwner ? (
                            <>
                                <div className="relative">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-600 to-cyan-500 flex items-center justify-center text-[10px] font-black text-white border border-emerald-400/40">
                                        AM
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full" />
                                </div>
                                <div className="hidden lg:block text-left">
                                    <p className="text-xs font-black text-slate-900 dark:text-slate-100 leading-none mb-0.5">Ahmed Mohamed</p>
                                    <div className="flex items-center text-[9px] uppercase font-black tracking-wider text-emerald-600 dark:text-emerald-400">
                                        <Shield size={9} className="mr-1" />
                                        Company Owner
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="relative">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20 overflow-hidden">
                                        <User size={16} fill="currentColor" className="opacity-80" />
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full" />
                                </div>
                                <div className="hidden lg:block text-left">
                                    <p className="text-xs font-black text-slate-900 dark:text-slate-100 leading-none mb-0.5">Ahmed Mohamed</p>
                                    <div className="flex items-center text-[9px] uppercase font-black tracking-wider text-slate-500 dark:text-slate-400">
                                        <Shield size={9} className="mr-1 text-primary" />
                                        Customer
                                    </div>
                                </div>
                            </>
                        )}
                        <ChevronDown size={12} className={cn("text-slate-400 dark:text-slate-500 transition-transform", profileOpen && "rotate-180")} />
                    </button>

                    {/* Profile Dropdown */}
                    {profileOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setProfileOpen(false)}
                            />
                            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl z-25 p-1.5 animate-in fade-in zoom-in-95 duration-200">
                                <div className="p-2 border-b border-slate-50 dark:border-slate-800">
                                    <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Account</p>
                                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate">
                                        {(user as any)?.email ||
                                            (isSuperAdmin ? "owner@saomalielectric.com" : isCompanyOwner ? "owner@beco.so" : "ahmed@example.so")}
                                    </p>
                                </div>
                                <Link
                                    href={isCompanyOwner ? "/company-owner/profile" : "/super-admin/profile"}
                                    onClick={() => setProfileOpen(false)}
                                    className="w-full flex items-center space-x-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all text-xs font-bold text-left cursor-pointer border-0"
                                >
                                    <User size={16} className="text-slate-500 dark:text-slate-400" />
                                    <span>My Profile</span>
                                </Link>
                                <Link
                                    href={isCompanyOwner ? "/company-owner/settings" : "/super-admin/settings"}
                                    onClick={() => setProfileOpen(false)}
                                    className="w-full flex items-center space-x-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all text-xs font-bold text-left cursor-pointer border-0"
                                >
                                    <Settings size={16} className="text-slate-500 dark:text-slate-400" />
                                    <span>Settings</span>
                                </Link>
                                <div className="h-px bg-slate-50 dark:bg-slate-800 my-1" />
                                <button onClick={() => { logout(); setProfileOpen(false); }} className="w-full flex items-center space-x-2.5 p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 dark:text-red-400 transition-all text-xs font-bold text-left cursor-pointer border-0">
                                    <LogOut size={16} />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
