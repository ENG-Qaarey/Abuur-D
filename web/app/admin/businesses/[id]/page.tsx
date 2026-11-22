import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, CalendarDays, Mail, MapPin, Phone, Store, Users } from "lucide-react";
import { BusinessActions } from "@/components/admin/status-actions";
import { EmptyRow, ErrorNote, KpiGrid, PageHeader, Panel, StatusPill, Table } from "@/components/admin/ui";
import { api } from "@/lib/api";
import { fmtDate, fullName, initialsOf, loadBusinesses, requireSuperAdmin } from "@/lib/admin";
import { adminRoutes as r } from "@/lib/routes";
import type { AdminSubscription, BusinessMember, AdminAuditLog } from "@/lib/types";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function BusinessDetailsPage({ params }: PageProps<"/admin/businesses/[id]">) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const { token } = await requireSuperAdmin();

  const [all, membersResult, subscriptionsResult, auditResult] = await Promise.all([
    loadBusinesses(token),
    api<BusinessMember[]>(`/businesses/${id}/members`, { token, businessId: id }),
    api<AdminSubscription[]>(`/subscriptions?businessId=${id}&take=100`, { token, businessId: id }),
    api<AdminAuditLog[]>(`/audit-logs?q=${id}&take=50`, { token }),
  ]);
  const b = all.data.items.find((x) => x.id === id);
  if (!b) {
    if (all.error) return <ErrorNote message={all.error} />;
    notFound();
  }
  const members = membersResult.ok ? membersResult.data : [];
  const subscriptions = subscriptionsResult.ok ? subscriptionsResult.data : [];
  const auditLogs = auditResult.ok ? auditResult.data.filter((log) => log.entityId === id || log.metadata && typeof log.metadata === "object" && JSON.stringify(log.metadata).includes(id)) : [];

  const facts = [
    { icon: Mail, label: "Email", value: b.email ?? b.owners[0]?.email },
    { icon: Phone, label: "Phone", value: b.phone },
    { icon: MapPin, label: "Address", value: b.address },
    { icon: Building2, label: "Industry", value: b.industry },
    { icon: CalendarDays, label: "Registered", value: fmtDate(b.createdAt) },
  ];

  return (
    <div className="w-full min-w-0 space-y-6">
      <Link href={r.businesses} className="inline-flex items-center gap-1.5 text-sm text-cl-muted hover:text-cl-blue">
        <ArrowLeft size={15} /> All businesses
      </Link>
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-3">
            {b.name} <StatusPill status={b.status} />
          </span>
        }
        subtitle={`abuur.so/${b.slug}`}
        actions={<BusinessActions id={b.id} name={b.name} status={b.status} />}
      />

      <KpiGrid
        items={[
          { label: "Members", value: String(b.memberCount), sub: "active team members", icon: Users, tone: "violet" },
          { label: "Stores", value: String(b.storeCount), sub: "stores created", icon: Store, tone: "blue" },
          { label: "Owners", value: String(b.owners.length), sub: b.owners.map(fullName).join(", ") || "none", icon: Building2, tone: "emerald" },
          { label: "Status", value: b.status === "PENDING_APPROVAL" ? "Pending" : b.status.charAt(0) + b.status.slice(1).toLowerCase(), sub: "current account state", icon: CalendarDays, tone: "amber" },
        ]}
      />

      <div className="grid gap-5 xl:grid-cols-3">
        <Panel title="Business profile" subtitle={b.description ?? "No description provided."}>
          <dl className="divide-y divide-cl-border text-sm">
            {facts.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 py-2.5">
                <Icon size={15} className="shrink-0 text-cl-muted" />
                <dt className="w-24 shrink-0 text-cl-muted">{label}</dt>
                <dd className="min-w-0 truncate font-medium">{value || "—"}</dd>
              </div>
            ))}
          </dl>
        </Panel>

        <Panel className="xl:col-span-2" title="Team members" subtitle="People with access to this business.">
          {!membersResult.ok && <ErrorNote message={membersResult.message} />}
          <Table head={["Member", "Role", "Status", "Joined"]}>
            {members.length === 0 ? (
              <EmptyRow cols={4}>No members found.</EmptyRow>
            ) : (
              members.map((m) => {
                const name = fullName(m.user);
                return (
                  <tr key={m.id}>
                    <td>
                      <span className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cl-blue-light text-[0.65rem] font-bold text-cl-blue">
                          {initialsOf(name)}
                        </span>
                        <span>
                          <span className="block font-semibold">{name}</span>
                          <span className="block text-xs text-cl-muted">{m.user.email}</span>
                        </span>
                      </span>
                    </td>
                    <td className="capitalize">{m.role.toLowerCase()}</td>
                    <td>
                      <StatusPill status={m.status} />
                    </td>
                    <td className="text-cl-muted">{fmtDate(m.joinedAt ?? m.createdAt)}</td>
                  </tr>
                );
              })
            )}
          </Table>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Subscription" subtitle="Current and recent billing relationships.">
          {subscriptions.length === 0 ? (
            <p className="py-6 text-center text-sm text-cl-muted">No subscription records.</p>
          ) : (
            <Table head={["Plan", "Status", "Started", "Renewal / end"]}>
              {subscriptions.map((subscription) => (
                <tr key={subscription.id}>
                  <td className="font-semibold">{subscription.plan.name}</td>
                  <td><StatusPill status={subscription.status} /></td>
                  <td className="text-cl-muted">{fmtDate(subscription.startDate)}</td>
                  <td className="text-cl-muted">{fmtDate(subscription.nextBillingAt ?? subscription.endDate ?? subscription.trialEndsAt ?? subscription.startDate)}</td>
                </tr>
              ))}
            </Table>
          )}
        </Panel>
        <Panel title="Administrative activity" subtitle="Audit events associated with this business.">
          {auditLogs.length === 0 ? (
            <p className="py-6 text-center text-sm text-cl-muted">No administrative activity recorded.</p>
          ) : (
            <Table head={["Action", "Actor", "Date"]}>
              {auditLogs.slice(0, 10).map((log) => (
                <tr key={log.id}>
                  <td className="font-medium">{log.action}</td>
                  <td className="text-cl-muted">{log.ipAddress ?? "Platform Admin"}</td>
                  <td className="text-cl-muted">{fmtDate(log.createdAt)}</td>
                </tr>
              ))}
            </Table>
          )}
        </Panel>
      </div>
    </div>
  );
}
