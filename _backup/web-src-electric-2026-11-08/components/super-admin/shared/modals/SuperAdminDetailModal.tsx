"use client";

import type { ReactNode } from "react";
import { Pencil } from "lucide-react";
import { SuperAdminModalShell } from "./SuperAdminModalShell";
import { SuperAdminModalButton, SuperAdminModalFooter } from "./SuperAdminModalFooter";
import { modalBodyClass, modalDetailCardClass } from "./modal-styles";

export type DetailField = { label: string; value: ReactNode };

export function SuperAdminDetailModal({
    title,
    subtitle,
    fields,
    onClose,
    onEdit,
    editLabel = "Edit",
    icon,
    hero,
}: {
    title: string;
    subtitle?: string;
    fields: DetailField[];
    onClose: () => void;
    onEdit?: () => void;
    editLabel?: string;
    icon?: ReactNode;
    hero?: ReactNode;
}) {
    return (
        <SuperAdminModalShell
            title={title}
            subtitle={subtitle}
            onClose={onClose}
            icon={icon}
            maxWidth="max-w-2xl"
            bodyClassName={modalBodyClass}
            footer={
                <SuperAdminModalFooter>
                    <SuperAdminModalButton onClick={onClose}>Close</SuperAdminModalButton>
                    {onEdit ? (
                        <SuperAdminModalButton variant="primary" onClick={onEdit}>
                            <span className="inline-flex items-center gap-2">
                                <Pencil size={14} />
                                {editLabel}
                            </span>
                        </SuperAdminModalButton>
                    ) : null}
                </SuperAdminModalFooter>
            }
        >
            {hero ? <div className="mb-5">{hero}</div> : null}
            <div className="grid gap-3 sm:grid-cols-2">
                {fields.map((field) => (
                    <div key={field.label} className={modalDetailCardClass}>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{field.label}</div>
                        <div className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100 break-words">{field.value}</div>
                    </div>
                ))}
            </div>
        </SuperAdminModalShell>
    );
}
