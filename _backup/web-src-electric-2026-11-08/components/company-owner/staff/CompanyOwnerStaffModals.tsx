"use client";

import { User } from "lucide-react";
import type { OwnerStaffRow } from "@/data/company-owner-mock";
import { SuperAdminConfirmDeleteModal } from "@/components/super-admin/shared/modals/SuperAdminConfirmDeleteModal";
import { SuperAdminDetailModal } from "@/components/super-admin/shared/modals/SuperAdminDetailModal";
import { companyOwnerToast } from "@/components/company-owner/shared/company-owner-toast";
import type { useSuperAdminCrud } from "@/hooks/useSuperAdminCrud";
import { AddStaffModal } from "./AddStaffModal";
import { STAFF_AVATAR_COLORS, staffFormToRow, staffRowToForm, type StaffFormState } from "./staff-form-types";

type Crud = ReturnType<typeof useSuperAdminCrud<OwnerStaffRow>>;

function staffDetailFields(row: OwnerStaffRow) {
    const modules = row.moduleAccess
        ? Object.entries(row.moduleAccess)
              .filter(([, on]) => on)
              .map(([m]) => m)
              .join(", ") || "—"
        : "—";

    return [
        { label: "Full name", value: row.name },
        { label: "Username", value: row.username ?? "—" },
        { label: "Email", value: row.email },
        { label: "Phone", value: row.phone ?? "—" },
        { label: "Role", value: row.role },
        { label: "Department", value: row.department },
        { label: "Position", value: row.position ?? "—" },
        { label: "Branch", value: row.branch ?? "—" },
        { label: "Employment", value: row.employmentType ?? "—" },
        { label: "Access level", value: row.accessLevel ?? "—" },
        { label: "Modules", value: modules },
        { label: "2FA", value: row.twoFactor ? "Enabled" : "Disabled" },
        { label: "Status", value: row.status },
        { label: "Joined", value: row.joined },
    ];
}

export function CompanyOwnerStaffModals({ crud }: { crud: Crud }) {
    const saveStaff = (form: StaffFormState) => {
        const color =
            crud.editing?.color ?? STAFF_AVATAR_COLORS[crud.nextId() % STAFF_AVATAR_COLORS.length];
        const id = crud.editing?.id ?? crud.nextId();

        if (crud.creating) {
            crud.add(staffFormToRow(form, id, color));
            companyOwnerToast.success("Staff member created");
        } else if (crud.editing) {
            crud.update(crud.editing.id, staffFormToRow(form, crud.editing.id, color));
            companyOwnerToast.success("Staff member updated");
        }
        crud.closeModals();
    };

    return (
        <>
            {crud.viewing ? (
                <SuperAdminDetailModal
                    title={crud.viewing.name}
                    subtitle={`Staff ID #${crud.viewing.id}`}
                    fields={staffDetailFields(crud.viewing)}
                    onClose={() => crud.setViewing(null)}
                    onEdit={() => {
                        crud.setEditing(crud.viewing);
                        crud.setViewing(null);
                    }}
                    icon={<User size={18} className="text-emerald-500" />}
                />
            ) : null}

            {crud.creating || crud.editing ? (
                <AddStaffModal
                    key={crud.editing?.id ?? "create"}
                    mode={crud.creating ? "create" : "edit"}
                    initial={crud.editing ? staffRowToForm(crud.editing) : undefined}
                    onClose={crud.closeModals}
                    onSubmit={saveStaff}
                />
            ) : null}

            {crud.deleting ? (
                <SuperAdminConfirmDeleteModal
                    title="Delete staff member?"
                    itemName={crud.deleting.name}
                    description="This will permanently remove the staff account and revoke access."
                    onClose={() => crud.setDeleting(null)}
                    onConfirm={() => {
                        crud.remove(crud.deleting!.id);
                        companyOwnerToast.success("Staff member deleted");
                        crud.closeModals();
                    }}
                />
            ) : null}
        </>
    );
}
