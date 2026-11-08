"use client";

import { motion, useInView, animate } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
    Zap,
    ShieldCheck,
    TrendingUp,
    Heart,
    ArrowRight,
    Target,
    Eye,
    Users,
    Globe,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";

const missionPoints = [
    {
        title: "Economic Growth",
        icon: TrendingUp,
        text: "Reduce operational friction and help local businesses grow with transparent, reliable billing.",
        color: "bg-blue-500",
        light: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
    },
    {
        title: "Digital Inclusion",
        icon: Zap,
        text: "Bring accessible billing, reporting, and direct utility services to every Somali household.",
        color: "bg-indigo-500",
        light: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400",
    },
    {
        title: "Grid Sustainability",
        icon: ShieldCheck,
        text: "Support a cleaner, more resilient power grid with smarter visibility and outage response.",
        color: "bg-cyan-500",
        light: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400",
    },
    {
        title: "Tailored Somali Built",
        icon: Heart,
        text: "A grid portal built from the ground up to respect local realities and national infrastructure goals.",
        color: "bg-blue-600",
        light: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    },
];

const stats = [
    { value: 120, suffix: "+", label: "Energy Providers", icon: Globe, color: "text-blue-600 dark:text-blue-400" },
    { value: 500, suffix: "K+", label: "Active Customers", icon: Users, color: "text-indigo-600 dark:text-indigo-400" },
    { value: 99.98, suffix: "%", label: "Grid Uptime", icon: ShieldCheck, color: "text-cyan-600 dark:text-cyan-400" },
    { value: 1.2, suffix: " GW", label: "Power Managed", icon: Zap, color: "text-blue-700 dark:text-blue-300" },
];

function AnimatedCounter({ target, suffix, decimals = 0 }: { target: number; suffix: string; decimals?: number }) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true });
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!isInView) return;
        const controls = animate(0, target, {
            duration: 2,
            ease: "easeOut",
            onUpdate: (latest) => setCount(latest),
        });
        return controls.stop;
    }, [isInView, target]);

    return (
        <span ref={ref}>
            {count.toFixed(decimals)}{suffix}
        </span>
    );
}

export function Impact() {
    return (
        <section id="about" className="relative bg-white py-28 lg:py-36 dark:bg-zinc-950">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent dark:via-blue-800" />

            <div className="container relative z-10 mx-auto max-w-7xl px-6 lg:px-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-20 text-center"
                >
                    <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
                        <Zap size={11} className="fill-current" />
                        National Impact
                    </span>
                    <h2 className="mt-4 text-5xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-6xl">
                        Built for{" "}
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
                            Somalia&apos;s Future
                        </span>
                    </h2>
                    <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-zinc-500 dark:text-zinc-400">
                        SEA bridges the gap between power utility companies and consumers —
                        automating billing, enabling smart metering, and driving measurable
                        progress across Somalia&apos;s power grid.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="mb-20 grid grid-cols-2 gap-4 sm:grid-cols-4"
                >
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.08 }}
                            className="group flex flex-col items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-6 py-8 text-center shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50/50 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-800 dark:hover:bg-blue-950/20"
                        >
                            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950 ${stat.color}`}>
                                <stat.icon size={18} />
                            </div>
                            <div className={`text-4xl font-bold tracking-tight ${stat.color}`}>
                                <AnimatedCounter target={stat.value} suffix={stat.suffix} decimals={stat.value % 1 === 0 ? 0 : 2} />
                            </div>
                            <div className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                <div className="mb-20 grid gap-6 lg:grid-cols-2">
                    <motion.div
                        initial={{ opacity: 0, x: -24 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-600 to-indigo-600 p-10 text-white shadow-xl shadow-blue-500/20 dark:border-blue-800"
                    >
                        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10" />
                        <div className="pointer-events-none absolute -bottom-16 -left-8 h-40 w-40 rounded-full bg-white/5" />

                        <div className="relative z-10">
                            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                                <Target size={22} className="text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Our Core Mission</h3>
                            <p className="mt-4 text-base leading-relaxed text-blue-100">
                                To digitalize Somalia&apos;s energy sector by providing reliable, transparent,
                                and high-performance metering and management systems built for grid stability
                                and economic empowerment.
                            </p>
                            <Link
                                href="#features"
                                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white/80 transition-colors hover:text-white"
                            >
                                Explore Features <ArrowRight size={14} />
                            </Link>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 24 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white/80 p-10 shadow-sm backdrop-blur-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/80"
                    >
                        <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-blue-500 to-indigo-500" />

                        <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 shadow-sm dark:border-blue-900 dark:from-blue-950 dark:to-indigo-950 dark:text-blue-400">
                            <Eye size={22} />
                        </div>
                        <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">Our Strategic Vision</h3>
                        <p className="mt-4 text-base leading-relaxed text-zinc-500 dark:text-zinc-400">
                            To serve as the primary smart utility partner across East Africa, driving grid
                            efficiency and micro-economic empowerment through cutting-edge grid software
                            tailored for every community.
                        </p>
                        <Link
                            href="#pricing"
                            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            View Pricing <ArrowRight size={14} />
                        </Link>
                    </motion.div>
                </div>

                <motion.div
                    className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
                >
                    {missionPoints.map((m) => (
                        <motion.div
                            key={m.title}
                            variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
                            className="group relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-800"
                        >
                            <div className={`absolute inset-x-0 top-0 h-0.5 ${m.color} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />

                            <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${m.light} transition-transform duration-300 group-hover:scale-110`}>
                                <m.icon size={22} />
                            </div>

                            <div>
                                <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                                    {m.title}
                                </h4>
                                <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                                    {m.text}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-20 flex flex-col items-center gap-6 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-14 text-center dark:border-blue-900 dark:from-blue-950/30 dark:to-indigo-950/30 sm:px-16"
                >
                    <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-blue-700 dark:border-blue-800 dark:bg-zinc-900 dark:text-blue-300">
                        <Zap size={11} className="fill-current" />
                        Get Started Today
                    </span>
                    <h3 className="max-w-xl text-3xl font-bold text-zinc-900 dark:text-white sm:text-4xl">
                        Ready to modernize your utility operations?
                    </h3>
                    <p className="max-w-lg text-base text-zinc-500 dark:text-zinc-400">
                        Join 120+ energy providers already running their grids smarter with SEA.
                        Set up your workspace in minutes.
                    </p>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Link
                            href={ROUTES.AUTH.REGISTER}
                            className="group inline-flex h-12 items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-8 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/30 active:scale-95"
                        >
                            Start Free Trial
                            <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                        </Link>
                        <Link
                            href="#features"
                            className="inline-flex h-12 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-8 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                        >
                            Explore Features
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
