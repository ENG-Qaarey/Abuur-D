import Link from "next/link";
import { EmptyRow, StatusPill, Table } from "./ui";
import { BusinessActions } from "./status-actions";
import { fmtDate, fullName } from "@/lib/admin";
import { adminRoutes as r } from "@/lib/routes";
import type { AdminBusiness } from "@/lib/types";

export function BusinessTable({ items, empty = "No businesses found." }: { items: AdminBusiness[]; empty?: string }) {
  return (
    <Table head={["Business", "Owner", "Members", "Stores", "Registered", "Status", { label: "Actions", className: "text-right" }]} minWidth={860}>
      {items.length === 0 ? (
        <EmptyRow cols={7}>{empty}</EmptyRow>
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
            <td>{b.memberCount}</td>
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
