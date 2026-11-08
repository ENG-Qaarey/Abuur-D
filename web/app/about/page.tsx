import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageSquare } from "lucide-react";
import { SiteShell } from "@/components/landing/site-shell";
import { PageHero } from "@/components/landing/page-hero";
import { SectionIntro, WhyAbuur } from "@/components/landing/home-sections";
import { ContactForm } from "@/components/landing/contact-form";
import { FinalCTA } from "@/components/landing/final-cta";
import { MotionSection } from "@/components/ui/motion-section";
import { CONTACT_EMAIL } from "@/lib/routes";

export const metadata: Metadata = {
  title: "About & Contact | ABUUR Digital",
  description:
    "ABUUR Digital helps Somali businesses sell online with their own store, WhatsApp ordering and an order dashboard.",
};

const CONTACT_DETAILS = [
  { icon: Mail, title: "Email", text: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
  { icon: MapPin, title: "Location", text: "Mogadishu, Somalia" },
  { icon: Clock, title: "Response time", text: "We usually reply within 1–2 business days." },
];

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

      <section id="contact" className="section-main scroll-mt-24 py-20 sm:py-28">
        <div className="cl-container">
          <MotionSection>
            <SectionIntro
              pill="Contact us"
              title="Let's get your shop online"
              subtitle="Want to open a store, or need help with your account? Send us a message."
            />
          </MotionSection>

          <div className="mt-12 grid items-start gap-10 lg:grid-cols-5 lg:gap-12">
            <MotionSection className="lg:col-span-2">
              <div className="space-y-4">
                {CONTACT_DETAILS.map(({ icon: Icon, title, text, href }) => (
                  <div key={title} className="abuur-tile flex gap-4 p-5">
                    <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cl-blue-light text-cl-blue">
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-cl-text">{title}</p>
                      {href ? (
                        <a href={href} className="mt-1 block text-sm text-cl-muted hover:text-cl-blue">
                          {text}
                        </a>
                      ) : (
                        <p className="mt-1 text-sm text-cl-muted">{text}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-cl-border bg-cl-main/50 p-5">
                <div className="flex items-start gap-3">
                  <MessageSquare className="mt-0.5 h-5 w-5 shrink-0 text-cl-blue" />
                  <p className="text-sm leading-relaxed text-cl-muted">
                    Messages go straight to the ABUUR team&apos;s inbox. We&apos;ll only use your
                    details to reply to you.
                  </p>
                </div>
              </div>
            </MotionSection>

            <MotionSection delay={0.08} className="lg:col-span-3">
              <ContactForm />
            </MotionSection>
          </div>
        </div>
      </section>
      <FinalCTA />
    </SiteShell>
  );
}
