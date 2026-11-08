"use client";

import { SuperAdminFormModal } from "../SuperAdminFormModal";
import { ANNOUNCEMENT_FORM_FIELDS } from "./announcement-modal-utils";

export function AnnouncementFormModal({
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
            title={mode === "create" ? "New Announcement" : "Edit Announcement"}
            subtitle="Compose a message for your audience"
            fields={ANNOUNCEMENT_FORM_FIELDS}
            values={values}
            onChange={onChange}
            onClose={onClose}
            onSubmit={onSubmit}
            submitLabel={mode === "create" ? "Create Announcement" : "Save Changes"}
            columns={2}
        />
    );
}
