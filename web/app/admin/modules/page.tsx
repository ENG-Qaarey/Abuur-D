import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { CARD, PageHeader, StatusPill } from "@/components/admin/ui";
import { requireSuperAdmin } from "@/lib/admin";
import { MODULES } from "@/lib/module-config";

export const metadata = { title: "Modules & Features | ABUUR Admin" };

export default async function ModulesPage() {
  await requireSuperAdmin();
  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        title="Main SaaS Modules"
        subtitle="The five core modules powering every ABUUR business. Open one to manage its records."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {MODULES.map((module, index) => (
          <Link key={module.slug} href={`/admin/modules/${module.slug}`} className="group">
            <article className={`${CARD} flex h-full min-h-[320px] flex-col p-5 transition group-hover:border-cl-blue/50`}>
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cl-blue-light text-[0.85rem] font-bold text-cl-blue">
                  {index + 1}
                </span>
                <StatusPill status="ACTIVE" />
              </div>
              <p className="mt-4 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-cl-blue">{module.area}</p>
              <h2 className="mt-1 text-lg font-bold leading-tight">{module.name}</h2>
              <p className="mt-2 text-sm leading-6 text-cl-muted">{module.description}</p>
              <ul className="mt-4 grid flex-1 gap-1.5 border-t border-cl-border pt-4">
                {module.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[0.82rem]">
                    <Check size={14} className="mt-0.5 shrink-0 text-cl-success" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <span className="mt-4 inline-flex items-center gap-1.5 text-[0.84rem] font-semibold text-cl-blue">
                Open module <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
              </span>
            </article>
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-cl-border bg-cl-card px-4 py-3">
        <p className="text-sm text-cl-muted">
          <span className="font-semibold text-cl-text">{MODULES.length} main modules</span>
          <span className="mx-2">·</span>
          {MODULES.reduce((a, m) => a + m.entities.length, 0)} manageables
        </p>
        <Link href="/admin/features" className="inline-flex items-center gap-1 text-sm font-semibold text-cl-blue">
          Manage feature flags <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
