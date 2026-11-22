import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Package, Store, ChevronRight, Phone, Clock } from "lucide-react";
import { SiteShell } from "@/components/landing/site-shell";
import { PageHero } from "@/components/landing/page-hero";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";

type StoreDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  city: string | null;
  industry: string | null;
  productCount: number;
  whatsappNumber: string | null;
  phone: string | null;
  address: string | null;
  status: string;
  currency: string;
};

export const metadata: Metadata = {
  title: "Store | ABUUR Digital",
  description: "Browse products and send your order on WhatsApp.",
};

export default async function StorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const result = await api<StoreDetail>(`/stores/public/slug/${slug}`);
  const store = result.ok ? result.data : null;

  if (!store) {
    return (
      <SiteShell>
        <PageHero
          label="Store Not Found"
          title="This store doesn't exist"
          subtitle="The store you're looking for may have been removed or is not yet live."
        />
        <section className="section-main pb-20 pt-4">
          <div className="cl-container text-center">
            <Link href={routes.stores} className="cl-btn cl-btn-primary group mt-8">
              Browse all stores
              <ChevronRight size={17} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <PageHero
        label={store.industry || "Store"}
        title={store.name}
        subtitle={store.description || "Discover products and order on WhatsApp."}
      />

      <section className="section-main pb-20 pt-4">
        <div className="cl-container">
          <div className="grid gap-8 sm:grid-cols-12">
            {/* Store info card */}
            <div className="sm:col-span-4 lg:col-span-3">
              <div className="rounded-[1.5rem] border border-cl-border bg-cl-card p-6">
                {store.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={store.logoUrl}
                    alt=""
                    className="w-full h-48 object-cover rounded-xl mb-4"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center rounded-xl bg-cl-blue-light mb-4">
                    <span className="text-2xl font-bold text-cl-blue">
                      {store.name
                        .split(/\s+/)
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                  </div>
                )}
                <h2 className="text-lg font-semibold text-cl-text mb-2">{store.name}</h2>
                <p className="text-sm text-cl-muted mb-4">{store.description || "No description available."}</p>

                <div className="space-y-3">
                  {store.city && (
                    <div className="flex items-start gap-3 text-sm">
                      <MapPin size={16} className="text-cl-accent mt-0.5" />
                      <div>
                        <p className="text-cl-text font-medium">{store.city}</p>
                        {store.address && <p className="text-cl-muted text-xs">{store.address}</p>}
                      </div>
                    </div>
                  )}
                  {store.industry && (
                    <div className="flex items-start gap-3 text-sm">
                      <Package size={16} className="text-cl-accent mt-0.5" />
                      <p className="text-cl-text font-medium">{store.industry}</p>
                    </div>
                  )}
                  {store.whatsappNumber && (
                    <div className="flex items-start gap-3 text-sm">
                      <Phone size={16} className="text-cl-accent mt-0.5" />
                      <a
                        href={`https://wa.me/${store.whatsappNumber.replace(/\+/g, "")}`}
                        className="text-cl-blue hover:underline"
                      >
                        {store.whatsappNumber}
                      </a>
                    </div>
                  )}
                  {store.phone && (
                    <div className="flex items-start gap-3 text-sm">
                      <Phone size={16} className="text-cl-accent mt-0.5" />
                      <p className="text-cl-text font-medium">{store.phone}</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-cl-border">
                  <p className="text-xs text-cl-muted">Products: {store.productCount}</p>
                  <p className="text-xs text-cl-muted">Currency: {store.currency}</p>
                  <p className="text-xs text-cl-muted">Status: {store.status}</p>
                </div>
              </div>
            </div>

            {/* Store products / CTA card */}
            <div className="sm:col-span-8 lg:col-span-9">
              <div className="rounded-[1.5rem] border border-cl-border bg-cl-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-cl-text">Order from {store.name}</h2>
                </div>

                <div className="rounded-xl bg-cl-blue p-6 mb-6">
                  <h3 className="font-semibold text-white mb-2">Send your order on WhatsApp</h3>
                  <p className="text-white/90 text-sm mb-4">
                    Fill your cart and message {store.name} directly on WhatsApp to place your order.
                  </p>
                  {store.whatsappNumber ? (
                    <Link
                      href={`https://wa.me/${store.whatsappNumber.replace(/\+/g, "")}?text=Hi%20${store.name}%2C%20I%20would%20like%20to%20place%20an%20order.`}
                      className="cl-btn cl-btn-primary w-full group"
                    >
                      Open WhatsApp Chat
                      <ChevronRight size={17} className="ml-2 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  ) : (
                    <p className="text-white/70 text-sm">WhatsApp contact not available for this store.</p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: Math.min(store.productCount, 6) }).map((_, i) => (
                    <div key={i} className="rounded-xl border border-cl-border p-4">
                      <div className="h-32 rounded-lg bg-cl-muted mb-3"></div>
                      <h3 className="font-semibold text-cl-text">{`Product ${i + 1}`}</h3>
                      <p className="text-xs text-cl-muted">Available</p>
                    </div>
                  ))}
                </div>

                {store.productCount === 0 && (
                  <div className="text-center py-8">
                    <p className="text-cl-muted">No products available yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
