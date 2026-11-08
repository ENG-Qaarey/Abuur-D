"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Theme = "light" | "dark" | "system";

export interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "sea-theme";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") {
    return;
  }

  const resolvedTheme = theme === "system" ? getSystemTheme() : theme;
  const root = document.documentElement;
  root.classList.toggle("dark", resolvedTheme === "dark");
  root.style.colorScheme = resolvedTheme;
}

export function ThemeProvider({ children, defaultTheme = "light" }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
    const initialTheme = storedTheme ?? defaultTheme;

    setThemeState(initialTheme);
    setResolvedTheme(initialTheme === "system" ? getSystemTheme() : initialTheme);
    applyTheme(initialTheme);
  }, [defaultTheme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      setResolvedTheme((current) => {
        if (theme !== "system") {
          return current;
        }

        const nextResolvedTheme = mediaQuery.matches ? "dark" : "light";
        applyTheme("system");
        return nextResolvedTheme;
      });
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [theme]);

  const setTheme = (nextTheme: Theme) => {
    setThemeState(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    const nextResolvedTheme = nextTheme === "system" ? getSystemTheme() : nextTheme;
    setResolvedTheme(nextResolvedTheme);
    applyTheme(nextTheme);
  };

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}