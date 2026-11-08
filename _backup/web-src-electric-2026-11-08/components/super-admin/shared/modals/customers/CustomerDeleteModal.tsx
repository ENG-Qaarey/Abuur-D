"use client";

import { SuperAdminConfirmDeleteModal } from "../SuperAdminConfirmDeleteModal";
import type { CustomerRow } from "@/data/super-admin-mock";

export function CustomerDeleteModal({
    customer,
    onClose,
    onConfirm,
}: {
    customer: CustomerRow;
    onClose: () => void;
    onConfirm: () => void;
}) {
    return (
        <SuperAdminConfirmDeleteModal
            title="Delete Customer"
            itemName={customer.name}
            description="The customer record will be removed from the platform."
            onClose={onClose}
            onConfirm={onConfirm}
        />
    );
}
