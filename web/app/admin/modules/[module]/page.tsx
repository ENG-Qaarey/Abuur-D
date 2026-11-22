import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import { requireSuperAdmin } from "@/lib/admin";
import { moduleBySlug, type Field } from "@/lib/module-config";
import { ModuleManager } from "@/components/admin/module-manager";
import { PageHeader } from "@/components/admin/ui";

export const metadata = { title: "Module | ABUUR Admin" };

type OptionsMap = Record<string, Record<string, { value: string; label: string }[]>>;

export default async function ModulePage({
  params,
  searchParams,
}: {
  params: Promise<{ module: string }>;
  searchParams: Promise<{ entity?: string }>;
}) {
  const { token } = await requireSuperAdmin();
  const { module: moduleSlug } = await params;
  const { entity: entitySlug } = await searchParams;

  const module = moduleBySlug(moduleSlug);
  if (!module) notFound();

  const activeEntity = module.entities.find((e) => e.slug === entitySlug) ?? module.entities[0];

  // Rows for every entity (tabs switch instantly).
  const rowsByEntity: Record<string, any[]> = {};
  await Promise.all(
    module.entities.map(async (e) => {
      const result = await api<any[]>(`/${e.endpoint}?take=100`, { token });
      rowsByEntity[e.slug] = result.ok ? result.data : [];
    })
  );

  // Options for dynamic reference selects (businessId, storeId, projectId…).
  const dynamicEndpoints = new Set<string>();
  for (const e of module.entities) {
    for (const f of e.fields) if (f.optionsEndpoint) dynamicEndpoints.add(f.optionsEndpoint);
  }
  const optionData: Record<string, any[]> = {};
  await Promise.all(
    [...dynamicEndpoints].map(async (ep) => {
      const result = await api<any[]>(`/${ep}?take=100`, { token });
      optionData[ep] = result.ok ? result.data : [];
    })
  );

  const optionsByEntity: OptionsMap = {};
  for (const e of module.entities) {
    optionsByEntity[e.slug] = {};
    for (const f of e.fields) {
      if (f.optionsEndpoint) {
        const labelKey = f.labelKey ?? "name";
        optionsByEntity[e.slug][f.name] = (optionData[f.optionsEndpoint] ?? []).map((r) => ({
          value: r.id,
          label: r[labelKey] ?? r.name ?? r.id,
        }));
      }
    }
  }

  return (
    <div className="w-full min-w-0 space-y-6">
      <Link href="/admin/modules" className="inline-flex items-center gap-1.5 text-sm font-medium text-cl-muted hover:text-cl-blue">
        <ArrowLeft size={15} /> All modules
      </Link>

      <PageHeader title={module.name} subtitle={module.description} />

      <ModuleManager
        key={module.slug}
        module={module}
        entitySlug={activeEntity.slug}
        rowsByEntity={rowsByEntity}
        optionsByEntity={optionsByEntity}
      />
    </div>
  );
}
