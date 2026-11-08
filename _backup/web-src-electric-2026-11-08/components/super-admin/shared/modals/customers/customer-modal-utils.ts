import type { FormFieldConfig } from "../SuperAdminFormModal";
import type { CustomerRow } from "@/data/super-admin-mock";

export const CUSTOMER_FORM_FIELDS: FormFieldConfig[] = [
    { key: "name", label: "Full name", required: true, placeholder: "Enter full name" },
    { key: "phone", label: "Phone", required: true, placeholder: "+252 61 000 0000" },
    { key: "email", label: "Email", type: "email", required: true, placeholder: "name@company.so" },
    {
        key: "company",
        label: "Company",
        type: "select",
        options: ["Somali Electric Co.", "Som Power", "HECO", "Telesom Electric", "NECSOM"],
        required: true,
    },
    { key: "meter", label: "Meter number", required: true, placeholder: "MTR-10000" },
    { key: "status", label: "Status", type: "select", options: ["Active", "Inactive"], required: true },
];

export const CUSTOMER_AVATAR_COLORS = [
    "from-blue-500 to-blue-600",
    "from-emerald-500 to-emerald-600",
    "from-purple-500 to-purple-600",
    "from-orange-500 to-orange-600",
    "from-cyan-500 to-cyan-600",
];

export function customerToForm(row: CustomerRow | null): Record<string, string> {
    if (!row) {
        return { name: "", phone: "", email: "", company: "Somali Electric Co.", meter: "", status: "Active" };
    }
    return {
        name: row.name,
        phone: row.phone,
        email: row.email,
        company: row.company,
        meter: row.meter,
        status: row.status,
    };
}

export function formToCustomer(id: number, form: Record<string, string>, color: string): CustomerRow {
    return {
        id,
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        company: form.company,
        meter: form.meter.trim(),
        status: form.status,
        joined: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
        color,
    };
}
