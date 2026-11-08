"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, LayoutDashboard, Menu, X } from "lucide-react";
import { routes } from "@/lib/routes";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

const NAV_LINKS = [
  { label: "Features", href: routes.features },
  { label: "How it works", href: routes.howItWorks },
  { label: "Pricing", href: routes.pricing },
  { label: "About", href: routes.about },
  { label: "Contact", href: routes.contact },
];

/** Floating pill navbar that tightens once the page scrolls. */
export function Navbar({ signedIn = false }: { signedIn?: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => !href.includes("#") && href === pathname;

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-5">
      <div
        className={`site-header mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-4 rounded-2xl border px-3 backdrop-blur-xl transition-[background-color,border-color,box-shadow] duration-300 sm:px-4 ${
          scrolled ? "border-cl-border shadow-[0_12px_40px_-12px_rgba(0,0,0,0.45)]" : "border-transparent !bg-transparent"
        }`}
      >
        <Logo />

        <nav className="hidden items-center gap-0.5 rounded-full border border-cl-border bg-cl-card/60 p-1 lg:flex" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={`abuur-focus rounded-full px-4 py-2 text-sm font-medium transition ${
                isActive(link.href)
                  ? "bg-cl-blue text-white shadow"
                  : "text-cl-muted hover:bg-cl-blue-light hover:text-cl-text"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="hidden items-center gap-2 md:flex">
            {signedIn ? (
              <Link href={routes.dashboard} className="cl-btn cl-btn-primary !min-h-10 !rounded-full !px-4 text-sm">
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href={routes.login}
                  className="abuur-focus rounded-full px-3.5 py-2 text-sm font-semibold text-cl-text transition hover:text-cl-accent"
                >
                  Login
                </Link>
                <Link href={routes.register} className="cl-btn cl-btn-primary group !min-h-10 !rounded-full !px-4 text-sm">
                  Open your store
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </>
            )}
          </div>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="abuur-focus inline-flex h-10 w-10 items-center justify-center rounded-xl border border-cl-border text-cl-text lg:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="site-header__mobile mx-auto mt-2 max-w-[1240px] rounded-2xl border border-cl-border shadow-2xl lg:hidden">
          <nav className="flex flex-col gap-1 p-3" aria-label="Mobile">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl px-4 py-3 text-sm font-medium text-cl-text hover:bg-cl-blue-light"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-cl-border pt-3">
              {signedIn ? (
                <Link href={routes.dashboard} className="cl-btn cl-btn-primary w-full" onClick={() => setOpen(false)}>
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href={routes.login} className="cl-btn cl-btn-secondary w-full" onClick={() => setOpen(false)}>
                    Login
                  </Link>
                  <Link href={routes.register} className="cl-btn cl-btn-primary w-full" onClick={() => setOpen(false)}>
                    Open your store
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
