"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/lib/types";
import { api } from "@/lib/api";
import { requireSuperAdmin } from "@/lib/admin";

const BUSINESS_STATUSES = ["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING_APPROVAL"];
const USER_STATUSES = ["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING_VERIFICATION"];
const MESSAGE_STATUSES = ["NEW", "HANDLED", "ARCHIVED"];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function field(form: FormData, key: string): string {
  const v = form.get(key);
  return typeof v === "string" ? v : "";
}

/**
 * Status changes are critical actions: Super Admin only, validated here and
 * again by the API, which also writes the audit log entry.
 */
async function patchStatus(path: string, status: string) {
  const { token } = await requireSuperAdmin();
  const result = await api(path, { method: "PATCH", token, body: { status } });
  revalidatePath("/admin", "layout");
  return result;
}

export async function setBusinessStatusAction(form: FormData) {
  const id = field(form, "id");
  const status = field(form, "status");
  const reason = field(form, "reason");
  if (!UUID.test(id) || !BUSINESS_STATUSES.includes(status)) return;
  const { token } = await requireSuperAdmin();
  await api(`/businesses/${id}/status`, { method: "PATCH", token, body: { status, reason } });
  revalidatePath("/admin", "layout");
}

export async function setUserStatusAction(form: FormData) {
  const id = field(form, "id");
  const status = field(form, "status");
  if (!UUID.test(id) || !USER_STATUSES.includes(status)) return;
  await patchStatus(`/users/${id}/status`, status);
}

export async function setMessageStatusAction(form: FormData) {
  const id = field(form, "id");
  const status = field(form, "status");
  if (!UUID.test(id) || !MESSAGE_STATUSES.includes(status)) return;
  await patchStatus(`/contact-messages/${id}`, status);
}

export async function createBusinessAction(_previous: FormState, form: FormData): Promise<FormState> {
  const { token } = await requireSuperAdmin();
  const name = field(form, "name").trim();
  const slug = field(form, "slug").trim();
  const ownerId = field(form, "ownerId");
  const planId = field(form, "planId");
  const industry = field(form, "industry");
  const email = field(form, "email");
  const phone = field(form, "phone");
  const description = field(form, "description");
  const address = field(form, "address");
  const status = field(form, "status");
  const fields = Object.fromEntries(Array.from(form.entries()).filter(([, value]) => typeof value === "string").map(([key, value]) => [key, String(value)]));
  if (name.length < 2) return { status: "error", message: "Business name must be at least 2 characters.", fields };
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return { status: "error", message: "Use a lowercase store slug with hyphens only.", fields };
  if (!UUID.test(ownerId)) return { status: "error", message: "Select a valid owner account.", fields };
  if (!industry) return { status: "error", message: "Business category is required.", fields };
  if (!email) return { status: "error", message: "Business email is required.", fields };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { status: "error", message: "Enter a valid business email address.", fields };
  if (!phone) return { status: "error", message: "Business phone is required.", fields };
  if (!/^[+()0-9\s.-]{7,40}$/.test(phone)) return { status: "error", message: "Enter a valid business phone number.", fields };
  if (description.length < 10) return { status: "error", message: "Description must be at least 10 characters.", fields };
  if (!address) return { status: "error", message: "Address is required.", fields };
  if (!UUID.test(planId)) return { status: "error", message: "Select a subscription plan.", fields };
  if (!["ACTIVE", "PENDING_APPROVAL"].includes(status)) return { status: "error", message: "Select an initial status.", fields };

  const result = await api<{ id: string }>(`/businesses`, {
    method: "POST",
    token,
    body: {
      name,
      slug,
      description: field(form, "description") || null,
      industry: field(form, "industry") || null,
      email: field(form, "email") || null,
      phone: field(form, "phone") || null,
      address: field(form, "address") || null,
      ownerId,
      planId: planId || undefined,
      trial: field(form, "trial") === "1",
      status: field(form, "status"),
    },
  });
  revalidatePath("/admin/businesses", "layout");
  if (result.ok) redirect(`/admin/businesses/${result.data.id}`);
  return { status: "error", message: result.message, fields };
}

export async function notificationAudienceCountAction(audience: Record<string, unknown>) {
  const { token } = await requireSuperAdmin();
  return api<{ eligible: number; unique: number }>("/notifications/audience-count", {
    method: "POST",
    token,
    body: { audience },
  });
}

export async function createNotificationAction(form: FormData) {
  const { token } = await requireSuperAdmin();
  const audience: Record<string, unknown> = {};
  const audienceType = field(form, "audienceType");
  const role = field(form, "role");
  const status = field(form, "accountStatus");
  const subscriptionStatus = field(form, "subscriptionStatus");
  if (audienceType === "role" && role) audience.role = role;
  if (audienceType === "status" && status) audience.status = status;
  if (audienceType === "subscription" && subscriptionStatus) audience.subscriptionStatus = subscriptionStatus;
  const channels = form.getAll("channels").filter((value): value is FormDataEntryValue => typeof value === "string") as string[];

  const result = await api("/notifications", {
    method: "POST",
    token,
    body: {
      title: field(form, "title"),
      description: field(form, "description"),
      internalName: field(form, "internalName"),
      category: field(form, "category"),
      priority: field(form, "priority"),
      language: field(form, "language"),
      message: field(form, "message"),
      actionText: field(form, "actionText"),
      actionUrl: field(form, "actionUrl"),
      audience,
      channels: channels.length ? channels : ["IN_APP"],
      delivery: field(form, "delivery"),
      scheduledAt: field(form, "scheduledAt") || undefined,
    },
  });
  revalidatePath("/admin/notifications", "layout");
  return result;
}

export async function notificationAction(form: FormData) {
  const { token } = await requireSuperAdmin();
  const id = field(form, "id");
  const action = field(form, "action");
  if (!UUID.test(id) || !["send", "cancel", "delete"].includes(action)) return;
  await (action === "delete"
    ? await api(`/notifications/${id}`, { method: "DELETE", token })
    : api(`/notifications/${id}/${action}`, { method: "POST", token }));
  revalidatePath("/admin/notifications", "layout");
}
