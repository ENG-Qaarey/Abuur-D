import type { FormFieldConfig } from "@/components/super-admin/shared/modals/SuperAdminFormModal";
import type { CustomerRow } from "@/data/super-admin-mock";
import { COMPANY_OWNER_NAME } from "@/data/company-owner-mock";

export const OWNER_CUSTOMER_FORM_FIELDS: FormFieldConfig[] = [
    { key: "name", label: "Full name", required: true },
    { key: "phone", label: "Phone number", required: true },
    { key: "email", label: "Email", type: "email", required: true },
    { key: "nationalId", label: "National ID", required: true },
    { key: "customerType", label: "Customer type", type: "select", options: ["Residential", "Commercial", "Industrial"], required: true },
    { key: "region", label: "Region", required: true },
    { key: "district", label: "District", required: true },
    { key: "area", label: "Area / Street", required: true },
    { key: "meter", label: "Meter number", required: true },
    { key: "tariff", label: "Tariff plan", type: "select", options: ["Standard", "Commercial Tier 1", "Industrial"], required: true },
    { key: "status", label: "Status", type: "select", options: ["Active", "Suspended", "Inactive"], required: true },
];

export function ownerCustomerToForm(row: CustomerRow | null, district?: string): Record<string, string> {
    if (!row) {
        return {
            name: "",
            phone: "",
            email: "",
            nationalId: "",
            customerType: "Residential",
            region: "Banaadir",
            district: "",
            area: "",
            meter: "",
            tariff: "Standard",
            status: "Active",
        };
    }
    return {
        name: row.name,
        phone: row.phone,
        email: row.email,
        nationalId: "",
        customerType: "Residential",
        region: "Banaadir",
        district: district ?? "",
        area: "",
        meter: row.meter,
        tariff: "Standard",
        status: row.status === "Inactive" ? "Inactive" : row.status,
    };
}

export function ownerFormToCustomer(id: number, form: Record<string, string>, color: string): CustomerRow {
    return {
        id,
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        company: COMPANY_OWNER_NAME,
        meter: form.meter.trim(),
        status: form.status === "Suspended" ? "Inactive" : form.status,
        joined: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
        color,
    };
}
