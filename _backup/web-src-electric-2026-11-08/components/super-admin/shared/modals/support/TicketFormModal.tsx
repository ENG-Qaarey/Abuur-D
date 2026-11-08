"use client";

import { SuperAdminFormModal } from "../SuperAdminFormModal";
import { TICKET_FORM_FIELDS } from "./support-modal-utils";

export function TicketFormModal({
    values,
    onChange,
    onClose,
    onSubmit,
}: {
    values: Record<string, string>;
    onChange: (key: string, value: string) => void;
    onClose: () => void;
    onSubmit: () => void;
}) {
    return (
        <SuperAdminFormModal
            title="Edit Ticket"
            subtitle="Update ticket priority and status"
            fields={TICKET_FORM_FIELDS}
            values={values}
            onChange={onChange}
            onClose={onClose}
            onSubmit={onSubmit}
            submitLabel="Save Changes"
            columns={2}
        />
    );
}
