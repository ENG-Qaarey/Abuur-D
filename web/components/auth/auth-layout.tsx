"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Check, ClipboardList, Store, TrendingUp, Users, type LucideIcon } from "lucide-react";
import { routes } from "@/lib/routes";
import { BrandLockup } from "@/components/landing/logo";
import { ThemeToggle } from "@/components/landing/theme-toggle";
import type { AuthMode } from "./auth-form";

const HEADER: Record<AuthMode, { title: string; text: string }> = {
  login: { title: "Welcome back", text: "Sign in to continue managing your business." },
  register: { title: "Create your business account", text: "Start building and managing your business with ABUUR." },
  forgot: { title: "Forgot your password?", text: "Enter your email address and we'll send you a link to reset your password." },
  reset: { title: "Set a new password", text: "Choose a new password for your ABUUR account." },
};

const BENEFITS = ["Your online store", "Orders and customers", "One connected dashboard"];

/* The ABUUR ecosystem: the sprout at the centre, four parts of the business around it. */
const NODES: { icon: LucideIcon; label: string; pos: string }[] = [
  { icon: Store, label: "Online store", pos: "left-0 top-6" },
  { icon: ClipboardList, label: "Orders", pos: "right-0 top-0" },
  { icon: Users, label: "Customers", pos: "left-4 bottom-2" },
  { icon: TrendingUp, label: "Growth", pos: "right-2 bottom-8" },
];

function Ecosystem() {
  return (
    <div className="auth-eco relative mx-auto h-[260px] w-full max-w-[400px]" aria-hidden>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 260" fill="none">
        <g stroke="rgba(85,185,255,0.28)" strokeWidth="1" strokeDasharray="3 5">
          <path d="M200 130 L72 46" />
          <path d="M200 130 L330 30" />
          <path d="M200 130 L78 222" />
          <path d="M200 130 L322 200" />
        </g>
        <circle cx="200" cy="130" r="74" stroke="rgba(255,255,255,0.08)" />
        <circle cx="200" cy="130" r="104" stroke="rgba(255,255,255,0.05)" />
      </svg>
      <div className="absolute left-1/2 top-1/2 grid h-[104px] w-[104px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-[#0B2552] shadow-[0_0_60px_-10px_rgba(22,119,248,0.6)]">
        <Image src="/brand/sprout/abuur-sprout-3d-white.svg" alt="" width={84} height={84} unoptimized priority />
      </div>
      {NODES.map(({ icon: Icon, label, pos }, i) => (
        <div key={label} className={`auth-eco__node absolute ${pos}`} style={{ animationDelay: `${i * 0.6}s` }}>
          <span className="grid h-7 w-7 place-items-center rounded-md bg-[#1677F8]/15 text-[#55B9FF]">
            <Icon size={14} />
          </span>
          {label}
        </div>
      ))}
    </div>
  );
}

function BrandPanel() {
  return (
    <aside className="auth-brand relative hidden h-dvh overflow-hidden text-white md:sticky md:top-0 md:flex md:flex-col">
      <div className="relative flex h-full flex-col px-10 py-9 lg:px-14">
        <Link href={routes.home} aria-label="ABUUR Digital home" className="w-fit">
          <Image src="/brand/sprout/abuur-logo-3d-dark.svg" alt="" width={144} height={45} unoptimized priority />
        </Link>

        <div className="mt-auto">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#55B9FF]">Your business, connected</p>
          <h2 className="mt-4 text-[30px] font-semibold leading-[1.15] tracking-[-0.02em] lg:text-[34px]">
            Everything your business needs.
            <br />
            <span className="bg-gradient-to-r from-[#55B9FF] to-[#258BFA] bg-clip-text text-transparent">All in one place.</span>
          </h2>
          <p className="mt-4 max-w-[400px] text-[15px] leading-relaxed text-[#B8C7E0]">
            Manage your store, connect with customers, track orders, and grow your business with ABUUR.
          </p>
        </div>

        <div className="my-auto hidden py-8 lg:block">
          <Ecosystem />
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 lg:mt-0">
          <ul className="flex flex-col gap-2.5 text-[13px] text-[#D5E0F2] xl:flex-row xl:flex-wrap xl:gap-x-6 xl:gap-y-2">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-center gap-2 whitespace-nowrap">
                <Check size={14} className="shrink-0 text-[#55B9FF]" aria-hidden />
                {b}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[12px] text-[#7D8DAB]">© {new Date().getFullYear()} ABUUR Digital. All rights reserved.</p>
        </div>
      </div>
    </aside>
  );
}

/**
 * Shared frame for /login, /register, /forgot-password and /reset-password. It stays mounted between them,
 * so the tab indicator slides and only the form content changes.
 */
export function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const mode: AuthMode = pathname.startsWith(routes.register)
    ? "register"
    : pathname.startsWith(routes.forgotPassword)
      ? "forgot"
      : pathname.startsWith(routes.resetPassword)
        ? "reset"
        : "login";
  const header = HEADER[mode];

  return (
    <div className="auth-root grid min-h-dvh bg-[var(--a-bg)] text-[var(--a-text)] md:grid-cols-[40fr_60fr] lg:grid-cols-[44fr_56fr]">
      <BrandPanel />

      <main className="flex min-h-dvh flex-col px-5 py-5 sm:px-8" aria-labelledby="auth-title">
        <div className="flex items-center justify-between gap-3">
          <Link href={routes.home} aria-label="ABUUR Digital home" className="md:hidden">
            <BrandLockup height={34} />
          </Link>
          <Link href={routes.home} className="auth-link-muted hidden items-center gap-1.5 text-sm md:inline-flex">
            <ArrowLeft size={15} aria-hidden />
            Back to home
          </Link>
          <ThemeToggle />
        </div>

        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-10">
          <div key={mode} className="auth-enter">
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--a-primary)]">Welcome to ABUUR</p>
            <h1 id="auth-title" className="mt-2.5 text-[28px] font-semibold leading-tight tracking-[-0.02em] sm:text-[30px]">
              {header.title}
            </h1>
            <p className="mt-2 text-[15px] leading-relaxed text-[var(--a-muted)]">{header.text}</p>
          </div>

          {(mode === "login" || mode === "register") && (
            <nav aria-label="Account" className="auth-tabs mt-7" data-active={mode}>
              <span className="auth-tabs__indicator" aria-hidden />
              <Link href={routes.login} aria-current={mode === "login" ? "page" : undefined} scroll={false} className="auth-tabs__tab">
                Sign in
              </Link>
              <Link href={routes.register} aria-current={mode === "register" ? "page" : undefined} scroll={false} className="auth-tabs__tab">
                Create account
              </Link>
            </nav>
          )}

          <div key={pathname} className="auth-enter mt-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
