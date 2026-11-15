"use server";

import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { clearSession, setSession } from "@/lib/session";
import type { AuthResponse, FormState } from "@/lib/types";

function text(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function raw(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === "string" ? value : "";
}

export async function loginAction(_prev: FormState, form: FormData): Promise<FormState> {
  const email = text(form, "email");
  const password = raw(form, "password");
  const fields = { email };
  if (!email || !password) return { status: "error", message: "Enter your email and password.", fields };

  const result = await api<AuthResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
  if (!result.ok) {
    return {
      status: "error",
      message: result.status === 401 ? "Incorrect email or password." : result.message,
      fields,
    };
  }
  await setSession(result.data.accessToken, result.data.expiresIn);
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
  const email = text(form, "email");
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

  const result = await api<AuthResponse>("/auth/register", {
    method: "POST",
    body: { firstName, lastName, email, password },
  });
  if (!result.ok) return { status: "error", message: result.message, fields };

  await setSession(result.data.accessToken, result.data.expiresIn);
  redirect("/dashboard?welcome=1");
}

/**
 * Password recovery request. There is no self-service reset yet, so the request goes to the
 * ABUUR team's support inbox (Admin, Support & Tickets). The reply is identical whether or not
 * the email has an account, so the form can't be used to discover registered emails.
 */
export async function forgotPasswordAction(_prev: FormState, form: FormData): Promise<FormState> {
  const email = text(form, "email");
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return { status: "error", message: "Enter a valid email address.", fields: { email } };
  }

  const result = await api("/contact-messages", {
    method: "POST",
    body: {
      name: "Password reset request",
      email,
      topic: "SUPPORT",
      message: `Password reset requested from the sign-in page for ${email}.`,
      locale: "en",
      website: text(form, "website"), // honeypot: real people leave it empty
    },
  });
  if (!result.ok) {
    return {
      status: "error",
      message: result.status === 429 ? result.message : "We couldn't send your request right now. Please try again in a moment.",
      fields: { email },
    };
  }
  return {
    status: "success",
    message: "If an account exists for this email, the ABUUR team will contact you there to help you get back in.",
  };
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}
