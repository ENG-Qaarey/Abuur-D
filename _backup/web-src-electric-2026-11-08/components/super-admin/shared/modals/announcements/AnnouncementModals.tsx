"use client";

import { useEffect, useState } from "react";
import type { AnnouncementRow } from "@/data/super-admin-mock";
import { superAdminToast } from "@/components/super-admin/shared/super-admin-toast";
import { AnnouncementDeleteModal } from "./AnnouncementDeleteModal";
import { AnnouncementFormModal } from "./AnnouncementFormModal";
import { announcementToForm } from "./announcement-modal-utils";

export type AnnouncementCrudApi = {
    editing: AnnouncementRow | null;
    creating: boolean;
    deleting: AnnouncementRow | null;
    setEditing: (row: AnnouncementRow | null) => void;
    setCreating: (v: boolean) => void;
    setDeleting: (row: AnnouncementRow | null) => void;
    closeModals: () => void;
    add: (row: AnnouncementRow) => void;
    update: (id: number, patch: Partial<AnnouncementRow>) => void;
    remove: (id: number) => void;
    nextId: () => number;
};

export function AnnouncementModals({ crud }: { crud: AnnouncementCrudApi }) {
    const [formValues, setFormValues] = useState(announcementToForm(null));

    useEffect(() => {
        if (crud.editing) setFormValues(announcementToForm(crud.editing));
        else if (crud.creating) setFormValues(announcementToForm(null));
    }, [crud.editing, crud.creating]);

    const saveForm = () => {
        if (!formValues.title.trim()) {
            superAdminToast.error("Title is required");
            return;
        }
        if (crud.creating) {
            crud.add({
                id: crud.nextId(),
                title: formValues.title.trim(),
                audience: formValues.audience,
                status: formValues.status,
                publishedAt: formValues.publishedAt,
            });
            superAdminToast.success("Announcement created");
        } else if (crud.editing) {
            crud.update(crud.editing.id, {
                ...crud.editing,
                title: formValues.title.trim(),
                audience: formValues.audience,
                status: formValues.status,
                publishedAt: formValues.publishedAt,
            });
            superAdminToast.success("Announcement updated");
        }
        crud.closeModals();
    };

    return (
        <>
            {crud.editing || crud.creating ? (
                <AnnouncementFormModal
                    mode={crud.creating ? "create" : "edit"}
                    values={formValues}
                    onChange={(key, value) => setFormValues((prev) => ({ ...prev, [key]: value }))}
                    onClose={crud.closeModals}
                    onSubmit={saveForm}
                />
            ) : null}
            {crud.deleting ? (
                <AnnouncementDeleteModal
                    announcement={crud.deleting}
                    onClose={() => crud.setDeleting(null)}
                    onConfirm={() => {
                        crud.remove(crud.deleting!.id);
                        superAdminToast.success("Announcement deleted");
                        crud.setDeleting(null);
                    }}
                />
            ) : null}
        </>
    );
}
