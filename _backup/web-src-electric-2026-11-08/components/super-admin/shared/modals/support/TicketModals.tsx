"use client";

import { useEffect, useState } from "react";
import type { TicketRow } from "@/data/super-admin-mock";
import { superAdminToast } from "@/components/super-admin/shared/super-admin-toast";
import { TicketDeleteModal } from "./TicketDeleteModal";
import { TicketFormModal } from "./TicketFormModal";
import { TicketViewModal } from "./TicketViewModal";
import { ticketToForm } from "./support-modal-utils";

export type TicketCrudApi = {
    viewing: TicketRow | null;
    editing: TicketRow | null;
    deleting: TicketRow | null;
    setViewing: (row: TicketRow | null) => void;
    setEditing: (row: TicketRow | null) => void;
    setDeleting: (row: TicketRow | null) => void;
    closeModals: () => void;
    update: (id: number, patch: Partial<TicketRow>) => void;
    remove: (id: number) => void;
};

export function TicketModals({ crud }: { crud: TicketCrudApi }) {
    const [formValues, setFormValues] = useState(ticketToForm(null));

    useEffect(() => {
        if (crud.editing) setFormValues(ticketToForm(crud.editing));
    }, [crud.editing]);

    const saveForm = () => {
        if (!crud.editing) return;
        crud.update(crud.editing.id, {
            ...crud.editing,
            subject: formValues.subject.trim(),
            customer: formValues.customer.trim(),
            priority: formValues.priority,
            status: formValues.status,
        });
        superAdminToast.success("Ticket updated");
        crud.closeModals();
    };

    return (
        <>
            {crud.viewing ? (
                <TicketViewModal
                    ticket={crud.viewing}
                    onClose={() => crud.setViewing(null)}
                    onEdit={() => {
                        const row = crud.viewing!;
                        crud.setViewing(null);
                        crud.setEditing(row);
                    }}
                />
            ) : null}
            {crud.editing ? (
                <TicketFormModal
                    values={formValues}
                    onChange={(key, value) => setFormValues((prev) => ({ ...prev, [key]: value }))}
                    onClose={crud.closeModals}
                    onSubmit={saveForm}
                />
            ) : null}
            {crud.deleting ? (
                <TicketDeleteModal
                    ticket={crud.deleting}
                    onClose={() => crud.setDeleting(null)}
                    onConfirm={() => {
                        crud.remove(crud.deleting!.id);
                        superAdminToast.success("Ticket deleted");
                        crud.setDeleting(null);
                    }}
                />
            ) : null}
        </>
    );
}
