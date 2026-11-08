"use client";

import { AlertTriangle } from "lucide-react";
import { SuperAdminModalShell } from "./SuperAdminModalShell";
import { SuperAdminModalButton, SuperAdminModalFooter } from "./SuperAdminModalFooter";
import { modalBodyClass } from "./modal-styles";

export function SuperAdminConfirmDeleteModal({
    title,
    itemName,
    description,
    onClose,
    onConfirm,
}: {
    title: string;
    itemName: string;
    description?: string;
    onClose: () => void;
    onConfirm: () => void;
}) {
    return (
        <SuperAdminModalShell
            title={title}
            subtitle={description ?? "This action cannot be undone."}
            onClose={onClose}
            variant="danger"
            maxWidth="max-w-md"
            icon={<AlertTriangle size={20} className="text-red-500" />}
            bodyClassName={modalBodyClass}
            footer={
                <SuperAdminModalFooter>
                    <SuperAdminModalButton onClick={onClose}>Cancel</SuperAdminModalButton>
                    <SuperAdminModalButton variant="danger" onClick={onConfirm}>
                        Delete
                    </SuperAdminModalButton>
                </SuperAdminModalFooter>
            }
        >
            <div className="rounded-2xl border border-red-200/80 bg-red-50 p-5 dark:border-red-500/25 dark:bg-red-500/10">
                <p className="text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-200">
                    You are about to permanently delete{" "}
                    <span className="font-black text-slate-900 dark:text-white">{itemName}</span>. All related data will be removed from this
                    list.
                </p>
            </div>
        </SuperAdminModalShell>
    );
}
