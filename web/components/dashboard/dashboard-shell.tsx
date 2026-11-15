"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Boxes,
  Building2,
  CalendarDays,
  ClipboardList,
  CreditCard,
  ExternalLink,
  Inbox,
  LayoutGrid,
  LogOut,
  Menu,
  Palette,
  Settings,
  ShieldCheck,
  UserCircle,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { BrandLockup } from "@/components/landing/logo";
import { ThemeToggle } from "@/components/landing/theme-toggle";
import { logoutAction } from "@/lib/actions/auth";
import { adminRoutes, routes } from "@/lib/routes";

type NavItem = { label: string; icon: LucideIcon; href?: string; badge?: string };
type NavGroup = { title: string; items: NavItem[] };

/** Items without an href are modules that are not built yet; they render disabled with a "Soon" tag. */
function navGroups(isAdmin: boolean): NavGroup[] {
  const groups: NavGroup[] = [
    { title: "Overview", items: [{ label: "Dashboard", icon: LayoutGrid, href: routes.dashboard }] },
    {
      title: "Store",
      items: [
        { label: "Store builder", icon: Palette },
        { label: "Products", icon: Boxes },
        { label: "Orders", icon: ClipboardList },
        { label: "Customers", icon: Users },
      ],
    },
    {
      title: "Business",
      items: [
        { label: "My businesses", icon: Building2, href: `${routes.dashboard}#businesses` },
        { label: "Team", icon: UserCircle, href: `${routes.dashboard}#team` },
        { label: "Plans & billing", icon: CreditCard, href: routes.pricing },
      ],
    },
  ];
  if (isAdmin) {
    groups.push({
      title: "Platform admin",
      items: [
        { label: "Admin console", icon: ShieldCheck, href: adminRoutes.dashboard },
        { label: "Support tickets", icon: Inbox, href: adminRoutes.support },
      ],
    });
  }
  groups.push({ title: "Account", items: [{ label: "Settings", icon: Settings }] });
  return groups;
}

type ShellUser = { name: string; email: string | null; roleLabel: string; initials: string };

export function DashboardShell({
  user,
  isAdmin,
  today,
  children,
}: {
  user: ShellUser;
  isAdmin: boolean;
  /** Pre-formatted on the server so server and client HTML match. */
  today: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const groups = navGroups(isAdmin);

  // Close the drawer on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center justify-between gap-2 border-b border-cl-border px-4">
        <Link href={routes.home} className="inline-flex items-center gap-2" aria-label="ABUUR Digital home">
          <BrandLockup height={38} />
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

      <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Dashboard">
        {groups.map((group, gi) => (
          <div key={group.title} className={gi > 0 ? "mt-2.5 border-t border-cl-border pt-2.5" : ""}>
            <p className="px-2.5 pb-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-cl-muted">
              {group.title}
            </p>
            <ul className="space-y-0.5">
              {group.items.map(({ label, icon: Icon, href }) => {
                const active = href === pathname;
                if (!href) {
                  return (
                    <li key={label}>
                      <span
                        aria-disabled
                        className="flex cursor-not-allowed items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[0.8125rem] text-cl-muted/70"
                      >
                        <Icon size={16} />
                        {label}
                        <span className="ml-auto rounded bg-cl-blue-light px-1 py-px text-[0.55rem] font-semibold uppercase text-cl-blue">
                          Soon
                        </span>
                      </span>
                    </li>
                  );
                }
                return (
                  <li key={label}>
                    <Link
                      href={href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[0.8125rem] font-medium transition ${
                        active
                          ? "bg-cl-blue text-white shadow-sm"
                          : "text-cl-text/80 hover:bg-cl-blue-light hover:text-cl-blue"
                      }`}
                    >
                      <Icon size={16} />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-cl-border p-2">
        <div className="flex items-center gap-2.5 rounded-xl border border-cl-border p-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cl-blue-light text-[0.7rem] font-bold text-cl-blue">
            {user.initials}
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-sm font-semibold">{user.name}</span>
            <span className="block truncate text-[0.7rem] font-medium text-cl-blue">{user.roleLabel}</span>
          </span>
        </div>
        <Link
          href={routes.home}
          className="mt-1 flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[0.8125rem] text-cl-muted hover:text-cl-blue"
        >
          <ExternalLink size={15} />
          View public site
          <span className="ml-auto rounded bg-cl-success/15 px-1.5 py-0.5 text-[0.6rem] font-semibold text-cl-success">
            Live
          </span>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cl-bg text-cl-text">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-52 border-r border-cl-border bg-cl-card lg:block">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-cl-border bg-cl-card shadow-xl">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-52">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-cl-border bg-cl-card/90 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-lg border border-cl-border p-2 text-cl-text lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>

          <div className="ml-auto flex items-center gap-2">
            <span className="hidden items-center gap-2 rounded-lg border border-cl-border px-3 py-2 text-sm font-medium md:inline-flex">
              <CalendarDays size={16} className="text-cl-muted" />
              {today}
            </span>
            <ThemeToggle />
            <span className="hidden items-center gap-2.5 rounded-full border border-cl-border py-1 pl-1 pr-3 sm:inline-flex">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cl-blue-light text-xs font-bold text-cl-blue">
                {user.initials}
              </span>
              <span className="leading-tight">
                <span className="block max-w-[10rem] truncate text-sm font-semibold">{user.name}</span>
                <span className="block text-[0.68rem] font-medium text-cl-blue">{user.roleLabel}</span>
              </span>
            </span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-cl-border px-3 text-sm font-medium transition hover:bg-cl-blue-light hover:text-cl-blue"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </form>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

