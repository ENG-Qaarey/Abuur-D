import type { FormFieldConfig } from "../SuperAdminFormModal";
import type { SubscriptionRow } from "@/data/super-admin-mock";

export const SUBSCRIPTION_FORM_FIELDS: FormFieldConfig[] = [
    { key: "company", label: "Company", required: true },
    { key: "plan", label: "Plan", type: "select", options: ["Premium", "Standard", "Basic"], required: true },
    { key: "status", label: "Status", type: "select", options: ["Active", "Cancelled", "Past Due"], required: true },
    { key: "amount", label: "Amount", required: true, placeholder: "$699 / month" },
    { key: "start", label: "Start date", required: true },
    { key: "next", label: "Next billing", required: true },
];

export function subscriptionToForm(row: SubscriptionRow | null): Record<string, string> {
    if (!row) {
        return { company: "", plan: "Standard", status: "Active", amount: "$699 / month", start: "", next: "" };
    }
    return {
        company: row.company,
        plan: row.plan,
        status: row.status,
        amount: row.amount,
        start: row.start,
        next: row.next,
    };
}
