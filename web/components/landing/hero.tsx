import Link from "next/link";
import { ArrowRight, CheckCircle2, PlayCircle } from "lucide-react";
import { MotionSection } from "@/components/ui/motion-section";
import { routes } from "@/lib/routes";
import { HeroShowcase } from "./hero-showcase";

const PROOF = ["Free to start", "No payment gateway", "Works on every phone"];

/** Centered hero with gradient title, glow and floating phone mockups
 *  over a browser-window storefront (layout adapted from 21st.dev "Hero with Mockup"). */
export function Hero() {
  return (
    <section id="home" className="hero-section relative -mt-[4.75rem] overflow-hidden pt-[4.75rem]">
      <div className="hero-bg" aria-hidden>
        <div className="hero-bg__gradient" />
      </div>
      <div className="abuur-grid-bg pointer-events-none absolute inset-0" aria-hidden />

      <div className="cl-container relative z-[2] flex flex-col items-center pt-14 text-center sm:pt-20 lg:pt-24">
        <MotionSection>
          <Link href={routes.features} className="abuur-pill abuur-focus transition hover:bg-cl-blue-light">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 motion-reduce:hidden" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Built for Somali businesses
            <ArrowRight size={14} />
          </Link>
        </MotionSection>

        <MotionSection delay={0.08}>
          <h1 className="mx-auto mt-6 max-w-4xl text-[2.6rem] font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            <span className="abuur-title-gradient">Your shop online.</span>
            <br />
            <span className="abuur-title-gradient">Orders on </span>
            <span className="hero-highlight">WhatsApp.</span>
          </h1>
        </MotionSection>

        <MotionSection delay={0.16}>
          <p className="cl-subtext mx-auto mt-6 max-w-2xl text-base sm:text-lg">
            ABUUR Digital gives your business its own online store and a simple product
            catalogue. Customers fill a cart, the order lands in your WhatsApp, and every order
            is tracked in one dashboard.
          </p>
        </MotionSection>

        <MotionSection delay={0.24}>
          <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
            <Link href={routes.register} className="cl-btn cl-btn-primary group !min-h-12 !px-6">
              Open your store free
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link href={routes.howItWorks} className="cl-btn cl-btn-secondary !min-h-12 !px-6">
              <PlayCircle size={18} />
              See how it works
            </Link>
          </div>
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-cl-muted">
            {PROOF.map((item) => (
              <li key={item} className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-cl-success" />
                {item}
              </li>
            ))}
          </ul>
        </MotionSection>

        <div className="relative mt-12 w-full pb-6 sm:mt-16">
          <div className="abuur-glow top-[12%]" aria-hidden />
          <HeroShowcase />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-16 bg-gradient-to-t from-cl-main to-transparent" />
    </section>
  );
}
