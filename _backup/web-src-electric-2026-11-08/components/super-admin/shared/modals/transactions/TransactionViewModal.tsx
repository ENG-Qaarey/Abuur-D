"use client";

import { ArrowRightLeft } from "lucide-react";
import { AvatarInitials, StatusBadge } from "@/components/super-admin/shared/admin-page";
import { SuperAdminDetailModal } from "../SuperAdminDetailModal";
import type { TransactionRow } from "@/data/super-admin-mock";

export function TransactionViewModal({
    transaction,
    onClose,
    onEdit,
}: {
    transaction: TransactionRow;
    onClose: () => void;
    onEdit: () => void;
}) {
    return (
        <SuperAdminDetailModal
            title={transaction.trxId}
            subtitle={transaction.customer}
            icon={<ArrowRightLeft size={18} className="text-blue-500" />}
            editLabel="Edit Transaction"
            onClose={onClose}
            onEdit={onEdit}
            hero={
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-4 dark:border-[#1a2744] dark:bg-[#0a1628]">
                    <div className="flex items-center gap-3 min-w-0">
                        <AvatarInitials name={transaction.customer} color={transaction.color} />
                        <div className="min-w-0">
                            <p className="font-black text-slate-900 dark:text-white truncate">{transaction.customer}</p>
                            <p className="text-sm text-slate-500">{transaction.company}</p>
                        </div>
                    </div>
                    <div className="text-right shrink-0">
                        <p className={`text-xl font-black ${transaction.amount.startsWith("-") ? "text-red-500" : "text-slate-900 dark:text-white"}`}>
                            {transaction.amount}
                        </p>
                        <StatusBadge status={transaction.status} />
                    </div>
                </div>
            }
            fields={[
                { label: "Type", value: transaction.type },
                { label: "Date & time", value: transaction.date },
                { label: "Company", value: transaction.company },
                { label: "Status", value: transaction.status },
            ]}
        />
    );
}
