"use client";

import { User } from "lucide-react";
import { AvatarInitials, StatusBadge } from "@/components/super-admin/shared/admin-page";
import { SuperAdminDetailModal } from "../SuperAdminDetailModal";
import type { CustomerRow } from "@/data/super-admin-mock";

export function CustomerViewModal({
    customer,
    onClose,
    onEdit,
}: {
    customer: CustomerRow;
    onClose: () => void;
    onEdit: () => void;
}) {
    return (
        <SuperAdminDetailModal
            title={customer.name}
            subtitle={customer.email}
            icon={<User size={18} className="text-blue-500" />}
            editLabel="Edit Customer"
            onClose={onClose}
            onEdit={onEdit}
            hero={
                <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 dark:border-[#1a2744] dark:bg-[#0a1628]">
                    <AvatarInitials name={customer.name} color={customer.color} />
                    <div className="min-w-0">
                        <p className="font-black text-slate-900 dark:text-white truncate">{customer.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{customer.company}</p>
                        <div className="mt-2">
                            <StatusBadge status={customer.status} />
                        </div>
                    </div>
                </div>
            }
            fields={[
                { label: "Phone", value: customer.phone },
                { label: "Email", value: customer.email },
                { label: "Company", value: customer.company },
                { label: "Meter number", value: customer.meter },
                { label: "Joined", value: customer.joined },
            ]}
        />
    );
}
