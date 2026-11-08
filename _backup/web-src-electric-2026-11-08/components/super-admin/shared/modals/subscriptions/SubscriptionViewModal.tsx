"use client";

import { CreditCard } from "lucide-react";
import { StatusBadge } from "@/components/super-admin/shared/admin-page";
import { SuperAdminDetailModal } from "../SuperAdminDetailModal";
import type { SubscriptionRow } from "@/data/super-admin-mock";

export function SubscriptionViewModal({
    subscription,
    onClose,
    onEdit,
}: {
    subscription: SubscriptionRow;
    onClose: () => void;
    onEdit: () => void;
}) {
    return (
        <SuperAdminDetailModal
            title={subscription.company}
            subtitle={subscription.plan}
            icon={<CreditCard size={18} className="text-violet-500" />}
            editLabel="Edit Subscription"
            onClose={onClose}
            onEdit={onEdit}
            hero={
                <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 dark:border-[#1a2744] dark:bg-[#0a1628]">
                    <div>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{subscription.amount}</p>
                        <p className="text-sm text-slate-500">Billing amount</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <StatusBadge status={subscription.plan} />
                        <StatusBadge status={subscription.status} />
                    </div>
                </div>
            }
            fields={[
                { label: "Start date", value: subscription.start },
                { label: "Next billing", value: subscription.next },
            ]}
        />
    );
}
