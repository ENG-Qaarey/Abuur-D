import {
  CheckCheck,
  CircleCheck,
  MessageCircle,
  Package,
  ShoppingBag,
  ShoppingCart,
  Store,
  Truck,
  Wallet,
  type LucideIcon,
} from "./icons";

/**
 * Floating shop icons for the order story. Each has a parallax speed: GSAP moves
 * [data-float] by `data-speed` as the story scrolls (see order-story.tsx).
 * Positions are percentages of the pinned viewport.
 */
const FLOATERS: { icon: LucideIcon; x: number; y: number; size: number; speed: number; tone: "blue" | "green" }[] = [
  { icon: ShoppingBag, x: 6, y: 14, size: 44, speed: -1.2, tone: "blue" },
  { icon: MessageCircle, x: 44, y: 8, size: 38, speed: 0.8, tone: "green" },
  { icon: Package, x: 92, y: 12, size: 48, speed: -0.6, tone: "blue" },
  { icon: ShoppingCart, x: 3, y: 72, size: 40, speed: 1.1, tone: "blue" },
  { icon: CheckCheck, x: 50, y: 86, size: 36, speed: -1.4, tone: "green" },
  { icon: Truck, x: 95, y: 64, size: 46, speed: 0.9, tone: "blue" },
  { icon: Wallet, x: 38, y: 52, size: 30, speed: 1.6, tone: "green" },
  { icon: Store, x: 60, y: 30, size: 34, speed: -0.9, tone: "blue" },
  { icon: CircleCheck, x: 84, y: 90, size: 34, speed: -1.1, tone: "green" },
];

export function StoryFloaters() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {FLOATERS.map(({ icon: Icon, x, y, size, speed, tone }, i) => (
        <span
          key={i}
          data-float
          data-speed={speed}
          className={`absolute flex items-center justify-center rounded-2xl border backdrop-blur-[2px] ${
            tone === "green"
              ? "border-[#25d366]/25 bg-[#25d366]/[0.07] text-[#4ade80]/70"
              : "border-[#3b82f6]/25 bg-[#3b82f6]/[0.07] text-[#93c5fd]/70"
          }`}
          style={{ left: `${x}%`, top: `${y}%`, width: size + 20, height: size + 20 }}
        >
          <Icon size={size * 0.55} strokeWidth={1.6} />
        </span>
      ))}
    </div>
  );
}

/** Dashed rings centred behind the phone; GSAP rotates them and shifts their colour. */
export function StoryRings() {
  return (
    <div data-rings className="pointer-events-none absolute left-1/2 top-1/2 h-0 w-0 text-[#3b82f6]" aria-hidden>
      {[
        { size: 520, dash: "4 10", width: 1.5, opacity: 0.55 },
        { size: 760, dash: "2 14", width: 1.5, opacity: 0.35 },
        { size: 1000, dash: "1 18", width: 2, opacity: 0.22 },
      ].map((ring, i) => (
        <svg
          key={ring.size}
          data-ring={i}
          viewBox="0 0 100 100"
          width={ring.size}
          height={ring.size}
          className="absolute left-0 top-0"
          style={{ opacity: ring.opacity, marginLeft: -ring.size / 2, marginTop: -ring.size / 2 }}
        >
          <circle
            cx="50"
            cy="50"
            r="49"
            fill="none"
            stroke="currentColor"
            strokeWidth={(ring.width * 100) / ring.size}
            strokeDasharray={ring.dash.split(" ").map((n) => (Number(n) * 100) / ring.size).join(" ")}
          />
          {/* A small dot on each ring makes the rotation readable */}
          <circle cx="50" cy="1" r={(5 * 100) / ring.size} fill="currentColor" />
        </svg>
      ))}
    </div>
  );
}
