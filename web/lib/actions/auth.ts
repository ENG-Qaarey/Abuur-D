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
  if (!email || !password) return { status: "error", message: "Enter your email and password." };

  const result = await api<AuthResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
  if (!result.ok) {
    return {
      status: "error",
      message: result.status === 401 ? "Incorrect email or password." : result.message,
    };
  }
  await setSession(result.data.accessToken, result.data.expiresIn);
  redirect("/dashboard");
}

export async function registerAction(_prev: FormState, form: FormData): Promise<FormState> {
  const firstName = text(form, "firstName");
  const lastName = text(form, "lastName");
  const email = text(form, "email");
  const password = raw(form, "password");

  if (!firstName || !lastName) return { status: "error", message: "Enter your first and last name." };
  if (password.length < 8) {
    return { status: "error", message: "Use a password of at least 8 characters." };
  }
  if (form.get("terms") !== "on") {
    return { status: "error", message: "Please accept the Terms of Service and Privacy Policy." };
  }

  const result = await api<AuthResponse>("/auth/register", {
    method: "POST",
    body: { firstName, lastName, email, password },
  });
  if (!result.ok) return { status: "error", message: result.message };

  await setSession(result.data.accessToken, result.data.expiresIn);
  redirect("/dashboard?welcome=1");
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}
