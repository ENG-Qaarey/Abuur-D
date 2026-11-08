"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { getToken } from "@/lib/session";
import type { FormState } from "@/lib/types";

function text(form: FormData, key: string): string | undefined {
  const value = form.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

/** "Hodan Fashion & Co." → "hodan-fashion-co" */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function createBusinessAction(_prev: FormState, form: FormData): Promise<FormState> {
  const token = await getToken();
  if (!token) redirect("/login");

  const name = text(form, "name") ?? "";
  const slug = slugify(text(form, "slug") ?? name);
  if (slug.length < 3) {
    return { status: "error", message: "Choose a store link of at least 3 letters or digits." };
  }

  const result = await api("/businesses", {
    method: "POST",
    token,
    body: {
      name,
      slug,
      description: text(form, "description"),
      phone: text(form, "phone"),
      address: text(form, "address"),
    },
  });
  if (!result.ok) {
    if (result.status === 401) redirect("/login");
    return {
      status: "error",
      message:
        result.status === 409 ? "That store link is already taken. Try another one." : result.message,
    };
  }
  revalidatePath("/dashboard");
  return {
    status: "success",
    message: "Your business was created. The ABUUR team will review and approve it.",
  };
}
