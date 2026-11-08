"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Building2, MapPin, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const companies = [
    { region: "Mogadishu", name: "BECO (Benadir Electric Company)" },
    { region: "Mogadishu", name: "Som Power" },
    { region: "Mogadishu", name: "Blue Sky Energy" },
    { region: "Somaliland", name: "Telesom Electric" },
    { region: "Somaliland", name: "HECO (Hargeisa Electric Company)" },
    { region: "Somaliland", name: "Kaah Electric" },
    { region: "Puntland", name: "NECSOM" },
    { region: "Puntland", name: "Bosaso Electric Company" },
    { region: "Other Regions", name: "Daha Electric" },
    { region: "Other Regions", name: "Juba Electric" },
    { region: "Other Regions", name: "Galkayo Power Company" },
    { region: "Other Regions", name: "Baidoa Electric Utilities" },
    { region: "Other Regions", name: "Kismayo Power Providers" },
];

const regionStyles: Record<string, string> = {
    Mogadishu: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20",
    Somaliland: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20",
    Puntland: "bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/20",
    "Other Regions": "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20",
};

const quickStats = [
    { icon: Building2, label: "Energy Providers", value: "13+" },
    { icon: MapPin, label: "Regions Covered", value: "4" },
    { icon: Globe, label: "Nationwide", value: "100%" },
];

export function Statistics() {
    const marqueeItems = [...companies, ...companies];
    const [isHovered, setIsHovered] = useState(false);

    const topDuration = isHovered ? 120 : 60;
    const bottomDuration = isHovered ? 140 : 80;

    return (
        <section className="relative border-t border-zinc-100 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 py-20 dark:border-zinc-800 dark:from-zinc-950 dark:via-zinc-900/60 dark:to-zinc-950">
            <div className="container mx-auto max-w-7xl px-6 lg:px-10">
                <div className="mb-14 max-w-2xl">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
                        <Building2 size={11} />
                        National Network
                    </div>
                    <h2 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
                        Connected Energy{" "}
                        <span className="text-blue-600 dark:text-blue-400">Providers</span>
                    </h2>
                    <p className="mt-4 text-base text-zinc-500 dark:text-zinc-400">
                        Supporting utility networks and power cooperatives across all Somali territories
                        with digital, automated operations.
                    </p>
                </div>

                {/* Quick stats row */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-12 grid grid-cols-3 gap-4 sm:gap-8"
                >
                    {quickStats.map((stat) => (
                        <div
                            key={stat.label}
                            className="flex flex-col items-center gap-2 rounded-xl border border-zinc-200 bg-white/70 p-6 text-center backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/70"
                        >
                            <stat.icon size={20} className="text-blue-600 dark:text-blue-400" />
                            <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                                {stat.value}
                            </span>
                            <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                                {stat.label}
                            </span>
                        </div>
                    ))}
                </motion.div>

                {/* Marquee */}
                <div
                    className="relative overflow-hidden py-3"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-white to-transparent dark:from-zinc-950" />
                    <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-white to-transparent dark:from-zinc-950" />

                    <motion.div
                        animate={{ x: [0, "-50%"] }}
                        transition={{ duration: topDuration, repeat: Infinity, ease: "linear" }}
                        className="flex w-max items-center gap-4 pb-2"
                    >
                        {marqueeItems.map((company, index) => (
                            <div
                                key={`top-${index}`}
                                className="group flex min-w-[280px] flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/5 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-700 dark:hover:shadow-blue-500/10"
                            >
                                <div className="flex items-center justify-between">
                                    <span className={cn(
                                        "rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest",
                                        regionStyles[company.region] || "bg-blue-50 text-blue-700 border-blue-100"
                                    )}>
                                        {company.region}
                                    </span>
                                    <Zap size={13} className="text-zinc-300 transition-colors group-hover:text-blue-500 dark:text-zinc-700" />
                                </div>
                                <span className="text-sm font-semibold text-zinc-800 transition-colors group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400">
                                    {company.name}
                                </span>
                            </div>
                        ))}
                    </motion.div>

                    <motion.div
                        animate={{ x: ["-50%", 0] }}
                        transition={{ duration: bottomDuration, repeat: Infinity, ease: "linear" }}
                        className="mt-4 flex w-max items-center gap-4"
                    >
                        {marqueeItems.map((company, index) => (
                            <div
                                key={`bottom-${index}`}
                                className="group flex min-w-[280px] flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/5 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-700 dark:hover:shadow-blue-500/10"
                            >
                                <div className="flex items-center justify-between">
                                    <span className={cn(
                                        "rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest",
                                        regionStyles[company.region] || "bg-blue-50 text-blue-700 border-blue-100"
                                    )}>
                                        {company.region}
                                    </span>
                                    <Zap size={13} className="text-zinc-300 transition-colors group-hover:text-blue-500 dark:text-zinc-700" />
                                </div>
                                <span className="text-sm font-semibold text-zinc-800 transition-colors group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-400">
                                    {company.name}
                                </span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
