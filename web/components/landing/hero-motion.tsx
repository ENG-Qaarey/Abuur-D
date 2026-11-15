"use client";

import { useRef } from "react";
import { gsap, MOTION_OK, useGSAP } from "@/components/motion/gsap";

/**
 * The hero's single orchestrated entrance: pill → headline words rise → copy → buttons → storefront.
 * Then the storefront tilts from an angled "on the desk" view to flat as the visitor scrolls.
 *
 * `[data-hero]` elements are pre-hidden by CSS (only when JS and motion are available, see globals.css)
 * so there is no flash of the final state before the timeline starts.
 */
export function HeroMotion({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const show = { autoAlpha: 1, y: 0 };
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.fromTo("[data-hero='pill']", { autoAlpha: 0, y: 12 }, { ...show, duration: 0.5 })
          .set("[data-hero='title']", { autoAlpha: 1 })
          .fromTo("[data-hero-word]", { yPercent: 115 }, { yPercent: 0, duration: 0.9, stagger: 0.07, ease: "expo.out" }, "-=0.2")
          .fromTo("[data-hero='sub']", { autoAlpha: 0, y: 14 }, { ...show, duration: 0.6 }, "-=0.55")
          .fromTo("[data-hero='cta']", { autoAlpha: 0, y: 14 }, { ...show, duration: 0.6 }, "-=0.45")
          .fromTo("[data-hero='show']", { autoAlpha: 0, y: 70 }, { ...show, duration: 1.1, ease: "expo.out" }, "-=0.45");

        gsap.fromTo(
          "[data-hero='tilt']",
          { rotateX: 16, scale: 0.93 },
          {
            rotateX: 0,
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: "[data-hero='show']", start: "top 85%", end: "top -15%", scrub: 1.5 },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
