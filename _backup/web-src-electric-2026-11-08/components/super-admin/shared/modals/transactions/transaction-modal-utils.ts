import type { FormFieldConfig } from "../SuperAdminFormModal";
import type { TransactionRow } from "@/data/super-admin-mock";

export const TRANSACTION_FORM_FIELDS: FormFieldConfig[] = [
    { key: "trxId", label: "Transaction ID", required: true },
    { key: "customer", label: "Customer", required: true },
    { key: "type", label: "Type", type: "select", options: ["Payment", "Refund"], required: true },
    { key: "company", label: "Company", required: true },
    { key: "amount", label: "Amount", required: true, placeholder: "$0.00" },
    { key: "status", label: "Status", type: "select", options: ["Success", "Failed", "Pending"], required: true },
];

export function transactionToForm(row: TransactionRow | null): Record<string, string> {
    if (!row) return { trxId: "", customer: "", type: "Payment", company: "", amount: "", status: "Success" };
    return {
        trxId: row.trxId,
        customer: row.customer,
        type: row.type,
        company: row.company,
        amount: row.amount,
        status: row.status,
    };
}

export function formToTransaction(id: number, form: Record<string, string>, color: string, date: string): TransactionRow {
    const amount = form.amount.startsWith("$") ? form.amount : `$${form.amount}`;
    return {
        id,
        trxId: form.trxId.trim(),
        customer: form.customer.trim(),
        type: form.type,
        company: form.company.trim(),
        amount,
        status: form.status,
        date,
        color,
    };
}
