import Link from "next/link";
import { Building2, CirclePause, MessageCircle, Megaphone, type LucideIcon } from "lucide-react";
import { ErrorNote, NotConnected, PageHeader, Panel } from "@/components/admin/ui";
import { fmtDate, fullName, loadBusinesses, loadMessages, loadUsers, requireSuperAdmin } from "@/lib/admin";
import { adminRoutes as r } from "@/lib/routes";

type Alert = { icon: LucideIcon; tone: string; text: string; sub: string; at: string; href: string };

export default async function NotificationsPage() {
  const { token } = await requireSuperAdmin();
  const [pending, suspended, messages, users] = await Promise.all([
    loadBusinesses(token, "PENDING_APPROVAL"),
    loadBusinesses(token, "SUSPENDED"),
    loadMessages(token, "NEW"),
    loadUsers(token),
  ]);

  const alerts: Alert[] = [
    ...pending.data.items.map((b) => ({ icon: Building2, tone: "bg-amber-500/10 text-amber-600 dark:text-amber-300", text: `${b.name} is waiting for verification`, sub: b.owners.map(fullName).join(", ") || `abuur.so/${b.slug}`, at: b.createdAt, href: r.business(b.id) })),
    ...messages.data.map((m) => ({ icon: MessageCircle, tone: "bg-rose-500/10 text-rose-600 dark:text-rose-300", text: `New ${m.topic.toLowerCase()} ticket from ${m.name}`, sub: m.message, at: m.createdAt, href: r.support })),
    ...suspended.data.items.map((b) => ({ icon: CirclePause, tone: "bg-slate-500/10 text-slate-600 dark:text-slate-300", text: `${b.name} is suspended`, sub: "Reactivate it from the business page", at: b.createdAt, href: r.business(b.id) })),
    ...users.data
      .filter((u) => u.status === "SUSPENDED")
      .map((u) => ({ icon: CirclePause, tone: "bg-slate-500/10 text-slate-600 dark:text-slate-300", text: `${fullName(u)} is suspended`, sub: u.email ?? "user account", at: u.updatedAt, href: r.users })),
  ].sort((a, b) => b.at.localeCompare(a.at));

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <PageHeader title="Notifications" subtitle="Everything that needs an admin's attention, newest first." />
      <ErrorNote message={pending.error ?? messages.error} />
      <Panel title="Needs attention" subtitle={`${alerts.length} ${alerts.length === 1 ? "item" : "items"}`}>
        {alerts.length === 0 ? (
          <p className="py-8 text-center text-sm text-cl-muted">You&apos;re all caught up.</p>
        ) : (
          <ul className="divide-y divide-cl-border">
            {alerts.map((a, i) => (
              <li key={i}>
                <Link href={a.href} className="flex items-start gap-3 py-3 hover:text-cl-blue">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${a.tone}`}>
                    <a.icon size={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{a.text}</span>
                    <span className="block truncate text-xs text-cl-muted">{a.sub}</span>
                  </span>
                  <span className="shrink-0 text-xs text-cl-muted">{fmtDate(a.at)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Megaphone size={16} className="text-cl-blue" /> Announcements
      </div>
      <NotConnected
        endpoint="POST /notifications (broadcast)"
        what="Sending an announcement to every business owner needs a Super Admin broadcast endpoint. Notifications are stored per user today."
      />
    </div>
  );
}
