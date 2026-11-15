import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  ClipboardList,
  Languages,
  MessageCircle,
  Package,
  Plus,
  ShieldCheck,
  Smartphone,
  Store,
  Users,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  MotionSection,
  Stagger,
} from "@/components/ui/motion-section";
import { routes } from "@/lib/routes";
import { FeatureBento } from "./feature-bento";
import { OrdersDashboardMock } from "./mockups";
import { SpotlightCard } from "@/components/ui/spotlight-card";

/* ------------------------------------------------------------ shared intro */

export function SectionIntro({
  pill,
  title,
  subtitle,
  align = "center",
}: {
  pill?: string;
  title: React.ReactNode;
  subtitle?: string;
  align?: "center" | "left";
}) {
  const centered = align === "center";
  return (
    <div className={`max-w-2xl ${centered ? "mx-auto text-center" : ""}`}>
      {pill && <span className="abuur-pill">{pill}</span>}
      <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem]">
        <span className="abuur-title-gradient">{title}</span>
      </h2>
      {subtitle && (
        <p className="cl-subtext mt-4 text-base sm:text-lg">{subtitle}</p>
      )}
    </div>
  );
}

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="mt-7 grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-start gap-2.5 text-[0.95rem] text-cl-text/90"
        >
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cl-success" />
          {item}
        </li>
      ))}
    </ul>
  );
}

/* ---------------------------------------------------------------- features */

export const MODULES = [
  {
    id: "store",
    icon: Store,
    title: "Online Store Builder",
    description:
      "Give your business its own storefront with your name, logo and contact details.",
  },
  {
    id: "products",
    icon: Boxes,
    title: "Product Management",
    description:
      "Add products, prices, photos and categories, and keep stock up to date.",
  },
  {
    id: "whatsapp",
    icon: MessageCircle,
    title: "WhatsApp Ordering",
    description:
      "Customers fill a cart and send the order straight to your WhatsApp.",
  },
  {
    id: "orders",
    icon: ClipboardList,
    title: "Order Dashboard",
    description:
      "See every order and move it from New to Delivered as you work.",
  },
];

export function FeatureGrid() {
  return (
    <section
      id="features"
      className="section-main relative overflow-hidden py-20 sm:py-28"
    >
      <div className="abuur-section-glow -left-72 top-40" aria-hidden />
      <div className="cl-container relative">
        <MotionSection>
          <SectionIntro
            pill="The platform"
            title="Everything you need to sell online"
            subtitle="No developer, no payment gateway, no complicated setup. Just your products, your customers and WhatsApp."
          />
        </MotionSection>
        <div className="mt-14">
          <FeatureBento />
        </div>
      </div>
    </section>
  );
}


/* ---------------------------------------------------------- for businesses */

const OWNER_FEATURES = [
  "Your own store link to share anywhere",
  "Products with photos, prices and stock",
  "Full cart delivered to your WhatsApp",
  "Invite staff with their own roles",
  "Works on any phone, no app needed",
  "Payment agreed your way",
];

