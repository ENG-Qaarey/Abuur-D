"use client";

import { useRef } from "react";
import { gsap, MOTION_OK, useGSAP } from "@/components/motion/gsap";

type MotionSectionProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

/**
 * Fades its content in once when it scrolls into view (GSAP ScrollTrigger).
 * Content is server-rendered visible, so it stays readable without JS and
 * with reduced motion the animation is skipped entirely.
 */
export function MotionSection({ children, className = "", delay = 0 }: MotionSectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from(ref.current, {
          autoAlpha: 0,
          y: 18,
          duration: 1.1,
          delay,
          ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 88%", once: true },
        });
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

type StaggerProps = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "ol" | "ul";
};

/** Reveals its direct children in a short wave as the group enters the viewport. */
export function Stagger({ children, className = "", as: Tag = "div" }: StaggerProps) {
  const ref = useRef<HTMLDivElement & HTMLOListElement & HTMLUListElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const items = gsap.utils.toArray<HTMLElement>(ref.current!.children);
        gsap.from(items, {
          autoAlpha: 0,
          y: 16,
          scale: 0.97,
          duration: 0.9,
          ease: "power3.out",
          stagger: { each: 0.12, grid: "auto", from: "start" },
          scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}

/**
 * A horizontal line that draws itself as its parent scrolls past.
 * Used to connect sequential steps, so the motion carries meaning (progress).
 */
export function DrawLine({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const fill = ref.current!.firstElementChild;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.fromTo(
          fill,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: { trigger: ref.current!.parentElement, start: "top 85%", end: "bottom 35%", scrub: 1.5 },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} aria-hidden className={`overflow-hidden rounded-full bg-cl-border ${className}`}>
      <div className="h-full w-full origin-left bg-gradient-to-r from-cl-blue to-[#25d366]" />
    </div>
  );
}
