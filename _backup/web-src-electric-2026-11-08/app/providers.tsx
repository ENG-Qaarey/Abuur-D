"use client";

import { Toaster } from "react-hot-toast";
import { ThemeProvider, type ThemeProviderProps } from "@/components/theme-provider";
export function Providers({ children, ...props }: ThemeProviderProps) {
  return (
    <ThemeProvider {...props}>
      {children}
      <Toaster position="top-right" />
    </ThemeProvider>
  );
}
