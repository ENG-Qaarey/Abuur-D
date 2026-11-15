import { HeroBackdrop } from "./hero-backdrop";

type PageHeroProps = {
  label?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
};

/** Centered inner-page hero: pill, gradient title, grid + glow backdrop. */
export function PageHero({ label, title, subtitle, children }: PageHeroProps) {
  return (
    <section className="page-hero relative -mt-[4.75rem] overflow-hidden pt-[4.75rem]">
      <HeroBackdrop />
      <div className="cl-container relative z-[1] flex flex-col items-center py-16 text-center sm:py-20 lg:py-24">
        {label && <span className="abuur-pill">{label}</span>}
        <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
          <span className="abuur-title-gradient">{title}</span>
        </h1>
        {subtitle && <p className="cl-subtext mt-5 max-w-2xl text-base sm:text-lg">{subtitle}</p>}
        {children}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-cl-main to-transparent" aria-hidden />
    </section>
  );
}
