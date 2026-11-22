import { Check, Tags } from "lucide-react";
import { SubTabs } from "@/components/admin/client";
import { TABS } from "@/components/admin/tabs";
import { CARD, ErrorNote, PageHeader, StatusPill } from "@/components/admin/ui";
import { loadPlans, requireSuperAdmin } from "@/lib/admin";

/** Plan `features` is free-form JSON; show it as a list when it is one. */
function featureList(features: unknown): string[] {
  if (Array.isArray(features)) return features.map(String);
  if (features && typeof features === "object") {
    return Object.entries(features as Record<string, unknown>).map(([k, v]) => (v === true ? k : `${k}: ${String(v)}`));
  }
  return [];
}

export default async function PlansPage() {
  await requireSuperAdmin();
  const plans = await loadPlans();

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        title="Plans & Pricing"
        subtitle="The Starter, Pro and Enterprise plans business owners subscribe to. Payment is agreed off-platform."
      />
      <SubTabs tabs={TABS.plans} />
      <ErrorNote message={plans.error} />
      {plans.data.length === 0 ? (
        <p className={`${CARD} px-6 py-12 text-center text-sm text-cl-muted`}>No plans published yet.</p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {plans.data.map((p) => {
            const price = Number(p.price);
            const features = featureList(p.features);
            return (
              <article key={p.id} className={`${CARD} flex flex-col p-5`}>
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cl-blue-light text-cl-blue">
                    <Tags size={18} />
                  </span>
                  <StatusPill status="ACTIVE" label={p.interval.toLowerCase()} />
                </div>
                <h2 className="mt-4 text-lg font-bold">{p.name}</h2>
                <p className="mt-1 min-h-10 text-sm text-cl-muted">{p.description ?? `abuur plan “${p.slug}”`}</p>
                <p className="mt-4 text-3xl font-bold">
                  {price === 0 ? "Free" : `${p.currency === "USD" ? "$" : `${p.currency} `}${price.toLocaleString("en-US")}`}
                  {price > 0 && <span className="text-sm font-medium text-cl-muted"> / {p.interval.toLowerCase().replace("ly", "")}</span>}
                </p>
                {features.length > 0 && (
                  <ul className="mt-5 space-y-2 border-t border-cl-border pt-4 text-sm">
                    {features.slice(0, 8).map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check size={15} className="mt-0.5 shrink-0 text-cl-success" />
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            );
          })}
        </div>
      )}
      <p className="text-xs text-cl-muted">Editing plans needs a Super Admin endpoint for /plans (create, update, archive). The list above is read-only.</p>
    </div>
  );
}
