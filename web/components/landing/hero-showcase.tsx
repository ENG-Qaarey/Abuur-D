"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  CheckCircle2,
  Footprints,
  Gem,
  Lock,
  MessageCircle,
  Minus,
  Plus,
  Search,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Watch,
} from "lucide-react";

const PRODUCTS = [
  { icon: Shirt, name: "Silk Diric Dress", price: 45, hue: "#3b82f6", tag: "New" },
  { icon: ShoppingBag, name: "Leather Handbag", price: 60, hue: "#f59e0b" },
  { icon: Sparkles, name: "Oud Perfume", price: 35, hue: "#a855f7", tag: "Popular" },
  { icon: Gem, name: "Gold Earrings", price: 120, hue: "#eab308" },
  { icon: Footprints, name: "Comfort Sandals", price: 22, hue: "#ef4444" },
  { icon: Watch, name: "Classic Watch", price: 80, hue: "#10b981" },
];

const CATEGORIES = ["All", "Dresses", "Bags", "Perfume", "Jewellery"];

const CART = [
  { name: "Silk Diric Dress", qty: 1, price: 45 },
  { name: "Oud Perfume", qty: 2, price: 35 },
];

function Float({
  children,
  className,
  delay = 0,
  distance = 10,
}: {
  children: React.ReactNode;
  className: string;
  delay?: number;
  distance?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={
        reduce
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 1, scale: 1, y: [0, -distance, 0] }
      }
      transition={
        reduce
          ? { duration: 0.4, delay }
          : {
              opacity: { duration: 0.5, delay },
              scale: { duration: 0.5, delay },
              y: { duration: 5, delay, repeat: Infinity, ease: "easeInOut" },
            }
      }
    >
      {children}
    </motion.div>
  );
}

