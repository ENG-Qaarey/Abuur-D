"use client";

import { SuperAdminConfirmDeleteModal } from "../SuperAdminConfirmDeleteModal";
import type { TicketRow } from "@/data/super-admin-mock";

export function TicketDeleteModal({ ticket, onClose, onConfirm }: { ticket: TicketRow; onClose: () => void; onConfirm: () => void }) {
    return (
        <SuperAdminConfirmDeleteModal
            title="Delete Ticket"
            itemName={ticket.ticketId}
            description="This support ticket will be closed and removed."
            onClose={onClose}
            onConfirm={onConfirm}
        />
    );
}
