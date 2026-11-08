"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

const EVENT = "abuur-theme-change";

/** The <html> class set by the theme-init script in app/layout.tsx is the source of truth. */
function readTheme(): Theme {
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  return () => window.removeEventListener(EVENT, callback);
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("light", theme === "light");
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
  try {
    localStorage.setItem("abuur-theme", theme);
  } catch {
    // Storage can be blocked (private mode); the theme still applies for this page.
  }
  window.dispatchEvent(new Event(EVENT));
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  // null on the server, so the first client render matches the HTML.
  const theme = useSyncExternalStore<Theme | null>(subscribe, readTheme, () => null);
  const isDark = theme !== "light";

  return (
    <button
      type="button"
      onClick={() => applyTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border border-cl-border text-cl-text transition hover:bg-cl-blue-light hover:text-cl-blue ${className}`}
    >
      {theme === null ? (
        <Sun size={18} className="opacity-40" />
      ) : isDark ? (
        <Sun size={18} />
      ) : (
        <Moon size={18} />
      )}
    </button>
  );
}
