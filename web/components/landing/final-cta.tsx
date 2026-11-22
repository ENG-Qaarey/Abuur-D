"use client";

import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { MotionSection } from "@/components/ui/motion-section";
import { BrandMark } from "./logo";
import { routes } from "@/lib/routes";

/** Glowing CTA panel with animated gradient border. */
export function FinalCTA() {
  return (
    <section id="join" className="section-main py-20 sm:py-24">
      <div className="cl-container">
        <MotionSection>
          <div className="abuur-border-glow relative overflow-hidden rounded-[1.75rem] bg-[#06101f] px-6 py-14 text-center sm:px-12 sm:py-20">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_90%_at_50%_120%,rgba(13,110,253,0.55),transparent_60%)]" />
            <div className="abuur-grid-bg pointer-events-none absolute inset-0 opacity-70" />
            <div className="relative">
              <BrandMark size={56} className="mx-auto block" />
              <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-bold leading-tight text-white sm:text-5xl">
                Your business, online today.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-blue-100/80 sm:text-lg">
                Create your free account, add your business and start receiving orders on
                WhatsApp.
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href={routes.register} className="cl-btn cl-btn-white group !min-h-12 !px-6">
                  Open your store free
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link href={routes.contact} className="cl-btn cl-btn-outline-white !min-h-12 !px-6">
                  <MessageCircle size={18} />
                  Talk to our team
                </Link>
              </div>
            </div>
          </div>
        </MotionSection>
      </div>
    </section>
  );
}
