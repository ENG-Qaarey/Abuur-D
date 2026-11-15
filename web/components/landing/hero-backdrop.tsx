/**
 * The one hero background used site-wide: blue gradient, faint grid and a soft top glow.
 * Place inside a `relative overflow-hidden` section; content needs `relative z-[1]` or higher.
 */
export function HeroBackdrop() {
  return (
    <>
      <div className="hero-bg absolute inset-0" aria-hidden>
        <div className="hero-bg__gradient" />
      </div>
      <div className="abuur-grid-bg pointer-events-none absolute inset-0" aria-hidden />
      <div className="abuur-glow -top-[260px] !h-[420px] opacity-70" aria-hidden />
    </>
  );
}
