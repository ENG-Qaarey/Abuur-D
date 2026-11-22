import Link from "next/link";
import { ArrowRight, CheckCircle2, PlayCircle } from "./icons";
import { getCurrentUser } from "@/lib/session";
import { routes, roleRoutes } from "@/lib/routes";
import { HeroShowcase } from "./hero-showcase";
import { HeroMotion } from "./hero-motion";
import { HeroBackdrop } from "./hero-backdrop";
import { ClaimLink } from "./claim-link";

const PROOF = ["Free to start", "No payment gateway", "Works on every phone"];

/** Each word sits in its own clipping box so it can rise into place. */
function Words({ text, className = "" }: { text: string; className?: string }) {
  return text.split(" ").map((word, i) => (
    <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-bottom">
      <span data-hero-word className={`inline-block ${className}`}>
        {word}
      </span>
      {" "}
    </span>
  ));
}

export async function Hero() {
  const user = await getCurrentUser();
  const signedIn = !!user;
  return (
    <section id="home" className="hero-section relative -mt-[4.75rem] overflow-hidden pt-[4.75rem]">
      <HeroBackdrop />
      <HeroMotion className="cl-container relative z-[2] flex flex-col items-center pt-14 text-center sm:pt-20 lg:pt-24">
        <div data-hero="pill">
          <Link href={routes.services} className="abuur-pill abuur-focus transition hover:bg-cl-blue-light">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 motion-reduce:hidden" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Built for Somali businesses
            <ArrowRight size={14} />
          </Link>
        </div>

        <h1
          data-hero="title"
          aria-label="Your shop online. Orders on WhatsApp."
          className="mx-auto mt-6 max-w-4xl text-[2.6rem] font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
        >
          <span aria-hidden>
            <Words text="Your shop online." className="abuur-title-gradient" />
            <br />
            <Words text="Orders on" className="abuur-title-gradient" />
            <Words text="WhatsApp." className="hero-highlight" />
          </span>
        </h1>

        <p data-hero="sub" className="cl-subtext mx-auto mt-6 max-w-2xl text-base sm:text-lg">
          ABUUR Digital gives your business its own online store and a simple product catalogue.
          Customers fill a cart, the order lands in your WhatsApp, and every order is tracked in one
          dashboard.
        </p>

        <div data-hero="cta" className="mt-9 flex w-full flex-col items-center">
          <ClaimLink href={user ? `${roleRoutes[user.platformRole as keyof typeof roleRoutes]}#new-business` : routes.register} />
          <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-cl-muted">
            {PROOF.map((item) => (
              <li key={item} className="inline-flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-cl-success" />
                {item}
              </li>
            ))}
            <li>
              <Link href={routes.howItWorks} className="inline-flex items-center gap-1.5 font-medium text-cl-blue hover:underline">
                <PlayCircle size={15} />
                See how it works
              </Link>
            </li>
          </ul>
        </div>

        <div data-hero="show" className="relative mt-12 w-full pb-6 [perspective:1400px] sm:mt-16">
          <div className="abuur-glow top-[12%]" aria-hidden />
          <div data-hero="tilt" className="origin-top">
            <HeroShowcase />
          </div>
        </div>
      </HeroMotion>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-16 bg-gradient-to-t from-cl-main to-transparent" />
    </section>
  );
}
