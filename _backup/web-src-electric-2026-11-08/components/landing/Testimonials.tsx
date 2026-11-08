"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
    {
        name: "Ahmed Hassan",
        title: "CEO, Benadir Electric Company",
        quote:
            "SEA transformed how we manage billing and customer relations. Our collection rate increased by 40% in just three months. The mobile money integration alone saved us countless hours of manual reconciliation.",
        rating: 5,
        initials: "AH",
    },
    {
        name: "Fadumo Ali",
        title: "Operations Manager, Som Power",
        quote:
            "The analytics dashboard gives us real-time visibility into our grid performance that we never had before. We can now predict outages before they happen and deploy crews proactively.",
        rating: 5,
        initials: "FA",
    },
    {
        name: "Abdirahman Mohamed",
        title: "CTO, Telesom Electric",
        quote:
            "Deploying SEA across our service territory was seamless. The team understood our unique challenges in the Somali market and delivered a solution that actually works in our environment.",
        rating: 5,
        initials: "AM",
    },
    {
        name: "Safia Ibrahim",
        title: "Director, NECSOM",
        quote:
            "The customer portal has been a game-changer for our users. They can now pay bills, track usage, and report issues from their phones. Customer satisfaction is at an all-time high.",
        rating: 4,
        initials: "SI",
    },
];

export function Testimonials() {
    const [current, setCurrent] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const next = useCallback(() => {
        setCurrent((prev) => (prev + 1) % testimonials.length);
    }, []);

    useEffect(() => {
        if (isPaused) return;
        const timer = setInterval(next, 5000);
        return () => clearInterval(timer);
    }, [isPaused, next]);

    return (
        <section className="bg-zinc-50 py-24 dark:bg-zinc-900/40">
            <div className="container mx-auto max-w-7xl px-6 lg:px-10">
                <div className="mb-16 text-center">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                        Testimonials
                    </p>
                    <h2 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
                        Trusted by utility leaders
                    </h2>
                    <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-500 dark:text-zinc-400">
                        Hear from the energy providers already running their grids with SEA.
                    </p>
                </div>

                <div
                    className="relative mx-auto max-w-3xl"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={current}
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -40 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-10 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                        >
                            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />

                            <Quote className="mb-6 h-10 w-10 text-blue-100 dark:text-blue-900" />

                            <blockquote className="text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">
                                &ldquo;{testimonials[current].quote}&rdquo;
                            </blockquote>

                            <div className="mt-6 flex gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                        key={i}
                                        size={16}
                                        className={
                                            i < testimonials[current].rating
                                                ? "fill-amber-400 text-amber-400"
                                                : "text-zinc-200 dark:text-zinc-700"
                                        }
                                    />
                                ))}
                            </div>

                            <div className="mt-6 flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
                                    {testimonials[current].initials}
                                </div>
                                <div>
                                    <div className="font-semibold text-zinc-900 dark:text-white">
                                        {testimonials[current].name}
                                    </div>
                                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                                        {testimonials[current].title}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    <div className="mt-8 flex justify-center gap-2">
                        {testimonials.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrent(i)}
                                className={`h-2 rounded-full transition-all ${
                                    i === current
                                        ? "w-8 bg-blue-600"
                                        : "w-2 bg-zinc-300 dark:bg-zinc-700"
                                }`}
                                aria-label={`Go to testimonial ${i + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
