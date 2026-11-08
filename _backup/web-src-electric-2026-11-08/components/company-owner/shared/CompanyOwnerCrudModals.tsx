"use client";

import { useEffect, useState } from "react";
import { User } from "lucide-react";
import { SuperAdminConfirmDeleteModal } from "@/components/super-admin/shared/modals/SuperAdminConfirmDeleteModal";
import { SuperAdminDetailModal, type DetailField } from "@/components/super-admin/shared/modals/SuperAdminDetailModal";
import { SuperAdminFormModal, type FormFieldConfig } from "@/components/super-admin/shared/modals/SuperAdminFormModal";
import { superAdminToast } from "@/components/super-admin/shared/super-admin-toast";
import type { useSuperAdminCrud } from "@/hooks/useSuperAdminCrud";

type CrudApi<T extends { id: number }> = ReturnType<typeof useSuperAdminCrud<T>>;

export function CompanyOwnerCrudModals<T extends { id: number }>({
    crud,
    entityLabel,
    formFields,
    rowToForm,
    formToRow,
    detailFields,
}: {
    crud: CrudApi<T>;
    entityLabel: string;
    formFields: FormFieldConfig[];
    rowToForm: (row: T | null) => Record<string, string>;
    formToRow: (values: Record<string, string>, existing: T | null, nextId: number) => T;
    detailFields: (row: T) => DetailField[];
}) {
    const [formValues, setFormValues] = useState<Record<string, string>>(rowToForm(null));

    useEffect(() => {
        if (crud.editing) setFormValues(rowToForm(crud.editing));
        else if (crud.creating) setFormValues(rowToForm(null));
    }, [crud.editing, crud.creating, rowToForm]);

    const saveForm = () => {
        const required = formFields.filter((f) => f.required);
        if (required.some((f) => !formValues[f.key]?.trim())) {
            superAdminToast.error("Please fill in required fields");
            return;
        }
        if (crud.creating) {
            crud.add(formToRow(formValues, null, crud.nextId()));
            superAdminToast.success(`${entityLabel} created`);
        } else if (crud.editing) {
            crud.update(crud.editing.id, formToRow(formValues, crud.editing, crud.editing.id));
            superAdminToast.success(`${entityLabel} updated`);
        }
        crud.closeModals();
    };

    const confirmDelete = () => {
        if (!crud.deleting) return;
        crud.remove(crud.deleting.id);
        superAdminToast.success(`${entityLabel} deleted`);
        crud.closeModals();
    };

    return (
        <>
            {crud.viewing ? (
                <SuperAdminDetailModal
                    title={entityLabel}
                    subtitle={`ID #${crud.viewing.id}`}
                    fields={detailFields(crud.viewing)}
                    onClose={() => crud.setViewing(null)}
                    onEdit={() => {
                        crud.setEditing(crud.viewing);
                        crud.setViewing(null);
                    }}
                    icon={<User size={18} className="text-blue-500" />}
                />
            ) : null}
            {crud.creating || crud.editing ? (
                <SuperAdminFormModal
                    title={crud.creating ? `Add ${entityLabel}` : `Edit ${entityLabel}`}
                    fields={formFields}
                    values={formValues}
                    onChange={(key, value) => setFormValues((prev) => ({ ...prev, [key]: value }))}
                    onClose={crud.closeModals}
                    onSubmit={saveForm}
                    submitLabel={crud.creating ? "Create" : "Save changes"}
                    columns={formFields.length > 4 ? 2 : 1}
                />
            ) : null}
            {crud.deleting ? (
                <SuperAdminConfirmDeleteModal
                    title={`Delete ${entityLabel}?`}
                    itemName={crud.deleting ? String((crud.deleting as { id: number }).id) : entityLabel}
                    description={`This will permanently remove this ${entityLabel.toLowerCase()}.`}
                    onClose={() => crud.setDeleting(null)}
                    onConfirm={confirmDelete}
                />
            ) : null}
        </>
    );
}
