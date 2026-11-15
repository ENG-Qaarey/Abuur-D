"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Bell, CalendarDays, Download, ExternalLink, LogOut, Menu, Search, X } from "lucide-react";
import { BrandLockup } from "@/components/landing/logo";
import { ThemeToggle } from "@/components/landing/theme-toggle";
import { logoutAction } from "@/lib/actions/auth";
import { adminRoutes, routes } from "@/lib/routes";
import { ADMIN_NAV, activeHref } from "./nav";

type ShellUser = { name: string; handle: string; initials: string };

const noopSubscribe = () => () => {};

function Avatar({ initials, size = 32 }: { initials: string; size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-cl-blue text-[0.7rem] font-bold text-white ring-2 ring-cl-blue/15"
      style={{ width: size, height: size }}
    >
      {initials}
    </span>
  );
}

function CommandSearch() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  // Server render shows "⌘K"; the client swaps to "Ctrl K" off Apple devices.
  const mac = useSyncExternalStore(
    noopSubscribe,
    () => /Mac|iPhone|iPad/.test(navigator.platform),
    () => true,
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    const all = ADMIN_NAV.flatMap((g) => g.items.map((i) => ({ ...i, group: g.title })));
    return term ? all.filter((i) => `${i.label} ${i.group}`.toLowerCase().includes(term)).slice(0, 7) : [];
  }, [q]);

  const go = (href: string) => {
    setQ("");
    setOpen(false);
    inputRef.current?.blur();
    router.push(href);
  };

  return (
    <div className="relative w-full max-w-xs">
      <label className="flex h-10 items-center gap-2.5 rounded-lg px-2 text-cl-muted focus-within:bg-cl-bg">
        <Search size={17} className="shrink-0" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results[0]) go(results[0].href);
            if (e.key === "Escape") inputRef.current?.blur();
          }}
          placeholder="Search"
          aria-label="Search the admin console"
          className="w-full min-w-0 bg-transparent text-[0.9rem] text-cl-text outline-none placeholder:text-cl-muted"
        />
        <kbd className="hidden shrink-0 rounded border border-cl-border bg-cl-bg px-1.5 py-0.5 font-sans text-[0.65rem] text-cl-muted sm:inline">
          {mac ? "⌘K" : "Ctrl K"}
        </kbd>
      </label>
      {open && results.length > 0 && (
        <ul className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-xl border border-cl-border bg-cl-card py-1 shadow-lg">
          {results.map(({ href, label, group, icon: Icon }) => (
            <li key={href}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => go(href)}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-cl-blue-light hover:text-cl-blue"
              >
                <Icon size={16} className="text-cl-muted" />
                {label}
                <span className="ml-auto text-[0.68rem] text-cl-muted">{group}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AdminShell({
  user,
  dateRange,
  alerts,
  children,
}: {
  user: ShellUser;
  /** Pre-formatted on the server so server and client HTML match. */
  dateRange: string;
  /** Items waiting for the admin (pending businesses + new messages). */
  alerts: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const current = activeHref(pathname);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-[58px] shrink-0 items-center justify-between border-b border-cl-border px-5">
        <Link href={adminRoutes.dashboard} aria-label="ABUUR admin home">
          <BrandLockup height={36} />
        </Link>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md p-1.5 text-cl-muted hover:bg-cl-blue-light lg:hidden"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-3 pt-2" aria-label="Administration">
        {ADMIN_NAV.map((group, gi) => (
          <div key={group.title} className={gi > 0 ? "mt-2 border-t border-cl-border pt-1" : ""}>
            <p className="px-3 pb-1.5 pt-2 text-[0.64rem] font-semibold uppercase tracking-[0.1em] text-cl-muted">
              {group.title}
            </p>
            <ul className="space-y-0.5">
              {group.items.map(({ label, href, icon: Icon }) => {
                const active = href === current;
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`flex h-8 items-center gap-2.5 rounded-lg px-3 text-[0.84rem] font-medium transition ${
                        active
                          ? "bg-cl-blue text-white shadow-[0_2px_6px_rgba(13,110,253,0.28)]"
                          : "text-cl-text/80 hover:bg-cl-blue-light hover:text-cl-blue"
                      }`}
                    >
                      <Icon size={16} strokeWidth={1.8} className="shrink-0" />
                      <span className="truncate">{label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-cl-border px-2.5 pb-2.5 pt-2.5">
        <div className="flex items-center gap-2.5 rounded-xl border border-cl-border bg-cl-card px-2.5 py-2 shadow-sm">
          <Avatar initials={user.initials} />
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-[0.82rem] font-semibold">Platform Admin</span>
            <span className="block truncate text-[0.68rem] font-semibold text-cl-blue">Super Administrator</span>
          </span>
        </div>
        <Link
          href={routes.home}
          className="mt-2 flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[0.8rem] text-cl-muted hover:text-cl-blue"
        >
          <ExternalLink size={15} />
          View Public Portal
          <span className="ml-auto rounded-md bg-cl-blue-light px-1.5 py-0.5 text-[0.62rem] font-semibold text-cl-blue">Live</span>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cl-bg text-cl-text">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-52 border-r border-cl-border bg-cl-card lg:block">{sidebar}</aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close menu" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-cl-border bg-cl-card shadow-xl">{sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-52">
        <header className="sticky top-0 z-30 flex h-[58px] items-center gap-3 border-b border-cl-border bg-cl-card/95 px-4 backdrop-blur sm:px-7">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-lg border border-cl-border p-2 lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
          <CommandSearch />

          <div className="ml-auto flex items-center gap-2.5">
            <span className="hidden h-10 items-center gap-2 rounded-lg border border-cl-border bg-cl-card px-3.5 text-[0.85rem] font-medium xl:inline-flex">
              <CalendarDays size={16} className="text-cl-muted" />
              {dateRange}
            </span>
            <a
              href={adminRoutes.exportBusinesses}
              className="hidden h-10 items-center gap-2 rounded-lg border border-cl-border bg-cl-card px-3.5 text-[0.85rem] font-medium transition hover:bg-cl-blue-light hover:text-cl-blue md:inline-flex"
            >
              <Download size={16} />
              Export
            </a>
            <Link
              href={adminRoutes.notifications}
              aria-label={alerts ? `Notifications, ${alerts} waiting` : "Notifications"}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-cl-text transition hover:bg-cl-blue-light hover:text-cl-blue"
            >
              <Bell size={18} />
              {alerts > 0 && <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-orange-500 ring-2 ring-cl-card" />}
            </Link>
            <ThemeToggle className="!rounded-full" />
            <span className="hidden items-center gap-2.5 rounded-full border border-cl-border bg-cl-card py-1 pl-1 pr-3.5 sm:inline-flex">
              <Avatar initials={user.initials} size={34} />
              <span className="leading-tight">
                <span className="block max-w-[9rem] truncate text-[0.82rem] font-semibold">{user.handle}</span>
                <span className="block whitespace-nowrap text-[0.66rem] font-semibold text-cl-blue">Super Administrator</span>
              </span>
            </span>
            <form action={logoutAction}>
              <button
                type="submit"
                aria-label="Log out"
                title="Log out"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-cl-muted transition hover:bg-cl-blue-light hover:text-cl-blue"
              >
                <LogOut size={17} />
              </button>
            </form>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-7 sm:py-7">{children}</main>
      </div>
    </div>
  );
}
