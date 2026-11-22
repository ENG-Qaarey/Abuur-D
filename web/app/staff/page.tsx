import { ArrowRight, Boxes, Building2, ClipboardList, CreditCard, Palette, Store, Users } from "lucide-react";

export default function StaffDashboard() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-[1.7rem]">Staff Dashboard</h1>
          <p className="mt-1 text-sm text-cl-muted">Limited access — view tasks assigned by your Business Owner.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <div className="cl-card cl-panel flex flex-col p-4">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-cl-muted">Assigned tasks</p>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600"><ClipboardList size={16} /></span>
          <p className="mt-2 text-2xl font-bold">—</p>
          <p className="mt-0.5 text-xs text-cl-muted">task module coming soon</p>
        </div>
        <div className="cl-card cl-panel flex flex-col p-4">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-cl-muted">Customers</p>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600"><Users size={16} /></span>
          <p className="mt-2 text-2xl font-bold">—</p>
          <p className="mt-0.5 text-xs text-cl-muted">CRM module coming soon</p>
        </div>
        <div className="cl-card cl-panel flex flex-col p-4">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-cl-muted">Leads</p>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600"><ArrowRight size={16} /></span>
          <p className="mt-2 text-2xl font-bold">—</p>
          <p className="mt-0.5 text-xs text-cl-muted">leads module coming soon</p>
        </div>
        <div className="cl-card cl-panel flex flex-col p-4">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-cl-muted">Creative projects</p>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600"><Palette size={16} /></span>
          <p className="mt-2 text-2xl font-bold">—</p>
          <p className="mt-0.5 text-xs text-cl-muted">creative module coming soon</p>
        </div>
        <div className="cl-card cl-panel flex flex-col p-4">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-cl-muted">Orders</p>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600"><Building2 size={16} /></span>
          <p className="mt-2 text-2xl font-bold">—</p>
          <p className="mt-0.5 text-xs text-cl-muted">orders module coming soon</p>
        </div>
        <div className="cl-card cl-panel flex flex-col p-4">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-cl-muted">Products</p>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600"><Boxes size={16} /></span>
          <p className="mt-2 text-2xl font-bold">—</p>
          <p className="mt-0.5 text-xs text-cl-muted">products module coming soon</p>
        </div>
      </div>

      <div className="cl-card cl-panel p-6">
        <h2 className="text-lg font-semibold text-cl-text mb-4">Available modules</h2>
        <p className="text-sm text-cl-muted">Your Business Owner controls which modules you can access. Contact them to request access.</p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Assigned Tasks", desc: "View and update tasks assigned to you", soon: true },
            { label: "Customers", desc: "View customer records", soon: true },
            { label: "Leads", desc: "View lead pipeline", soon: true },
            { label: "Creative Projects", desc: "View creative work", soon: true },
            { label: "Orders", desc: "View store orders", soon: true },
            { label: "Products", desc: "View product catalog", soon: true },
          ].map((m) => (
            <div key={m.label} className="rounded-lg border border-cl-border p-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cl-blue-light text-cl-blue"><ArrowRight size={16} /></span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-cl-text">{m.label}</p>
                <p className="text-xs text-cl-muted">{m.desc}</p>
              </div>
              <span className="rounded bg-cl-blue-light px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase text-cl-blue">Soon</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
