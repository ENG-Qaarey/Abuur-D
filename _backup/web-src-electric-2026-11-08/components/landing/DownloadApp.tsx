"use client";

import { motion } from "framer-motion";
import { Check, Smartphone } from "lucide-react";

const benefits = [
    "Pay bills instantly via Zaad & EVC Plus",
    "Track your daily electricity usage",
    "Report outages with one tap",
    "Receive real-time alerts & notifications",
    "Access 24/7 customer support",
];

export function DownloadApp() {
    return (
        <section className="bg-white py-24 dark:bg-zinc-950">
            <div className="container mx-auto max-w-7xl px-6 lg:px-10">
                <div className="grid items-center gap-12 lg:grid-cols-2">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
                            <Smartphone size={11} />
                            Mobile App
                        </div>
                        <h2 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
                            Take SEA in your pocket
                        </h2>
                        <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400">
                            Download the SEA mobile app to manage your utility account from
                            anywhere in Somalia.
                        </p>

                        <ul className="mt-8 space-y-4">
                            {benefits.map((benefit) => (
                                <li key={benefit} className="flex items-center gap-3">
                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                                        <Check size={13} />
                                    </div>
                                    <span className="text-zinc-700 dark:text-zinc-300">
                                        {benefit}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-10 flex flex-wrap gap-4">
                            <a
                                href="#"
                                className="inline-flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-6 py-3 text-sm font-semibold text-zinc-800 transition-all hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                            >
                                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.74 12.03c-.04-2.79 1.54-4.76 3.96-5.82-1.26-1.84-3.18-2.68-5.74-2.5-1.12.05-2.3.44-3.29.82-.91.35-1.82.7-2.58.7-.8 0-1.61-.33-2.44-.68-.9-.38-1.85-.78-2.98-.82C3.6 2.5 1.4 4.21.92 6.97c-.41 2.33.69 5.32 2.18 7.08.32.38.66.78 1.02 1.2.34.39.71.82 1.09 1.17.46.43.94.83 1.47 1.22.66.49 1.3.92 2.09.9.75-.01 1.17-.3 1.95-.59.95-.35 2.02-.74 3.5-.67 1.67.08 2.91.57 3.93 1.49.77-1.56 1.09-3.11.99-4.72-.87-.52-2.03-1.06-4.01-1.13zM14.9 4.15C15.64 2.85 16.28 1.25 16.08 0c-1.12.09-2.45.68-3.24 1.66-.74.91-1.32 2.27-1.12 3.46 1.21.16 2.37-.4 3.18-.97z"/>
                                </svg>
                                App Store
                            </a>
                            <a
                                href="#"
                                className="inline-flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-6 py-3 text-sm font-semibold text-zinc-800 transition-all hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                            >
                                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M3.61 2.1C3.31 1.8 3 1.92 3 2.33v19.34c0 .41.31.53.61.23l10.39-10.4c.2-.2.2-.52 0-.72L3.61 2.1zm2.55 1.56l8.18 8.18-8.18 8.18V3.66zM21 11.01c.55 0 1 .45 1 1s-.45 1-1 1h-7.07l-2-2H21zm0 4c.55 0 1 .45 1 1s-.45 1-1 1h-4.07l-2-2H21z"/>
                                </svg>
                                Google Play
                            </a>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="flex justify-center"
                    >
                        <div className="relative h-[500px] w-[260px] rounded-[2.5rem] border-4 border-zinc-800 bg-zinc-900 p-3 shadow-2xl dark:border-zinc-700">
                            <div className="absolute left-1/2 top-0 z-10 h-6 w-36 -translate-x-1/2 rounded-b-2xl bg-zinc-800 dark:bg-zinc-700" />

                            <div className="flex h-full w-full flex-col items-center justify-center rounded-[1.8rem] bg-gradient-to-br from-blue-500 via-indigo-500 to-blue-600 p-6 text-center text-white">
                                <Smartphone size={40} className="mb-4 opacity-80" />
                                <p className="text-lg font-bold">SEA</p>
                                <p className="mt-1 text-sm opacity-80">Saomali Electric App</p>
                                <div className="mt-6 flex gap-1">
                                    {[1, 2, 3, 4, 5].map((dot) => (
                                        <div
                                            key={dot}
                                            className="h-1.5 w-1.5 rounded-full bg-white/40"
                                        />
                                    ))}
                                </div>
                                <p className="mt-6 text-xs opacity-60">Download now</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
