"use client";

import { SuperAdminFormModal } from "../SuperAdminFormModal";
import { TRANSACTION_FORM_FIELDS } from "./transaction-modal-utils";

export function TransactionFormModal({
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
            title="Edit Transaction"
            subtitle="Update transaction details and status"
            fields={TRANSACTION_FORM_FIELDS}
            values={values}
            onChange={onChange}
            onClose={onClose}
            onSubmit={onSubmit}
            submitLabel="Save Changes"
            columns={2}
        />
    );
}
