"use client";

import { Calendar, Edit, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Company } from "./types";
import { ModalShell } from "./ModalShell";
import { formatCurrency, formatNumber } from "./formatters";
import { PlanBadge } from "./PlanBadge";
import { StatusDot } from "./StatusDot";

export function ViewModal({ company, onClose, onEdit }: { company: Company; onClose: () => void; onEdit: () => void }) {
    return (
        <ModalShell title={company.name} subtitle={company.domain} onClose={onClose} maxWidth="max-w-3xl">
            <div className="grid gap-6 bg-slate-50 p-6 dark:bg-slate-950 md:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className={cn("flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-xl font-black text-white shadow-lg", company.logoColor)}>{company.logo}</div>
                        <div>
                            <div className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">{company.name}</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">{company.domain}</div>
                        </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Region</div>
                            <div className="mt-2 font-semibold text-slate-900 dark:text-slate-100">{company.region}</div>
                        </div>
                        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Status</div>
                            <div className="mt-2"><StatusDot status={company.status} /></div>
                        </div>
                        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Customers</div>
                            <div className="mt-2 font-semibold text-slate-900 dark:text-slate-100">{formatNumber(company.customers)}</div>
                        </div>
                        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Meters</div>
                            <div className="mt-2 font-semibold text-slate-900 dark:text-slate-100">{formatNumber(company.meters)}</div>
                        </div>
                        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Revenue</div>
                            <div className="mt-2 font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(company.revenue)}</div>
                        </div>
                        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Plan</div>
                            <div className="mt-2"><PlanBadge plan={company.plan} /></div>
                        </div>
                    </div>
                </div>
                <div className="space-y-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400"><Calendar size={16} /> Joined on {company.joined}</div>
                    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 dark:bg-slate-950 dark:ring-slate-800">
                        <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Quick actions</div>
                        <div className="mt-4 space-y-3">
                            <button onClick={onEdit} className="flex w-full items-center justify-center gap-2 rounded-full border border-blue-600/20 bg-blue-600 px-4 py-3 text-sm font-black text-white transition-all hover:-translate-y-0.5 hover:bg-blue-700">
                                <Edit size={16} /> Edit company
                            </button>
                            <button onClick={() => window.open(`https://${company.domain}`, "_blank", "noopener,noreferrer")} className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 transition-all hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800">
                                <ExternalLink size={16} /> Visit domain
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </ModalShell>
    );
}
