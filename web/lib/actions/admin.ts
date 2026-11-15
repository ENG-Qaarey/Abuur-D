"use server";

import { revalidatePath } from "next/cache";
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
  if (!UUID.test(id) || !BUSINESS_STATUSES.includes(status)) return;
  await patchStatus(`/businesses/${id}/status`, status);
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
