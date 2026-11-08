"use client";

import { useEffect, useState } from "react";
import type { CustomerRow } from "@/data/super-admin-mock";
import { SuperAdminConfirmDeleteModal } from "@/components/super-admin/shared/modals/SuperAdminConfirmDeleteModal";
import { SuperAdminDetailModal } from "@/components/super-admin/shared/modals/SuperAdminDetailModal";
import { SuperAdminFormModal } from "@/components/super-admin/shared/modals/SuperAdminFormModal";
import { companyOwnerToast } from "@/components/company-owner/shared/company-owner-toast";
import {
    OWNER_CUSTOMER_FORM_FIELDS,
    ownerCustomerToForm,
    ownerFormToCustomer,
} from "./owner-customer-fields";
import { CUSTOMER_AVATAR_COLORS } from "@/components/super-admin/shared/modals/customers/customer-modal-utils";
import type { useSuperAdminCrud } from "@/hooks/useSuperAdminCrud";

type Crud = ReturnType<typeof useSuperAdminCrud<CustomerRow>>;

export function CompanyOwnerCustomerModals({ crud }: { crud: Crud }) {
    const [formValues, setFormValues] = useState<Record<string, string>>(ownerCustomerToForm(null));

    useEffect(() => {
        if (crud.editing) setFormValues(ownerCustomerToForm(crud.editing));
        else if (crud.creating) setFormValues(ownerCustomerToForm(null));
    }, [crud.editing, crud.creating]);

    const saveForm = () => {
        if (!formValues.name.trim() || !formValues.phone.trim()) {
            companyOwnerToast.error("Please fill required fields");
            return;
        }
        const color = CUSTOMER_AVATAR_COLORS[crud.nextId() % CUSTOMER_AVATAR_COLORS.length];
        if (crud.creating) {
            crud.add(ownerFormToCustomer(crud.nextId(), formValues, color));
            companyOwnerToast.success("Customer created");
        } else if (crud.editing) {
            crud.update(crud.editing.id, ownerFormToCustomer(crud.editing.id, formValues, crud.editing.color));
            companyOwnerToast.success("Customer updated");
        }
        crud.closeModals();
    };

    return (
        <>
            {crud.viewing ? (
                <SuperAdminDetailModal
                    title={crud.viewing.name}
                    subtitle={`Customer ID #${crud.viewing.id}`}
                    fields={[
                        { label: "Phone", value: crud.viewing.phone },
                        { label: "Email", value: crud.viewing.email },
                        { label: "Meter", value: crud.viewing.meter },
                        { label: "Status", value: crud.viewing.status },
                        { label: "Joined", value: crud.viewing.joined },
                        { label: "Balance", value: "$0.00" },
                        { label: "Outstanding", value: "$0.00" },
                    ]}
                    onClose={() => crud.setViewing(null)}
                    onEdit={() => {
                        crud.setEditing(crud.viewing);
                        crud.setViewing(null);
                    }}
                />
            ) : null}
            {crud.creating || crud.editing ? (
                <SuperAdminFormModal
                    title={crud.creating ? "Add customer" : "Edit customer"}
                    subtitle="Personal, address, meter and billing information"
                    fields={OWNER_CUSTOMER_FORM_FIELDS}
                    values={formValues}
                    onChange={(key, value) => setFormValues((p) => ({ ...p, [key]: value }))}
                    onClose={crud.closeModals}
                    onSubmit={saveForm}
                    submitLabel={crud.creating ? "Create customer" : "Save changes"}
                    columns={2}
                />
            ) : null}
            {crud.deleting ? (
                <SuperAdminConfirmDeleteModal
                    title="Delete customer?"
                    itemName={crud.deleting.name}
                    description="This will permanently remove the customer from your company."
                    onClose={() => crud.setDeleting(null)}
                    onConfirm={() => {
                        crud.remove(crud.deleting!.id);
                        companyOwnerToast.success("Customer deleted");
                        crud.closeModals();
                    }}
                />
            ) : null}
        </>
    );
}
