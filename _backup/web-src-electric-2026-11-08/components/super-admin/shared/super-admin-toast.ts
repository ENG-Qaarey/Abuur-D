import toast from "react-hot-toast";

export const superAdminToast = {
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
    info: (message: string) => toast(message, { icon: "ℹ️" }),
};

export async function copyToClipboard(text: string, successMessage = "Copied to clipboard") {
    try {
        await navigator.clipboard.writeText(text);
        superAdminToast.success(successMessage);
    } catch {
        superAdminToast.error("Could not copy to clipboard");
    }
}

export function exportTableCsv(filename: string, headers: string[], rows: string[][]) {
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const lines = [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    superAdminToast.success("Export started");
}
