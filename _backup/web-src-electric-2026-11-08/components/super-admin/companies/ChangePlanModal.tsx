"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Company } from "./types";
import { ModalShell } from "./ModalShell";
import { plans } from "./constants";

export function ChangePlanModal({ company, onClose, onSave }: { company: Company; onClose: () => void; onSave: (plan: string) => void }) {
    const [plan, setPlan] = useState(company.plan);
    return (
        <ModalShell title="Change Plan" subtitle={company.name} onClose={onClose} maxWidth="max-w-lg">
            <div className="space-y-6 bg-slate-50 p-6 dark:bg-slate-950">
                <label className="flex flex-col gap-2">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Subscription plan</span>
                    <div className="relative">
                        <select value={plan} onChange={(e) => setPlan(e.target.value)} className="h-12 w-full appearance-none rounded-full border border-slate-200 bg-white px-4 pr-12 text-slate-950 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400/10">
                            {plans.map((item) => <option key={item}>{item}</option>)}
                        </select>
                        <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                    </div>
                </label>
                <div className="flex gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                    <button onClick={onClose} className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
                        Cancel
                    </button>
                    <button onClick={() => onSave(plan)} className="flex-1 rounded-full border border-blue-600/20 bg-blue-600 px-4 py-3 text-sm font-black text-white transition-all hover:-translate-y-0.5 hover:bg-blue-700">
                        Update plan
                    </button>
                </div>
            </div>
        </ModalShell>
    );
}
