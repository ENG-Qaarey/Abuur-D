"use client";

import { motion } from "framer-motion";
import {
    BarChart3,
    CreditCard,
    Users,
    ShieldCheck,
    Smartphone,
    Bell,
    ArrowRight,
} from "lucide-react";
import Link from "next/link";

const features = [
    {
        title: "Grid Intelligence",
        description: "Track demand and consumption patterns in a clean enterprise view built for utility teams.",
        icon: BarChart3,
        gradient: "from-blue-500 to-cyan-500",
    },
    {
        title: "Mobile Payments",
        description: "Accept Zaad and EVC Plus with fast reconciliations and polished receipt workflows.",
        icon: CreditCard,
        gradient: "from-indigo-500 to-purple-500",
    },
    {
        title: "Role-based Operations",
        description: "Separate views for admins, meter readers, and customers for better control.",
        icon: Users,
        gradient: "from-emerald-500 to-teal-500",
    },
    {
        title: "Security Layer",
        description: "Role-based access and secure data handling for critical energy workflows.",
        icon: ShieldCheck,
        gradient: "from-rose-500 to-pink-500",
    },
    {
        title: "Mobile UX",
        description: "Mobile-first tools for inspections and meter reads with fast touch interactions.",
        icon: Smartphone,
        gradient: "from-amber-500 to-orange-500",
    },
    {
        title: "Outage Awareness",
        description: "Surface maintenance and outage signals immediately for confident operations.",
        icon: Bell,
        gradient: "from-violet-500 to-purple-500",
    },
];



export function Features() {
    return (
        <section id="features" className="bg-zinc-50 py-24 sm:py-32 dark:bg-zinc-900/40">
            <div className="container mx-auto max-w-7xl px-6 lg:px-10">
                <div className="mb-16 max-w-2xl">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                        Platform Features
                    </p>
                    <h2 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
                        Everything your utility team needs
                    </h2>
                    <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400">
                        A comprehensive suite of tools built for modern power utility operations across Somalia.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30, y: 20 }}
                            whileInView={{ opacity: 1, x: 0, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.07, duration: 0.45, ease: "easeOut" }}
                            className="group relative flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-800"
                        >
                            <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-xl bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 shadow-sm ring-1 ring-blue-100 transition-all duration-300 group-hover:scale-110 group-hover:shadow-md dark:from-blue-950 dark:to-indigo-950 dark:text-blue-400 dark:ring-blue-900">
                                <feature.icon size={22} />
                            </div>

                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                {feature.title}
                            </h3>

                            <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                                {feature.description}
                            </p>

                            <Link
                                href="#"
                                className="mt-auto inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 opacity-0 transition-all duration-300 group-hover:opacity-100 dark:text-blue-400"
                            >
                                Learn more <ArrowRight size={12} />
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
