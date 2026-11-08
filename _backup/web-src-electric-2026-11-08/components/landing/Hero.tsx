"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRef, useState, useCallback } from "react";

import { ROUTES } from "@/lib/constants";
import electricityData from "../../../electricity.json";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export function Hero() {
	const sectionRef = useRef<HTMLElement>(null);
	const [spotlight, setSpotlight] = useState({ x: -9999, y: -9999 });

	const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
		const rect = sectionRef.current?.getBoundingClientRect();
		if (!rect) return;
		setSpotlight({ x: e.clientX - rect.left, y: e.clientY - rect.top });
	}, []);

	const handleMouseLeave = useCallback(() => {
		setSpotlight({ x: -9999, y: -9999 });
	}, []);

	return (
		<section
			ref={sectionRef}
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
			className="bg-transparent dark:bg-zinc-950 min-h-screen relative pt-20 overflow-hidden"
		>
			{/* Static dim dot grid */}
			<div
				className="absolute inset-0 pointer-events-none"
				style={{
					backgroundImage:
						"radial-gradient(circle, #a1a1aa 1px, transparent 1px)",
					backgroundSize: "20px 20px",
					opacity: 0.25,
				}}
			/>

			{/* Spotlight layer — lit dots follow the cursor */}
			<div
				className="absolute inset-0 pointer-events-none transition-opacity duration-150"
				style={{
					backgroundImage:
						"radial-gradient(circle, #3b82f6 1px, transparent 1px)",
					backgroundSize: "20px 20px",
					WebkitMaskImage: `radial-gradient(circle 180px at ${spotlight.x}px ${spotlight.y}px, black 0%, transparent 100%)`,
					maskImage: `radial-gradient(circle 180px at ${spotlight.x}px ${spotlight.y}px, black 0%, transparent 100%)`,
					opacity: spotlight.x === -9999 ? 0 : 1,
				}}
			/>

			{/* Content */}
			<div className="relative z-10 container mx-auto max-w-7xl px-6 lg:px-10 py-16">
				<div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">

					{/* ── Left: Text ───────────────────────────────── */}
					<motion.div
						initial={{ opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						className="flex flex-col items-start"
					>
						{/* Live badge */}
						<div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-xs font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
							<span className="relative flex h-1.5 w-1.5">
								<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
								<span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
							</span>
							⚡ Somali Power Digitization is Live
						</div>

						{/* Headline */}
						<h1 className="text-4xl font-bold leading-[1.12] tracking-tight text-zinc-900 sm:text-5xl dark:text-white">
							Empowering{" "}
							<span className="text-blue-600 dark:text-blue-400">Somalia&apos;s Grid</span>
							{" "}with Smarter Power
						</h1>

						{/* Subtitle */}
						<p className="mt-4 max-w-lg text-base leading-relaxed text-zinc-500 dark:text-zinc-400">
							SEA is a unified utility management ecosystem. Automate billing,
							track consumption, manage smart meters, and drive efficiency across
							Somalia&apos;s power grids.
						</p>

						{/* CTA Buttons */}
						<div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
							{/* Sign‑Up (primary) */}
							<Link
								href={ROUTES.AUTH.REGISTER}
								className="group inline-flex h-12 items-center justify-center gap-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-8 text-base font-semibold text-white shadow-md transition hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg active:scale-95"
							>
								Sign Up
								<ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
							</Link>
							{/* Log‑In (secondary) */}
							<Link
								href={ROUTES.AUTH.LOGIN}
								className="inline-flex h-12 items-center justify-center gap-3 rounded-lg border border-blue-600 bg-white px-8 text-base font-semibold text-blue-600 shadow-sm transition hover:bg-blue-600 hover:text-white active:scale-95 dark:bg-zinc-900 dark:hover:bg-blue-600 dark:hover:text-white"
							>
								Log In
							</Link>
						</div>

						{/* Inline stats */}
						<div className="mt-10 flex flex-wrap items-center gap-6 border-t border-zinc-100 pt-8 dark:border-zinc-800">
							<div>
								<p className="text-xl font-bold text-zinc-900 dark:text-white">13+</p>
								<p className="text-xs text-zinc-400">Utility Providers</p>
							</div>
							<div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800" />
							<div>
								<p className="text-xl font-bold text-zinc-900 dark:text-white">500K+</p>
								<p className="text-xs text-zinc-400">Customers Served</p>
							</div>
							<div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800" />
							<div>
								<p className="text-xl font-bold text-blue-600 dark:text-blue-400">99.98%</p>
								<p className="text-xs text-zinc-400">Grid Uptime</p>
							</div>
						</div>
					</motion.div>

					{/* ── Right: Lottie only ────────────────────────── */}
					<motion.div
						initial={{ opacity: 0, scale: 0.97 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.5, delay: 0.1 }}
						className="flex items-center justify-center"
					>
						<Lottie
							animationData={electricityData}
							loop={true}
							className="w-full max-w-[480px]"
						/>
					</motion.div>

				</div>
			</div>
		</section>
	);
}
