import { cookies } from "next/headers";
import { api } from "./api";
import type { SessionUser } from "./types";

export const SESSION_COOKIE = "abuur_session";
const DEFAULT_MAX_AGE = 60 * 60 * 24; // 1 day

/** "900", "15m", "12h", "7d" → seconds. */
function toSeconds(expiresIn?: string): number {
  if (!expiresIn) return DEFAULT_MAX_AGE;
  const match = /^(\d+)\s*([smhd]?)$/.exec(expiresIn.trim());
  if (!match) return DEFAULT_MAX_AGE;
  const unit = { "": 1, s: 1, m: 60, h: 3600, d: 86400 }[match[2] as "" | "s" | "m" | "h" | "d"];
  return Number(match[1]) * unit;
}

/** Stores the backend access token in an httpOnly cookie (never readable by page JS). */
export async function setSession(token: string, expiresIn?: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: toSeconds(expiresIn),
  });
}

export async function clearSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function getToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

export async function hasSession(): Promise<boolean> {
  return Boolean(await getToken());
}

/** The signed-in user, or null when there is no valid session. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = await getToken();
  if (!token) return null;
  const result = await api<SessionUser>("/auth/me", { token });
  return result.ok ? result.data : null;
}
