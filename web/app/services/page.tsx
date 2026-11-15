import type { Metadata } from "next";
import { OrderSteps } from "@/components/landing/order-steps";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, Megaphone, Bot, Truck } from "lucide-react";
import { SiteShell } from "@/components/landing/site-shell";
import { PageHero } from "@/components/landing/page-hero";
import {
  FAQSection,
  MODULES,
  OrderDashboardSection,
  SectionIntro,
} from "@/components/landing/home-sections";
import { FeatureBento } from "@/components/landing/feature-bento";
import { FinalCTA } from "@/components/landing/final-cta";
import { MotionSection } from "@/components/ui/motion-section";
import { routes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Services | ABUUR Digital",
  description:
    "Online store builder, product management, WhatsApp ordering and an order dashboard for Somali businesses.",
};

const DETAILS: Record<string, string[]> = {
  store: [
    "Your business name, logo, description and contact details",
    "A clean store link to share anywhere",
    "Mobile-friendly pages that load fast",
  ],
  products: [
    "Products with prices, photos and descriptions",
    "Categories so customers find things quickly",
    "Stock levels and inventory movements",
  ],
  whatsapp: [
    "Customers build a cart without creating an account",
    "One tap sends the full order to your WhatsApp number",
    "Payment and delivery agreed directly with the customer",
  ],
  orders: [
    "New → Confirmed → Preparing → Ready → Dispatched → Delivered",
    "Customer details and order history in one place",
    "Record payment status yourself once you've been paid",
  ],
};

const ROADMAP = [
  { icon: Truck, title: "Dropshipping", text: "Sell products from verified suppliers without holding stock." },
  { icon: Bot, title: "WhatsApp automation", text: "Auto-replies, order updates and message templates." },
  { icon: Megaphone, title: "Marketing campaigns", text: "Reach your customer list with offers and announcements." },
];

export default function ServicesPage() {
  return (
    <SiteShell>
      <PageHero
        label="Services"
        title="Everything you need to sell online"
        subtitle="ABUUR Digital brings your store, your products and your WhatsApp orders together in one simple platform."
      >
        <Link href={routes.register} className="cl-btn cl-btn-primary group mt-8 !rounded-full">
          Open your store free
          <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </PageHero>

      <section className="section-main py-16 sm:py-20">
        <div className="cl-container">
          <FeatureBento />
        </div>
      </section>

      <section className="section-secondary py-20 sm:py-28">
        <div className="cl-container">
          <MotionSection>
            <SectionIntro pill="In detail" title="What each tool does" />
          </MotionSection>
          <div className="mt-14 grid gap-5 md:grid-cols-2">
            {MODULES.map(({ id, icon: Icon, title, description }, i) => (
              <MotionSection key={id} delay={i * 0.06}>
                <article id={id} className="abuur-tile h-full scroll-mt-28 p-7 sm:p-8">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cl-blue to-[#60a5fa] text-white shadow-lg">
                      <Icon size={22} />
                    </div>
                    <h2 className="text-xl font-semibold text-cl-text sm:text-2xl">{title}</h2>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-cl-muted sm:text-base">{description}</p>
                  <ul className="mt-5 space-y-2.5 border-t border-cl-border pt-5">
                    {DETAILS[id].map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-cl-text/90">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cl-success" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </article>
              </MotionSection>
            ))}
          </div>
        </div>
      </section>

      <OrderDashboardSection />
      <OrderSteps />

      <section className="section-main py-20 sm:py-28">
        <div className="cl-container">
          <MotionSection>
            <SectionIntro
              pill="Coming next"
              title="On our roadmap"
              subtitle="We're building ABUUR step by step. These tools come after the core store."
            />
          </MotionSection>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {ROADMAP.map(({ icon: Icon, title, text }, i) => (
              <MotionSection key={title} delay={i * 0.06}>
                <div className="h-full rounded-[1.25rem] border border-dashed border-cl-border bg-cl-card/50 p-6">
                  <div className="flex items-center justify-between">
                    <Icon className="h-6 w-6 text-cl-accent" />
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-cl-blue-light px-2.5 py-1 text-xs font-semibold text-cl-accent">
                      <Clock size={12} />
                      Planned
                    </span>
                  </div>
                  <h3 className="mt-5 text-base font-semibold text-cl-text">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-cl-muted">{text}</p>
                </div>
              </MotionSection>
            ))}
          </div>
        </div>
      </section>

      <FAQSection />
      <FinalCTA />
    </SiteShell>
  );
}
