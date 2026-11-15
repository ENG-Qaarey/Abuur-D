import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  Boxes,
  Building2,
  Circle,
  CircleCheck,
  ClipboardList,
  Clock,
  CreditCard,
  Inbox,
  LifeBuoy,
  MessageCircle,
  Palette,
  PartyPopper,
  Plus,
  ShieldCheck,
  Store,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import { ActivityChart, Donut, Sparkline } from "@/components/dashboard/charts";
import { dailyCounts } from "@/components/dashboard/chart-utils";
import { CreateBusinessForm } from "@/components/dashboard/create-business-form";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";
import { getCurrentUser, getToken } from "@/lib/session";
import type { AdminBusiness, Business, BusinessMember, ContactMessage } from "@/lib/types";

const STATUS: Record<string, { label: string; pill: string; color: string }> = {
  ACTIVE: { label: "Active", pill: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300", color: "#10b981" },
  PENDING_APPROVAL: { label: "Pending", pill: "bg-amber-500/15 text-amber-600 dark:text-amber-300", color: "#f59e0b" },
  SUSPENDED: { label: "Suspended", pill: "bg-red-500/15 text-red-600 dark:text-red-300", color: "#ef4444" },
  INACTIVE: { label: "Inactive", pill: "bg-slate-500/15 text-slate-600 dark:text-slate-300", color: "#94a3b8" },
  REJECTED: { label: "Not approved", pill: "bg-red-500/15 text-red-600 dark:text-red-300", color: "#b91c1c" },
};
const statusOf = (s: string) => STATUS[s] ?? { label: s, pill: "bg-cl-blue-light text-cl-blue", color: "#0d6efd" };

const ORDER_STAGES = ["New", "Confirmed", "Preparing", "Ready", "Dispatched", "Delivered"];

const TONES = {
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-300",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
  violet: "bg-violet-500/10 text-violet-600 dark:text-violet-300",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  sky: "bg-sky-500/10 text-sky-600 dark:text-sky-300",
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-300",
} as const;

type Kpi = {
  label: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  tone: keyof typeof TONES;
  spark?: number[];
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Mogadishu" });

function greeting(): string {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Africa/Mogadishu" }).format(new Date()),
  );
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function Panel({
  title,
  subtitle,
  action,
  id,
  className = "",
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`cl-card cl-panel scroll-mt-24 p-5 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[0.95rem] font-semibold">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-cl-muted">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function PanelLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-sm font-medium text-cl-blue hover:underline">
      {children}
      <ArrowRight size={14} />
    </Link>
  );
}

export default async function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const token = (await getToken()) as string;
  const { welcome } = await searchParams;
  const isAdmin = user.platformRole === "SUPER_ADMIN";

  const [mineResult, adminResult, messagesResult] = await Promise.all([
    api<Business[]>("/businesses", { token }),
    isAdmin ? api<{ total: number; items: AdminBusiness[] }>("/businesses/admin/list?take=100", { token }) : null,
    isAdmin ? api<ContactMessage[]>("/contact-messages?status=NEW", { token }) : null,
  ]);
  const mine = mineResult.ok ? mineResult.data : [];
  const adminItems = adminResult?.ok ? adminResult.data.items : [];
  const adminTotal = adminResult?.ok ? adminResult.data.total : 0;
  const messages = messagesResult?.ok ? messagesResult.data : [];

  // Team of the first active business the user belongs to (the members API only serves active businesses).
  const teamBusiness = mine.find((b) => b.status === "ACTIVE");
  const membersResult = teamBusiness
    ? await api<BusinessMember[]>(`/businesses/${teamBusiness.id}/members`, { token, businessId: teamBusiness.id })
    : null;
  const members = membersResult?.ok ? membersResult.data : [];

  // Admins see the whole platform; owners see their own businesses.
  const scope: (Business | AdminBusiness)[] = isAdmin ? adminItems : mine;
  const count = (status: string) => scope.filter((b) => b.status === status).length;
  const totalBiz = isAdmin ? adminTotal : mine.length;
  const active = count("ACTIVE");
  const pending = count("PENDING_APPROVAL");
  const createdDates = scope.map((b) => b.createdAt);
  const bizSpark = dailyCounts(createdDates, 30);
  const flat = new Array(30).fill(0);

  const kpis: Kpi[] = isAdmin
    ? [
        { label: "Total businesses", value: String(totalBiz), sub: `${active} active · ${pending} pending`, icon: Building2, tone: "blue", spark: bizSpark },
        { label: "Pending approval", value: String(pending), sub: "awaiting your review", icon: ShieldCheck, tone: "amber", spark: dailyCounts(scope.filter((b) => b.status === "PENDING_APPROVAL").map((b) => b.createdAt), 30) },
        { label: "Stores", value: String(adminItems.reduce((a, b) => a + b.storeCount, 0)), sub: "across all businesses", icon: Store, tone: "violet" },
        { label: "Members", value: String(adminItems.reduce((a, b) => a + b.memberCount, 0)), sub: "active business members", icon: Users, tone: "emerald" },
        { label: "Orders", value: "—", sub: "orders module coming soon", icon: ClipboardList, tone: "sky" },
        { label: "New messages", value: String(messages.length), sub: "from the contact form", icon: Inbox, tone: "rose", spark: dailyCounts(messages.map((m) => m.createdAt), 30) },
      ]
    : [
        { label: "My businesses", value: String(totalBiz), sub: `${active} active · ${pending} pending`, icon: Building2, tone: "blue", spark: bizSpark },
        { label: "Pending approval", value: String(pending), sub: pending ? "ABUUR is reviewing" : "nothing waiting", icon: Clock, tone: "amber" },
        { label: "Team members", value: teamBusiness ? String(members.length) : "—", sub: teamBusiness ? `in ${teamBusiness.name}` : "after approval", icon: Users, tone: "emerald" },
        { label: "Stores", value: "—", sub: "store builder coming soon", icon: Store, tone: "violet" },
        { label: "Products", value: "—", sub: "catalogue coming soon", icon: Boxes, tone: "sky" },
        { label: "Orders", value: "—", sub: "WhatsApp orders coming soon", icon: ClipboardList, tone: "rose" },
      ];

  const quickActions: { label: string; icon: LucideIcon; href?: string }[] = [
    { label: "Add business", icon: Plus, href: "#new-business" },
    { label: "Build store", icon: Palette },
    { label: "Add product", icon: Boxes },
    { label: "View orders", icon: ClipboardList },
    { label: "Invite teammate", icon: UserPlus },
    { label: "Plans & billing", icon: CreditCard, href: routes.pricing },
  ];

  const statusSegments = ["ACTIVE", "PENDING_APPROVAL", "SUSPENDED", "INACTIVE", "REJECTED"]
    .map((s) => ({ label: statusOf(s).label, value: count(s), color: statusOf(s).color }))
    .filter((s, i) => i < 2 || s.value > 0);

  const recent = [...scope].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);

  const activity = [
    ...scope.map((b) => ({ icon: Building2, text: `Business “${b.name}” created`, at: b.createdAt })),
    ...messages.map((m) => ({ icon: MessageCircle, text: `Message from ${m.name} (${m.topic})`, at: m.createdAt })),
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 6);

  const approvalPct = totalBiz ? Math.round((active / Math.max(1, scope.length)) * 100) : 0;
  const steps = [
    { label: "Create your ABUUR account", done: true },
    { label: "Add your business", done: mine.length > 0 },
    { label: "Get approved by ABUUR", done: mine.some((b) => b.status === "ACTIVE") },
    { label: "Build your store", done: false, soon: true },
    { label: "Add your products", done: false, soon: true },
    { label: "Take your first WhatsApp order", done: false, soon: true },
  ];
  const displayName = user.firstName || user.email || "there";

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      {/* Greeting */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-[1.7rem]">
            {greeting()}, {displayName}
          </h1>
          <p className="mt-1 text-sm text-cl-muted sm:text-base">
            {isAdmin
              ? "Here is what is happening across the ABUUR platform today."
              : "Here is what is happening with your business today."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="#new-business" className="inline-flex h-10 items-center gap-2 rounded-lg bg-cl-blue px-4 text-sm font-semibold text-white transition hover:bg-cl-blue-hover">
            <Plus size={16} /> New business
          </Link>
          <Link href={routes.pricing} className="inline-flex h-10 items-center gap-2 rounded-lg border border-cl-border bg-cl-card px-4 text-sm font-medium transition hover:bg-cl-blue-light hover:text-cl-blue">
            <CreditCard size={16} /> Plans
          </Link>
        </div>
      </div>

      {welcome && (
        <p role="status" className="flex items-start gap-3 rounded-xl border border-cl-success/40 bg-cl-success/10 px-5 py-4 text-sm">
          <PartyPopper className="mt-0.5 h-5 w-5 shrink-0 text-cl-success" />
          Your account is ready. Welcome to ABUUR Digital! Add your business below to get started.
        </p>
      )}
      {(!mineResult.ok || (adminResult && !adminResult.ok)) && (
        <p role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-4 text-sm">
          {!mineResult.ok ? mineResult.message : adminResult && !adminResult.ok ? adminResult.message : ""}
        </p>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {kpis.map(({ label, value, sub, icon: Icon, tone, spark }) => (
          <div key={label} className="cl-card cl-panel flex flex-col p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-cl-muted">{label}</p>
              <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${TONES[tone]}`}>
                <Icon size={16} />
              </span>
            </div>
            <p className={`mt-2 text-2xl font-bold ${value === "—" ? "text-cl-muted" : ""}`}>{value}</p>
            <p className="mt-0.5 text-xs text-cl-muted">{sub}</p>
            <div className="mt-3">
              <Sparkline values={spark ?? flat} color={spark ? "var(--cl-blue)" : "var(--cl-muted)"} />
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-cl-muted">Quick actions</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-6">
          {quickActions.map(({ label, icon: Icon, href }) => {
            const inner = (
              <>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cl-blue-light text-cl-blue">
                  <Icon size={17} />
                </span>
                <span className="text-sm font-medium">{label}</span>
                {!href && (
                  <span className="ml-auto rounded bg-cl-blue-light px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase text-cl-blue">
                    Soon
                  </span>
                )}
              </>
            );
            return href ? (
              <Link key={label} href={href} className="cl-card cl-panel flex items-center gap-3 p-3 transition hover:!border-cl-blue/50">
                {inner}
              </Link>
            ) : (
              <div key={label} aria-disabled className="cl-card cl-panel flex cursor-not-allowed items-center gap-3 p-3 opacity-60">
                {inner}
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity + status overview */}
      <div className="grid gap-6 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title={isAdmin ? "Platform activity" : "Business activity"}
          subtitle={isAdmin ? "New businesses and website messages over time." : "Businesses you created over time."}
        >
          <ActivityChart
            series={[
              { label: "New businesses", color: "#0d6efd", dates: createdDates },
              ...(isAdmin ? [{ label: "New messages", color: "#10b981", dates: messages.map((m) => m.createdAt) }] : []),
            ]}
          />
        </Panel>

        <Panel title="Status overview" subtitle="Businesses by approval status.">
          <div className="flex flex-col items-center gap-5 py-2">
            <Donut
              segments={statusSegments}
              center={
                <>
                  <span className="text-2xl font-bold">{scope.length}</span>
                  <span className="text-xs text-cl-muted">businesses</span>
                </>
              }
            />
            <ul className="grid w-full grid-cols-2 gap-2 text-sm">
              {statusSegments.map((s) => (
                <li key={s.label} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                  <span className="text-cl-muted">{s.label}</span>
                  <span className="ml-auto font-semibold">{s.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>
      </div>

      {/* Recent businesses + side panel */}
      <div className="grid gap-6 xl:grid-cols-3">
        <Panel
          id="businesses"
          className="xl:col-span-2"
          title={isAdmin ? "Recently added businesses" : "Your businesses"}
          subtitle={isAdmin ? "Newest sign-ups across the platform." : "Every store on ABUUR belongs to a business."}
          action={
            <Link href="#new-business" className="inline-flex items-center gap-1 text-sm font-medium text-cl-blue hover:underline">
              Add <ArrowUpRight size={14} />
            </Link>
          }
        >
          {recent.length === 0 ? (
            <p className="rounded-lg border border-dashed border-cl-border px-4 py-8 text-center text-sm text-cl-muted">
              No businesses yet. <Link href="#new-business" className="font-medium text-cl-blue hover:underline">Add your first one</Link>.
            </p>
          ) : (
            <div className="-mx-5 overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-cl-border text-left text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-cl-muted">
                    <th className="px-5 pb-2 font-semibold">Business</th>
                    <th className="px-3 pb-2 font-semibold">{isAdmin ? "Owner" : "Your role"}</th>
                    <th className="px-3 pb-2 font-semibold">Created</th>
                    <th className="px-5 pb-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((b) => {
                    const st = statusOf(b.status);
                    const owner =
                      "owners" in b
                        ? b.owners.map((o) => [o.firstName, o.lastName].filter(Boolean).join(" ") || o.email).join(", ") || "—"
                        : b.myRole.charAt(0) + b.myRole.slice(1).toLowerCase();
                    return (
                      <tr key={b.id} className="border-b border-cl-border last:border-0">
                        <td className="px-5 py-3">
                          <p className="font-semibold">{b.name}</p>
                          <p className="text-xs text-cl-muted">abuur.so/{b.slug}</p>
                        </td>
                        <td className="px-3 py-3 text-cl-muted">{owner}</td>
                        <td className="px-3 py-3 text-cl-muted">{fmtDate(b.createdAt)}</td>
                        <td className="px-5 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-wide ${st.pill}`}>
                            {st.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        {isAdmin ? (
          <Panel title="Needs review" subtitle="Businesses waiting for approval.">
            {pending === 0 ? (
              <p className="text-sm text-cl-muted">Nothing waiting. All caught up.</p>
            ) : (
              <ul className="space-y-3">
                {scope
                  .filter((b) => b.status === "PENDING_APPROVAL")
                  .slice(0, 5)
                  .map((b) => (
                    <li key={b.id} className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-300">
                        <Clock size={16} />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">{b.name}</span>
                        <span className="block text-xs text-cl-muted">Submitted {fmtDate(b.createdAt)}</span>
                      </span>
                    </li>
                  ))}
              </ul>
            )}
          </Panel>
        ) : (
          <Panel title="Getting started" subtitle="Your path to the first WhatsApp order.">
            <ol className="space-y-3">
              {steps.map((s) => (
                <li key={s.label} className="flex items-center gap-3 text-sm">
                  {s.done ? (
                    <CircleCheck size={18} className="shrink-0 text-cl-success" />
                  ) : (
                    <Circle size={18} className="shrink-0 text-cl-muted/60" />
                  )}
                  <span className={s.done ? "text-cl-muted line-through" : ""}>{s.label}</span>
                  {s.soon && (
                    <span className="ml-auto rounded bg-cl-blue-light px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase text-cl-blue">
                      Soon
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </Panel>
        )}
      </div>

      {/* Three insight cards */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Panel title="Order pipeline" subtitle="WhatsApp orders from New to Delivered.">
          <p className="text-2xl font-bold text-cl-muted">—</p>
          <p className="mt-0.5 text-xs text-cl-muted">Order tracking arrives with the Orders module.</p>
          <ol className="mt-5 flex flex-wrap gap-1.5">
            {ORDER_STAGES.map((stage, i) => (
              <li key={stage} className="flex items-center gap-1.5 text-xs text-cl-muted">
                <span className="rounded-md border border-dashed border-cl-border px-2 py-1">{stage}</span>
                {i < ORDER_STAGES.length - 1 && <ArrowRight size={12} />}
              </li>
            ))}
          </ol>
        </Panel>

        <Panel title="Approval progress" subtitle={isAdmin ? "Share of businesses that are live." : "How many of your businesses are live."}>
          <p className="text-2xl font-bold">{active}</p>
          <p className="mt-0.5 text-xs text-cl-muted">
            active of {scope.length} {scope.length === 1 ? "business" : "businesses"}
          </p>
          <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-cl-border" role="progressbar" aria-valuenow={approvalPct} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-cl-blue transition-all" style={{ width: `${approvalPct}%` }} />
          </div>
          <p className="mt-2 text-xs text-cl-muted">{approvalPct}% approved</p>
        </Panel>

        <Panel title="Your plan" subtitle="Subscriptions unlock stores and products.">
          <div className="flex items-center gap-5">
            <Donut size={96} thickness={12} segments={[{ label: "Plan", value: 0, color: "#0d6efd" }]} center={<CreditCard size={20} className="text-cl-muted" />} />
            <div>
              <p className="text-sm text-cl-muted">Pick the plan that fits your business. You pay outside the app and we activate it.</p>
              <div className="mt-3">
                <PanelLink href={routes.pricing}>View plans</PanelLink>
              </div>
            </div>
          </div>
        </Panel>
      </div>

      {/* Activity, team, messages */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Panel title="Recent activity">
          {activity.length === 0 ? (
            <p className="text-sm text-cl-muted">No activity yet.</p>
          ) : (
            <ul className="space-y-4">
              {activity.map((a, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cl-blue-light text-cl-blue">
                    <a.icon size={15} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{a.text}</span>
                    <span className="block text-xs text-cl-muted">{fmtDate(a.at)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel id="team" title="Team members" subtitle={teamBusiness ? teamBusiness.name : undefined}>
          {!teamBusiness ? (
            <p className="text-sm text-cl-muted">Your team appears here once a business is approved.</p>
          ) : members.length === 0 ? (
            <p className="text-sm text-cl-muted">No members found.</p>
          ) : (
            <ul className="space-y-3">
              {members.slice(0, 6).map((m) => {
                const name = [m.user.firstName, m.user.lastName].filter(Boolean).join(" ") || m.user.email || "Member";
                const initials = name.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
                return (
                  <li key={m.id} className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cl-blue-light text-xs font-bold text-cl-blue">
                      {initials}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{name}</span>
                      <span className="block text-xs capitalize text-cl-muted">{m.role.toLowerCase()}</span>
                    </span>
                    <span
                      className={`ml-auto h-2 w-2 rounded-full ${m.status === "ACTIVE" ? "bg-emerald-500" : "bg-amber-500"}`}
                      title={m.status === "ACTIVE" ? "Active" : "Invited"}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        {isAdmin ? (
          <Panel id="messages" title="Website messages" subtitle="New messages from the contact form.">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-cl-bg p-3">
                <p className="text-xl font-bold">{messages.length}</p>
                <p className="text-xs text-cl-muted">New</p>
              </div>
              <div className="rounded-lg bg-cl-bg p-3">
                <p className="text-xl font-bold">{dailyCounts(messages.map((m) => m.createdAt), 7).reduce((a, b) => a + b, 0)}</p>
                <p className="text-xs text-cl-muted">This week</p>
              </div>
            </div>
            <ul className="mt-4 divide-y divide-cl-border">
              {messages.slice(0, 4).map((m) => (
                <li key={m.id} className="py-2.5">
                  <p className="text-sm font-semibold">
                    {m.name}
                    <span className="ml-2 rounded bg-cl-blue-light px-1.5 py-0.5 text-[0.65rem] font-semibold text-cl-blue">{m.topic}</span>
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-cl-muted">{m.message}</p>
                  <p className="mt-0.5 text-[0.7rem] text-cl-muted">{[m.email, m.phone].filter(Boolean).join(" · ")}</p>
                </li>
              ))}
            </ul>
          </Panel>
        ) : (
          <Panel title="Need help?" subtitle="The ABUUR team is here for you.">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cl-blue-light text-cl-blue">
                <LifeBuoy size={18} />
              </span>
              <p className="text-sm text-cl-muted">
                Questions about setting up your store, approval or plans? Send us a message and we&apos;ll get back to you.
              </p>
            </div>
            <div className="mt-4">
              <PanelLink href={routes.contact}>Contact ABUUR</PanelLink>
            </div>
          </Panel>
        )}
      </div>

      {/* Add business */}
      <Panel
        id="new-business"
        title={mine.length > 0 ? "Add another business" : "Add your business"}
        subtitle="Every store on ABUUR belongs to a business. You'll be its owner."
      >
        <CreateBusinessForm />
      </Panel>
    </div>
  );
}
