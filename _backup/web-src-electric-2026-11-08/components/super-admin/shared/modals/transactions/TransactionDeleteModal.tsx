"use client";

import { SuperAdminConfirmDeleteModal } from "../SuperAdminConfirmDeleteModal";
import type { TransactionRow } from "@/data/super-admin-mock";

export function TransactionDeleteModal({
    transaction,
    onClose,
    onConfirm,
}: {
    transaction: TransactionRow;
    onClose: () => void;
    onConfirm: () => void;
}) {
    return (
        <SuperAdminConfirmDeleteModal
            title="Delete Transaction"
            itemName={transaction.trxId}
            description="This transaction will be removed from the ledger."
            onClose={onClose}
            onConfirm={onConfirm}
        />
    );
}
