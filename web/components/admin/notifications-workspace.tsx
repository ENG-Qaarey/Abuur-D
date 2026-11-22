"use client";

import { useMemo, useState } from "react";
import { Bell, CalendarDays, CheckCircle2, Clock3, Megaphone, Send, Trash2, X } from "lucide-react";
import { CARD, EmptyRow, StatusPill, Table } from "@/components/admin/ui";
import { createNotificationAction, notificationAction } from "@/lib/actions/admin";

type Campaign = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  priority: string;
  channels: string[];
  status: string;
  scheduledAt: string | null;
  sentAt: string | null;
  recipientCount: number;
  createdAt: string;
  creator?: { firstName: string | null; lastName: string | null; email: string | null };
};

export function NotificationsWorkspace({
  overview,
  campaigns,
  templates,
}: {
  overview: { total: number; sent: number; scheduled: number; drafts: number; failed: number; reached: number };
  campaigns: Campaign[];
  templates: { id: string; name: string; title: string; message: string; category: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("GENERAL_ANNOUNCEMENT");
  const [delivery, setDelivery] = useState("immediate");
  const [search, setSearch] = useState("");
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [internalName, setInternalName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [language, setLanguage] = useState("en");
  const [actionText, setActionText] = useState("");
  const [actionUrl, setActionUrl] = useState("");
  const [audienceType, setAudienceType] = useState("");
  const [role, setRole] = useState("");
  const [accountStatus, setAccountStatus] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState("");
  const [channels, setChannels] = useState<string[]>(["IN_APP"]);
  const [scheduledAt, setScheduledAt] = useState("");

  const unsafeTemplateVariables = useMemo(() => {
    const text = `${title}\n${description}\n${message}`;
    return [...text.matchAll(/{{([^{}]+)}}/g)]
      .map((match) => match[1].trim())
      .filter((name) => !["user_name", "business_name", "subscription_plan", "renewal_date"].includes(name));
  }, [title, description, message]);

  function validateForm(form: FormData): Record<string, string> {
    const errors: Record<string, string> = {};
    const cleanTitle = String(form.get("title") ?? "").trim();
    const cleanMessage = String(form.get("message") ?? "").trim();
    const cleanDescription = String(form.get("description") ?? "").trim();
    const cleanActionText = String(form.get("actionText") ?? "").trim();
    const cleanActionUrl = String(form.get("actionUrl") ?? "").trim();
    const cleanScheduledAt = String(form.get("scheduledAt") ?? "").trim();

    if (cleanTitle.length < 3) errors.title = "Title must be at least 3 characters.";
    else if (cleanTitle.length > 160) errors.title = "Title must be at most 160 characters.";
    if (cleanMessage.length < 10) errors.message = "Message must be at least 10 characters.";
    else if (cleanMessage.length > 5000) errors.message = "Message must be at most 5,000 characters.";
    if (cleanDescription.length > 500) errors.description = "Description must be at most 500 characters.";
    if (internalName.length > 100) errors.internalName = "Internal campaign name must be at most 100 characters.";
    if (unsafeTemplateVariables.length) errors.message = `Unsupported variable: ${[...new Set(unsafeTemplateVariables)].join(", ")}.`;
    if (!channels.length) errors.channels = "Select at least one delivery channel.";

    if ((cleanActionText && !cleanActionUrl) || (!cleanActionText && cleanActionUrl)) {
      errors.actionUrl = "Action text and destination URL must be provided together.";
    }
    if (cleanActionUrl) {
      const internal = cleanActionUrl.startsWith("/") && !cleanActionUrl.startsWith("//");
      let external = false;
      try {
        const url = new URL(cleanActionUrl);
        external = url.protocol === "https:";
      } catch {
        external = false;
      }
      if (!internal && !external) errors.actionUrl = "Use a safe internal route or an HTTPS URL.";
    }
    if (audienceType === "role" && !role) errors.audience = "Choose a role for this audience.";
    if (audienceType === "status" && !accountStatus) errors.audience = "Choose an account status.";
    if (audienceType === "subscription" && !subscriptionStatus) errors.audience = "Choose a subscription status.";
    if (delivery === "scheduled") {
      const date = new Date(cleanScheduledAt);
      if (!cleanScheduledAt || Number.isNaN(date.getTime())) errors.scheduledAt = "Choose a valid scheduled date and time.";
      else if (date.getTime() <= Date.now()) errors.scheduledAt = "Scheduled time must be in the future.";
    }
    return errors;
  }

  const visible = useMemo(() => campaigns.filter((item) =>
    (!filter || item.status === filter) &&
    (!search || `${item.title} ${item.description ?? ""} ${item.category}`.toLowerCase().includes(search.toLowerCase()))
  ), [campaigns, filter, search]);
  const cards = [
    ["All", overview.total, "", Bell],
    ["Sent", overview.sent, "SENT", CheckCircle2],
    ["Scheduled", overview.scheduled, "SCHEDULED", CalendarDays],
    ["Drafts", overview.drafts, "DRAFT", Megaphone],
    ["Failed", overview.failed, "FAILED", X],
  ] as const;

  async function submit(form: FormData) {
    const errors = validateForm(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      setFormError("Fix the highlighted fields before continuing.");
      return;
    }
    setBusy(true);
    setFormError("");
    const result = await createNotificationAction(form);
    setBusy(false);
    if (!result.ok) setFormError(result.message);
    else setOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[1.6rem] font-bold leading-tight">Platform Notifications</h1>
          <p className="mt-1 text-sm text-cl-muted">Create, schedule, and monitor platform-wide communications.</p>
        </div>
        <button type="button" onClick={() => setOpen(true)} className="h-10 rounded-lg bg-cl-blue px-4 text-sm font-semibold text-white">Create Notification</button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map(([label, value, status, Icon]) => (
          <button key={label} type="button" onClick={() => setFilter(status)} className={`${CARD} min-h-24 p-4 text-left transition hover:border-cl-blue/50 ${filter === status ? "border-cl-blue" : ""}`}>
            <div className="flex items-start justify-between"><span className="text-xs font-semibold uppercase text-cl-muted">{label}</span><Icon size={16} className="text-cl-blue" /></div>
            <p className="mt-3 text-2xl font-bold">{value}</p>
          </button>
        ))}
      </div>

      <div className={`${CARD} p-4 sm:p-5`}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="font-semibold">Notification history</h2><p className="text-xs text-cl-muted">{overview.reached} recipient records reached</p></div>
          <input placeholder="Search notifications" value={search} className="h-9 w-full max-w-64 rounded-lg border border-cl-border bg-cl-bg px-3 text-sm" onChange={(event) => setSearch(event.target.value)} />
        </div>
        <Table head={["Notification", "Category", "Channel", "Scheduled", "Status", "Actions"]} minWidth={980}>
          {visible.length === 0 ? <EmptyRow cols={6}>No notifications found.</EmptyRow> : visible.map((item) => (
            <tr key={item.id}>
              <td><p className="font-semibold">{item.title}</p><p className="max-w-xs truncate text-xs text-cl-muted">{item.description || "No description"}</p></td>
              <td><span className="text-sm">{item.category.replaceAll("_", " ").toLowerCase()}</span></td>
              <td className="text-xs text-cl-muted">{item.channels?.join(", ") || "IN_APP"}</td>
              <td className="text-xs text-cl-muted">{item.scheduledAt ? new Date(item.scheduledAt).toLocaleString() : "—"}</td>
              <td><StatusPill status={item.status} /></td>
              <td>
                <form action={notificationAction} className="flex justify-end gap-1.5">
                  <input type="hidden" name="id" value={item.id} />
                  {item.status === "DRAFT" && <><button name="action" value="send" className="h-8 rounded-md border border-cl-border px-2 text-xs font-semibold">Send</button><button name="action" value="delete" className="h-8 rounded-md border border-red-500/30 px-2 text-red-600" title="Delete"><Trash2 size={14} /></button></>}
                  {item.status === "SCHEDULED" && <button name="action" value="cancel" className="h-8 rounded-md border border-cl-border px-2 text-xs font-semibold">Cancel</button>}
                </form>
              </td>
            </tr>
          ))}
        </Table>
      </div>

      {open && (
        <div className="fixed inset-0 z-[80] flex items-center justify-end bg-black/35 p-3 sm:p-6" role="dialog" aria-modal="true">
          <div className="flex h-full w-full max-w-[760px] flex-col rounded-2xl border border-cl-border bg-cl-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-cl-border px-5 py-4">
              <div><h2 className="font-semibold">Create Notification</h2><p className="text-xs text-cl-muted">In-app delivery is available now; external channels require provider configuration.</p></div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-md p-2 hover:bg-cl-blue-light"><X size={18} /></button>
            </div>
            <form action={submit} noValidate className="flex-1 overflow-y-auto">
              <div className="grid gap-5 p-5 lg:grid-cols-[1fr_280px]">
                <div className="space-y-4">
                  {formError && <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600">{formError}</p>}
                  <label className="block text-xs font-semibold text-cl-muted">Title<span className="float-right font-normal">{title.length}/160</span><input name="title" value={title} onChange={(e) => { setTitle(e.target.value); if (fieldErrors.title) setFieldErrors((current) => ({ ...current, title: "" })); }} maxLength={160} aria-invalid={!!fieldErrors.title} className={`mt-1 h-10 w-full rounded-lg border bg-cl-bg px-3 text-sm text-cl-text ${fieldErrors.title ? "border-red-500 ring-1 ring-red-500/20" : "border-cl-border"}`} />{fieldErrors.title && <span className="mt-1 block font-normal text-red-600">{fieldErrors.title}</span>}</label>
                  <label className="block text-xs font-semibold text-cl-muted">Internal campaign name<span className="float-right font-normal">{internalName.length}/100</span><input name="internalName" value={internalName} onChange={(e) => setInternalName(e.target.value)} maxLength={100} aria-invalid={!!fieldErrors.internalName} className={`mt-1 h-10 w-full rounded-lg border bg-cl-bg px-3 text-sm text-cl-text ${fieldErrors.internalName ? "border-red-500" : "border-cl-border"}`} />{fieldErrors.internalName && <span className="mt-1 block font-normal text-red-600">{fieldErrors.internalName}</span>}</label>
                  <label className="block text-xs font-semibold text-cl-muted">Category<select name="category" value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-cl-border bg-cl-bg px-3 text-sm"><option value="GENERAL_ANNOUNCEMENT">General announcement</option><option value="PLATFORM_UPDATE">Platform update</option><option value="MAINTENANCE">Maintenance</option><option value="SUBSCRIPTION_BILLING">Subscription and billing</option><option value="SECURITY_ALERT">Security alert</option><option value="NEW_FEATURE">New feature</option></select></label>
                  <div className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-semibold text-cl-muted">Priority<select name="priority" value={priority} onChange={(e) => setPriority(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-cl-border bg-cl-bg px-3 text-sm"><option>NORMAL</option><option>LOW</option><option>HIGH</option><option>CRITICAL</option></select></label><label className="text-xs font-semibold text-cl-muted">Language<select name="language" value={language} onChange={(e) => setLanguage(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-cl-border bg-cl-bg px-3 text-sm"><option value="en">English</option><option value="so">Somali</option></select></label></div>
                  <label className="block text-xs font-semibold text-cl-muted">Description<span className="float-right font-normal">{description.length}/500</span><textarea name="description" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} rows={2} aria-invalid={!!fieldErrors.description} className={`mt-1 w-full rounded-lg border bg-cl-bg p-3 text-sm text-cl-text ${fieldErrors.description ? "border-red-500" : "border-cl-border"}`} />{fieldErrors.description && <span className="mt-1 block font-normal text-red-600">{fieldErrors.description}</span>}</label>
                  <label className="block text-xs font-semibold text-cl-muted">Message<span className="float-right font-normal">{message.length}/5000</span><textarea name="message" value={message} onChange={(e) => { setMessage(e.target.value); if (fieldErrors.message) setFieldErrors((current) => ({ ...current, message: "" })); }} maxLength={5000} rows={6} aria-invalid={!!fieldErrors.message} className={`mt-1 w-full rounded-lg border bg-cl-bg p-3 text-sm text-cl-text ${fieldErrors.message ? "border-red-500 ring-1 ring-red-500/20" : "border-cl-border"}`} />{fieldErrors.message && <span className="mt-1 block font-normal text-red-600">{fieldErrors.message}</span>}{unsafeTemplateVariables.length === 0 && message.includes("{{") && <span className="mt-1 block font-normal text-cl-muted">Supported variables: user_name, business_name, subscription_plan, renewal_date</span>}</label>
                  <div className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-semibold text-cl-muted">Action button text<span className="float-right font-normal">{actionText.length}/40</span><input name="actionText" value={actionText} onChange={(e) => setActionText(e.target.value)} maxLength={40} className="mt-1 h-10 w-full rounded-lg border border-cl-border bg-cl-bg px-3 text-sm" /></label><label className="text-xs font-semibold text-cl-muted">Destination URL<input name="actionUrl" value={actionUrl} onChange={(e) => { setActionUrl(e.target.value); if (fieldErrors.actionUrl) setFieldErrors((current) => ({ ...current, actionUrl: "" })); }} placeholder="/dashboard or https://..." aria-invalid={!!fieldErrors.actionUrl} className={`mt-1 h-10 w-full rounded-lg border bg-cl-bg px-3 text-sm ${fieldErrors.actionUrl ? "border-red-500 ring-1 ring-red-500/20" : "border-cl-border"}`} />{fieldErrors.actionUrl && <span className="mt-1 block font-normal text-red-600">{fieldErrors.actionUrl}</span>}</label></div>

                  <div className="rounded-lg border border-cl-border p-4">
                    <p className="text-xs font-semibold uppercase text-cl-muted">Audience</p>
                    <select name="audienceType" value={audienceType} onChange={(e) => setAudienceType(e.target.value)} className="mt-2 h-10 w-full rounded-lg border border-cl-border bg-cl-bg px-3 text-sm"><option value="">Everyone</option><option value="role">Specific role</option><option value="status">Account status</option><option value="subscription">Subscription status</option></select>
                    {audienceType && <div className="mt-3 grid gap-2 sm:grid-cols-3"><select name="role" value={role} onChange={(e) => setRole(e.target.value)} className="h-9 rounded-lg border border-cl-border bg-cl-bg px-2 text-xs"><option value="">Role</option><option value="OWNER">Business owners</option><option value="STAFF">Staff</option><option value="DESIGNER">Creative</option><option value="MARKETING_MANAGER">Marketing</option><option value="STORE_MANAGER">Store</option><option value="FINANCE_MANAGER">Finance</option></select><select name="accountStatus" value={accountStatus} onChange={(e) => setAccountStatus(e.target.value)} className="h-9 rounded-lg border border-cl-border bg-cl-bg px-2 text-xs"><option value="">Account status</option><option>ACTIVE</option><option>PENDING_VERIFICATION</option><option>INACTIVE</option><option>SUSPENDED</option></select><select name="subscriptionStatus" value={subscriptionStatus} onChange={(e) => setSubscriptionStatus(e.target.value)} className="h-9 rounded-lg border border-cl-border bg-cl-bg px-2 text-xs"><option value="">Subscription status</option><option>ACTIVE</option><option>TRIALING</option><option>PAST_DUE</option><option>EXPIRED</option></select></div>}
                    {fieldErrors.audience && <p className="mt-2 text-xs text-red-600">{fieldErrors.audience}</p>}
                  </div>

                  <div className="rounded-lg border border-cl-border p-4">
                    <p className="text-xs font-semibold uppercase text-cl-muted">Delivery channels</p>
                    <label className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" name="channels" value="IN_APP" checked={channels.includes("IN_APP")} onChange={(e) => setChannels((current) => e.target.checked ? [...new Set([...current, "IN_APP"])] : current.filter((item) => item !== "IN_APP"))} /> In-app</label>
                    <label className="mt-2 flex items-center gap-2 text-sm text-cl-muted"><input type="checkbox" name="channels" value="EMAIL" checked={channels.includes("EMAIL")} onChange={(e) => setChannels((current) => e.target.checked ? [...new Set([...current, "EMAIL"])] : current.filter((item) => item !== "EMAIL"))} /> Email (provider status required)</label>
                    <label className="mt-2 flex items-center gap-2 text-sm text-cl-muted"><input type="checkbox" name="channels" value="SMS" checked={channels.includes("SMS")} onChange={(e) => setChannels((current) => e.target.checked ? [...new Set([...current, "SMS"])] : current.filter((item) => item !== "SMS"))} /> SMS (provider status required)</label>
                    <label className="mt-2 flex items-center gap-2 text-sm text-cl-muted"><input type="checkbox" name="channels" value="WHATSAPP" checked={channels.includes("WHATSAPP")} onChange={(e) => setChannels((current) => e.target.checked ? [...new Set([...current, "WHATSAPP"])] : current.filter((item) => item !== "WHATSAPP"))} /> WhatsApp (approved template required)</label>
                    {fieldErrors.channels && <p className="mt-2 text-xs text-red-600">{fieldErrors.channels}</p>}
                  </div>
                </div>

                <aside className="space-y-4">
                  <div className={`${CARD} min-w-0 p-4`}>
                    <p className="text-xs font-semibold uppercase text-cl-muted">Live preview</p>
                    <div className="mt-3 flex min-w-0 items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cl-blue-light text-cl-blue">
                        <Bell size={16} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="break-words text-sm font-semibold [overflow-wrap:anywhere]">{title || "Notification title"}</p>
                        <p className="mt-1 max-h-32 overflow-y-auto whitespace-pre-wrap break-words text-xs text-cl-muted [overflow-wrap:anywhere]">
                          {message || "Message preview"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <label className="block text-xs font-semibold text-cl-muted">Delivery<select name="delivery" value={delivery} onChange={(e) => setDelivery(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-cl-border bg-cl-bg px-3 text-sm"><option value="immediate">Send immediately</option><option value="scheduled">Schedule later</option><option value="draft">Save as draft</option></select></label>
                </aside>
              </div>
              <div className="sticky bottom-0 flex justify-end gap-2 border-t border-cl-border bg-cl-card px-5 py-4"><button type="button" onClick={() => setOpen(false)} className="h-10 rounded-lg border border-cl-border px-4 text-sm font-semibold">Cancel</button><button type="submit" disabled={busy} className="inline-flex h-10 items-center gap-2 rounded-lg bg-cl-blue px-4 text-sm font-semibold text-white disabled:opacity-50"><Send size={15} />{busy ? "Processing…" : delivery === "draft" ? "Save Draft" : delivery === "scheduled" ? "Schedule" : "Send Notification"}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
