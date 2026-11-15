"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFormStatus } from "react-dom";

/** Tabs for sub-pages that share one sidebar entry (e.g. Payments / Transactions / Refunds). */
export function SubTabs({ tabs }: { tabs: { label: string; href: string }[] }) {
  const pathname = usePathname();
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-cl-border" role="tablist">
      {tabs.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            role="tab"
            aria-selected={active}
            className={`-mb-px whitespace-nowrap border-b-2 px-3.5 py-2.5 text-[0.86rem] font-medium transition ${
              active ? "border-cl-blue text-cl-blue" : "border-transparent text-cl-muted hover:text-cl-text"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}

const VARIANT = {
  primary: "bg-cl-blue text-white hover:bg-cl-blue-hover border-transparent",
  danger: "border-red-500/40 text-red-600 hover:bg-red-500/10 dark:text-red-300",
  neutral: "border-cl-border text-cl-text hover:bg-cl-blue-light hover:text-cl-blue",
};

/**
 * Submit button for a status-change form. Critical actions ask for confirmation
 * first, as required for suspensions and similar changes.
 */
export function ActionButton({
  children,
  confirm,
  variant = "neutral",
}: {
  children: React.ReactNode;
  confirm?: string;
  variant?: keyof typeof VARIANT;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
      className={`inline-flex h-8 items-center rounded-md border px-2.5 text-[0.76rem] font-semibold transition disabled:opacity-50 ${VARIANT[variant]}`}
    >
      {pending ? "Saving…" : children}
    </button>
  );
}
