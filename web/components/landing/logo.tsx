import Link from "next/link";
import { routes } from "@/lib/routes";

type LogoProps = {
  className?: string;
  href?: string;
};

/** ABUUR mark: a blue "A" tile with a green "online" dot. */
export function BrandMark({ size = 44, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      aria-hidden
      className={`shrink-0 ${className}`}
    >
      <defs>
        <linearGradient id="abuur-mark-g" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6" />
          <stop offset="1" stopColor="#0D6EFD" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#abuur-mark-g)" />
      <path
        d="M19 46 32 16l13 30"
        stroke="#fff"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M24.5 36h15" stroke="#fff" strokeWidth="5.5" strokeLinecap="round" />
      <circle cx="47" cy="17" r="5" fill="#34D399" stroke="#fff" strokeWidth="2.5" />
    </svg>
  );
}

export function Logo({ className = "", href = routes.home }: LogoProps) {
  return (
    <Link href={href} aria-label="ABUUR Digital home" className={`inline-flex items-center gap-2.5 ${className}`}>
      <BrandMark size={44} className="sm:h-12 sm:w-12" />
      <span className="leading-tight">
        <span className="block text-[0.95rem] font-bold tracking-tight text-cl-text sm:text-base">
          ABUUR
        </span>
        <span className="block text-[0.65rem] font-semibold tracking-[0.14em] text-cl-accent sm:text-[0.7rem]">
          DIGITAL
        </span>
      </span>
    </Link>
  );
}
