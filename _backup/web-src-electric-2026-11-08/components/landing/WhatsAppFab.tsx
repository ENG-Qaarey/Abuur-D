"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

export function WhatsAppFab() {
    const [hovered, setHovered] = useState(false);
    const href = "https://wa.me/252614463895";

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 1 }}
            className="fixed bottom-6 right-6 z-50 sm:bottom-8 sm:right-8"
        >
            <Link
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp"
                className="relative block"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                {/* Tooltip */}
                <motion.span
                    initial={{ opacity: 0, x: 10, pointerEvents: "none" }}
                    animate={hovered ? { opacity: 1, x: 0 } : { opacity: 0, x: 10 }}
                    className="absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white shadow-lg dark:bg-white dark:text-zinc-900"
                >
                    Chat with us
                </motion.span>

                {/* Pulse ring */}
                <motion.span
                    className="absolute inset-0 rounded-full bg-emerald-500"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.4, 0, 0.4],
                    }}
                    transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />

                {/* Button */}
                <motion.div
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.94 }}
                    className="relative flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-900/20 ring-1 ring-emerald-600/40 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="currentColor" aria-hidden>
                        <path d="M20.52 3.48A11.88 11.88 0 0 0 12 .75C6.6.75 2.29 4.92 2.06 10.08c-.07 1.19.2 2.35.77 3.36L1 22l8.9-1.62c.98.53 2.07.81 3.16.81 5.4 0 9.71-4.17 9.95-9.33.18-3.21-1.17-6.22-3.49-8.38zM12 20.4c-.92 0-1.83-.23-2.63-.66l-.19-.11-5.3.97 1.07-4.12-.12-.2A8.1 8.1 0 0 1 3 10.08C3.22 6.03 7.03 2.9 11.99 2.9c2.95 0 5.66 1.28 7.54 3.52 1.8 2.13 2.45 4.96 1.84 7.64-.45 1.86-1.7 3.54-3.44 4.62-1.29.84-2.88 1.27-4.77 1.12z" />
                        <path d="M17.33 14.18c-.29-.14-1.7-.84-1.96-.94-.26-.1-.45-.14-.64.14-.19.29-.76.94-.93 1.13-.17.19-.34.21-.63.07-.29-.14-1.23-.45-2.34-1.44-.87-.77-1.46-1.72-1.63-2.01-.17-.29-.02-.45.13-.59.13-.13.29-.34.44-.51.15-.17.2-.29.29-.48.09-.19.05-.36-.02-.5-.07-.14-.64-1.54-.88-2.12-.23-.55-.47-.48-.64-.48-.17 0-.37-.02-.57-.02-.19 0-.5.07-.76.36-.26.29-.99.97-.99 2.37 0 1.4 1.01 2.75 1.15 2.94.14.19 1.97 3.02 4.77 4.24 1.67.72 2.41.77 3.27.64.52-.08 1.7-.69 1.94-1.36.24-.66.24-1.22.17-1.36-.07-.14-.26-.22-.55-.36z" />
                    </svg>
                </motion.div>
            </Link>
        </motion.div>
    );
}