/** Browser-window storefront with floating order cards (replaces the phone mockups). */
export function HeroShowcase() {
  const total = CART.reduce((sum, item) => sum + item.qty * item.price, 0);

  return (
    <div className="relative mx-auto w-full max-w-5xl" role="img" aria-label="An ABUUR storefront with a cart that sends the order to WhatsApp">
      {/* Browser window */}
      <div className="overflow-hidden rounded-2xl border border-cl-border bg-cl-card shadow-[0_40px_120px_-30px_rgba(13,110,253,0.55)]">
        <div className="flex items-center gap-3 border-b border-cl-border bg-cl-main/70 px-4 py-3">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="mx-auto flex w-full max-w-md items-center justify-center gap-2 rounded-lg border border-cl-border bg-cl-card px-3 py-1.5 text-xs text-cl-muted">
            <Lock size={11} className="text-emerald-500" />
            abuur.so/<span className="font-semibold text-cl-text">hodan-fashion</span>
          </div>
          <div className="hidden w-[52px] sm:block" />
        </div>

        <div className="grid text-left md:grid-cols-[1fr_260px]">
          {/* Store */}
          <div className="p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cl-blue to-[#60a5fa] text-sm font-bold text-white shadow-lg">
                  HF
                </span>
                <span>
                  <span className="block font-semibold text-cl-text">Hodan Fashion</span>
                  <span className="flex items-center gap-1.5 text-xs text-cl-muted">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Open now · Mogadishu
                  </span>
                </span>
              </div>
              <div className="hidden items-center gap-2 rounded-lg border border-cl-border bg-cl-main/60 px-3 py-2 text-xs text-cl-muted sm:flex">
                <Search size={13} />
                Search products
              </div>
            </div>

            <div className="mt-5 flex gap-2 overflow-hidden">
              {CATEGORIES.map((c, i) => (
                <span
                  key={c}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                    i === 0 ? "bg-cl-blue text-white" : "border border-cl-border text-cl-muted"
                  }`}
                >
                  {c}
                </span>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {PRODUCTS.map(({ icon: Icon, name, price, hue, tag }, i) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className={`group rounded-xl border border-cl-border bg-cl-main/50 p-2.5 ${i > 3 ? "hidden sm:block" : ""}`}
                >
                  <div
                    className="relative flex h-20 items-center justify-center rounded-lg sm:h-24"
                    style={{ background: `radial-gradient(circle at 30% 20%, ${hue}55, ${hue}12 70%)` }}
                  >
                    <Icon size={30} style={{ color: hue }} strokeWidth={1.6} />
                    {tag && (
                      <span className="absolute left-1.5 top-1.5 rounded-md bg-cl-card/90 px-1.5 py-0.5 text-[0.6rem] font-semibold text-cl-text">
                        {tag}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 truncate text-xs font-medium text-cl-text">{name}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-sm font-bold text-cl-text">${price}</span>
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-cl-blue text-white">
                      <Plus size={13} />
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Cart */}
          <aside className="hidden flex-col border-l border-cl-border bg-cl-main/40 p-5 md:flex">
            <p className="flex items-center gap-2 text-sm font-semibold text-cl-text">
              <ShoppingCart size={15} className="text-cl-accent" />
              Your cart
              <span className="ml-auto rounded-full bg-cl-blue-light px-2 py-0.5 text-[0.65rem] font-bold text-cl-accent">3 items</span>
            </p>
            <ul className="mt-4 space-y-3">
              {CART.map((item) => (
                <li key={item.name} className="rounded-lg border border-cl-border bg-cl-card p-2.5">
                  <p className="text-xs font-medium text-cl-text">{item.name}</p>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-cl-muted">
                      <Minus size={11} />
                      <span className="font-semibold text-cl-text">{item.qty}</span>
                      <Plus size={11} />
                    </span>
                    <span className="font-semibold text-cl-text">${item.qty * item.price}</span>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-5">
              <div className="flex items-center justify-between border-t border-cl-border pt-3 text-sm">
                <span className="text-cl-muted">Total</span>
                <span className="text-lg font-bold text-cl-text">${total}</span>
              </div>
              <span className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-[#25d366] py-2.5 text-sm font-semibold text-[#052e16] shadow-[0_10px_30px_-8px_rgba(37,211,102,0.7)]">
                <MessageCircle size={16} />
                Order on WhatsApp
              </span>
            </div>
          </aside>
        </div>
      </div>

      {/* Floating cards */}
      <Float className="absolute -left-52 top-[36%] hidden xl:block" delay={0.9}>
        <div className="w-60 rounded-2xl border border-cl-border bg-cl-card/95 p-3.5 text-left shadow-2xl backdrop-blur">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25d366] text-white">
              <MessageCircle size={17} />
            </span>
            <span>
              <span className="block text-sm font-semibold text-cl-text">New WhatsApp order</span>
              <span className="block text-xs text-cl-muted">#1042 · just now</span>
            </span>
          </div>
          <p className="mt-3 rounded-lg bg-[#005c4b] px-3 py-2 text-xs leading-relaxed text-white">
            1 × Silk Diric Dress · $45
            <br />2 × Oud Perfume · $70
            <br />
            <span className="font-semibold">Total: $115</span>
          </p>
        </div>
      </Float>

      <Float className="absolute -right-44 top-[44%] hidden xl:block" delay={1.2} distance={12}>
        <div className="w-56 rounded-2xl border border-cl-border bg-cl-card/95 p-3.5 text-left shadow-2xl backdrop-blur">
          <p className="flex items-center justify-between text-sm font-semibold text-cl-text">
            Order #1039
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[0.65rem] font-semibold text-emerald-500">
              <CheckCircle2 size={11} />
              Delivered
            </span>
          </p>
          <div className="mt-3 flex gap-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="h-1.5 flex-1 rounded-full bg-emerald-500" />
            ))}
          </div>
          <p className="mt-2 text-xs text-cl-muted">New → Delivered in 3 hours</p>
        </div>
      </Float>
    </div>
  );
}