function BusinessVisual() {
  return (
    <div className="relative">
      <div className="abuur-glow top-[10%] !h-[360px]" aria-hidden />
      <div className="abuur-tile relative space-y-5 p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cl-blue to-[#60a5fa] text-white shadow-lg">
              <Store size={22} />
            </div>
            <div>
              <p className="text-lg font-bold text-cl-text">Hodan Fashion</p>
              <p className="text-sm text-cl-muted">abuur.so/hodan-fashion</p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-500">
            Live
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { icon: Package, label: "Products", text: "Dresses, shoes, bags" },
            {
              icon: MessageCircle,
              label: "Orders",
              text: "Sent to +252 61 ··· ····",
            },
            { icon: Users, label: "Team", text: "Owner, Manager, Staff" },
            {
              icon: Wallet,
              label: "Payment",
              text: "Agreed with the customer",
            },
          ].map(({ icon: Icon, label, text }) => (
            <div
              key={label}
              className="rounded-xl border border-cl-border bg-cl-main/60 p-3.5"
            >
              <Icon className="h-4 w-4 text-cl-accent" />
              <p className="mt-2 text-sm font-semibold text-cl-text">{label}</p>
              <p className="text-xs text-cl-muted">{text}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-cl-muted">Example store for illustration.</p>
      </div>
    </div>
  );
}

export function ForBusinesses() {
  return (
    <section
      id="businesses"
      className="section-main overflow-hidden py-20 sm:py-28"
    >
      <div className="cl-container grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <MotionSection>
          <BusinessVisual />
        </MotionSection>
        <MotionSection delay={0.1}>
          <SectionIntro
            align="left"
            pill="For business owners"
            title="Turn your shop into an online store"
            subtitle="Clothing, electronics, cosmetics, restaurants, pharmacies: if you sell it, list it on ABUUR and let customers order from their phone."
          />
          <CheckList items={OWNER_FEATURES} />
          <Button href={routes.register} className="mt-9">
            Open your store
            <ArrowRight size={18} />
          </Button>
        </MotionSection>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- order dashboard */

const LIFECYCLE = [
  "New",
  "Confirmed",
  "Preparing",
  "Ready",
  "Dispatched",
  "Delivered",
];

export function OrderDashboardSection() {
  return (
    <section
      id="orders"
      className="section-blue relative overflow-hidden py-20 sm:py-28"
    >
      <div className="cl-container grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <MotionSection>
          <SectionIntro
            align="left"
            pill="Order dashboard"
            title="Never lose an order in your chats again"
            subtitle="Every WhatsApp order is also saved in your dashboard, so your whole team knows what to prepare and deliver."
          />
          <ol
            className="mt-8 grid grid-cols-3 gap-2 sm:grid-cols-6"
            aria-label="Order steps"
          >
            {LIFECYCLE.map((step, i) => (
              <li key={step} className="flex flex-col items-center gap-2">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-bold ${
                    i === LIFECYCLE.length - 1
                      ? "border-emerald-400/60 bg-emerald-500/15 text-emerald-500"
                      : "border-cl-blue/40 bg-cl-blue-light text-cl-accent"
                  }`}
                >
                  {i === LIFECYCLE.length - 1 ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    i + 1
                  )}
                </span>
                <span className="text-center text-xs font-medium text-cl-text">
                  {step}
                </span>
              </li>
            ))}
          </ol>
          <CheckList
            items={[
              "Customer name, phone and cart on every order",
              "Mark payment received yourself",
              "Cancel with a reason, keep the history",
              "See what's new at a glance",
            ]}
          />
        </MotionSection>
        <MotionSection delay={0.1}>
          <div className="relative">
            <div className="abuur-glow top-[15%] !h-[380px]" aria-hidden />
            <div className="relative">
              <OrdersDashboardMock />
            </div>
          </div>
        </MotionSection>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------- why */

export const WHY = [
  {
    icon: MessageCircle,
    title: "Built around WhatsApp",
    text: "Your customers already chat with you there. ABUUR turns those chats into organised orders.",
  },
  {
    icon: Wallet,
    title: "No payment gateway",
    text: "Cash on delivery, mobile money or bank transfer: you and your customer decide.",
  },
  {
    icon: Smartphone,
    title: "Mobile first",
    text: "Stores load fast on any phone, even on slower connections.",
  },
  {
    icon: Users,
    title: "Made for teams",
    text: "Owners, managers and staff each get the access they need.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by design",
    text: "Each business's data is kept separate, and important changes are recorded.",
  },
  {
    icon: Languages,
    title: "Built for Somalia",
    text: "Designed with Somali businesses, prices and phone numbers in mind.",
  },
];

export function WhyAbuur() {
  return (
    <section
      id="why"
      className="section-secondary relative overflow-hidden py-20 sm:py-28"
    >
      <div className="abuur-section-glow -right-72 top-0" aria-hidden />
      <div className="cl-container relative">
        <MotionSection>
          <SectionIntro
            pill="Why ABUUR"
            title="Made for the way Somalia sells"
            subtitle="We didn't copy a foreign shop builder. We built around how businesses here already work."
          />
        </MotionSection>
        <Stagger className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {WHY.map(({ icon: Icon, title, text }) => (
            <SpotlightCard key={title} className="group h-full p-7">
              <div className="relative z-[1]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cl-blue/30 bg-cl-blue-light text-cl-accent transition group-hover:scale-110 group-hover:bg-cl-blue group-hover:text-white">
                  <Icon size={22} />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-cl-text">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-cl-muted">
                  {text}
                </p>
              </div>
            </SpotlightCard>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------- FAQ */

export const FAQS = [
  {
    q: "Do my customers need to install an app or create an account?",
    a: "No. Customers open your store link in any browser, add items to the cart and send the order to your WhatsApp. No app and no sign-up needed.",
  },
  {
    q: "How do I get paid?",
    a: "ABUUR doesn't take payments from your customers. You agree on payment directly with each customer: cash on delivery, mobile money (EVC Plus, Zaad, Sahal) or bank transfer. Then you mark the order as paid in your dashboard.",
  },
  {
    q: "Do I need a website or technical skills?",
    a: "No. You add your business details and products from the dashboard, and ABUUR gives you a ready store link to share.",
  },
  {
    q: "Which WhatsApp number receives the orders?",
    a: "The number you set for your business. You can use your normal WhatsApp or WhatsApp Business.",
  },
  {
    q: "Can my staff help manage orders?",
    a: "Yes. Invite your team as managers or staff. Each person signs in with their own account and sees the business they belong to.",
  },
  {
    q: "Why does my business need approval?",
    a: "The ABUUR team reviews new businesses to keep the platform safe for shoppers. Approval is usually quick, and you can prepare your products in the meantime.",
  },
];

export function FAQSection() {
  return (
    <section
      id="faq"
      className="section-main relative overflow-hidden py-20 sm:py-28"
    >
      <div className="abuur-section-glow -left-72 bottom-0" aria-hidden />
      <div className="cl-container grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
        <MotionSection>
          <SectionIntro
            align="left"
            pill="FAQ"
            title="Questions, answered"
            subtitle="Can't find what you're looking for? Our team is happy to help."
          />
          <Link href={routes.contact} className="cl-btn cl-btn-secondary mt-8">
            Contact us
            <ArrowRight size={16} />
          </Link>
        </MotionSection>
        <MotionSection delay={0.08}>
          <div className="space-y-3">
            {FAQS.map((item) => (
              <details
                key={item.q}
                className="abuur-faq abuur-tile !transform-none p-0"
              >
                <summary className="flex items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-cl-text">
                  {item.q}
                  <span className="abuur-faq__icon flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cl-border text-cl-accent transition-transform">
                    <Plus size={14} />
                  </span>
                </summary>
                <p className="px-5 pb-5 text-sm leading-relaxed text-cl-muted">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </MotionSection>
      </div>
    </section>
  );
}
