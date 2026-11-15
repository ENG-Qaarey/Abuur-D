import { api } from "@/lib/api";
import { getCurrentUser, getToken } from "@/lib/session";
import type { AdminBusiness } from "@/lib/types";

/** CSV export of all businesses (Super Admin only). */
export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.platformRole !== "SUPER_ADMIN") return new Response("Forbidden", { status: 403 });
  const token = (await getToken()) as string;

  const result = await api<{ total: number; items: AdminBusiness[] }>("/businesses/admin/list?take=100", { token });
  if (!result.ok) return new Response(result.message, { status: result.status });

  // Quote every cell; neutralise leading =,+,-,@ so spreadsheets don't run them as formulas.
  const cell = (v: unknown) => {
    let s = v == null ? "" : String(v);
    if (/^[=+\-@]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  };
  const rows = [
    ["Name", "Slug", "Status", "Owners", "Owner emails", "Members", "Stores", "Phone", "Email", "Created"],
    ...result.data.items.map((b) => [
      b.name,
      b.slug,
      b.status,
      b.owners.map((o) => [o.firstName, o.lastName].filter(Boolean).join(" ")).join("; "),
      b.owners.map((o) => o.email ?? "").join("; "),
      b.memberCount,
      b.storeCount,
      b.phone,
      b.email,
      b.createdAt,
    ]),
  ];
  const csv = rows.map((r) => r.map(cell).join(",")).join("\r\n");
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="abuur-businesses-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
