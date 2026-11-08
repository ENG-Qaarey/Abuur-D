import type { FormFieldConfig } from "../SuperAdminFormModal";
import type { AnnouncementRow } from "@/data/super-admin-mock";

export const ANNOUNCEMENT_FORM_FIELDS: FormFieldConfig[] = [
    { key: "title", label: "Title", required: true, placeholder: "Announcement title" },
    { key: "audience", label: "Audience", type: "select", options: ["All Users", "All Companies", "Customers"], required: true },
    { key: "status", label: "Status", type: "select", options: ["Published", "Scheduled", "Draft"], required: true },
    { key: "publishedAt", label: "Publish date / time", required: true, placeholder: "May 24, 2024 10:00 AM" },
];

export function announcementToForm(row: AnnouncementRow | null): Record<string, string> {
    if (!row) return { title: "", audience: "All Users", status: "Draft", publishedAt: "—" };
    return { title: row.title, audience: row.audience, status: row.status, publishedAt: row.publishedAt };
}
