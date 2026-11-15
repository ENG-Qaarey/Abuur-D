import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageSquare } from "lucide-react";
import { SiteShell } from "@/components/landing/site-shell";
import { PageHero } from "@/components/landing/page-hero";
import { ContactForm } from "@/components/landing/contact-form";
import { FAQSection } from "@/components/landing/home-sections";
import { MotionSection } from "@/components/ui/motion-section";
import { CONTACT_EMAIL } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Contact | ABUUR Digital",
  description: "Talk to the ABUUR Digital team about opening your online store or getting help with your account.",
};

const CONTACT_DETAILS = [
  { icon: Mail, title: "Email", text: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
  { icon: MapPin, title: "Location", text: "Mogadishu, Somalia" },
  { icon: Clock, title: "Response time", text: "We usually reply within 1–2 business days." },
];

export default function ContactPage() {
  return (
    <SiteShell>
      <PageHero
        label="Contact"
        title="Let's get your shop online"
        subtitle="Want to open a store, or need help with your account? Send us a message and the ABUUR team will reply."
      />

      <section id="contact" className="section-main scroll-mt-24 pb-20 pt-4 sm:pb-28">
        <div className="cl-container">

          <div className="grid items-start gap-10 lg:grid-cols-5 lg:gap-12">
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
      <FAQSection />
    </SiteShell>
  );
}
