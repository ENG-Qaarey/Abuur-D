"use client";

import { useEffect, useState } from "react";
import type { TransactionRow } from "@/data/super-admin-mock";
import { superAdminToast } from "@/components/super-admin/shared/super-admin-toast";
import { TransactionDeleteModal } from "./TransactionDeleteModal";
import { TransactionFormModal } from "./TransactionFormModal";
import { TransactionViewModal } from "./TransactionViewModal";
import { formToTransaction, transactionToForm } from "./transaction-modal-utils";

export type TransactionCrudApi = {
    viewing: TransactionRow | null;
    editing: TransactionRow | null;
    deleting: TransactionRow | null;
    setViewing: (row: TransactionRow | null) => void;
    setEditing: (row: TransactionRow | null) => void;
    setDeleting: (row: TransactionRow | null) => void;
    closeModals: () => void;
    update: (id: number, patch: Partial<TransactionRow>) => void;
    remove: (id: number) => void;
};

export function TransactionModals({ crud }: { crud: TransactionCrudApi }) {
    const [formValues, setFormValues] = useState(transactionToForm(null));

    useEffect(() => {
        if (crud.editing) setFormValues(transactionToForm(crud.editing));
    }, [crud.editing]);

    const saveForm = () => {
        if (!crud.editing) return;
        crud.update(crud.editing.id, formToTransaction(crud.editing.id, formValues, crud.editing.color, crud.editing.date));
        superAdminToast.success("Transaction updated");
        crud.closeModals();
    };

    return (
        <>
            {crud.viewing ? (
                <TransactionViewModal
                    transaction={crud.viewing}
                    onClose={() => crud.setViewing(null)}
                    onEdit={() => {
                        const row = crud.viewing!;
                        crud.setViewing(null);
                        crud.setEditing(row);
                    }}
                />
            ) : null}
            {crud.editing ? (
                <TransactionFormModal
                    values={formValues}
                    onChange={(key, value) => setFormValues((prev) => ({ ...prev, [key]: value }))}
                    onClose={crud.closeModals}
                    onSubmit={saveForm}
                />
            ) : null}
            {crud.deleting ? (
                <TransactionDeleteModal
                    transaction={crud.deleting}
                    onClose={() => crud.setDeleting(null)}
                    onConfirm={() => {
                        crud.remove(crud.deleting!.id);
                        superAdminToast.success("Transaction deleted");
                        crud.setDeleting(null);
                    }}
                />
            ) : null}
        </>
    );
}
