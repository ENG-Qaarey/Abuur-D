import type { Metadata } from "next";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { SiteShell } from "@/components/landing/site-shell";
import { PageHero } from "@/components/landing/page-hero";
import { FinalCTA } from "@/components/landing/final-cta";
import { FAQSection } from "@/components/landing/home-sections";
import { MotionSection } from "@/components/ui/motion-section";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { routes } from "@/lib/routes";
import type { Plan } from "@/lib/types";

export const metadata: Metadata = {
  title: "Pricing | ABUUR Digital",
  description: "Simple monthly plans for Somali businesses selling online with ABUUR Digital.",
};

const INCLUDED = [
  "Your own store link",
  "WhatsApp ordering",
  "Order dashboard",
  "Mobile-friendly storefront",
  "No fees on your sales",
  "Support from the ABUUR team",
];

/** Plan.features is free-form JSON: accept a string list or an object of named flags. */
function featureList(features: unknown): string[] {
  if (Array.isArray(features)) return features.filter((f): f is string => typeof f === "string");
  if (features && typeof features === "object") {
    return Object.entries(features as Record<string, unknown>)
      .filter(([, value]) => value !== false && value !== null)
      .map(([key, value]) => (typeof value === "string" || typeof value === "number" ? `${key}: ${value}` : key));
  }
  return [];
}

function formatPrice(plan: Plan): string {
  const amount = Number(plan.price);
  if (!Number.isFinite(amount)) return String(plan.price);
  if (amount === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: plan.currency || "USD",
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export default async function PricingPage() {
  const result = await api<Plan[]>("/plans/public");
  const plans = result.ok ? result.data : [];
  const highlight = plans.length >= 3 ? 1 : -1;

  return (
    <SiteShell>
      <PageHero
        label="Pricing"
        title="Simple plans for every business"
        subtitle="Choose the plan that fits your business today and change it as you grow. Your customers never pay ABUUR, only you."
      />

      <section className="section-main pb-20 pt-4 sm:pb-28">
        <div className="cl-container">
          {plans.length > 0 ? (
            <div className={`grid gap-6 ${plans.length >= 3 ? "lg:grid-cols-3" : "md:grid-cols-2"} mx-auto max-w-6xl`}>
              {plans.map((plan, i) => {
                const featured = i === highlight;
                return (
                  <MotionSection key={plan.id} delay={i * 0.06}>
                    <article
                      className={`relative flex h-full flex-col rounded-[1.25rem] p-7 sm:p-8 ${
                        featured
                          ? "abuur-border-glow bg-[#06101f] shadow-[0_24px_60px_-12px_rgba(13,110,253,0.45)] lg:-translate-y-3"
                          : "abuur-tile"
                      }`}
                    >
                      {featured && (
                        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-cl-blue to-emerald-500 px-3.5 py-1 text-xs font-semibold text-white shadow-lg">
                          Most popular
                        </span>
                      )}
                      <h2 className={`text-xl font-semibold ${featured ? "text-white" : "text-cl-text"}`}>{plan.name}</h2>
                      {plan.description && (
                        <p className="mt-2 text-sm leading-relaxed text-cl-muted">{plan.description}</p>
                      )}
                      <p className="mt-6 flex items-baseline gap-1.5">
                        <span className={`text-5xl font-bold tracking-tight ${featured ? "text-white" : "text-cl-text"}`}>{formatPrice(plan)}</span>
                        {Number(plan.price) > 0 && (
                          <span className="text-sm text-cl-muted">/ {plan.interval === "YEARLY" ? "year" : "month"}</span>
                        )}
                      </p>
                      <ul className="mt-7 flex-1 space-y-3 border-t border-cl-border pt-6">
                        {featureList(plan.features).map((feature) => (
                          <li key={feature} className={`flex items-start gap-2.5 text-sm ${featured ? "text-blue-50/90" : "text-cl-text/90"}`}>
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cl-success" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button
                        href={`${routes.register}?plan=${encodeURIComponent(plan.slug)}`}
                        variant={featured ? "primary" : "secondary"}
                        className="mt-8 w-full"
                      >
                        Start with {plan.name}
                      </Button>
                    </article>
                  </MotionSection>
                );
              })}
            </div>
          ) : (
            <div className="abuur-border-glow mx-auto max-w-xl rounded-[1.25rem] bg-cl-card p-10 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cl-blue-light text-cl-accent">
                <MessageCircle className="h-7 w-7" />
              </span>
              <h2 className="mt-4 text-xl font-semibold text-cl-text">
                {result.ok ? "Plans are being finalised" : "Plans couldn't be loaded"}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-cl-muted">
                {result.ok
                  ? "Our plans will be published here soon. Talk to us and we'll help you choose the right setup for your business."
                  : "We couldn't load our plans right now. Please try again in a moment, or talk to us and we'll help you choose."}
              </p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <Button href={routes.contact}>Talk to us</Button>
                <Button href={routes.register} variant="secondary">
                  Create free account
                </Button>
              </div>
            </div>
          )}

          <MotionSection>
            <div className="mx-auto mt-16 max-w-5xl rounded-[1.25rem] border border-cl-border bg-cl-card/60 p-6 sm:p-8">
              <p className="text-center text-sm font-semibold uppercase tracking-[0.14em] text-cl-muted">
                Included in every plan
              </p>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {INCLUDED.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-cl-text">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-cl-success" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </MotionSection>

          <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-cl-muted">
            After you sign up and add your business, the ABUUR team contacts you to confirm
            your plan and how you&apos;d like to pay for it.
          </p>
        </div>
      </section>

      <FAQSection />
      <FinalCTA />
    </SiteShell>
  );
}
