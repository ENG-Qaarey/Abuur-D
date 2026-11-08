"use client";

import { SuperAdminFormModal } from "../SuperAdminFormModal";
import { SUBSCRIPTION_FORM_FIELDS } from "./subscription-modal-utils";

export function SubscriptionFormModal({
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
            title={mode === "create" ? "Add Subscription" : "Edit Subscription"}
            subtitle="Company plan and billing details"
            fields={SUBSCRIPTION_FORM_FIELDS}
            values={values}
            onChange={onChange}
            onClose={onClose}
            onSubmit={onSubmit}
            submitLabel={mode === "create" ? "Add Subscription" : "Save Changes"}
            columns={2}
        />
    );
}
