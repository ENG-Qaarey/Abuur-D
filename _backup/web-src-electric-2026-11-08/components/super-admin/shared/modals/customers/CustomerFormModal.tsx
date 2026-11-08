"use client";

import { SuperAdminFormModal } from "../SuperAdminFormModal";
import { CUSTOMER_FORM_FIELDS } from "./customer-modal-utils";

export function CustomerFormModal({
    mode,
    values,
    onChange,
    onClose,
    onSubmit,
}: {
    mode: "create" | "edit";
    values: Record<string, string>;
    onChange: (key: string, value: string) => void;
    onClose: () => void;
    onSubmit: () => void;
}) {
    return (
        <SuperAdminFormModal
            title={mode === "create" ? "Add Customer" : "Edit Customer"}
            subtitle="Manage customer profile and account details"
            fields={CUSTOMER_FORM_FIELDS}
            values={values}
            onChange={onChange}
            onClose={onClose}
            onSubmit={onSubmit}
            submitLabel={mode === "create" ? "Add Customer" : "Save Changes"}
            columns={2}
        />
    );
}
