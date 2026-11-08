"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { useState } from "react";

import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const plans = [
    {
        name: "Starter",
        monthly: 49,
        description: "For small cooperatives that need a polished operational foundation.",
        features: [
            "Up to 500 customers",
            "Basic billing workflows",
            "Mobile money integration",
            "Standard support",
            "Single admin workspace",
        ],
        cta: "Start Free Trial",
        popular: false,
    },
    {
        name: "Enterprise",
        monthly: 199,
        description: "The premium operating layer for large utility providers across Somalia.",
        features: [
            "Unlimited customers",
            "Advanced analytics suite",
            "All payment integrations",
            "Priority 24/7 support",
            "Unlimited employees",
            "Custom reporting",
        ],
        cta: "Contact Sales",
        popular: true,
    },
    {
        name: "Custom",
        monthly: null,
        description: "For national programs, integrations, and white-label partnerships.",
        features: [
            "Full API access",
            "Dedicated setup",
            "Custom SLA",
            "On-site training",
            "Hardware integrations",
        ],
        cta: "Contact Us",
        popular: false,
    },
];

function FeatureItem({ feature, popular, delay }: { feature: string; popular: boolean; delay: number }) {
    return (
        <motion.li
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.3 }}
            className="flex items-center gap-3"
        >
            <div className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                popular ? "bg-white/20 text-white" : "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
            )}>
                <Check size={12} />
            </div>
            <span className={cn("text-sm", popular ? "text-blue-50" : "text-zinc-600 dark:text-zinc-300")}>
                {feature}
            </span>
        </motion.li>
    );
}

export function Pricing() {
    const [annual, setAnnual] = useState(false);

    return (
        <section id="pricing" className="bg-white py-24 lg:py-32 dark:bg-zinc-950">
            <div className="container mx-auto max-w-7xl px-6 lg:px-10">
                <div className="mb-16 text-center">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                        Pricing
                    </p>
                    <h2 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
                        Simple, transparent pricing
                    </h2>
                    <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-500 dark:text-zinc-400">
                        Choose the right plan for your utility operations. No hidden fees.
                    </p>

                    {/* Toggle */}
                    <div className="mt-8 inline-flex items-center gap-4 rounded-full border border-zinc-200 bg-zinc-50 p-1.5 dark:border-zinc-800 dark:bg-zinc-900">
                        <button
                            onClick={() => setAnnual(false)}
                            className={cn(
                                "rounded-full px-5 py-2 text-sm font-semibold transition-all",
                                !annual
                                    ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white"
                                    : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                            )}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setAnnual(true)}
                            className={cn(
                                "relative rounded-full px-5 py-2 text-sm font-semibold transition-all",
                                annual
                                    ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white"
                                    : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                            )}
                        >
                            Annual
                            <span className="ml-1.5 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                Save 20%
                            </span>
                        </button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={!plan.popular ? { scale: 1.02 } : { scale: 1.03 }}
                            className={cn(
                                "relative flex flex-col rounded-xl border p-8 transition-all",
                                plan.popular
                                    ? "border-blue-600 bg-blue-600 text-white shadow-xl shadow-blue-500/20"
                                    : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900",
                                !plan.popular && "hover:border-blue-200 hover:shadow-lg dark:hover:border-blue-800"
                            )}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                                    <span className="rounded-full border border-blue-400 bg-blue-500 px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <h3 className={cn("text-lg font-semibold", plan.popular ? "text-white" : "text-zinc-900 dark:text-white")}>
                                {plan.name}
                            </h3>

                            <div className="mt-4 flex items-baseline gap-1">
                                <span className={cn("text-5xl font-bold tracking-tight", plan.popular ? "text-white" : "text-zinc-900 dark:text-white")}>
                                    {plan.monthly === null
                                        ? "Custom"
                                        : `$${annual ? plan.monthly * 10 : plan.monthly}`}
                                </span>
                                {plan.monthly !== null && (
                                    <span className={cn("text-sm", plan.popular ? "text-blue-200" : "text-zinc-500 dark:text-zinc-400")}>
                                        /{annual ? "yr" : "mo"}
                                    </span>
                                )}
                            </div>

                            {annual && plan.monthly !== null && (
                                <p className={cn("mt-1 text-xs", plan.popular ? "text-blue-200" : "text-zinc-400")}>
                                    ${plan.monthly}/mo billed annually
                                </p>
                            )}

                            <p className={cn("mt-4 text-sm leading-relaxed", plan.popular ? "text-blue-100" : "text-zinc-500 dark:text-zinc-400")}>
                                {plan.description}
                            </p>

                            <ul className="mt-8 flex-grow space-y-3">
                                {plan.features.map((feature, i) => (
                                    <FeatureItem key={feature} feature={feature} popular={plan.popular} delay={i * 0.05} />
                                ))}
                            </ul>

                            <Link
                                href={ROUTES.AUTH.REGISTER}
                                className={cn(
                                    "mt-10 flex h-11 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all active:scale-95",
                                    plan.popular
                                        ? "bg-white text-blue-600 hover:bg-blue-50"
                                        : "bg-blue-600 text-white hover:bg-blue-700"
                                )}
                            >
                                {plan.cta}
                                <ArrowRight size={14} />
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
