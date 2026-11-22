import Link from "next/link";
import { ArrowRight, Boxes, Building2, ClipboardList, CreditCard, Store, Users } from "lucide-react";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";
import { getCurrentUser, getToken } from "@/lib/session";

const STATUS: Record<string, { label: string; pill: string; color: string }> = {
  ACTIVE: { label: "Active", pill: "bg-emerald-500/15 text-emerald-600", color: "#10b981" },
  PENDING_APPROVAL: { label: "Pending", pill: "bg-amber-500/15 text-amber-600", color: "#f59e0b" },
  SUSPENDED: { label: "Suspended", pill: "bg-red-500/15 text-red-600", color: "#ef4444" },
  INACTIVE: { label: "Inactive", pill: "bg-slate-500/15 text-slate-600", color: "#94a3b8" },
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const token = (await getToken()) as string;

  const mineResult = await api<any[]>("/businesses", { token });
  const mine = mineResult.ok ? mineResult.data : [];

  const active = mine.filter((b) => b.status === "ACTIVE").length;
  const pending = mine.filter((b) => b.status === "PENDING_APPROVAL").length;
  const totalBiz = mine.length;

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-[1.7rem]">Dashboard</h1>
          <p className="mt-1 text-sm text-cl-muted">Here is what is happening with your business today.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="#new-business" className="inline-flex h-10 items-center gap-2 rounded-lg bg-cl-blue px-4 text-sm font-semibold text-white transition hover:bg-cl-blue-hover">
            <ArrowRight size={16} /> New business
          </Link>
          <Link href={routes.pricing} className="inline-flex h-10 items-center gap-2 rounded-lg border border-cl-border bg-cl-card px-4 text-sm font-medium transition hover:bg-cl-blue-light hover:text-cl-blue">
            <CreditCard size={16} /> Plans
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <div className="cl-card cl-panel flex flex-col p-4">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-cl-muted">My businesses</p>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600"><Building2 size={16} /></span>
          <p className="mt-2 text-2xl font-bold">{totalBiz}</p>
          <p className="mt-0.5 text-xs text-cl-muted">{active} active · {pending} pending</p>
        </div>
        <div className="cl-card cl-panel flex flex-col p-4">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-cl-muted">Pending approval</p>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600"><ArrowRight size={16} /></span>
          <p className="mt-2 text-2xl font-bold">{pending}</p>
          <p className="mt-0.5 text-xs text-cl-muted">{pending ? "ABUUR is reviewing" : "nothing waiting"}</p>
        </div>
        <div className="cl-card cl-panel flex flex-col p-4">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-cl-muted">Team members</p>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600"><Users size={16} /></span>
          <p className="mt-2 text-2xl font-bold">—</p>
          <p className="mt-0.5 text-xs text-cl-muted">after approval</p>
        </div>
        <div className="cl-card cl-panel flex flex-col p-4">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-cl-muted">Stores</p>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600"><Store size={16} /></span>
          <p className="mt-2 text-2xl font-bold">—</p>
          <p className="mt-0.5 text-xs text-cl-muted">store builder coming soon</p>
        </div>
        <div className="cl-card cl-panel flex flex-col p-4">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-cl-muted">Products</p>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600"><Boxes size={16} /></span>
          <p className="mt-2 text-2xl font-bold">—</p>
          <p className="mt-0.5 text-xs text-cl-muted">catalogue coming soon</p>
        </div>
        <div className="cl-card cl-panel flex flex-col p-4">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-cl-muted">Orders</p>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600"><ClipboardList size={16} /></span>
          <p className="mt-2 text-2xl font-bold">—</p>
          <p className="mt-0.5 text-xs text-cl-muted">WhatsApp orders coming soon</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="cl-card cl-panel p-6 xl:col-span-2">
          <h2 className="text-lg font-semibold text-cl-text mb-6">Your businesses</h2>
          {mine.length === 0 ? (
            <p className="rounded-lg border border-dashed border-cl-border px-4 py-8 text-center text-sm text-cl-muted">
              No businesses yet. <Link href="#new-business" className="font-medium text-cl-blue hover:underline">Add your first one</Link>.
            </p>
          ) : (
            <div className="-mx-5 overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-cl-border text-left text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-cl-muted">
                    <th className="px-5 pb-2 font-semibold">Business</th>
                    <th className="px-3 pb-2 font-semibold">Your role</th>
                    <th className="px-3 pb-2 font-semibold">Created</th>
                    <th className="px-5 pb-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[...mine].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6).map((b) => {
                    const st = STATUS[b.status];
                    return (
                      <tr key={b.id} className="border-b border-cl-border last:border-0">
                        <td className="px-5 py-3">
                          <p className="font-semibold">{b.name}</p>
                          <p className="text-xs text-cl-muted">abuur.so/{b.slug}</p>
                        </td>
                        <td className="px-3 py-3 text-cl-muted">OWNER</td>
                        <td className="px-3 py-3 text-cl-muted">{b.createdAt}</td>
                        <td className="px-5 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-wide ${st.pill}`}>{st.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="cl-card cl-panel p-6">
          <h2 className="text-lg font-semibold text-cl-text mb-6">Getting started</h2>
          <p className="text-sm text-cl-muted mb-4">Your path to the first WhatsApp order.</p>
          <ol className="space-y-3">
            {[
              { label: "Create your ABUUR account", done: true },
              { label: "Add your business", done: mine.length > 0 },
              { label: "Get approved by ABUUR", done: mine.some((b) => b.status === "ACTIVE") },
              { label: "Build your store", done: false, soon: true },
              { label: "Add your products", done: false, soon: true },
              { label: "Take your first WhatsApp order", done: false, soon: true },
            ].map((s, i) => (
              <li key={i} className="flex items-center gap-3 text-sm">
                {s.done ? <span className="shrink-0 text-cl-success">✓</span> : <span className="shrink-0 text-cl-muted/60">○</span>}
                <span className={s.done ? "text-cl-muted line-through" : ""}>{s.label}</span>
                {s.soon && <span className="ml-auto rounded bg-cl-blue-light px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase text-cl-blue">Soon</span>}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="cl-card cl-panel p-6" id="new-business">
        <h2 className="text-lg font-semibold text-cl-text mb-4">Add your business</h2>
        <p className="text-sm text-cl-muted mb-4">Every store on ABUUR belongs to a business. You'll be its owner.</p>
        <div className="rounded-lg border border-dashed border-cl-border bg-cl-card/50 p-8 text-center">
          <p className="text-cl-muted">Business creation form coming soon.</p>
          <Link href="#new-business" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-cl-blue hover:underline">
            Add business <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
