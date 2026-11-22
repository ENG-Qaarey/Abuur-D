import Link from "next/link";
import { EmptyRow, StatusPill, Table, statusLabel } from "./ui";
import { BusinessActions } from "./status-actions";
import { adminRoutes as r } from "@/lib/routes";
import type { AdminBusiness } from "@/lib/types";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Mogadishu" });

const fullName = (person: { firstName: string | null; lastName: string | null; email: string | null }) =>
  [person.firstName, person.lastName].filter(Boolean).join(" ") || person.email || "Unnamed";

export function BusinessTable({ items, empty = "No businesses found." }: { items: AdminBusiness[]; empty?: string }) {
  return (
    <Table head={["Business", "Owner", "Category", "Subscription", "Stores", "Registered", "Status", { label: "Actions", className: "text-right" }]} minWidth={980}>
      {items.length === 0 ? (
        <EmptyRow cols={8}>{empty}</EmptyRow>
      ) : (
        items.map((b) => (
          <tr key={b.id}>
            <td>
              <Link href={r.business(b.id)} className="font-semibold hover:text-cl-blue">
                {b.name}
              </Link>
              <p className="text-xs text-cl-muted">abuur.so/{b.slug}</p>
            </td>
            <td>
              <p>{b.owners.map(fullName).join(", ") || "—"}</p>
              <p className="text-xs text-cl-muted">{b.owners[0]?.email ?? b.phone ?? ""}</p>
            </td>
            <td className="text-cl-muted">{b.industry ?? "—"}</td>
            <td>
              {b.subscription ? (
                <>
                  <p className="font-medium">{b.subscription.plan.name}</p>
                  <p className="text-xs text-cl-muted">{statusLabel(b.subscription.status)} · {b.subscription.endDate ? fmtDate(b.subscription.endDate) : "No end date"}</p>
                </>
              ) : <span className="text-cl-muted">No subscription</span>}
            </td>
            <td>{b.storeCount}</td>
            <td className="text-cl-muted">{fmtDate(b.createdAt)}</td>
            <td>
              <StatusPill status={b.status} />
            </td>
            <td>
              <BusinessActions id={b.id} name={b.name} status={b.status} />
            </td>
          </tr>
        ))
      )}
    </Table>
  );
}
