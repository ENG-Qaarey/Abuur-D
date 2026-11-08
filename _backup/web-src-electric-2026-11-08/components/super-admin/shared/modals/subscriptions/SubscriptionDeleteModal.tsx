"use client";

import { SuperAdminConfirmDeleteModal } from "../SuperAdminConfirmDeleteModal";
import type { SubscriptionRow } from "@/data/super-admin-mock";

export function SubscriptionDeleteModal({
    subscription,
    onClose,
    onConfirm,
}: {
    subscription: SubscriptionRow;
    onClose: () => void;
    onConfirm: () => void;
}) {
    return (
        <SuperAdminConfirmDeleteModal
            title="Delete Subscription"
            itemName={subscription.company}
            description="This company's subscription will be cancelled and removed."
            onClose={onClose}
            onConfirm={onConfirm}
        />
    );
}
