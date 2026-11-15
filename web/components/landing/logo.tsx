import Image from "next/image";
import Link from "next/link";
import { routes } from "@/lib/routes";

/*
 * ABUUR sprout brand. Files live in public/brand/sprout/ (exported from the brand kit).
 * The lockup has a light and a dark version; CSS shows the one that matches the theme
 * (see .brand-on-light / .brand-on-dark in globals.css).
 */
const LOGO_RATIO = 3.192; // width / height of abuur-logo-3d-*.svg

/** The 3D app-icon tile on its own. */
export function BrandMark({ size = 44, className = "" }: { size?: number; className?: string }) {
  return (
    <Image
      src="/brand/sprout/abuur-mark-3d.svg"
      alt=""
      aria-hidden
      width={size}
      height={size}
      unoptimized
      className={`shrink-0 ${className}`}
    />
  );
}

/** Full lockup: 3D sprout + ABUUR DIGITAL, switching with the colour theme. */
export function BrandLockup({ height = 40, className = "" }: { height?: number; className?: string }) {
  const width = Math.round(height * LOGO_RATIO);
  return (
    <span className={`relative inline-flex shrink-0 ${className}`} style={{ width, height }} aria-hidden>
      <Image src="/brand/sprout/abuur-logo-3d-dark.svg" alt="" width={width} height={height} unoptimized priority className="brand-on-dark" />
      <Image src="/brand/sprout/abuur-logo-3d-light.svg" alt="" width={width} height={height} unoptimized priority className="brand-on-light" />
    </span>
  );
}

type LogoProps = {
  className?: string;
  href?: string;
  height?: number;
};

export function Logo({ className = "", href = routes.home, height = 44 }: LogoProps) {
  return (
    <Link href={href} aria-label="ABUUR Digital home" className={`inline-flex items-center ${className}`}>
      <BrandLockup height={height} />
    </Link>
  );
}
