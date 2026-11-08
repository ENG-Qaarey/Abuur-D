"use client";

import { useEffect, useState } from "react";
import type { CustomerRow } from "@/data/super-admin-mock";
import { superAdminToast } from "@/components/super-admin/shared/super-admin-toast";
import { CustomerDeleteModal } from "./CustomerDeleteModal";
import { CustomerFormModal } from "./CustomerFormModal";
import { CustomerViewModal } from "./CustomerViewModal";
import { CUSTOMER_AVATAR_COLORS, customerToForm, formToCustomer } from "./customer-modal-utils";

export type CustomerCrudApi = {
    viewing: CustomerRow | null;
    editing: CustomerRow | null;
    creating: boolean;
    deleting: CustomerRow | null;
    setViewing: (row: CustomerRow | null) => void;
    setEditing: (row: CustomerRow | null) => void;
    setCreating: (v: boolean) => void;
    setDeleting: (row: CustomerRow | null) => void;
    closeModals: () => void;
    add: (row: CustomerRow) => void;
    update: (id: number, patch: Partial<CustomerRow>) => void;
    remove: (id: number) => void;
    nextId: () => number;
};

export function CustomerModals({ crud }: { crud: CustomerCrudApi }) {
    const [formValues, setFormValues] = useState<Record<string, string>>(customerToForm(null));

    useEffect(() => {
        if (crud.editing) setFormValues(customerToForm(crud.editing));
        else if (crud.creating) setFormValues(customerToForm(null));
    }, [crud.editing, crud.creating]);

    const saveForm = () => {
        if (!formValues.name.trim() || !formValues.email.trim()) {
            superAdminToast.error("Please fill in required fields");
            return;
        }
        if (crud.creating) {
            const id = crud.nextId();
            crud.add(formToCustomer(id, formValues, CUSTOMER_AVATAR_COLORS[id % CUSTOMER_AVATAR_COLORS.length]));
            superAdminToast.success("Customer added");
        } else if (crud.editing) {
            crud.update(crud.editing.id, formToCustomer(crud.editing.id, formValues, crud.editing.color));
            superAdminToast.success("Customer updated");
        }
        crud.closeModals();
    };

    const confirmDelete = () => {
        if (!crud.deleting) return;
        crud.remove(crud.deleting.id);
        superAdminToast.success(`${crud.deleting.name} deleted`);
        crud.setDeleting(null);
    };

    return (
        <>
            {crud.viewing ? (
                <CustomerViewModal
                    customer={crud.viewing}
                    onClose={() => crud.setViewing(null)}
                    onEdit={() => {
                        const row = crud.viewing!;
                        crud.setViewing(null);
                        crud.setEditing(row);
                    }}
                />
            ) : null}

            {crud.editing || crud.creating ? (
                <CustomerFormModal
                    mode={crud.creating ? "create" : "edit"}
                    values={formValues}
                    onChange={(key, value) => setFormValues((prev) => ({ ...prev, [key]: value }))}
                    onClose={crud.closeModals}
                    onSubmit={saveForm}
                />
            ) : null}

            {crud.deleting ? (
                <CustomerDeleteModal customer={crud.deleting} onClose={() => crud.setDeleting(null)} onConfirm={confirmDelete} />
            ) : null}
        </>
    );
}
