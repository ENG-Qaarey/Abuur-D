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
  Rocket,
  Share2,
  ShoppingCart,
  ShieldCheck,
  Smartphone,
  Store,
  UserPlus,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MotionSection } from "@/components/ui/motion-section";
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
      {subtitle && <p className="cl-subtext mt-4 text-base sm:text-lg">{subtitle}</p>}
    </div>
  );
}

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="mt-7 grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-[0.95rem] text-cl-text/90">
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
    description: "Give your business its own storefront with your name, logo and contact details.",
  },
  {
    id: "products",
    icon: Boxes,
    title: "Product Management",
    description: "Add products, prices, photos and categories, and keep stock up to date.",
  },
  {
    id: "whatsapp",
    icon: MessageCircle,
    title: "WhatsApp Ordering",
    description: "Customers fill a cart and send the order straight to your WhatsApp.",
  },
  {
    id: "orders",
    icon: ClipboardList,
    title: "Order Dashboard",
    description: "See every order and move it from New to Delivered as you work.",
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="section-main relative overflow-hidden py-20 sm:py-28">
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

/* ------------------------------------------------------------ how it works */

const STEPS = [
  { icon: UserPlus, title: "Create your account", description: "Sign up with your email in under a minute." },
  { icon: Store, title: "Add your business", description: "Business name, WhatsApp number and store link. We approve it." },
  { icon: Plus, title: "Upload your products", description: "Prices, photos and categories, right from your phone." },
  { icon: Share2, title: "Share & get orders", description: "Share your link. Orders arrive on WhatsApp and in your dashboard." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="section-secondary relative scroll-mt-20 overflow-hidden py-20 sm:py-28">
      <div className="abuur-section-glow -left-60 top-10" aria-hidden />
      <div className="abuur-section-glow -right-60 bottom-0" aria-hidden />
      <div className="cl-container relative">
        <MotionSection>
          <SectionIntro
            pill="How it works"
            title="From sign-up to first order"
            subtitle="Four simple steps. Most shops are ready the same day."
          />
        </MotionSection>
        <ol className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, title, description }, i) => (
            <MotionSection key={title} delay={i * 0.08}>
              <li className="abuur-tile group relative h-full p-6">
                <span className="abuur-step-number pointer-events-none absolute right-3 top-1 select-none" aria-hidden>
                  0{i + 1}
                </span>
                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cl-blue to-[#60a5fa] text-white shadow-[0_10px_30px_-8px_rgba(13,110,253,0.8)] transition-transform group-hover:-rotate-6 group-hover:scale-105">
                  <Icon size={22} />
                </div>
                <p className="relative mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-cl-accent">Step {i + 1}</p>
                <h3 className="relative mt-1.5 text-lg font-semibold text-cl-text">{title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-cl-muted">{description}</p>
              </li>
            </MotionSection>
          ))}
        </ol>
        <MotionSection>
          <div className="mt-14 flex justify-center">
            <Button href={routes.register}>
              <Rocket size={18} />
              Start step 1 now
            </Button>
          </div>
        </MotionSection>
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
          <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-500">Live</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { icon: Package, label: "Products", text: "Dresses, shoes, bags" },
            { icon: MessageCircle, label: "Orders", text: "Sent to +252 61 ··· ····" },
            { icon: Users, label: "Team", text: "Owner, Manager, Staff" },
            { icon: Wallet, label: "Payment", text: "Agreed with the customer" },
          ].map(({ icon: Icon, label, text }) => (
            <div key={label} className="rounded-xl border border-cl-border bg-cl-main/60 p-3.5">
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
    <section id="businesses" className="section-main overflow-hidden py-20 sm:py-28">
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

const LIFECYCLE = ["New", "Confirmed", "Preparing", "Ready", "Dispatched", "Delivered"];

export function OrderDashboardSection() {
  return (
    <section id="orders" className="section-blue relative overflow-hidden py-20 sm:py-28">
      <div className="cl-container grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <MotionSection>
          <SectionIntro
            align="left"
            pill="Order dashboard"
            title="Never lose an order in your chats again"
            subtitle="Every WhatsApp order is also saved in your dashboard, so your whole team knows what to prepare and deliver."
          />
          <ol className="mt-8 grid grid-cols-3 gap-2 sm:grid-cols-6" aria-label="Order steps">
            {LIFECYCLE.map((step, i) => (
              <li key={step} className="flex flex-col items-center gap-2">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-bold ${
                    i === LIFECYCLE.length - 1
                      ? "border-emerald-400/60 bg-emerald-500/15 text-emerald-500"
                      : "border-cl-blue/40 bg-cl-blue-light text-cl-accent"
                  }`}
                >
                  {i === LIFECYCLE.length - 1 ? <CheckCircle2 size={16} /> : i + 1}
                </span>
                <span className="text-center text-xs font-medium text-cl-text">{step}</span>
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

/* --------------------------------------------------------- shopper journey */

const SHOPPER_FLOW = [
  {
    icon: Store,
    title: "Browse the store",
    text: "Shoppers open your link from WhatsApp, TikTok or Facebook. No app, no sign-up.",
  },
  {
    icon: ShoppingCart,
    title: "Fill the cart",
    text: "They pick what they want and see the total straight away.",
  },
  {
    icon: MessageCircle,
    title: "Send on WhatsApp",
    text: "One tap opens WhatsApp with the full order written out, ready to send to you.",
  },
];

function FlowVisual({ step }: { step: number }) {
  if (step === 0) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {["#3b82f6", "#a855f7", "#f59e0b"].map((hue, i) => (
          <div key={hue} className="rounded-lg border border-white/10 bg-white/[0.04] p-1.5">
            <div className="h-12 rounded-md" style={{ background: `radial-gradient(circle at 30% 20%, ${hue}88, ${hue}22 70%)` }} />
            <div className="mt-1.5 h-1.5 w-3/4 rounded bg-white/25" />
            <div className="mt-1 text-[0.65rem] font-bold text-white">${[45, 35, 60][i]}</div>
          </div>
        ))}
      </div>
    );
  }
  if (step === 1) {
    return (
      <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs text-white">
        {[
          ["Silk Diric Dress", "$45"],
          ["Oud Perfume x 2", "$70"],
        ].map(([n, price]) => (
          <div key={n} className="flex justify-between">
            <span className="text-blue-100/80">{n}</span>
            <span className="font-semibold">{price}</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-white/10 pt-2 font-bold">
          <span>Total</span>
          <span>$115</span>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <p className="ml-auto w-fit max-w-[90%] rounded-lg rounded-tr-none bg-[#005c4b] px-3 py-2 text-xs leading-relaxed text-white">
        Salaam! New order:
        <br />1 x Silk Diric Dress
        <br />2 x Oud Perfume
        <br />
        <span className="font-semibold">Total: $115</span>
      </p>
      <p className="w-fit rounded-lg rounded-tl-none bg-white/10 px-3 py-2 text-xs text-white">Confirmed! Delivery today.</p>
    </div>
  );
}

export function ShopperSection() {
  return (
    <section className="relative overflow-hidden bg-[#050a14] py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_10%_20%,rgba(13,110,253,0.3),transparent_60%),radial-gradient(ellipse_50%_60%_at_90%_90%,rgba(37,211,102,0.16),transparent_60%)]" />
      <div className="abuur-grid-bg pointer-events-none absolute inset-0 opacity-60" />
      <div className="cl-container relative">
        <MotionSection>
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#25d366]/40 bg-[#25d366]/10 px-3.5 py-1.5 text-xs font-semibold text-[#4ade80]">
              <MessageCircle size={14} />
              For your customers
            </span>
            <h2 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              Browse. Add to cart.{" "}
              <span className="bg-gradient-to-r from-[#4ade80] to-[#60a5fa] bg-clip-text text-transparent">
                Send on WhatsApp.
              </span>
            </h2>
            <p className="mt-5 text-base leading-relaxed text-blue-100/75 sm:text-lg">
              Ordering from your store is as easy as sending a message, because it is one.
            </p>
          </div>
        </MotionSection>

        <ol className="relative mt-14 grid gap-5 lg:grid-cols-3">
          {SHOPPER_FLOW.map(({ icon: Icon, title, text }, i) => (
            <MotionSection key={title} delay={i * 0.1}>
              <li className="relative flex h-full flex-col rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-6 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)] transition hover:border-[#25d366]/40 hover:bg-white/[0.05]">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-xl text-white ${
                      i === 2 ? "bg-[#25d366]" : "bg-cl-blue"
                    }`}
                  >
                    <Icon size={20} />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-200/70">Step {i + 1}</span>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-blue-100/70">{text}</p>
                <div className="mt-6 flex-1">
                  <FlowVisual step={i} />
                </div>
              </li>
            </MotionSection>
          ))}
        </ol>

        <MotionSection>
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            {[
              { icon: Smartphone, label: "Works on every phone" },
              { icon: Zap, label: "No sign-up for shoppers" },
              { icon: Wallet, label: "Pay the way they like" },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white"
              >
                <Icon size={15} className="text-[#60a5fa]" />
                {label}
              </span>
            ))}
          </div>
        </MotionSection>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------- why */

export const WHY = [
  { icon: MessageCircle, title: "Built around WhatsApp", text: "Your customers already chat with you there. ABUUR turns those chats into organised orders." },
  { icon: Wallet, title: "No payment gateway", text: "Cash on delivery, mobile money or bank transfer: you and your customer decide." },
  { icon: Smartphone, title: "Mobile first", text: "Stores load fast on any phone, even on slower connections." },
  { icon: Users, title: "Made for teams", text: "Owners, managers and staff each get the access they need." },
  { icon: ShieldCheck, title: "Secure by design", text: "Each business's data is kept separate, and important changes are recorded." },
  { icon: Languages, title: "Built for Somalia", text: "Designed with Somali businesses, prices and phone numbers in mind." },
];

export function WhyAbuur() {
  return (
    <section id="why" className="section-secondary relative overflow-hidden py-20 sm:py-28">
      <div className="abuur-section-glow -right-72 top-0" aria-hidden />
      <div className="cl-container relative">
        <MotionSection>
          <SectionIntro
            pill="Why ABUUR"
            title="Made for the way Somalia sells"
            subtitle="We didn't copy a foreign shop builder. We built around how businesses here already work."
          />
        </MotionSection>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {WHY.map(({ icon: Icon, title, text }, i) => (
            <MotionSection key={title} delay={i * 0.05}>
              <SpotlightCard className="group h-full p-7">
                <div className="relative z-[1]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cl-blue/30 bg-cl-blue-light text-cl-accent transition group-hover:scale-110 group-hover:bg-cl-blue group-hover:text-white">
                    <Icon size={22} />
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-cl-text">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-cl-muted">{text}</p>
                </div>
              </SpotlightCard>
            </MotionSection>
          ))}
        </div>
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
    <section id="faq" className="section-main relative overflow-hidden py-20 sm:py-28">
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
              <details key={item.q} className="abuur-faq abuur-tile !transform-none p-0">
                <summary className="flex items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-cl-text">
                  {item.q}
                  <span className="abuur-faq__icon flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cl-border text-cl-accent transition-transform">
                    <Plus size={14} />
                  </span>
                </summary>
                <p className="px-5 pb-5 text-sm leading-relaxed text-cl-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </MotionSection>
      </div>
    </section>
  );
}
