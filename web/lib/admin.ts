import { redirect } from "next/navigation";
import { api, type ApiResult } from "./api";
import { getCurrentUser, getToken } from "./session";
import type { AdminBusiness, AdminUser, ContactMessage, Plan, SessionUser } from "./types";

/**
 * Gate for every /admin page and action. The backend only lets SUPER_ADMIN
 * through @PlatformAdmin(), so the console is Super Admin only too.
 */
export async function requireSuperAdmin(): Promise<{ user: SessionUser; token: string }> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.platformRole !== "SUPER_ADMIN") redirect("/dashboard");
  return { user, token: (await getToken()) as string };
}

export type Loaded<T> = { data: T; error?: string };

function unwrap<T>(result: ApiResult<T>, fallback: T): Loaded<T> {
  if (result.ok) return { data: result.data };
  if (result.status === 401) redirect("/login");
  return { data: fallback, error: result.message };
}

export async function loadBusinesses(token: string, status?: string): Promise<Loaded<{ total: number; items: AdminBusiness[] }>> {
  const q = new URLSearchParams({ take: "100" });
  if (status) q.set("status", status);
  return unwrap(await api<{ total: number; items: AdminBusiness[] }>(`/businesses/admin/list?${q}`, { token }), {
    total: 0,
    items: [],
  });
}

export async function loadUsers(token: string): Promise<Loaded<AdminUser[]>> {
  return unwrap(await api<AdminUser[]>("/users?take=100", { token }), []);
}

export async function loadMessages(token: string, status?: string): Promise<Loaded<ContactMessage[]>> {
  return unwrap(await api<ContactMessage[]>(`/contact-messages${status ? `?status=${status}` : ""}`, { token }), []);
}

export async function loadPlans(): Promise<Loaded<Plan[]>> {
  // Public endpoint: a 401 here is an API problem, not an expired session, so never redirect to login.
  const result = await api<Plan[]>("/plans/public");
  return result.ok ? { data: result.data } : { data: [], error: `Plans could not be loaded (HTTP ${result.status}).` };
}

export const ROLE_NAME = { USER: "Business user", ABUUR_STAFF: "ABUUR staff", SUPER_ADMIN: "Super admin" } as const;

export const fullName =(p: { firstName: string | null; lastName: string | null; email: string | null }) =>
  [p.firstName, p.lastName].filter(Boolean).join(" ") || p.email || "Unnamed";

export const initialsOf = (name: string) =>
  name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/** Whole days since an ISO date (request-time helper for Server Components). */
export const daysSince = (iso: string) => Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);

/** "10 Sep 2026 – 07 Oct 2026" for the last `days` days, in Mogadishu time. */
export function lastDaysRange(days: number): string {
  const fmt = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "Africa/Mogadishu" });
  const now = Date.now();
  return `${fmt.format(new Date(now - (days - 1) * 86_400_000))} – ${fmt.format(new Date(now))}`;
}

export const fmtDate =(iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Mogadishu" });

export function greeting(): string {
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Africa/Mogadishu" }).format(new Date()));
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
