import type { Metadata } from "next";
import { OrderSteps } from "@/components/landing/order-steps";
import { CheckCircle2, Pill, Shirt, ShoppingBasket, Smartphone, Sparkles, UtensilsCrossed, type LucideIcon } from "lucide-react";
import { SiteShell } from "@/components/landing/site-shell";
import { PageHero } from "@/components/landing/page-hero";
import { FinalCTA } from "@/components/landing/final-cta";
import { Stagger } from "@/components/ui/motion-section";

export const metadata: Metadata = {
  title: "Solutions | ABUUR Digital",
  description:
    "How fashion shops, restaurants, pharmacies, electronics sellers, groceries and beauty brands in Somalia sell online with ABUUR.",
};

const SOLUTIONS: { icon: LucideIcon; title: string; lead: string; points: string[]; hue: string }[] = [
  {
    icon: Shirt,
    title: "Fashion & clothing",
    lead: "Dirac, garbasaar, abaya and shoes, shown with sizes and colours.",
    points: ["Photos and prices for every item", "Customers pick size and quantity", "New arrivals shared as one link"],
    hue: "#3b82f6",
  },
  {
    icon: UtensilsCrossed,
    title: "Restaurants & cafés",
    lead: "Your menu online, orders straight to the kitchen's WhatsApp.",
    points: ["Menu with categories and prices", "Delivery area agreed in the chat", "Busy times tracked in the dashboard"],
    hue: "#f59e0b",
  },
  {
    icon: Pill,
    title: "Pharmacies",
    lead: "Everyday health products customers can order from home.",
    points: ["Stock levels kept up to date", "Questions answered on WhatsApp before delivery", "Every order recorded for your team"],
    hue: "#10b981",
  },
  {
    icon: Smartphone,
    title: "Phones & electronics",
    lead: "Phones, accessories and laptops with clear prices and stock.",
    points: ["Models and storage options listed", "Mark items out of stock in one tap", "Orders confirmed before payment"],
    hue: "#a855f7",
  },
  {
    icon: ShoppingBasket,
    title: "Groceries & fresh produce",
    lead: "Weekly shopping lists that arrive as one tidy WhatsApp order.",
    points: ["Large catalogues organised by category", "Repeat customers order in seconds", "Cash on delivery or mobile money"],
    hue: "#22c55e",
  },
  {
    icon: Sparkles,
    title: "Beauty & perfume",
    lead: "Oud, cosmetics and skincare with product photos that sell.",
    points: ["Gift sets and bundles as products", "Share your link on TikTok and Instagram", "Team members handle orders together"],
    hue: "#ec4899",
  },
];

export default function SolutionsPage() {
  return (
    <SiteShell>
      <PageHero
        label="Solutions"
        title="Built for the way your business sells"
        subtitle="Whatever you sell, ABUUR gives you a store link, a product catalogue and WhatsApp orders tracked in one dashboard."
      />

      <section className="section-main pb-20 pt-4 sm:pb-28">
        <div className="cl-container">
          <Stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {SOLUTIONS.map(({ icon: Icon, title, lead, points, hue }) => (
              <article key={title} className="abuur-tile flex h-full flex-col p-7">
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: `${hue}1f`, color: hue }}
                >
                  <Icon size={22} />
                </span>
                <h2 className="mt-5 text-xl font-semibold text-cl-text">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-cl-muted">{lead}</p>
                <ul className="mt-5 space-y-2.5 border-t border-cl-border pt-5">
                  {points.map((p) => (
                    <li key={p} className="flex items-start gap-2.5 text-sm text-cl-text/90">
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-cl-success" />
                      {p}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </Stagger>
        </div>
      </section>

      <OrderSteps />
      <FinalCTA />
    </SiteShell>
  );
}
