import Link from "next/link";
import { BadgeCheck, CirclePause, ShieldUser, Users } from "lucide-react";
import { SubTabs } from "@/components/admin/client";
import { UserActions } from "@/components/admin/status-actions";
import { TABS } from "@/components/admin/tabs";
import { EmptyRow, ErrorNote, KpiGrid, PageHeader, Panel, StatusPill, Table } from "@/components/admin/ui";
import { dailyCounts } from "@/components/dashboard/chart-utils";
import { ROLE_NAME, fmtDate, fullName, initialsOf, loadUsers, requireSuperAdmin } from "@/lib/admin";
import { adminRoutes as r } from "@/lib/routes";

const FILTERS = ["", "ACTIVE", "PENDING_VERIFICATION", "SUSPENDED", "INACTIVE"];

export default async function UsersPage({ searchParams }: PageProps<"/admin/users">) {
  const { user: me, token } = await requireSuperAdmin();
  const { status: raw, q: rawQ } = await searchParams;
  const status = FILTERS.includes(raw as string) ? (raw as string) : "";
  const q = typeof rawQ === "string" ? rawQ.trim().toLowerCase() : "";

  const users = await loadUsers(token);
  const all = users.data;
  const shown = all
    .filter((u) => !status || u.status === status)
    .filter((u) => !q || `${fullName(u)} ${u.email ?? ""} ${u.phone ?? ""}`.toLowerCase().includes(q));
  const count = (s: string) => all.filter((u) => u.status === s).length;

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <PageHeader title="Users" subtitle="Manage platform users and account access." />
      <SubTabs tabs={TABS.users} />
      <ErrorNote message={users.error} />
      <KpiGrid
        items={[
          { label: "Total users", value: String(all.length), sub: "latest 100 accounts", icon: Users, tone: "blue", spark: dailyCounts(all.map((u) => u.createdAt), 30) },
          { label: "Active", value: String(count("ACTIVE")), sub: "can sign in", icon: BadgeCheck, tone: "emerald" },
          { label: "Staff & admins", value: String(all.filter((u) => u.platformRole !== "USER").length), sub: "ABUUR team accounts", icon: ShieldUser, tone: "violet" },
          { label: "Suspended", value: String(count("SUSPENDED")), sub: "blocked accounts", icon: CirclePause, tone: "rose" },
        ]}
      />
      <Panel
        title="All users"
        subtitle={`${shown.length} of ${all.length} shown`}
        action={
          <form action={r.users}>
            {status && <input type="hidden" name="status" value={status} />}
            <input
              name="q"
              defaultValue={q}
              placeholder="Search name, email or phone"
              className="h-9 w-56 rounded-lg border border-cl-border bg-cl-bg px-3 text-sm outline-none focus:border-cl-blue"
            />
          </form>
        }
      >
        <div className="mb-3 flex flex-wrap gap-1.5">
          {FILTERS.map((f) => {
            const params = new URLSearchParams();
            if (f) params.set("status", f);
            if (q) params.set("q", q);
            return (
              <Link
                key={f || "all"}
                href={`${r.users}${params.size ? `?${params}` : ""}`}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  f === status ? "bg-cl-blue text-white" : "text-cl-muted hover:bg-cl-blue-light hover:text-cl-blue"
                }`}
              >
                {f ? (f === "PENDING_VERIFICATION" ? "Unverified" : f.charAt(0) + f.slice(1).toLowerCase()) : "All"}
              </Link>
            );
          })}
        </div>
        <Table head={["User", "Phone", "Role", "Verified", "Joined", "Status", { label: "Actions", className: "text-right" }]} minWidth={880}>
          {shown.length === 0 ? (
            <EmptyRow cols={7}>No users found.</EmptyRow>
          ) : (
            shown.map((u) => {
              const name = fullName(u);
              return (
                <tr key={u.id}>
                  <td>
                    <span className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cl-blue-light text-[0.65rem] font-bold text-cl-blue">
                        {initialsOf(name)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{name}</span>
                        <span className="block truncate text-xs text-cl-muted">{u.email ?? "no email"}</span>
                      </span>
                    </span>
                  </td>
                  <td className="text-cl-muted">{u.phone ?? "—"}</td>
                  <td>{ROLE_NAME[u.platformRole] ?? u.platformRole}</td>
                  <td className="text-cl-muted">{[u.emailVerified && "Email", u.phoneVerified && "Phone"].filter(Boolean).join(", ") || "—"}</td>
                  <td className="text-cl-muted">{fmtDate(u.createdAt)}</td>
                  <td>
                    <StatusPill status={u.status} />
                  </td>
                  <td>
                    <UserActions id={u.id} name={name} status={u.status} self={u.id === me.id} />
                  </td>
                </tr>
              );
            })
          )}
        </Table>
      </Panel>
    </div>
  );
}
