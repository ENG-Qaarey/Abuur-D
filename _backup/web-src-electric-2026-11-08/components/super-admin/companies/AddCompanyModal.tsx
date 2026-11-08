"use client";

import { useState } from "react";
import { Building2, ChevronDown, Globe, Mail, MapPin, Phone, Plus, User } from "lucide-react";
import type { Company, CompanyFormState } from "./types";
import { ModalShell } from "./ModalShell";
import { plans, regions, statuses } from "./constants";
import { allUsers } from "@/app/super-admin/users/page";

export function AddCompanyModal({ onClose, onAdd }: { onClose: () => void; onAdd: (company: Omit<Company, "id" | "logo" | "logoColor">) => void }) {
    const [form, setForm] = useState<CompanyFormState>({
        name: "",
        domain: "",
        region: regions[1],
        customers: "0",
        meters: "0",
        revenue: "0",
        plan: plans[0],
        status: "Active",
        email: "",
        phone: "",
        address: "",
        website: "",
        ownerId: "",
    });

    const adminCandidates = allUsers.filter((u) => ["System Admin", "Company Owner", "Company Admin"].includes(u.role));

    return (
        <ModalShell title="Add Company" subtitle="Create a new utility company record." onClose={onClose} maxWidth="max-w-xl">
            <form
                className="space-y-6 bg-slate-50 p-6 dark:bg-slate-950"
                onSubmit={(e) => {
                    e.preventDefault();
                    // generate a simple domain from the name if user didn't provide one
                    const genDomain = (name: string) => {
                        const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 40) || "company";
                        return `${slug}.so`;
                    };

                    onAdd({
                        name: form.name.trim(),
                        domain: genDomain(form.name),
                        region: form.region,
                        customers: Number(form.customers) || 0,
                        meters: Number(form.meters) || 0,
                        revenue: 0,
                        plan: form.plan,
                        status: form.status,
                        // UI-facing joined column (friendly format)
                        joined: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
                        // Backend / DB-aligned fields (optional on the UI Company type)
                        email: form.email?.trim() || undefined,
                        phone: form.phone?.trim() || undefined,
                        address: form.address?.trim() || undefined,
                        website: form.website?.trim() || undefined,
                        ownerId: form.ownerId?.trim() || undefined,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    });
                }}
            >
                <div className="grid gap-4 md:grid-cols-2">
                    <label className="flex flex-col gap-2 md:col-span-2">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Company name <span className="text-red-500">*</span></span>
                        <div className="relative">
                            <Building2 size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required className="h-12 w-full rounded-full border border-slate-200 bg-white pl-11 pr-4 text-slate-950 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/10" />
                        </div>
                    </label>
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Email <span className="text-red-500">*</span></span>
                        <div className="relative">
                            <Mail size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input required value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} type="email" placeholder="contact@company.so" className="h-12 w-full rounded-full border border-slate-200 bg-white pl-11 pr-4 text-slate-950 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/10" />
                        </div>
                    </label>
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Phone <span className="text-red-500">*</span></span>
                        <div className="relative">
                            <Phone size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input required value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} placeholder="+252 6xx xxx xxx" className="h-12 w-full rounded-full border border-slate-200 bg-white pl-11 pr-4 text-slate-950 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/10" />
                        </div>
                    </label>
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Region</span>
                        <div className="relative">
                            <Globe size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <select value={form.region} onChange={(e) => setForm((prev) => ({ ...prev, region: e.target.value }))} className="h-12 w-full appearance-none rounded-full border border-slate-200 bg-white pl-11 pr-12 text-slate-950 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400/10">
                                {regions.slice(1).map((region) => <option key={region}>{region}</option>)}
                            </select>
                            <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                        </div>
                    </label>
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Assign Admin <span className="text-red-500">*</span></span>
                        <div className="relative">
                            <User size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <select value={form.ownerId} required onChange={(e) => setForm((prev) => ({ ...prev, ownerId: e.target.value }))} className="h-12 w-full appearance-none rounded-full border border-slate-200 bg-white pl-11 pr-12 text-slate-950 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400/10">
                                <option value="">Select admin...</option>
                                {adminCandidates.map((u) => <option key={u.id} value={String(u.id)}>{u.fullName} — {u.email}</option>)}
                            </select>
                            <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                        </div>
                    </label>
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Plan <span className="text-red-500">*</span></span>
                        <div className="relative">
                            <select required value={form.plan} onChange={(e) => setForm((prev) => ({ ...prev, plan: e.target.value }))} className="h-12 w-full appearance-none rounded-full border border-slate-200 bg-white px-4 pr-12 text-slate-950 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400/10">
                                {plans.map((plan) => <option key={plan}>{plan}</option>)}
                            </select>
                            <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                        </div>
                    </label>
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Status <span className="text-red-500">*</span></span>
                        <div className="relative">
                            <select required value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))} className="h-12 w-full appearance-none rounded-full border border-slate-200 bg-white px-4 pr-12 text-slate-950 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400/10">
                                {statuses.slice(1).map((status) => <option key={status}>{status}</option>)}
                            </select>
                            <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                        </div>
                    </label>
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Customers <span className="text-red-500">*</span></span>
                        <input required min={0} type="number" value={form.customers} onChange={(e) => setForm((prev) => ({ ...prev, customers: e.target.value }))} className="h-12 w-full rounded-full border border-slate-200 bg-white px-4 text-slate-950 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400/10" />
                    </label>
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Meters <span className="text-red-500">*</span></span>
                        <input required min={0} type="number" value={form.meters} onChange={(e) => setForm((prev) => ({ ...prev, meters: e.target.value }))} className="h-12 w-full rounded-full border border-slate-200 bg-white px-4 text-slate-950 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400/10" />
                    </label>
                    {/* domain and revenue inputs removed per request; domain generated from name and revenue defaults to 0 */}
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Address <span className="text-red-500">*</span></span>
                        <div className="relative">
                            <MapPin size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input required value={form.address} onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} placeholder="Street, City, Region" className="h-12 w-full rounded-full border border-slate-200 bg-white pl-11 pr-4 text-slate-950 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/10" />
                        </div>
                    </label>
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Website</span>
                        <div className="relative">
                            <Globe size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input value={form.website} onChange={(e) => setForm((prev) => ({ ...prev, website: e.target.value }))} placeholder="https://company.so" className="h-12 w-full rounded-full border border-slate-200 bg-white pl-11 pr-4 text-slate-950 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/10" />
                        </div>
                    </label>
                </div>
                <div className="mt-6 flex gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                    <button type="button" onClick={onClose} className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
                        Cancel
                    </button>
                    <button type="submit" className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500 px-4 py-3 text-sm font-black text-white transition-all hover:-translate-y-0.5 hover:bg-emerald-600">
                        <Plus size={16} /> Add company
                    </button>
                </div>
            </form>
        </ModalShell>
    );
}
