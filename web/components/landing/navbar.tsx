"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  CreditCard,
  Home,
  Info,
  LayoutDashboard,
  Layers,
  Mail,
  Menu,
  Store,
  X,
  type LucideIcon,
} from "lucide-react";
import { routes } from "@/lib/routes";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

const NAV_LINKS: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Home", href: routes.home, icon: Home },
  { label: "Services", href: routes.services, icon: Layers },
  { label: "Stores", href: routes.stores, icon: Store },
  { label: "Solutions", href: routes.solutions, icon: Building2 },
  { label: "Pricing", href: routes.pricing, icon: CreditCard },
  { label: "About", href: routes.about, icon: Info },
  { label: "Contact", href: routes.contact, icon: Mail },
];

/**
 * "Tubelight" navbar: a pill glides to whichever link is hovered,
 * and the current page wears a glowing lamp on top.
 */
export function Navbar({ signedIn = false }: { signedIn?: boolean }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [lastPath, setLastPath] = useState(pathname);

  // Close the mobile menu after navigating.
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));
  const spring = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 380, damping: 32 };

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-5">
      <div
        className={`mx-auto flex max-w-[1240px] items-center justify-between gap-4 rounded-2xl border px-3 transition-all duration-300 sm:px-4 ${
          scrolled
            ? "h-14 border-cl-border bg-[var(--nav-glass)] shadow-[0_12px_40px_-14px_rgba(0,0,0,0.5)] backdrop-blur-xl"
            : "h-16 border-transparent bg-transparent"
        }`}
      >
        <Logo height={48} />

        {/* Desktop links */}
        <nav
          aria-label="Main"
          onMouseLeave={() => setHovered(null)}
          className="relative hidden items-center rounded-full border border-cl-border bg-cl-card/50 p-1 backdrop-blur-md xl:flex"
        >
          {NAV_LINKS.map(({ label, href }) => {
            const active = isActive(href);
            const highlighted = hovered ? hovered === href : active;
            return (
              <Link
                key={href}
                href={href}
                onMouseEnter={() => setHovered(href)}
                onFocus={() => setHovered(href)}
                aria-current={active ? "page" : undefined}
                className={`abuur-focus relative rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-200 ${
                  highlighted ? "text-cl-text" : "text-cl-muted hover:text-cl-text"
                } ${active ? "font-semibold" : ""}`}
              >
                {highlighted && (
                  <motion.span
                    layoutId="nav-pill"
                    transition={spring}
                    className="absolute inset-0 -z-0 rounded-full bg-cl-blue/12 ring-1 ring-cl-blue/25"
                    aria-hidden
                  />
                )}
                {active && (
                  <motion.span layoutId="nav-lamp" transition={spring} className="absolute -top-1 left-1/2 -translate-x-1/2" aria-hidden>
                    <span className="block h-[3px] w-7 rounded-full bg-cl-blue" />
                    <span className="absolute -left-2 -top-2 h-6 w-11 rounded-full bg-cl-blue/30 blur-md" />
                    <span className="absolute -top-1 left-0 h-5 w-7 rounded-full bg-cl-blue/25 blur-sm" />
                  </motion.span>
                )}
                <span className="relative">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="hidden items-center gap-1.5 md:flex">
            {signedIn ? (
              <Link href={routes.dashboard} className="nav-cta abuur-focus group">
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href={routes.login}
                  className="abuur-focus rounded-full px-3.5 py-2 text-sm font-semibold text-cl-text transition hover:bg-cl-blue-light"
                >
                  Login
                </Link>
                <Link href={routes.register} className="nav-cta abuur-focus group">
                  Get Started
                  <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </>
            )}
          </div>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="abuur-focus relative z-[60] inline-flex h-10 w-10 items-center justify-center rounded-xl border border-cl-border bg-cl-card/60 text-cl-text xl:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={open ? "x" : "menu"}
                initial={reduce ? false : { rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={reduce ? undefined : { rotate: 90, opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                {open ? <X size={20} /> : <Menu size={20} />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: reduce ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-2 max-h-[calc(100dvh-6rem)] max-w-[1240px] overflow-y-auto rounded-2xl border border-cl-border bg-[var(--nav-glass)] shadow-2xl backdrop-blur-xl xl:hidden"
          >
            <nav aria-label="Mobile" className="grid gap-1 p-3 sm:grid-cols-2">
              {NAV_LINKS.map(({ label, href, icon: Icon }, i) => {
                const active = isActive(href);
                return (
                  <motion.div
                    key={href}
                    initial={reduce ? false : { opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: reduce ? 0 : 0.04 * i, duration: 0.25 }}
                  >
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition ${
                        active ? "bg-cl-blue text-white" : "text-cl-text hover:bg-cl-blue-light"
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                          active ? "bg-white/15" : "bg-cl-blue-light text-cl-accent"
                        }`}
                      >
                        <Icon size={16} />
                      </span>
                      {label}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
            <div className="grid gap-2 border-t border-cl-border p-3 sm:grid-cols-2">
              {signedIn ? (
                <Link href={routes.dashboard} className="cl-btn cl-btn-primary w-full !rounded-xl sm:col-span-2">
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href={routes.login} className="cl-btn cl-btn-secondary w-full !rounded-xl">
                    Login
                  </Link>
                  <Link href={routes.register} className="cl-btn cl-btn-primary w-full !rounded-xl">
                    Get Started
                    <ArrowRight size={16} />
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
