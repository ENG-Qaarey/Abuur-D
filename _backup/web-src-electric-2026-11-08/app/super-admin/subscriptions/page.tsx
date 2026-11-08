"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { ResponsiveTableShell } from "@/components/ui/ResponsiveTableShell";
import { StatusBadge } from "@/components/super-admin/shared/admin-page";
import { EntityTableActions } from "@/components/super-admin/shared/EntityTableActions";
import { SubscriptionModals } from "@/components/super-admin/shared/modals/subscriptions/SubscriptionModals";
import { exportTableCsv, superAdminToast } from "@/components/super-admin/shared/super-admin-toast";
import {
    SuperAdminAddButton,
    SuperAdminCardBody,
    SuperAdminMainCard,
    SuperAdminMetricsGrid,
    SuperAdminPageHeader,
    SuperAdminSearchInput,
    SuperAdminSecondaryButton,
    SuperAdminTab,
    SuperAdminToolbar,
    superAdminTableHeadClass,
    superAdminTableRowClass,
} from "@/components/super-admin/shared/super-admin-layout";
import { subscriptionMetrics, subscriptionRows, type SubscriptionRow } from "@/data/super-admin-mock";
import { useSuperAdminCrud } from "@/hooks/useSuperAdminCrud";

export default function SubscriptionsPage() {
    const crud = useSuperAdminCrud<SubscriptionRow>(subscriptionRows);
    const [tab, setTab] = useState<"plans" | "subscriptions">("subscriptions");
    const [search, setSearch] = useState("");

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return crud.items;
        return crud.items.filter((row) => row.company.toLowerCase().includes(q) || row.plan.toLowerCase().includes(q));
    }, [crud.items, search]);

    const exportSubscriptions = () => {
        exportTableCsv(
            "subscriptions.csv",
            ["Company", "Plan", "Status", "Amount", "Start", "Next Billing"],
            filtered.map((r) => [r.company, r.plan, r.status, r.amount, r.start, r.next]),
        );
    };

    return (
        <div className="space-y-6 min-w-0 w-full">
            <SuperAdminPageHeader title="Subscriptions & Plans" description="Manage subscription plans and company subscriptions." />

            <SuperAdminMetricsGrid stats={subscriptionMetrics} />

            <SuperAdminMainCard>
                <SuperAdminToolbar
                    tabs={
                        <>
                            <SuperAdminTab active={tab === "plans"} onClick={() => setTab("plans")}>Plans</SuperAdminTab>
                            <SuperAdminTab active={tab === "subscriptions"} onClick={() => setTab("subscriptions")}>Subscriptions</SuperAdminTab>
                        </>
                    }
                    actions={
                        <>
                            <SuperAdminSearchInput value={search} onChange={setSearch} placeholder="Search subscriptions..." />
                            <SuperAdminAddButton label="Add Plan" onClick={() => crud.setCreating(true)} />
                            <SuperAdminSecondaryButton label="Export" icon={Download} onClick={exportSubscriptions} />
                        </>
                    }
                />
                <SuperAdminCardBody>
                    {tab === "plans" ? (
                        <div className="grid gap-3 sm:grid-cols-3">
                            {["Premium — $1,299 / month", "Standard — $699 / month", "Basic — $499 / month"].map((plan) => (
                                <button
                                    key={plan}
                                    type="button"
                                    onClick={() => superAdminToast.info(`Managing plan: ${plan.split("—")[0].trim()}`)}
                                    className="rounded-2xl border border-slate-100 dark:border-[#1a2744] bg-slate-50/50 dark:bg-white/[0.02] p-5 text-left hover:border-blue-300 dark:hover:border-blue-500/40 transition-all"
                                >
                                    <p className="text-sm font-black text-slate-900 dark:text-white">{plan}</p>
                                    <p className="text-xs text-slate-400 mt-1">Click to manage plan</p>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <ResponsiveTableShell>
                            <table className="w-full text-sm border-collapse max-xl:min-w-[880px] xl:min-w-0">
                                <thead>
                                    <tr className={superAdminTableHeadClass}>
                                        <th className="py-4 px-4 w-12">#</th>
                                        <th className="py-4 px-4 text-left">Company</th>
                                        <th className="py-4 px-4 text-left">Plan</th>
                                        <th className="py-4 px-4 text-center">Status</th>
                                        <th className="py-4 px-4 text-left">Amount</th>
                                        <th className="py-4 px-4 hidden md:table-cell">Start Date</th>
                                        <th className="py-4 px-4 hidden lg:table-cell">Next Billing</th>
                                        <th className="py-4 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-[#1a2744]">
                                    {filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="py-12 text-center text-sm font-semibold text-slate-400 dark:text-slate-500">
                                                No subscriptions match your search.
                                            </td>
                                        </tr>
                                    ) : (
                                        filtered.map((row, i) => (
                                            <tr key={row.id} className={superAdminTableRowClass}>
                                                <td className="py-4 px-4 text-slate-400 font-semibold">{i + 1}</td>
                                                <td className="py-4 px-4 font-bold text-slate-900 dark:text-slate-100">{row.company}</td>
                                                <td className="py-4 px-4"><StatusBadge status={row.plan} /></td>
                                                <td className="py-4 px-4 text-center"><StatusBadge status={row.status} /></td>
                                                <td className="py-4 px-4 font-semibold text-slate-800 dark:text-slate-200">{row.amount}</td>
                                                <td className="py-4 px-4 text-slate-500 hidden md:table-cell">{row.start}</td>
                                                <td className="py-4 px-4 text-slate-500 hidden lg:table-cell">{row.next}</td>
                                                <td className="py-4 px-4 text-right">
                                                    <EntityTableActions
                                                        viewLabel="View Subscription"
                                                        editLabel="Edit Subscription"
                                                        deleteLabel="Delete Subscription"
                                                        onView={() => crud.setViewing(row)}
                                                        onEdit={() => crud.setEditing(row)}
                                                        onDelete={() => crud.setDeleting(row)}
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </ResponsiveTableShell>
                    )}
                </SuperAdminCardBody>
            </SuperAdminMainCard>

            <SubscriptionModals crud={{ ...crud, onAfterSave: () => setTab("subscriptions") }} />
        </div>
    );
}
