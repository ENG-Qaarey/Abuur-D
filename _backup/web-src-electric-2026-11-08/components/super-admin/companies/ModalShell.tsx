"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function ModalShell({ title, subtitle, onClose, children, maxWidth = "max-w-2xl" }: { title: string; subtitle?: string; onClose: () => void; children: ReactNode; maxWidth?: string; }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button aria-label="Close modal" className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm dark:bg-slate-950/80" onClick={onClose} />
            <div className={cn("relative z-10 w-full overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950", maxWidth)}>
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50 px-6 py-5 dark:border-slate-800 dark:bg-slate-900/70">
                    <div>
                        <h3 className="text-lg font-black tracking-tight text-slate-950 dark:text-white">{title}</h3>
                        {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
                    </div>
                    <button onClick={onClose} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white">
                        <X size={16} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}
