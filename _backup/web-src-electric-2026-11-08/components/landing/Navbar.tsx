"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    ArrowRight,
    Moon,
    Sun,
    X,
    Home,
    Zap,
    Tag,
    HelpCircle,
    Phone,
    Mail,
} from "lucide-react";
import { useBrandSettings } from "@/store/brand-settings.store";
import { useTheme } from "@/components/theme-provider";

import { APP_NAME, ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const navigation = {
    categories: [
        {
            id: "main",
            name: "Main",
            sections: [
                {
                    id: "about",
                    name: "About",
                    items: [
                        { name: "About Us", href: "#about" },
                        { name: "Our Mission", href: "#about" },
                        { name: "Pricing", href: "#pricing" },
                    ],
                },
                {
                    id: "features",
                    name: "Features",
                    items: [
                        { name: "Grid Intelligence", href: "#features" },
                        { name: "Mobile Payments", href: "#features" },
                        { name: "Outage Alerts", href: "#features" },
                    ],
                },
                {
                    id: "resources",
                    name: "Resources",
                    items: [
                        { name: "FAQ", href: "#faq" },
                        { name: "Documentation", href: "#" },
                        { name: "Support", href: "#" },
                    ],
                },
                {
                    id: "company",
                    name: "Company",
                    items: [
                        { name: "Contact", href: "#" },
                        { name: "Privacy Policy", href: "#" },
                        { name: "Terms of Service", href: "#" },
                    ],
                },
            ],
        },
    ],
};

function MobileMenuIcon({ open }: { open: boolean }) {
    return (
        <span className="relative inline-flex h-6 w-7 items-center justify-center">
            <motion.span
                className="absolute left-0 top-0 h-[3px] w-7 rounded-full bg-current"
                animate={{ y: open ? 9 : 0, rotate: open ? 45 : 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
            />
            <motion.span
                className="absolute left-0 top-[11px] h-[3px] w-7 rounded-full bg-current"
                animate={{ opacity: open ? 0 : 1, scaleX: open ? 0.2 : 1 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
            />
            <motion.span
                className="absolute left-0 top-[22px] h-[3px] w-7 rounded-full bg-current"
                animate={{ y: open ? -9 : 0, rotate: open ? -45 : 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
            />
        </span>
    );
}

export function Navbar() {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("");
    const pathname = usePathname();

    useEffect(() => {
        setMounted(true);
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 15);

            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            setScrollProgress(docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0);
        };
        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        const sections = document.querySelectorAll("section[id]");
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                }
            },
            { rootMargin: "-40% 0px -55% 0px" }
        );

        sections.forEach((s) => observer.observe(s));
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!mobileMenuOpen) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setMobileMenuOpen(false);
            }
        };

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [mobileMenuOpen]);

    const navLinks = [
        { name: "Home", href: "#", section: "", icon: Home },
        { name: "Features", href: "#features", section: "features", icon: Zap },
        { name: "Pricing", href: "#pricing", section: "pricing", icon: Tag },
        { name: "FAQ", href: "#faq", section: "faq", icon: HelpCircle },
    ];

    const isDark = mounted && resolvedTheme === "dark";
    const isActive = (href: string) => {
        if (href.startsWith("#")) {
            return false;
        }
        return href === "/" ? pathname === "/" : pathname.startsWith(href);
    };

    const menuItemVariants = {
        closed: { opacity: 0, x: -15 },
        open: (index: number) => ({
            opacity: 1,
            x: 0,
            transition: { delay: 0.05 * index },
        }),
    };

    const isSectionActive = (section: string) => {
        if (!section) return false;
        return activeSection === section;
    };

    return (
        <header
            className={cn(
                "fixed inset-x-0 top-0 z-50 transition-all duration-300 border-b",
                isScrolled
                    ? "bg-white/95 dark:bg-zinc-950/95 border-zinc-200 dark:border-zinc-800 backdrop-blur-md shadow-sm py-3"
                    : "bg-transparent border-transparent py-5"
            )}
        >
            {/* Scroll progress bar */}
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-zinc-100 dark:bg-zinc-800">
                <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-150"
                    style={{ width: `${scrollProgress}%` }}
                />
            </div>

            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between gap-3">
                    
                    {/* Brand Logo */}
                    <Link href="/" className="flex min-w-0 items-center gap-2.5">
                        <div className="relative h-9 w-9 overflow-hidden rounded-xl border border-zinc-200 bg-white p-1.5 dark:border-zinc-800 dark:bg-zinc-900">
                            <Image
                                src={isDark ? "/iconDark.png" : "/iconLight.png"}
                                alt={APP_NAME}
                                fill
                                sizes="36px"
                                className="object-contain"
                                priority
                            />
                        </div>
                        <span className="text-base font-bold tracking-tight text-zinc-900 dark:text-white">
                            {APP_NAME}
                        </span>
                    </Link>

                    {/* Desktop Menu Links */}
                    <div className="hidden items-center gap-6 lg:flex">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                aria-current={
                                    link.section
                                        ? isSectionActive(link.section)
                                            ? "page"
                                            : undefined
                                        : isActive(link.href)
                                        ? "page"
                                        : undefined
                                }
                                className={cn(
                                    "text-sm font-medium transition-colors relative",
                                    link.section
                                        ? isSectionActive(link.section)
                                            ? "text-blue-600 dark:text-blue-400"
                                            : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                                        : isActive(link.href)
                                        ? "text-blue-600 dark:text-blue-400"
                                        : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                                )}
                            >
                                {link.name}
                                {link.section && isSectionActive(link.section) && (
                                    <motion.span
                                        layoutId="nav-indicator"
                                        className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-blue-600 dark:bg-blue-400"
                                    />
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* Actions Block - Desktop/Tablet */}
                    <div className="hidden items-center gap-3 sm:flex">
                        <button
                            onClick={() => setTheme(isDark ? "light" : "dark")}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
                            aria-label="Toggle theme"
                        >
                            {isDark ? <Sun size={16} /> : <Moon size={16} />}
                        </button>

                        <Link
                            href={ROUTES.AUTH.LOGIN}
                            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors dark:text-zinc-400 dark:hover:text-white"
                        >
                            Log in
                        </Link>

                        <Link
                            href={ROUTES.AUTH.REGISTER}
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition-all hover:bg-blue-700 active:scale-95"
                        >
                            Get Started
                            <ArrowRight size={14} />
                        </Link>
                    </div>

                    {/* Mobile Menu Icon Toggle */}
                    <motion.button
                        whileTap={{ scale: 0.92 }}
                        className={cn(
                            "inline-flex h-12 w-12 items-center justify-center rounded-2xl transition-all hover:-translate-y-0.5 lg:hidden",
                            isScrolled
                                ? "text-slate-700 hover:text-blue-600 dark:text-white"
                                : "text-slate-900 dark:text-white"
                        )}
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                        aria-expanded={mobileMenuOpen}
                        aria-controls="mobile-navigation-panel"
                    >
                        <MobileMenuIcon open={mobileMenuOpen} />
                    </motion.button>
                </div>
            </div>

            {/* Mobile Left Sidebar Drawer */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        <motion.button
                            aria-label="Close navigation overlay"
                            className="fixed inset-0 z-40 cursor-default bg-black/60 backdrop-blur-sm lg:hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileMenuOpen(false)}
                        />

                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", stiffness: 280, damping: 28 }}
                            style={{
                                backgroundColor: isDark ? "#0d0d12" : "#ffffff",
                                color: isDark ? "white" : "#0f172a",
                                boxShadow: "4px 0 30px rgba(0,0,0,0.3)",
                                height: "100vh",
                                minHeight: "100vh",
                            }}
                        >
                            <div
                                className="flex items-center justify-between px-5 py-5 shrink-0"
                                style={{ borderBottom: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid #e2e8f0" }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="relative h-9 w-9 rounded-xl overflow-hidden shrink-0" style={{ backgroundColor: "#2563eb" }}>
                                        <Image
                                            src={isDark ? "/iconDark.png" : "/iconLight.png"}
                                            alt={APP_NAME} fill sizes="36px" className="object-contain"
                                        />
                                    </div>
                                    <span className="text-[15px] font-black" style={{ color: isDark ? "#ffffff" : "#0f172a" }}>
                                        {APP_NAME}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="h-9 w-9 rounded-xl flex items-center justify-center transition-colors shrink-0"
                                    style={{
                                        backgroundColor: isDark ? "#1c1c28" : "#f1f5f9",
                                        color: isDark ? "#94a3b8" : "#475569",
                                        border: "none",
                                    }}
                                    aria-label="Close menu"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Mobile Navigation Grid */}
                            <div className="flex-1 overflow-y-auto px-5 py-4">
                                {navigation.categories.map((category) => (
                                    <div
                                        key={category.name}
                                        className="grid grid-cols-2 gap-x-6 gap-y-8"
                                    >
                                        {category.sections.map((section) => (
                                            <div key={section.name}>
                                                <h4
                                                    className="mb-3 text-[11px] font-black uppercase tracking-widest"
                                                    style={{ color: isDark ? "#64748b" : "#94a3b8" }}
                                                >
                                                    {section.name}
                                                </h4>
                                                <ul className="flex flex-col gap-2.5">
                                                    {section.items.map((item) => {
                                                        const active = item.href.startsWith("#")
                                                            ? isSectionActive(item.href.replace("#", ""))
                                                            : false;
                                                        return (
                                                            <li key={item.name}>
                                                                <Link
                                                                    href={item.href}
                                                                    onClick={() => setMobileMenuOpen(false)}
                                                                    className="text-sm font-medium transition-colors"
                                                                    style={{
                                                                        color: active
                                                                            ? (isDark ? "#60a5fa" : "#2563eb")
                                                                            : (isDark ? "#cbd5e1" : "#334155"),
                                                                        textDecoration: "none",
                                                                    }}
                                                                    onMouseEnter={(e) => {
                                                                        e.currentTarget.style.color = isDark ? "#60a5fa" : "#2563eb";
                                                                    }}
                                                                    onMouseLeave={(e) => {
                                                                        if (!active) {
                                                                            e.currentTarget.style.color = isDark ? "#cbd5e1" : "#334155";
                                                                        }
                                                                    }}
                                                                >
                                                                    {item.name}
                                                                </Link>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>

                            <div
                                className="shrink-0 px-4 pb-6 pt-4 flex flex-col gap-3"
                                style={{ borderTop: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0" }}
                            >
                                <button
                                    onClick={() => setTheme(isDark ? "light" : "dark")}
                                    className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-semibold transition-colors"
                                    style={{
                                        backgroundColor: isDark ? "#1c1c28" : "#f1f5f9",
                                        color: isDark ? "#cbd5e1" : "#475569",
                                        border: "none",
                                        cursor: "pointer",
                                    }}
                                    aria-label="Toggle theme"
                                >
                                    {isDark
                                        ? <Sun size={16} color="#64748b" />
                                        : <Moon size={16} color="#64748b" />
                                    }
                                    <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
                                </button>

                                <Link
                                    href={ROUTES.AUTH.REGISTER}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-black text-sm text-white"
                                    style={{ background: "linear-gradient(to right, #22d3ee, #3b82f6)", textDecoration: "none" }}
                                >
                                    Get Started
                                    <ArrowRight size={15} />
                                </Link>

                                <Link
                                    href={ROUTES.AUTH.LOGIN}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center justify-center py-3 rounded-xl text-sm font-semibold transition-colors"
                                    style={{
                                        color: isDark ? "#94a3b8" : "#64748b",
                                        textDecoration: "none",
                                    }}
                                >
                                    Login
                                </Link>

                                <div
                                    className="flex flex-col gap-2 pt-3"
                                    style={{ borderTop: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e2e8f0" }}
                                >
                                    <a
                                        href="tel:+1234567890"
                                        className="flex items-center gap-2.5 text-xs transition-colors"
                                        style={{ color: isDark ? "#475569" : "#94a3b8", textDecoration: "none" }}
                                    >
                                        <Phone size={13} />
                                        <span>+1 (555) 123-4567</span>
                                    </a>
                                    <a
                                        href="mailto:hello@saomalielectric.com"
                                        className="flex items-center gap-2.5 text-xs transition-colors"
                                        style={{ color: isDark ? "#475569" : "#94a3b8", textDecoration: "none" }}
                                    >
                                        <Mail size={13} />
                                        <span>hello@saomalielectric.com</span>
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </header>
    );
}
