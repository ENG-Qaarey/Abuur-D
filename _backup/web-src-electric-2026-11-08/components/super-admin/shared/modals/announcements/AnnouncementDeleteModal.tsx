"use client";

import { SuperAdminConfirmDeleteModal } from "../SuperAdminConfirmDeleteModal";
import type { AnnouncementRow } from "@/data/super-admin-mock";

export function AnnouncementDeleteModal({
    announcement,
    onClose,
    onConfirm,
}: {
    announcement: AnnouncementRow;
    onClose: () => void;
    onConfirm: () => void;
}) {
    return (
        <SuperAdminConfirmDeleteModal
            title="Delete Announcement"
            itemName={announcement.title}
            description="This announcement will no longer be visible to users."
            onClose={onClose}
            onConfirm={onConfirm}
        />
    );
}
