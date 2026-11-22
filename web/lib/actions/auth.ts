"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { clearSession, setSession, startSessionFromSupabase } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import type { AuthResponse, FormState } from "@/lib/types";

/*
 * Sign-in goes through Supabase Auth. The Supabase session is then exchanged with the ABUUR API
 * (POST /auth/supabase) for the ABUUR token stored in the httpOnly `abuur_session` cookie.
 */

function text(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function raw(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value : "";
}

/** Absolute base URL for links in Supabase emails (must be in Supabase's redirect allow list). */
async function siteUrl(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/+$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3001";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

const callbackUrl = async (next: string) => `${await siteUrl()}/auth/callback?next=${encodeURIComponent(next)}`;

const RATE_LIMITED = "Too many attempts. Please wait a minute and try again.";
const UNAVAILABLE = "We couldn't reach the sign-in service. Please try again in a moment.";

export async function loginAction(_prev: FormState, form: FormData): Promise<FormState> {
  const email = text(form, "email").toLowerCase();
  const password = raw(form, "password");
  const fields = { email };
  if (!email || !password) return { status: "error", message: "Enter your email and password.", fields };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (!error && data.session) {
    const exchanged = await startSessionFromSupabase(data.session.access_token);
    if (!exchanged.ok) {
      await supabase.auth.signOut();
      return { status: "error", message: exchanged.message, fields };
    }
    redirect("/dashboard");
  }

  if (error?.code === "email_not_confirmed") {
    return {
      status: "error",
      message: "Confirm your email first. Open the link we sent when you created your account.",
      fields,
    };
  }
  if (error?.status === 429) return { status: "error", message: RATE_LIMITED, fields };
  if (error && error.code !== "invalid_credentials") return { status: "error", message: UNAVAILABLE, fields };

  // Accounts created before Supabase Auth have their password in the ABUUR API instead.
  const legacy = await api<AuthResponse>("/auth/login", { method: "POST", body: { email, password } });
  if (!legacy.ok) {
    return {
      status: "error",
      message: legacy.status === 401 || legacy.status === 400 ? "Incorrect email or password." : legacy.message,
      fields,
    };
  }
  await setSession(legacy.data.access_token, legacy.data.expires_in);
  redirect("/dashboard");
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** "Hodan Ali Warsame" → { firstName: "Hodan", lastName: "Ali Warsame" } (the API stores both). */
function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.split(/\s+/).filter(Boolean);
  return { firstName: parts[0] ?? "", lastName: parts.slice(1).join(" ") };
}

export async function registerAction(_prev: FormState, form: FormData): Promise<FormState> {
  const fullName = text(form, "fullName").replace(/\s+/g, " ");
  const email = text(form, "email").toLowerCase();
  const password = raw(form, "password");
  const confirmPassword = raw(form, "confirmPassword");
  const fields = { fullName, email };
  const { firstName, lastName } = splitName(fullName);

  if (!firstName || !lastName) return { status: "error", message: "Enter your first and last name.", fields };
  if (firstName.length > 80 || lastName.length > 80) {
    return { status: "error", message: "Your name is too long. Use up to 80 characters for each part.", fields };
  }
  if (!EMAIL_RE.test(email)) return { status: "error", message: "Enter a valid email address.", fields };
  if (password.length < 8) {
    return { status: "error", message: "Use a password of at least 8 characters.", fields };
  }
  if (password !== confirmPassword) return { status: "error", message: "The passwords don't match.", fields };
  if (form.get("terms") !== "on") {
    return { status: "error", message: "Please accept the Terms of Service and Privacy Policy.", fields };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { first_name: firstName, last_name: lastName, full_name: fullName },
      emailRedirectTo: await callbackUrl("/dashboard?welcome=1"),
    },
  });

  if (error) {
    if (error.status === 429) return { status: "error", message: RATE_LIMITED, fields };
    if (error.code === "weak_password") {
      return { status: "error", message: "Choose a stronger password: mix letters, numbers and symbols.", fields };
    }
    if (error.code === "email_address_invalid") return { status: "error", message: "Enter a valid email address.", fields };
    if (error.code === "user_already_exists") {
      return { status: "error", message: "An account with this email already exists. Sign in instead.", fields };
    }
    return { status: "error", message: UNAVAILABLE, fields };
  }

  // Email confirmation off: Supabase returns a session straight away.
  if (data.session) {
    const exchanged = await startSessionFromSupabase(data.session.access_token);
    if (!exchanged.ok) return { status: "error", message: exchanged.message, fields };
    redirect("/dashboard?welcome=1");
  }

  // Email confirmation on (the default): the account is finished from the link in the email.
  // Supabase answers the same way for an already-registered email, so this can't reveal accounts.
  return {
    status: "success",
    message: `Check your inbox at ${email}. Open the link in the email to confirm your address and finish creating your account.`,
  };
}

/**
 * Sends a Supabase password-reset email. The link lands on /auth/callback, which signs the
 * visitor in and continues to /reset-password. The reply never reveals whether an account exists.
 */
export async function forgotPasswordAction(_prev: FormState, form: FormData): Promise<FormState> {
  const email = text(form, "email").toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return { status: "error", message: "Enter a valid email address.", fields: { email } };
  }
  const sent: FormState = {
    status: "success",
    message: "If an account exists for this email, we've sent a link to reset your password. Check your inbox.",
  };
  if (text(form, "website")) return sent; // honeypot: real people leave it empty

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: await callbackUrl("/reset-password"),
  });
  if (error?.status === 429) return { status: "error", message: RATE_LIMITED, fields: { email } };
  return sent;
}

/** Sets a new password for the visitor signed in through a reset link. */
export async function resetPasswordAction(_prev: FormState, form: FormData): Promise<FormState> {
  const password = raw(form, "password");
  if (password.length < 8) return { status: "error", message: "Use a password of at least 8 characters." };
  if (password !== raw(form, "confirmPassword")) return { status: "error", message: "The passwords don't match." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.updateUser({ password });
  if (error) {
    if (error.code === "same_password") {
      return { status: "error", message: "Choose a password different from your old one." };
    }
    if (error.code === "weak_password") {
      return { status: "error", message: "Choose a stronger password: mix letters, numbers and symbols." };
    }
    if (error.name === "AuthSessionMissingError" || error.status === 401 || error.status === 403) {
      return { status: "error", message: "Your reset link has expired. Request a new one from Forgot password." };
    }
    return { status: "error", message: UNAVAILABLE };
  }

  const { data: sessionData } = await supabase.auth.getSession();
  if (data.user && sessionData.session) {
    const exchanged = await startSessionFromSupabase(sessionData.session.access_token);
    if (!exchanged.ok) return { status: "error", message: exchanged.message };
  }
  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  await clearSession();
  redirect("/");
}
