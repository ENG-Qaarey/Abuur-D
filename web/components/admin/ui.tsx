import Link from "next/link";
import { ArrowUpRight, PlugZap, type LucideIcon } from "lucide-react";
import { Sparkline } from "@/components/dashboard/charts";

/* Shared building blocks for every /admin page, so they all line up the same way. */

export const TONES = {
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-300",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
  violet: "bg-violet-500/10 text-violet-600 dark:text-violet-300",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
  sky: "bg-sky-500/10 text-sky-600 dark:text-sky-300",
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-300",
} as const;
export type Tone = keyof typeof TONES;

export const CARD = "rounded-xl border border-cl-border bg-cl-card shadow-[0_1px_3px_rgba(16,24,40,0.05)]";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: React.ReactNode;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-[1.6rem] font-bold leading-tight tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-[0.95rem] text-cl-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Button({
  href,
  icon: Icon,
  children,
  primary,
}: {
  href: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  primary?: boolean;
}) {
  const cls = primary
    ? "bg-cl-blue text-white hover:bg-cl-blue-hover border-transparent"
    : "bg-cl-card text-cl-text hover:bg-cl-blue-light hover:text-cl-blue border-cl-border";
  const external = href.endsWith("/export");
  const inner = (
    <>
      {Icon && <Icon size={16} />}
      {children}
    </>
  );
  const className = `inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-[0.88rem] font-semibold transition ${cls}`;
  return external ? (
    <a href={href} className={className}>
      {inner}
    </a>
  ) : (
    <Link href={href} className={className}>
      {inner}
    </Link>
  );
}

export type Kpi = {
  label: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  tone: Tone;
  spark?: number[];
};

export function KpiGrid({ items }: { items: Kpi[] }) {
  const cols = items.length >= 6 ? "2xl:grid-cols-6" : items.length === 5 ? "2xl:grid-cols-5" : "xl:grid-cols-4";
  return (
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 ${cols}`}>
      {items.map((k) => (
        <KpiCard key={k.label} {...k} />
      ))}
    </div>
  );
}

export function KpiCard({ label, value, sub, icon: Icon, tone, spark }: Kpi) {
  const empty = value === "—";
  return (
    <div className={`${CARD} flex min-h-[150px] flex-col px-4 pb-3 pt-4`}>
      <div className="flex items-start justify-between gap-2">
        <p className="truncate pt-1 text-[0.66rem] font-semibold uppercase tracking-[0.08em] text-cl-muted" title={label}>
          {label}
        </p>
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${TONES[tone]}`}>
          <Icon size={15} />
        </span>
      </div>
      <p className={`mt-2 text-[1.45rem] font-bold leading-none ${empty ? "text-cl-muted" : ""}`}>{value}</p>
      <p className="mt-2 truncate text-[0.74rem] text-cl-muted">{sub}</p>
      <div className="mt-auto border-b border-cl-border pt-2">
        <Sparkline values={spark ?? new Array(30).fill(0)} color={spark?.some(Boolean) ? "var(--cl-blue)" : "var(--cl-muted)"} />
      </div>
    </div>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-cl-muted">{children}</p>;
}

export type QuickAction = { label: string; icon: LucideIcon; href: string };

