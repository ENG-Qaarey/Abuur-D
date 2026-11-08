"use client";

import { LifeBuoy } from "lucide-react";
import { StatusBadge } from "@/components/super-admin/shared/admin-page";
import { SuperAdminDetailModal } from "../SuperAdminDetailModal";
import type { TicketRow } from "@/data/super-admin-mock";

export function TicketViewModal({ ticket, onClose, onEdit }: { ticket: TicketRow; onClose: () => void; onEdit: () => void }) {
    return (
        <SuperAdminDetailModal
            title={ticket.ticketId}
            subtitle={ticket.subject}
            icon={<LifeBuoy size={18} className="text-amber-500" />}
            editLabel="Edit Ticket"
            onClose={onClose}
            onEdit={onEdit}
            hero={
                <div className="rounded-2xl border border-slate-100 bg-white p-4 dark:border-[#1a2744] dark:bg-[#0a1628]">
                    <p className="font-black text-slate-900 dark:text-white">{ticket.subject}</p>
                    <p className="text-sm text-slate-500 mt-1">{ticket.customer}</p>
                    <div className="flex gap-2 mt-3">
                        <StatusBadge status={ticket.priority} />
                        <StatusBadge status={ticket.status} />
                    </div>
                </div>
            }
            fields={[
                { label: "Customer", value: ticket.customer },
                { label: "Created", value: ticket.created },
            ]}
        />
    );
}
