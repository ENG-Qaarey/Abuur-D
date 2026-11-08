"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const faqs = [
    {
        q: "How do I pay my bill using the app?",
        a: "You can pay instantly via Zaad, EVC Plus, or Sahal from the customer dashboard. SEA keeps the journey calm, fast, and secure.",
    },
    {
        q: "Can I monitor my usage in real time?",
        a: "Yes. Smart meters sync into the dashboard so customers and operators can review live usage, trends, and alerts with clarity.",
    },
    {
        q: "What should I do during a power outage?",
        a: "Report the outage inside the dashboard or mobile app. Your operations team can verify it, coordinate response, and track restoration.",
    },
    {
        q: "How secure is my payment data?",
        a: "SEA uses secure integrations and permission-based access, and it does not store mobile money PINs or sensitive payment secrets.",
    },
    {
        q: "Which payment methods are supported?",
        a: "SEA supports Zaad, EVC Plus, Sahal, and credit/debit cards. More payment gateways are being added regularly.",
    },
];

export function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section id="faq" className="bg-zinc-50 py-24 lg:py-32 dark:bg-zinc-900/40">
            <div className="container mx-auto max-w-7xl px-6 lg:px-10">
                <div className="grid gap-16 lg:grid-cols-[1fr_1.5fr] lg:items-start">

                    {/* Left: header */}
                    <div className="lg:sticky lg:top-28">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                            FAQ
                        </p>
                        <h2 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
                            Frequently asked questions
                        </h2>
                        <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400">
                            Everything you need to know about the SEA platform. Can&apos;t find an answer?{" "}
                            <a href="mailto:support@sea.so" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                                Reach out to us.
                            </a>
                        </p>
                    </div>

                    {/* Right: accordion */}
                    <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {faqs.map((faq, i) => {
                            const open = openIndex === i;
                            return (
                                <div key={faq.q}>
                                    <button
                                        onClick={() => setOpenIndex(open ? null : i)}
                                        className="flex w-full items-center justify-between gap-4 py-6 text-left"
                                    >
                                        <span className={cn(
                                            "text-base font-semibold transition-colors",
                                            open ? "text-blue-600 dark:text-blue-400" : "text-zinc-900 dark:text-white"
                                        )}>
                                            {faq.q}
                                        </span>
                                        <ChevronDown
                                            size={18}
                                            className={cn(
                                                "shrink-0 text-zinc-400 transition-transform duration-300",
                                                open && "rotate-180 text-blue-600 dark:text-blue-400"
                                            )}
                                        />
                                    </button>

                                    <AnimatePresence initial={false}>
                                        {open && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.25 }}
                                                className="overflow-hidden"
                                            >
                                                <p className="pb-6 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                                                    {faq.a}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
