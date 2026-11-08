"use client";

import { useState } from "react";
import { ChevronDown, Save } from "lucide-react";
import type { Company, CompanyFormState } from "./types";
import { ModalShell } from "./ModalShell";
import { plans, regions, statuses } from "./constants";

export function EditModal({ company, onClose, onSave }: { company: Company; onClose: () => void; onSave: (updated: Company) => void }) {
    const [form, setForm] = useState<CompanyFormState>({
        name: company.name,
        domain: company.domain,
        region: company.region,
        customers: String(company.customers),
        meters: String(company.meters),
        revenue: String(company.revenue),
        plan: company.plan,
        status: company.status,
    });

    return (
        <ModalShell title="Edit Company" subtitle="Update the company profile and save changes." onClose={onClose} maxWidth="max-w-3xl">
            <form
                className="space-y-6 bg-slate-50 p-6 dark:bg-slate-950"
                onSubmit={(e) => {
                    e.preventDefault();
                    onSave({
                        ...company,
                        name: form.name.trim(),
                        domain: form.domain.trim(),
                        region: form.region,
                        customers: Number(form.customers) || 0,
                        meters: Number(form.meters) || 0,
                        revenue: Number(form.revenue) || 0,
                        plan: form.plan,
                        status: form.status,
                    });
                }}
            >
                <div className="grid gap-4 md:grid-cols-2">
                    {[
                        ["Company name", "name"],
                        ["Domain", "domain"],
                    ].map(([label, key]) => (
                        <label key={label} className="flex flex-col gap-2">
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{label}</span>
                            <input
                                value={form[key as keyof CompanyFormState]}
                                onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                                className="h-12 w-full rounded-full border border-slate-200 bg-white px-4 text-slate-950 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/10"
                            />
                        </label>
                    ))}
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Region</span>
                        <div className="relative">
                            <select value={form.region} onChange={(e) => setForm((prev) => ({ ...prev, region: e.target.value }))} className="h-12 w-full appearance-none rounded-full border border-slate-200 bg-white px-4 pr-12 text-slate-950 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400/10">
                                {regions.slice(1).map((region) => <option key={region}>{region}</option>)}
                            </select>
                            <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                        </div>
                    </label>
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Plan</span>
                        <div className="relative">
                            <select value={form.plan} onChange={(e) => setForm((prev) => ({ ...prev, plan: e.target.value }))} className="h-12 w-full appearance-none rounded-full border border-slate-200 bg-white px-4 pr-12 text-slate-950 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400/10">
                                {plans.map((plan) => <option key={plan}>{plan}</option>)}
                            </select>
                            <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                        </div>
                    </label>
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Status</span>
                        <div className="relative">
                            <select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))} className="h-12 w-full appearance-none rounded-full border border-slate-200 bg-white px-4 pr-12 text-slate-950 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400/10">
                                {statuses.slice(1).map((status) => <option key={status}>{status}</option>)}
                            </select>
                            <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                        </div>
                    </label>
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Customers</span>
                        <input type="number" value={form.customers} onChange={(e) => setForm((prev) => ({ ...prev, customers: e.target.value }))} className="h-12 w-full rounded-full border border-slate-200 bg-white px-4 text-slate-950 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400/10" />
                    </label>
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Meters</span>
                        <input type="number" value={form.meters} onChange={(e) => setForm((prev) => ({ ...prev, meters: e.target.value }))} className="h-12 w-full rounded-full border border-slate-200 bg-white px-4 text-slate-950 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400/10" />
                    </label>
                    <label className="flex flex-col gap-2 md:col-span-2">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Revenue</span>
                        <input type="number" value={form.revenue} onChange={(e) => setForm((prev) => ({ ...prev, revenue: e.target.value }))} className="h-12 w-full rounded-full border border-slate-200 bg-white px-4 text-slate-950 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400/10" />
                    </label>
                </div>
                <div className="mt-6 flex gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                    <button type="button" onClick={onClose} className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
                        Cancel
                    </button>
                    <button type="submit" className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-blue-600/20 bg-blue-600 px-4 py-3 text-sm font-black text-white transition-all hover:-translate-y-0.5 hover:bg-blue-700">
                        <Save size={16} /> Save changes
                    </button>
                </div>
            </form>
        </ModalShell>
    );
}
