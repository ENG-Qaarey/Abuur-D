import type { Metadata } from "next";
import { SiteShell } from "@/components/landing/site-shell";
import { PageHero } from "@/components/landing/page-hero";
import { WhyAbuur } from "@/components/landing/home-sections";
import { FinalCTA } from "@/components/landing/final-cta";
import { MotionSection } from "@/components/ui/motion-section";

export const metadata: Metadata = {
  title: "About | ABUUR Digital",
  description:
    "ABUUR Digital helps Somali businesses sell online with their own store, WhatsApp ordering and an order dashboard.",
};

const MISSION = [
  {
    title: "Our mission",
    text: "Help every Somali business, from a market stall to a growing brand, take orders online without technical skills or expensive tools.",
  },
  {
    title: "How we work",
    text: "We build on the tools people already use. Customers order through WhatsApp, and businesses agree on payment the way they always have.",
  },
  {
    title: "Step by step",
    text: "We started with the essentials: your store, your products and your orders. Dropshipping, automation and marketing come next.",
  },
];

export default function AboutPage() {
  return (
    <SiteShell>
      <PageHero
        label="About ABUUR"
        title="Helping Somali businesses sell online"
        subtitle="ABUUR Digital is a platform for businesses that want an online store, organised WhatsApp orders and a clear view of their sales."
      />

      <section className="section-main pb-20 pt-4 sm:pb-28">
        <div className="cl-container grid gap-5 md:grid-cols-3">
          {MISSION.map((item, i) => (
            <MotionSection key={item.title} delay={i * 0.06}>
              <div className="abuur-tile h-full p-7">
                <span className="text-sm font-bold text-cl-accent">0{i + 1}</span>
                <h2 className="mt-3 text-xl font-semibold text-cl-text">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-cl-muted">{item.text}</p>
              </div>
            </MotionSection>
          ))}
        </div>
      </section>

      <WhyAbuur />

      <FinalCTA />
    </SiteShell>
  );
}
