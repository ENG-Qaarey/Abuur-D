"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { createBusinessAction } from "@/lib/actions/admin";
import type { AdminUser, Plan } from "@/lib/types";
import { adminRoutes as r } from "@/lib/routes";

export function AddBusinessForm({ users, plans, compact = false }: { users: AdminUser[]; plans: Plan[]; compact?: boolean }) {
  const [state, action, pending] = useActionState(createBusinessAction, { status: "idle" as const });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(form: FormData) {
    const next: Record<string, string> = {};
    const name = String(form.get("name") ?? "").trim();
    const slug = String(form.get("slug") ?? "").trim();
    const ownerId = String(form.get("ownerId") ?? "");
    const email = String(form.get("email") ?? "").trim();
    const industry = String(form.get("industry") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();
    const address = String(form.get("address") ?? "").trim();
    const planId = String(form.get("planId") ?? "");
    const status = String(form.get("status") ?? "");
    if (name.length < 2) next.name = "Business name must be at least 2 characters.";
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) next.slug = "Use a lowercase slug with hyphens only.";
    if (!ownerId) next.ownerId = "Select a valid owner account.";
    if (!industry) next.industry = "Business category is required.";
    if (!email) next.email = "Business email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid business email.";
    if (!phone) next.phone = "Business phone is required.";
    else if (!/^[+()0-9\s.-]{7,40}$/.test(phone)) next.phone = "Enter a valid business phone number.";
    if (description.length < 10) next.description = "Description must be at least 10 characters.";
    if (!address) next.address = "Address is required.";
    if (!planId) next.planId = "Select a subscription plan.";
    if (!["ACTIVE", "PENDING_APPROVAL"].includes(status)) next.status = "Select an initial status.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  return (
    <form
      action={action}
      noValidate
      onSubmit={(event) => {
        if (!validate(new FormData(event.currentTarget))) event.preventDefault();
      }}
      className={compact ? "grid gap-5" : "grid gap-5 lg:grid-cols-2"}
    >
      {state.status === "error" && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-600 lg:col-span-2">
          {state.message}
        </p>
      )}

      <label className="text-xs font-semibold text-cl-muted">Business name *
        <input name="name" defaultValue={state.fields?.name} maxLength={120} aria-invalid={!!errors.name} className={`mt-1 h-10 w-full rounded-lg border bg-cl-bg px-3 text-sm text-cl-text ${errors.name ? "border-red-500 ring-1 ring-red-500/20" : "border-cl-border"}`} />
        {errors.name && <span className="mt-1 block font-normal text-red-600">{errors.name}</span>}
      </label>
      <label className="text-xs font-semibold text-cl-muted">Store slug *
        <input name="slug" defaultValue={state.fields?.slug} placeholder="example-business" maxLength={60} aria-invalid={!!errors.slug} className={`mt-1 h-10 w-full rounded-lg border bg-cl-bg px-3 text-sm text-cl-text ${errors.slug ? "border-red-500 ring-1 ring-red-500/20" : "border-cl-border"}`} />
        {errors.slug && <span className="mt-1 block font-normal text-red-600">{errors.slug}</span>}
      </label>
      <label className="text-xs font-semibold text-cl-muted">Owner account *
        <select name="ownerId" defaultValue={state.fields?.ownerId} aria-invalid={!!errors.ownerId} className={`mt-1 h-10 w-full rounded-lg border bg-cl-bg px-3 text-sm text-cl-text ${errors.ownerId ? "border-red-500 ring-1 ring-red-500/20" : "border-cl-border"}`}>
          <option value="">Select an owner</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>{[user.firstName, user.lastName].filter(Boolean).join(" ") || user.email || user.id}</option>
          ))}
        </select>
        {errors.ownerId && <span className="mt-1 block font-normal text-red-600">{errors.ownerId}</span>}
      </label>
      <label className="text-xs font-semibold text-cl-muted">Category *
        <input name="industry" defaultValue={state.fields?.industry} list="business-categories" aria-invalid={!!errors.industry} className={`mt-1 h-10 w-full rounded-lg border bg-cl-bg px-3 text-sm text-cl-text ${errors.industry ? "border-red-500 ring-1 ring-red-500/20" : "border-cl-border"}`} />
        {errors.industry && <span className="mt-1 block font-normal text-red-600">{errors.industry}</span>}
        <datalist id="business-categories">
          <option value="Retail" /><option value="Technology" /><option value="Education" /><option value="Healthcare" />
          <option value="Restaurants & Food" /><option value="Real Estate" /><option value="Professional Services" /><option value="Other" />
        </datalist>
      </label>
      <label className="text-xs font-semibold text-cl-muted">Business email *
        <input name="email" type="text" defaultValue={state.fields?.email} maxLength={254} aria-invalid={!!errors.email} className={`mt-1 h-10 w-full rounded-lg border bg-cl-bg px-3 text-sm text-cl-text ${errors.email ? "border-red-500 ring-1 ring-red-500/20" : "border-cl-border"}`} />
        {errors.email && <span className="mt-1 block font-normal text-red-600">{errors.email}</span>}
      </label>
      <label className="text-xs font-semibold text-cl-muted">Business phone *
        <input name="phone" defaultValue={state.fields?.phone} maxLength={40} aria-invalid={!!errors.phone} className={`mt-1 h-10 w-full rounded-lg border bg-cl-bg px-3 text-sm text-cl-text ${errors.phone ? "border-red-500 ring-1 ring-red-500/20" : "border-cl-border"}`} />
        {errors.phone && <span className="mt-1 block font-normal text-red-600">{errors.phone}</span>}
      </label>
      <label className="text-xs font-semibold text-cl-muted lg:col-span-2">Description *
        <textarea name="description" defaultValue={state.fields?.description} maxLength={2000} rows={4} aria-invalid={!!errors.description} className={`mt-1 w-full rounded-lg border bg-cl-bg p-3 text-sm text-cl-text ${errors.description ? "border-red-500 ring-1 ring-red-500/20" : "border-cl-border"}`} />
        {errors.description && <span className="mt-1 block font-normal text-red-600">{errors.description}</span>}
      </label>
      <label className="text-xs font-semibold text-cl-muted lg:col-span-2">Address *
        <input name="address" defaultValue={state.fields?.address} maxLength={300} aria-invalid={!!errors.address} className={`mt-1 h-10 w-full rounded-lg border bg-cl-bg px-3 text-sm text-cl-text ${errors.address ? "border-red-500 ring-1 ring-red-500/20" : "border-cl-border"}`} />
        {errors.address && <span className="mt-1 block font-normal text-red-600">{errors.address}</span>}
      </label>
      <label className="text-xs font-semibold text-cl-muted">Subscription plan *
        <select name="planId" defaultValue={state.fields?.planId} aria-invalid={!!errors.planId} className={`mt-1 h-10 w-full rounded-lg border bg-cl-bg px-3 text-sm text-cl-text ${errors.planId ? "border-red-500 ring-1 ring-red-500/20" : "border-cl-border"}`}>
          <option value="">Select a subscription plan</option>
          {plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name} — {plan.currency} {String(plan.price)}</option>)}
        </select>
        {errors.planId && <span className="mt-1 block font-normal text-red-600">{errors.planId}</span>}
      </label>
      <label className="text-xs font-semibold text-cl-muted">Initial status *
        <select name="status" defaultValue={state.fields?.status ?? "PENDING_APPROVAL"} aria-invalid={!!errors.status} className={`mt-1 h-10 w-full rounded-lg border bg-cl-bg px-3 text-sm text-cl-text ${errors.status ? "border-red-500 ring-1 ring-red-500/20" : "border-cl-border"}`}>
          <option value="PENDING_APPROVAL">Pending approval</option>
          <option value="ACTIVE">Active</option>
        </select>
        {errors.status && <span className="mt-1 block font-normal text-red-600">{errors.status}</span>}
      </label>
      <label className="flex items-center gap-2 text-sm text-cl-muted">
        <input type="checkbox" name="trial" value="1" defaultChecked={state.fields?.trial === "1"} /> Start selected subscription in trial
      </label>
      <div className={compact ? "sticky bottom-[-20px] -mx-5 -mb-5 flex items-end justify-end gap-2 border-t border-cl-border bg-cl-card px-5 py-4" : "flex items-end justify-end gap-2 lg:col-span-2"}>
        <Link href={r.businesses} className="h-10 rounded-lg border border-cl-border px-4 py-2 text-sm font-semibold">Cancel</Link>
        <button type="submit" disabled={pending} className="inline-flex h-10 items-center gap-2 rounded-lg bg-cl-blue px-4 text-sm font-semibold text-white disabled:opacity-50"><Building2 size={16} />{pending ? "Creating…" : "Create Business"}</button>
      </div>
    </form>
  );
}
