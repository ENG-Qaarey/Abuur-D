"use server";

import { api } from "@/lib/api";
import type { FormState } from "@/lib/types";

const TOPICS = ["SALES", "SUPPORT", "PARTNERSHIP", "OTHER"] as const;

function text(form: FormData, key: string): string | undefined {
  const value = form.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export async function contactAction(_prev: FormState, form: FormData): Promise<FormState> {
  const topic = text(form, "topic");
  const email = text(form, "email");
  const phone = text(form, "phone");
  if (!email && !phone) {
    return { status: "error", message: "Add an email address or a phone number so we can reply." };
  }

  const result = await api("/contact-messages", {
    method: "POST",
    body: {
      name: text(form, "name") ?? "",
      email,
      phone,
      businessName: text(form, "businessName"),
      topic: TOPICS.includes(topic as (typeof TOPICS)[number]) ? topic : "OTHER",
      message: text(form, "message") ?? "",
      locale: "en",
      website: text(form, "website"), // honeypot: real people leave it empty
    },
  });
  if (!result.ok) return { status: "error", message: result.message };
  return {
    status: "success",
    message: "Thank you! Your message reached the ABUUR team. We'll get back to you soon.",
  };
}
