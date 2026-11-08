"use client";

import { FileEdit } from "lucide-react";
import { SuperAdminModalShell } from "./SuperAdminModalShell";
import { SuperAdminModalButton, SuperAdminModalFooter } from "./SuperAdminModalFooter";
import { modalBodyClass, modalInputClass, modalLabelClass } from "./modal-styles";

export type FormFieldConfig = {
    key: string;
    label: string;
    type?: "text" | "email" | "select";
    options?: string[];
    required?: boolean;
    placeholder?: string;
};

export function SuperAdminFormModal({
    title,
    subtitle,
    fields,
    values,
    onChange,
    onClose,
    onSubmit,
    submitLabel,
    columns = 1,
}: {
    title: string;
    subtitle?: string;
    fields: FormFieldConfig[];
    values: Record<string, string>;
    onChange: (key: string, value: string) => void;
    onClose: () => void;
    onSubmit: () => void;
    submitLabel: string;
    columns?: 1 | 2;
}) {
    return (
        <SuperAdminModalShell
            title={title}
            subtitle={subtitle}
            onClose={onClose}
            variant="form"
            maxWidth={columns === 2 ? "max-w-3xl" : "max-w-xl"}
            icon={<FileEdit size={18} className="text-violet-500" />}
            bodyClassName={modalBodyClass}
            footer={
                <SuperAdminModalFooter>
                    <SuperAdminModalButton onClick={onClose}>Cancel</SuperAdminModalButton>
                    <SuperAdminModalButton type="submit" form="super-admin-form-modal" variant="primary">
                        {submitLabel}
                    </SuperAdminModalButton>
                </SuperAdminModalFooter>
            }
        >
            <form
                id="super-admin-form-modal"
                className={columns === 2 ? "grid gap-5 sm:grid-cols-2" : "space-y-5"}
                onSubmit={(e) => {
                    e.preventDefault();
                    onSubmit();
                }}
            >
                {fields.map((field) => (
                    <label key={field.key} className="block space-y-2">
                        <span className={modalLabelClass}>
                            {field.label}
                            {field.required ? <span className="text-red-500"> *</span> : null}
                        </span>
                        {field.type === "select" ? (
                            <select
                                required={field.required}
                                value={values[field.key] ?? ""}
                                onChange={(e) => onChange(field.key, e.target.value)}
                                className={modalInputClass}
                            >
                                {(field.options ?? []).map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type={field.type ?? "text"}
                                required={field.required}
                                placeholder={field.placeholder}
                                value={values[field.key] ?? ""}
                                onChange={(e) => onChange(field.key, e.target.value)}
                                className={modalInputClass}
                            />
                        )}
                    </label>
                ))}
            </form>
        </SuperAdminModalShell>
    );
}
