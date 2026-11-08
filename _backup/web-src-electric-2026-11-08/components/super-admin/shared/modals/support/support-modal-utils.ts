import type { FormFieldConfig } from "../SuperAdminFormModal";
import type { TicketRow } from "@/data/super-admin-mock";

export const TICKET_FORM_FIELDS: FormFieldConfig[] = [
    { key: "subject", label: "Subject", required: true },
    { key: "customer", label: "Customer", required: true },
    { key: "priority", label: "Priority", type: "select", options: ["High", "Medium", "Low"], required: true },
    { key: "status", label: "Status", type: "select", options: ["Open", "In Progress", "Resolved"], required: true },
];

export function ticketToForm(row: TicketRow | null): Record<string, string> {
    if (!row) return { subject: "", customer: "", priority: "Medium", status: "Open" };
    return { subject: row.subject, customer: row.customer, priority: row.priority, status: row.status };
}