export function QuickActions({ items }: { items: QuickAction[] }) {
  return (
    <div>
      <SectionLabel>Quick actions</SectionLabel>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {items.map(({ label, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className={`${CARD} flex h-[58px] items-center gap-3 px-3.5 transition hover:border-cl-blue/50 hover:text-cl-blue`}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cl-blue-light text-cl-blue">
              <Icon size={16} />
            </span>
            <span className="truncate text-[0.86rem] font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function Panel({
  title,
  subtitle,
  action,
  className = "",
  bodyClassName = "mt-4",
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`${CARD} p-4 sm:p-5 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[0.98rem] font-semibold">{title}</h2>
          {subtitle && <p className="mt-1 text-[0.82rem] text-cl-muted">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

export function ViewAll({ href, children = "View All" }: { href: string; children?: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-[0.82rem] font-semibold hover:text-cl-blue">
      {children}
      <ArrowUpRight size={14} />
    </Link>
  );
}

const PILL: Record<string, string> = {
  green: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  amber: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  red: "bg-red-500/15 text-red-700 dark:text-red-300",
  gray: "bg-slate-500/15 text-slate-600 dark:text-slate-300",
  blue: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
};

const STATUS_TONE: Record<string, keyof typeof PILL> = {
  ACTIVE: "green",
  CONNECTED: "green",
  PAID: "green",
  HANDLED: "green",
  LIVE: "green",
  PENDING_APPROVAL: "amber",
  PENDING_VERIFICATION: "amber",
  PENDING: "amber",
  NEW: "blue",
  TRIALING: "blue",
  BETA: "blue",
  SUSPENDED: "red",
  ERROR: "red",
  FAILED: "red",
  INACTIVE: "gray",
  ARCHIVED: "gray",
  PLANNED: "gray",
};

export const STATUS_COLOR: Record<string, string> = {
  ACTIVE: "#10b981",
  PENDING_APPROVAL: "#f59e0b",
  SUSPENDED: "#ef4444",
  INACTIVE: "#94a3b8",
};

export const statusLabel = (s: string) =>
  ({ PENDING_APPROVAL: "Pending", PENDING_VERIFICATION: "Unverified" })[s] ?? s.charAt(0) + s.slice(1).toLowerCase().replace(/_/g, " ");

export function StatusPill({ status, label }: { status: string; label?: string }) {
  return (
    <span className={`inline-flex rounded-md px-2.5 py-1 text-[0.66rem] font-bold uppercase tracking-wide ${PILL[STATUS_TONE[status] ?? "blue"]}`}>
      {label ?? statusLabel(status)}
    </span>
  );
}

/** Table with the reference look: uppercase muted headers, hairline row dividers. */
export function Table({
  head,
  children,
  minWidth = 640,
}: {
  head: (string | { label: string; className?: string })[];
  children: React.ReactNode;
  minWidth?: number;
}) {
  return (
    <div className="-mx-4 overflow-x-auto sm:-mx-5">
      <table className="w-full text-[0.86rem]" style={{ minWidth }}>
        <thead>
          <tr className="border-b border-cl-border text-left text-[0.66rem] font-semibold uppercase tracking-[0.08em] text-cl-muted">
            {head.map((h, i) => {
              const label = typeof h === "string" ? h : h.label;
              const cls = typeof h === "string" ? "" : (h.className ?? "");
              return (
                <th key={label || i} className={`py-2.5 font-semibold first:pl-4 last:pr-4 sm:first:pl-5 sm:last:pr-5 ${i > 0 ? "px-3" : ""} ${cls}`}>
                  {label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="[&>tr]:border-b [&>tr]:border-cl-border [&>tr:last-child]:border-0 [&_td]:px-3 [&_td]:py-3 [&_td:first-child]:pl-4 [&_td:last-child]:pr-4 sm:[&_td:first-child]:pl-5 sm:[&_td:last-child]:pr-5">
          {children}
        </tbody>
      </table>
    </div>
  );
}

export function EmptyRow({ cols, children }: { cols: number; children: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={cols} className="!py-10 text-center text-cl-muted">
        {children}
      </td>
    </tr>
  );
}

export function ErrorNote({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm">
      {message}
    </p>
  );
}

/** Shown where the backend has no admin endpoint yet, instead of inventing numbers. */
export function NotConnected({
  endpoint,
  what,
  items,
}: {
  endpoint: string;
  what: string;
  items?: string[];
}) {
  return (
    <div className={`${CARD} flex flex-col items-center px-6 py-14 text-center`}>
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-cl-blue-light text-cl-blue">
        <PlugZap size={22} />
      </span>
      <h2 className="mt-4 text-base font-semibold">Waiting for the admin API</h2>
      <p className="mt-1.5 max-w-lg text-sm text-cl-muted">{what}</p>
      <p className="mt-3 text-xs text-cl-muted">
        Needs a Super Admin endpoint for <code className="rounded bg-cl-bg px-1.5 py-0.5 text-cl-text">{endpoint}</code>.
      </p>
      {items && (
        <ul className="mt-6 grid w-full max-w-2xl gap-2 text-left sm:grid-cols-2">
          {items.map((i) => (
            <li key={i} className="flex items-center gap-2 rounded-lg border border-dashed border-cl-border px-3 py-2 text-sm text-cl-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-cl-blue" />
              {i}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
