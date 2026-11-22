import { ShieldCheck, ShieldUser, User } from "lucide-react";
import { SubTabs } from "@/components/admin/client";
import { TABS } from "@/components/admin/tabs";
import { ErrorNote, KpiGrid, PageHeader, Panel, StatusPill, Table } from "@/components/admin/ui";
import { ROLE_NAME, fullName, loadUsers, requireSuperAdmin } from "@/lib/admin";
import type { PlatformRole } from "@/lib/types";

const ROLE_ABOUT: Record<PlatformRole, string> = {
  USER: "Business owners and their team members. Access only their own businesses.",
  ABUUR_STAFF: "ABUUR team members. No Super Admin console access.",
  SUPER_ADMIN: "Controls the whole ABUUR platform from this console.",
  OWNER: "Owns and administers a registered business.",
  STAFF: "Works inside a business with assigned operational access.",
  DESIGNER: "Creates and manages creative projects.",
  MARKETING_MANAGER: "Runs marketing campaigns and customer outreach.",
  STORE_MANAGER: "Manages store products, inventory and orders.",
  FINANCE_MANAGER: "Manages invoices, payments and financial reporting.",
};

export default async function UserRolesPage() {
  const { token } = await requireSuperAdmin();
  const users = await loadUsers(token);
  const by = (role: PlatformRole) => users.data.filter((u) => u.platformRole === role);
  const roles: PlatformRole[] = [
    "SUPER_ADMIN",
    "OWNER",
    "STAFF",
    "DESIGNER",
    "MARKETING_MANAGER",
    "STORE_MANAGER",
    "FINANCE_MANAGER",
    "ABUUR_STAFF",
    "USER",
  ];

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader title="User Roles" subtitle="Platform roles assigned to accounts. Role changes are made in the backend for now." />
      <SubTabs tabs={TABS.users} />
      <ErrorNote message={users.error} />
      <KpiGrid
        items={[
          { label: "Super admins", value: String(by("SUPER_ADMIN").length), sub: "full platform control", icon: ShieldCheck, tone: "rose" },
          { label: "ABUUR staff", value: String(by("ABUUR_STAFF").length), sub: "internal team", icon: ShieldUser, tone: "violet" },
          { label: "Business users", value: String(by("USER").length), sub: "owners and members", icon: User, tone: "blue" },
        ]}
      />
      <Panel title="Roles" subtitle="Who holds each platform role.">
        <Table head={["Role", "Description", "Accounts", "Members"]} minWidth={760}>
          {roles.map((role) => (
            <tr key={role}>
              <td className="font-semibold">{ROLE_NAME[role]}</td>
              <td className="text-cl-muted">{ROLE_ABOUT[role]}</td>
              <td>
                <StatusPill status="ACTIVE" label={String(by(role).length)} />
              </td>
              <td className="max-w-xs truncate text-cl-muted">
                {by(role)
                  .slice(0, 4)
                  .map(fullName)
                  .join(", ") || "—"}
              </td>
            </tr>
          ))}
        </Table>
      </Panel>
    </div>
  );
}
