"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { ArrowRight } from "lucide-react";

/** Key read by CreateBusinessForm to pre-fill the business the visitor claimed here. */
export const CLAIM_KEY = "abuur-claimed-shop";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/**
 * "Claim your store link": the visitor types their shop name and sees the link
 * they'll get. The name is carried through sign-up into the Add business form.
 */
export function ClaimLink({
  href,
  tone = "default",
  className = "",
}: {
  /** Where to continue: /register for visitors, the dashboard form when signed in. */
  href: string;
  tone?: "default" | "onDark";
  className?: string;
}) {
  const router = useRouter();
  const id = useId();
  const [name, setName] = useState("");
  const slug = slugify(name);
  const dark = tone === "onDark";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim()) {
      try {
        localStorage.setItem(CLAIM_KEY, JSON.stringify({ name: name.trim(), slug }));
      } catch {
        // Storage blocked: the visitor just types the name again later.
      }
    }
    router.push(href);
  }

  return (
    <form onSubmit={submit} className={`w-full max-w-xl ${className}`}>
      <label htmlFor={id} className="sr-only">
        Your shop name
      </label>
      <div
        className={`flex flex-col gap-2 rounded-2xl border p-2 shadow-[0_20px_50px_-24px_rgba(13,110,253,0.55)] transition focus-within:border-cl-blue sm:flex-row sm:items-center ${
          dark ? "border-white/15 bg-white/[0.06]" : "border-cl-border bg-cl-card"
        }`}
      >
        <input
          id={id}
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          autoComplete="organization"
          placeholder="Your shop name, e.g. Hodan Fashion"
          className={`min-h-12 flex-1 rounded-xl bg-transparent px-4 text-base outline-none ${
            dark ? "text-white placeholder:text-white/45" : "text-cl-text placeholder:text-cl-muted"
          }`}
        />
        <button type="submit" className="cl-btn cl-btn-primary group !min-h-12 shrink-0 !rounded-xl !px-5">
          Claim your link
          <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
      <p className={`mt-3 text-sm ${dark ? "text-blue-100/70" : "text-cl-muted"}`} aria-live="polite">
        Your store will live at{" "}
        <span className={`font-semibold ${dark ? "text-white" : "text-cl-text"}`}>
          abuur.so/
          <span className={dark ? "text-[#4ade80]" : "text-emerald-700 dark:text-emerald-400"}>{slug || "your-shop"}</span>
        </span>
      </p>
    </form>
  );
}
