import { ArrowRight, Users, Clock, Inbox, Palette, BarChart3 } from "lucide-react";
import { api } from "@/lib/api";
import { getToken } from "@/lib/session";

export default async function MarketingDashboard() {
  const token = (await getToken()) as string;
  const businesses = await api<any[]>("/businesses", { token });
  const business = businesses.ok ? businesses.data.find((item) => item.status === "ACTIVE") ?? businesses.data[0] : null;
  const businessId = business?.id;
  const [campaigns, contacts, segments, templates, messageLogs] = businessId ? await Promise.all([
    api<any[]>("/campaigns", { token, businessId }),
    api<any[]>("/marketing-contacts", { token, businessId }),
    api<any[]>("/contact-segments", { token, businessId }),
    api<any[]>("/message-templates", { token, businessId }),
    api<any[]>("/message-logs", { token, businessId }),
  ]) : [null, null, null, null, null];
  const campaignRows = campaigns?.ok ? campaigns.data : [];
  const contactRows = contacts?.ok ? contacts.data : [];
  const segmentRows = segments?.ok ? segments.data : [];
  const templateRows = templates?.ok ? templates.data : [];
  const logRows = messageLogs?.ok ? messageLogs.data : [];
  const whatsapp = campaignRows.filter((item) => item.channel === "WHATSAPP");
  const sms = campaignRows.filter((item) => item.channel === "SMS");
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-[1.7rem]">Marketing Dashboard</h1>
          <p className="mt-1 text-sm text-cl-muted">Manage WhatsApp, SMS campaigns and contact segments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <div className="cl-card cl-panel flex flex-col p-4">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-cl-muted">Campaigns</p>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600"><Palette size={16} /></span>
          <p className="mt-2 text-2xl font-bold">{campaignRows.length}</p>
          <p className="mt-0.5 text-xs text-cl-muted">{campaignRows.filter((item) => item.status === "RUNNING").length} running</p>
        </div>
        <div className="cl-card cl-panel flex flex-col p-4">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-cl-muted">WhatsApp Marketing</p>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600"><ArrowRight size={16} /></span>
          <p className="mt-2 text-2xl font-bold">{whatsapp.length}</p>
          <p className="mt-0.5 text-xs text-cl-muted">{whatsapp.filter((item) => item.status === "COMPLETED").length} completed</p>
        </div>
        <div className="cl-card cl-panel flex flex-col p-4">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-cl-muted">SMS Marketing</p>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600"><Clock size={16} /></span>
          <p className="mt-2 text-2xl font-bold">{sms.length}</p>
          <p className="mt-0.5 text-xs text-cl-muted">{sms.filter((item) => item.status === "COMPLETED").length} completed</p>
        </div>
        <div className="cl-card cl-panel flex flex-col p-4">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-cl-muted">Contacts & Segments</p>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600"><Users size={16} /></span>
          <p className="mt-2 text-2xl font-bold">{contactRows.length}</p>
          <p className="mt-0.5 text-xs text-cl-muted">{segmentRows.length} segments</p>
        </div>
        <div className="cl-card cl-panel flex flex-col p-4">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-cl-muted">Message Templates</p>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600"><Inbox size={16} /></span>
          <p className="mt-2 text-2xl font-bold">{templateRows.length}</p>
          <p className="mt-0.5 text-xs text-cl-muted">approved & draft templates</p>
        </div>
        <div className="cl-card cl-panel flex flex-col p-4">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-cl-muted">Campaign Analytics</p>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600"><BarChart3 size={16} /></span>
          <p className="mt-2 text-2xl font-bold">{logRows.length}</p>
          <p className="mt-0.5 text-xs text-cl-muted">{logRows.filter((item) => item.status === "FAILED").length} failed messages</p>
        </div>
      </div>

      <div className="cl-card cl-panel p-6">
        <h2 className="text-lg font-semibold text-cl-text mb-4">Recent campaigns</h2>
        {campaignRows.length === 0 ? (
          <p className="rounded-lg border border-dashed border-cl-border py-8 text-center text-sm text-cl-muted">No campaigns found for {business?.name ?? "this account"}.</p>
        ) : (
          <div className="-mx-6 overflow-x-auto"><table className="w-full min-w-[720px] text-sm"><thead><tr className="border-b border-cl-border text-left text-xs text-cl-muted"><th className="px-6 py-3">Campaign</th><th>Channel</th><th>Status</th><th>Recipients</th><th>Scheduled</th></tr></thead><tbody>{campaignRows.slice(0,10).map((campaign) => <tr key={campaign.id} className="border-b border-cl-border last:border-0"><td className="px-6 py-3 font-semibold">{campaign.name}</td><td>{campaign.channel}</td><td>{campaign.status}</td><td>{campaign.totalRecipients ?? 0}</td><td className="text-cl-muted">{campaign.scheduledAt ? new Date(campaign.scheduledAt).toLocaleString() : "—"}</td></tr>)}</tbody></table></div>
        )}
      </div>
    </div>
  );
}
