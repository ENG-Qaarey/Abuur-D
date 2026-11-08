"use client";

import { useEffect, useState } from "react";
import type { SubscriptionRow } from "@/data/super-admin-mock";
import { superAdminToast } from "@/components/super-admin/shared/super-admin-toast";
import { SubscriptionDeleteModal } from "./SubscriptionDeleteModal";
import { SubscriptionFormModal } from "./SubscriptionFormModal";
import { SubscriptionViewModal } from "./SubscriptionViewModal";
import { subscriptionToForm } from "./subscription-modal-utils";

export type SubscriptionCrudApi = {
    viewing: SubscriptionRow | null;
    editing: SubscriptionRow | null;
    creating: boolean;
    deleting: SubscriptionRow | null;
    setViewing: (row: SubscriptionRow | null) => void;
    setEditing: (row: SubscriptionRow | null) => void;
    setCreating: (v: boolean) => void;
    setDeleting: (row: SubscriptionRow | null) => void;
    closeModals: () => void;
    add: (row: SubscriptionRow) => void;
    update: (id: number, patch: Partial<SubscriptionRow>) => void;
    remove: (id: number) => void;
    nextId: () => number;
    onAfterSave?: () => void;
};

export function SubscriptionModals({ crud }: { crud: SubscriptionCrudApi }) {
    const [formValues, setFormValues] = useState(subscriptionToForm(null));

    useEffect(() => {
        if (crud.editing) setFormValues(subscriptionToForm(crud.editing));
        else if (crud.creating) setFormValues(subscriptionToForm(null));
    }, [crud.editing, crud.creating]);

    const saveForm = () => {
        if (!formValues.company.trim()) {
            superAdminToast.error("Company name is required");
            return;
        }
        if (crud.creating) {
            crud.add({
                id: crud.nextId(),
                company: formValues.company.trim(),
                plan: formValues.plan,
                status: formValues.status,
                amount: formValues.amount,
                start: formValues.start || "Today",
                next: formValues.next || "Next month",
            });
            superAdminToast.success("Subscription added");
        } else if (crud.editing) {
            crud.update(crud.editing.id, {
                id: crud.editing.id,
                company: formValues.company.trim(),
                plan: formValues.plan,
                status: formValues.status,
                amount: formValues.amount,
                start: formValues.start,
                next: formValues.next,
            });
            superAdminToast.success("Subscription updated");
        }
        crud.closeModals();
        crud.onAfterSave?.();
    };

    return (
        <>
            {crud.viewing ? (
                <SubscriptionViewModal
                    subscription={crud.viewing}
                    onClose={() => crud.setViewing(null)}
                    onEdit={() => {
                        const row = crud.viewing!;
                        crud.setViewing(null);
                        crud.setEditing(row);
                    }}
                />
            ) : null}
            {crud.editing || crud.creating ? (
                <SubscriptionFormModal
                    mode={crud.creating ? "create" : "edit"}
                    values={formValues}
                    onChange={(key, value) => setFormValues((prev) => ({ ...prev, [key]: value }))}
                    onClose={crud.closeModals}
                    onSubmit={saveForm}
                />
            ) : null}
            {crud.deleting ? (
                <SubscriptionDeleteModal
                    subscription={crud.deleting}
                    onClose={() => crud.setDeleting(null)}
                    onConfirm={() => {
                        crud.remove(crud.deleting!.id);
                        superAdminToast.success("Subscription removed");
                        crud.setDeleting(null);
                    }}
                />
            ) : null}
        </>
    );
}
