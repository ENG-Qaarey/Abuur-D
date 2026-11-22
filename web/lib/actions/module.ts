"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { getToken } from "@/lib/session";
import { moduleBySlug } from "@/lib/module-config";

/** Convert a form value to the type the API expects. */
function coerce(fieldType: string, value: unknown): unknown {
  if (value === "" || value === null || value === undefined) return undefined;
  if (fieldType === "number") {
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
  }
  if (fieldType === "select" && value === "true") return true;
  if (fieldType === "select" && value === "false") return false;
  return String(value);
}

function payloadFrom(fields: { name: string; type: string }[], values: Record<string, unknown>) {
  const data: Record<string, unknown> = {};
  for (const f of fields) {
    const v = coerce(f.type, values[f.name]);
    if (v !== undefined) data[f.name] = v;
  }
  return data;
}

/** Create a record inside a module entity. */
export async function createEntityAction(moduleSlug: string, entitySlug: string, values: Record<string, unknown>) {
  const token = await getToken();
  if (!token) redirect("/login");

  const module = moduleBySlug(moduleSlug);
  const entity = module?.entities.find((e) => e.slug === entitySlug);
  if (!module || !entity) return { status: "error" as const, message: "Unknown module or entity." };

  const result = await api(`/${entity.endpoint}`, {
    method: "POST",
    token,
    body: payloadFrom(entity.fields, values),
  });
  if (!result.ok) {
    if (result.status === 401) redirect("/login");
    return { status: "error" as const, message: result.message };
  }
  revalidatePath("/admin/modules");
  return { status: "success" as const, message: `${entity.label} record created.` };
}

/** Update a record. */
export async function updateEntityAction(moduleSlug: string, entitySlug: string, id: string, values: Record<string, unknown>) {
  const token = await getToken();
  if (!token) redirect("/login");

  const module = moduleBySlug(moduleSlug);
  const entity = module?.entities.find((e) => e.slug === entitySlug);
  if (!module || !entity) return { status: "error" as const, message: "Unknown module or entity." };

  const result = await api(`/${entity.endpoint}/${id}`, {
    method: "PUT",
    token,
    body: payloadFrom(entity.fields, values),
  });
  if (!result.ok) {
    if (result.status === 401) redirect("/login");
    return { status: "error" as const, message: result.message };
  }
  revalidatePath("/admin/modules");
  return { status: "success" as const, message: `${entity.label} record updated.` };
}

/** Delete a record. */
export async function deleteEntityAction(moduleSlug: string, entitySlug: string, id: string) {
  const token = await getToken();
  if (!token) redirect("/login");

  const module = moduleBySlug(moduleSlug);
  const entity = module?.entities.find((e) => e.slug === entitySlug);
  if (!module || !entity) return { status: "error" as const, message: "Unknown module or entity." };

  const result = await api(`/${entity.endpoint}/${id}`, { method: "DELETE", token });
  if (!result.ok) {
    if (result.status === 401) redirect("/login");
    return { status: "error" as const, message: result.message };
  }
  revalidatePath("/admin/modules");
  return { status: "success" as const, message: `${entity.label} record deleted.` };
}
