import { ArrowRight, Clipboard, Palette, Clock, UserCircle, Users } from "lucide-react";
import { api } from "@/lib/api";
import { getCurrentUser, getToken } from "@/lib/session";

export default async function CreativeDashboard() {
  const user = await getCurrentUser();
  const token = (await getToken()) as string;
  const businesses = await api<any[]>("/businesses", { token });
  const business = businesses.ok ? businesses.data.find((item) => item.status === "ACTIVE") ?? businesses.data[0] : null;
  const businessId = business?.id;
  const [projects, tasks, briefs, reviews] = businessId ? await Promise.all([
    api<any[]>("/creative-projects", { token, businessId }),
    api<any[]>("/creative-tasks", { token, businessId }),
    api<any[]>("/creative-requests", { token, businessId }),
    api<any[]>("/creative-reviews", { token, businessId }),
  ]) : [null, null, null, null];
  const projectRows = projects?.ok ? projects.data : [];
  const taskRows = tasks?.ok ? tasks.data : [];
  const briefRows = briefs?.ok ? briefs.data : [];
  const reviewRows = reviews?.ok ? reviews.data : [];

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-[1.7rem]">Creative Dashboard</h1>
          <p className="mt-1 text-sm text-cl-muted">Manage creative projects, briefs, and deliverables.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <div className="cl-card cl-panel flex flex-col p-4">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-cl-muted">My projects</p>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600"><Palette size={16} /></span>
          <p className="mt-2 text-2xl font-bold">{projectRows.length}</p>
          <p className="mt-0.5 text-xs text-cl-muted">{projectRows.filter((item) => item.status !== "COMPLETED").length} active</p>
        </div>
        <div className="cl-card cl-panel flex flex-col p-4">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-cl-muted">Assigned tasks</p>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600"><Clipboard size={16} /></span>
          <p className="mt-2 text-2xl font-bold">{taskRows.length}</p>
          <p className="mt-0.5 text-xs text-cl-muted">{taskRows.filter((item) => item.status !== "COMPLETED").length} open</p>
        </div>
        <div className="cl-card cl-panel flex flex-col p-4">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-cl-muted">Project briefs</p>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600"><ArrowRight size={16} /></span>
          <p className="mt-2 text-2xl font-bold">{briefRows.length}</p>
          <p className="mt-0.5 text-xs text-cl-muted">{briefRows.filter((item) => item.status === "SUBMITTED").length} submitted</p>
        </div>
        <div className="cl-card cl-panel flex flex-col p-4">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-cl-muted">Upload files</p>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600"><Users size={16} /></span>
          <p className="mt-2 text-2xl font-bold">{reviewRows.length}</p>
          <p className="mt-0.5 text-xs text-cl-muted">file review records</p>
        </div>
        <div className="cl-card cl-panel flex flex-col p-4">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-cl-muted">Review & revisions</p>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600"><Clock size={16} /></span>
          <p className="mt-2 text-2xl font-bold">{reviewRows.filter((item) => item.status === "REVISION_REQUESTED").length}</p>
          <p className="mt-0.5 text-xs text-cl-muted">revision requests</p>
        </div>
        <div className="cl-card cl-panel flex flex-col p-4">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-cl-muted">Approved projects</p>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600"><UserCircle size={16} /></span>
          <p className="mt-2 text-2xl font-bold">{reviewRows.filter((item) => item.status === "APPROVED").length}</p>
          <p className="mt-0.5 text-xs text-cl-muted">approved reviews</p>
        </div>
      </div>

      <div className="cl-card cl-panel p-6">
        <h2 className="text-lg font-semibold text-cl-text mb-4">Recent creative projects</h2>
        {projectRows.length === 0 ? (
          <p className="rounded-lg border border-dashed border-cl-border py-8 text-center text-sm text-cl-muted">No creative projects found for {business?.name ?? "this account"}.</p>
        ) : (
          <div className="-mx-6 overflow-x-auto"><table className="w-full min-w-[720px] text-sm"><thead><tr className="border-b border-cl-border text-left text-xs text-cl-muted"><th className="px-6 py-3">Project</th><th>Stage</th><th>Status</th><th>Deadline</th></tr></thead><tbody>{projectRows.slice(0,10).map((project) => <tr key={project.id} className="border-b border-cl-border last:border-0"><td className="px-6 py-3 font-semibold">{project.title}</td><td>{project.stage}</td><td>{project.status}</td><td className="text-cl-muted">{project.deadline ? new Date(project.deadline).toLocaleDateString() : "—"}</td></tr>)}</tbody></table></div>
        )}
      </div>
    </div>
  );
}
