import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, Package, Store, ChevronRight } from "lucide-react";
import { SiteShell } from "@/components/landing/site-shell";
import { PageHero } from "@/components/landing/page-hero";
import { FinalCTA } from "@/components/landing/final-cta";
import { MotionSection, Stagger } from "@/components/ui/motion-section";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Stores | ABUUR Digital",
  description: "Browse Somali businesses selling online with ABUUR. Order from their store and send your cart on WhatsApp.",
};

/** GET /stores/public: live stores of approved businesses, public fields only. */
type PublicStore = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  city: string | null;
  industry: string | null;
  productCount: number;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function StoresPage() {
  const result = await api<PublicStore[]>("/stores/public");
  const stores = result.ok ? result.data : [];

  return (
    <SiteShell>
      <PageHero
        label="Stores"
        title="Shop from businesses on ABUUR"
        subtitle="Every store here is run by an approved Somali business. Open one, fill your cart and send the order on WhatsApp."
      />

      <section className="section-main pb-20 pt-4 sm:pb-28">
        <div className="cl-container">
          {stores.length > 0 ? (
            <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {stores.map((s) => (
                <Link
                  key={s.id}
                  href={`/stores/${s.slug}`}
                  className="block"
                >
                  <article className="abuur-tile flex flex-col h-full p-6">
                    <div className="flex items-center gap-3 mb-4">
                      {s.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={s.logoUrl} alt="" className="h-12 w-12 rounded-xl object-cover" />
                      ) : (
                        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-cl-blue text-sm font-bold text-white">
                          {initials(s.name)}
                        </span>
                      )}
                      <div className="min-w-0">
                        <h2 className="truncate font-semibold text-cl-text">{s.name}</h2>
                        <p className="truncate text-xs text-cl-muted">abuur.so/{s.slug}</p>
                      </div>
                    </div>
                    {s.description && (
                      <p className="mt-0 line-clamp-2 text-sm leading-relaxed text-cl-muted flex-1">
                        {s.description}
                      </p>
                    )}
                    <div className="mt-auto pt-4 flex flex-wrap gap-2 text-xs text-cl-muted">
                      {s.industry && (
                        <span className="rounded-full bg-cl-blue-light px-2.5 py-1 font-medium text-cl-accent">
                          {s.industry}
                        </span>
                      )}
                      {s.city && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-cl-border px-2.5 py-1">
                          <MapPin size={12} /> {s.city}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 rounded-full border border-cl-border px-2.5 py-1">
                        <Package size={12} /> {s.productCount} {s.productCount === 1 ? "product" : "products"}
                      </span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-cl-border/50 flex items-center justify-between">
                      <span className="text-xs font-medium text-cl-muted">View store</span>
                      <ChevronRight size={14} className="text-cl-accent" />
                    </div>
                  </article>
                </Link>
              ))}
            </Stagger>
          ) : (
            <MotionSection>
              <div className="mx-auto max-w-xl rounded-[1.5rem] border border-dashed border-cl-border bg-cl-card px-6 py-14 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cl-blue-light text-cl-accent">
                  <Store size={26} />
                </span>
                <h2 className="mt-5 text-xl font-semibold text-cl-text">
                  {result.ok ? "The first stores are opening soon" : "The store list can't load right now"}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-cl-muted">
                  {result.ok
                    ? "Approved businesses appear here as soon as their store goes live. Yours could be one of the first."
                    : "Please try again in a moment. In the meantime, you can open your own store."}
                </p>
                <Link href={routes.register} className="cl-btn cl-btn-primary group mt-7">
                  Open your store
                  <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </MotionSection>
          )}
        </div>
      </section>

      <FinalCTA />
    </SiteShell>
  );
}
