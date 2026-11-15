"use client";

import { useRef } from "react";
import { LayoutDashboard, MessageCircle, PackagePlus, Share2, ShoppingCart, Store } from "lucide-react";
import { gsap, MOTION_OK, useGSAP } from "@/components/motion/gsap";

const STEPS = [
  { icon: Store, title: "Create Store", text: "Sign up, name your business and claim your abuur.so store link.", tag: "Store link" },
  { icon: PackagePlus, title: "Add Products", text: "Upload photos, prices and stock so customers see what you sell.", tag: "Catalogue" },
  { icon: Share2, title: "Share Link", text: "Post your link on WhatsApp, TikTok, Instagram and Facebook.", tag: "Visitors" },
  { icon: ShoppingCart, title: "Customer Orders", text: "Shoppers pick products and quantities and fill their cart.", tag: "Full cart" },
  { icon: MessageCircle, title: "WhatsApp Chat", text: "The order arrives on your WhatsApp; you agree delivery and payment.", tag: "Order" },
  { icon: LayoutDashboard, title: "Track & Grow", text: "Every order is saved in your dashboard so your team can follow up.", tag: "Record" },
];

/**
 * "How it works": six steps on a line that fills as the visitor scrolls,
 * each step lighting up when the line reaches it.
 */
export function OrderSteps() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from("[data-steps-head]", {
          y: 40,
          autoAlpha: 0,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: { trigger: "[data-steps-head]", start: "top 88%", once: true },
        });

        const steps = gsap.utils.toArray<HTMLElement>("[data-step]");
        const tl = gsap.timeline({
          scrollTrigger: { trigger: "[data-steps]", start: "top 85%", end: "bottom 30%", scrub: 1.5 },
        });
        // Desktop line grows left→right, mobile line top→bottom; both share the timeline.
        tl.fromTo("[data-line='x']", { scaleX: 0 }, { scaleX: 1, ease: "none", duration: 1 }, 0);
        tl.fromTo("[data-line='y']", { scaleY: 0 }, { scaleY: 1, ease: "none", duration: 1 }, 0);
        steps.forEach((step, i) => {
          const at = (i / (steps.length - 1 || 1)) * 0.95;
          tl.fromTo(
            step.querySelector("[data-dot]"),
            { backgroundColor: "rgba(13,110,253,0.12)", color: "#0D6EFD", scale: 0.85 },
            { backgroundColor: "#0D6EFD", color: "#ffffff", scale: 1, duration: 0.08, ease: "back.out(2)" },
            at,
          );
          tl.fromTo(step.querySelector("[data-body]"), { autoAlpha: 0.35, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.1 }, at);
        });
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="how-it-works"
      className="order-steps section-secondary relative scroll-mt-20 overflow-hidden py-20 sm:py-28"
      aria-labelledby="steps-title"
    >
      <div className="abuur-grid-bg pointer-events-none absolute inset-0 opacity-60" aria-hidden />
      <div className="cl-container relative">
        <header data-steps-head className="mx-auto max-w-3xl text-center">
          <p className="flex items-center justify-center gap-2.5 text-xs font-bold uppercase tracking-[0.13em] text-cl-blue">
            <span className="h-[3px] w-[27px] shrink-0 bg-current" aria-hidden />
            How It Works
          </p>
          <h2 id="steps-title" className="mt-4 text-3xl font-extrabold tracking-tight text-cl-text sm:text-4xl lg:text-[2.625rem]">
            One Order, <span className="text-cl-blue">Start to Finish</span>
          </h2>
          <p className="mt-4 text-sm text-cl-muted sm:text-base">
            From your first product to a confirmed WhatsApp order, every step happens in one simple flow.
          </p>
        </header>

        <ol data-steps className="relative mt-16 grid gap-10 pl-14 lg:grid-cols-6 lg:gap-6 lg:pl-0">
          {/* Track + progress line */}
          <span className="absolute bottom-2 left-[22px] top-2 w-0.5 bg-cl-border lg:hidden" aria-hidden />
          <span data-line="y" className="absolute bottom-2 left-[22px] top-2 w-0.5 origin-top bg-cl-blue lg:hidden" aria-hidden />
          <span className="absolute left-[8%] right-[8%] top-[22px] hidden h-0.5 bg-cl-border lg:block" aria-hidden />
          <span data-line="x" className="absolute left-[8%] right-[8%] top-[22px] hidden h-0.5 origin-left bg-cl-blue lg:block" aria-hidden />

          {STEPS.map(({ icon: Icon, title, text, tag }, i) => (
            <li key={title} data-step className="group relative transition-transform duration-300 hover:-translate-y-1.5 lg:text-center">
              <span
                data-dot
                className="absolute -left-14 top-0 grid h-11 w-11 place-items-center rounded-full bg-cl-blue text-white ring-8 ring-[var(--steps-bg)] lg:static lg:mx-auto"
              >
                <Icon className="h-5 w-5" />
              </span>
              <div data-body className="lg:mt-5">
                <span className="text-xs font-bold text-cl-blue">Step {i + 1}</span>
                <h3 className="mt-1 text-base font-bold text-cl-text">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-cl-muted">{text}</p>
                <span className="mt-3 inline-block rounded-full border border-cl-border bg-cl-card px-3 py-1 text-[11px] font-semibold text-cl-text shadow-sm">
                  {tag}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
