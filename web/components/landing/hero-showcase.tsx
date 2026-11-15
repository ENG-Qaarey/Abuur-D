"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Check,
  CheckCheck,
  Lock,
  MapPin,
  MessageCircle,
  Minus,
  Plus,
  Search,
  Share2,
  ShoppingCart,
  Truck,
} from "lucide-react";

/* Example store for illustration only. Photos: Unsplash (free licence), unbranded products. */
const photo = (id: string) => `https://images.unsplash.com/photo-${id}?w=480&h=360&q=70&auto=format&fit=crop`;
const PRODUCTS: { img: string; name: string; price: number; tag?: string }[] = [
  { img: photo("1585487000160-6ebcfceb0d03"), name: "Silk Diric Dress", price: 45, tag: "New" },
  { img: photo("1590874103328-eac38a683ce7"), name: "Woven Handbag", price: 60 },
  { img: photo("1615634260167-c8cdede054de"), name: "Oud Perfume", price: 35, tag: "Popular" },
  { img: photo("1617038220319-276d3cfab638"), name: "Gold Earrings", price: 120 },
  { img: photo("1562273138-f46be4ebdf33"), name: "Comfort Sandals", price: 22 },
  { img: photo("1524592094714-0f0654e20314"), name: "Classic Watch", price: 80 },
];
const CATEGORIES = ["All", "Dresses", "Bags", "Perfume", "Jewellery"];
const STATUS = ["New", "Confirmed", "Delivered"];

/*
 * The demo plays one order on a loop:
 * 0 empty cart → 1 dress added → 2 perfume added → 3 perfume ×2 → 4 "Order on WhatsApp" pressed
 * → 5 message arrives (New) → 6 Confirmed → 7 Delivered.
 * Server render and reduced motion show the finished state (7).
 */
const FINAL = 7;
const TIMING = [900, 1000, 1000, 1000, 800, 1300, 1200, 3300]; // ms spent on steps 0..7

function cartFor(step: number) {
  const items: { name: string; price: number; qty: number }[] = [];
  if (step >= 1) items.push({ name: "Silk Diric Dress", price: 45, qty: 1 });
  if (step >= 2) items.push({ name: "Oud Perfume", price: 35, qty: step >= 3 ? 2 : 1 });
  return items;
}
const ADDING: Record<number, number> = { 1: 0, 2: 2, 3: 2 }; // step → product index being added

function useOrderDemo() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(FINAL);

  useEffect(() => {
    if (reduce) return;
    let current = FINAL;
    let timer: ReturnType<typeof setTimeout>;
    const next = () => {
      current = current === FINAL ? 0 : current + 1;
      setStep(current);
      timer = setTimeout(next, TIMING[current]);
    };
    // Let the hero entrance finish and the finished order stay readable, then replay.
    timer = setTimeout(next, 3800);
    return () => clearTimeout(timer);
  }, [reduce]);

  return reduce ? FINAL : step;
}

function Float({ children, className, delay = 0 }: { children: React.ReactNode; className: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={reduce ? { opacity: 1, y: 0, scale: 1 } : { opacity: 1, scale: 1, y: [0, -10, 0] }}
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

/** Browser-window storefront that plays a WhatsApp order from cart to delivery. */
export function HeroShowcase() {
  const step = useOrderDemo();
  const cart = cartFor(step);
  const count = cart.reduce((n, i) => n + i.qty, 0);
  const total = cart.reduce((n, i) => n + i.qty * i.price, 0);
  const adding = ADDING[step];
  const ordered = step >= 5;
  const status = Math.max(0, step - 5);

  return (
    <div className="relative mx-auto w-full max-w-5xl" role="img" aria-label="Example ABUUR store: a customer fills a cart and sends the order to WhatsApp">
      {/* Animated gradient border ("border beam") around the window */}
      <div className="showcase-beam rounded-[1.15rem] p-px shadow-[0_40px_120px_-30px_rgba(13,110,253,0.6)]">
        <div className="isolate overflow-hidden rounded-[1.1rem] bg-[var(--showcase-bg)]">
          {/* Browser chrome */}
          <div className="flex items-center gap-3 border-b border-cl-border px-4 py-3">
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" />
            </div>
            <div className="mx-auto flex w-full max-w-md items-center justify-center gap-2 rounded-lg border border-cl-border bg-cl-main px-3 py-1.5 text-xs text-cl-muted">
              <Lock size={11} className="text-emerald-500" />
              abuur.so/<span className="font-semibold text-cl-text">hodan-fashion</span>
            </div>
            <span className="hidden h-7 w-7 items-center justify-center rounded-lg border border-cl-border text-cl-muted sm:flex">
              <Share2 size={13} />
            </span>
          </div>

          <div className="grid text-left md:grid-cols-[1fr_270px]">
            {/* Store */}
            <div className="p-4 sm:p-6">
              {/* Cover + store identity */}
              <div className="relative overflow-hidden rounded-2xl border border-cl-border bg-[linear-gradient(120deg,rgba(13,110,253,0.35),rgba(168,85,247,0.25)_55%,rgba(37,211,102,0.2))] p-4">
                <div className="abuur-grid-bg pointer-events-none absolute inset-0 opacity-70" aria-hidden />
                <div className="relative flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cl-blue to-[#60a5fa] text-sm font-bold text-white shadow-lg ring-4 ring-white/10">
                      HF
                    </span>
                    <span>
                      <span className="block font-semibold text-cl-text">Hodan Fashion</span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-cl-muted">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,0.25)]" />
                          Open now
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={11} /> Mogadishu
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Truck size={11} /> Delivery today
                        </span>
                      </span>
                    </span>
                  </div>
                  <div className="hidden items-center gap-2 rounded-xl border border-cl-border bg-cl-main/80 px-3 py-2 text-xs text-cl-muted backdrop-blur sm:flex">
                    <Search size={13} />
                    Search products
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-2 overflow-hidden">
                {CATEGORIES.map((c, i) => (
                  <span
                    key={c}
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                      i === 0 ? "bg-cl-blue text-white shadow-[0_6px_16px_-6px_rgba(13,110,253,0.9)]" : "border border-cl-border text-cl-muted"
                    }`}
                  >
                    {c}
                  </span>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {PRODUCTS.map(({ img, name, price, tag }, i) => {
                  const isAdding = adding === i;
                  return (
                    <motion.div
                      key={name}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className={`showcase-product group rounded-xl border bg-cl-main p-2.5 ${
                        isAdding ? "border-cl-blue shadow-[0_0_0_3px_rgba(13,110,253,0.25)]" : "border-cl-border"
                      } ${i > 3 ? "hidden sm:block" : ""}`}
                    >
                      <div className="relative h-24 overflow-hidden rounded-lg bg-cl-border sm:h-28">
                        <Image
                          src={img}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 45vw, 200px"
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                        />
                        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/35 to-transparent" aria-hidden />
                        {tag && (
                          <span className="absolute left-1.5 top-1.5 rounded-md bg-black/45 px-1.5 py-0.5 text-[0.6rem] font-semibold text-white backdrop-blur">
                            {tag}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 truncate text-xs font-medium text-cl-text">{name}</p>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-sm font-bold text-cl-text">${price}</span>
                        <motion.span
                          animate={isAdding ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                          transition={{ duration: 0.45 }}
                          className={`flex h-6 w-6 items-center justify-center rounded-md text-white transition-colors duration-300 ${
                            isAdding ? "bg-emerald-500" : "bg-cl-blue group-hover:rotate-90"
                          }`}
                          style={{ transitionProperty: "transform, background-color" }}
                        >
                          {isAdding ? <Check size={13} /> : <Plus size={13} />}
                        </motion.span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Cart */}
            <aside className="hidden flex-col border-l border-cl-border bg-cl-main/60 p-5 md:flex">
              <p className="flex items-center gap-2 text-sm font-semibold text-cl-text">
                <ShoppingCart size={15} className="text-cl-accent" />
                Your cart
                <motion.span
                  key={count}
                  initial={{ scale: 1.4 }}
                  animate={{ scale: 1 }}
                  className="ml-auto rounded-full bg-cl-blue-light px-2 py-0.5 text-[0.65rem] font-bold text-cl-accent"
                >
                  {count} {count === 1 ? "item" : "items"}
                </motion.span>
              </p>

              <ul className="mt-4 min-h-[9.5rem] space-y-3">
                <AnimatePresence initial={false} mode="popLayout">
                  {cart.map((item) => (
                    <motion.li
                      key={item.name}
                      layout
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 24 }}
                      transition={{ duration: 0.35 }}
                      className="rounded-lg border border-cl-border bg-cl-card p-2.5"
                    >
                      <p className="text-xs font-medium text-cl-text">{item.name}</p>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 text-cl-muted">
                          <Minus size={11} />
                          <motion.span key={item.qty} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-semibold text-cl-text">
                            {item.qty}
                          </motion.span>
                          <Plus size={11} />
                        </span>
                        <span className="font-semibold text-cl-text">${item.qty * item.price}</span>
                      </div>
                    </motion.li>
                  ))}
                  {cart.length === 0 && (
                    <motion.li
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex h-[9.5rem] flex-col items-center justify-center rounded-lg border border-dashed border-cl-border text-center text-xs text-cl-muted"
                    >
                      <ShoppingCart size={18} className="mb-2 opacity-60" />
                      Tap + to add products
                    </motion.li>
                  )}
                </AnimatePresence>
              </ul>

              <AnimatePresence>
                {ordered && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-3 rounded-lg border border-cl-border bg-cl-card p-3"
                  >
                    <p className="flex items-center justify-between text-xs font-semibold text-cl-text">
                      Order #1042
                      <motion.span
                        key={STATUS[status]}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`rounded-full px-2 py-0.5 text-[0.62rem] font-semibold ${
                          status === 2 ? "bg-emerald-500/15 text-emerald-500" : "bg-cl-blue-light text-cl-accent"
                        }`}
                      >
                        {STATUS[status]}
                      </motion.span>
                    </p>
                    <div className="mt-2.5 flex items-center">
                      {STATUS.map((s, i) => (
                        <div key={s} className="flex flex-1 items-center last:flex-none">
                          <span
                            className={`flex h-4 w-4 items-center justify-center rounded-full text-white transition-colors duration-500 ${
                              i <= status ? "bg-emerald-500" : "bg-cl-border"
                            }`}
                          >
                            {i <= status && <Check size={9} />}
                          </span>
                          {i < STATUS.length - 1 && (
                            <span className="mx-1 h-1 flex-1 overflow-hidden rounded-full bg-cl-border">
                              <span
                                className="block h-full rounded-full bg-emerald-500 transition-[width] duration-700"
                                style={{ width: i < status ? "100%" : "0%" }}
                              />
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-1 flex justify-between text-[0.6rem] text-cl-muted">
                      {STATUS.map((s) => (
                        <span key={s}>{s}</span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-auto pt-5">
                <div className="flex items-center justify-between border-t border-cl-border pt-3 text-sm">
                  <span className="text-cl-muted">Total</span>
                  <motion.span key={total} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="text-lg font-bold text-cl-text">
                    ${total}
                  </motion.span>
                </div>
                <motion.span
                  animate={step === 4 ? { scale: [1, 0.94, 1.03, 1] } : { scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className={`showcase-wa relative mt-3 flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#25d366] py-2.5 text-sm font-semibold text-[#052e16] shadow-[0_10px_30px_-8px_rgba(37,211,102,0.7)] ${
                    step === 4 ? "ring-4 ring-[#25d366]/35" : ""
                  }`}
                >
                  <MessageCircle size={16} />
                  {ordered ? "Order sent" : "Order on WhatsApp"}
                  {ordered && <CheckCheck size={15} />}
                </motion.span>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* WhatsApp message arriving on the owner's phone */}
      <Float className="absolute -bottom-10 -left-8 z-10 hidden lg:block 2xl:-left-56 2xl:bottom-auto 2xl:top-[30%]" delay={0.9}>
        <AnimatePresence mode="wait">
          {ordered && (
            <motion.div
              key="wa"
              initial={{ opacity: 0, scale: 0.85, x: -16 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="w-64 overflow-hidden rounded-2xl border border-white/10 bg-[#0b141a] text-left shadow-2xl"
            >
              <div className="flex items-center gap-2.5 bg-[#202c33] px-3.5 py-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25d366] text-white">
                  <MessageCircle size={15} />
                </span>
                <span className="leading-tight">
                  <span className="block text-sm font-semibold text-white">New order #1042</span>
                  <span className="text-[0.68rem] text-emerald-300">WhatsApp · just now</span>
                </span>
              </div>
              <div className="p-3">
                <p className="ml-auto w-fit rounded-xl rounded-tr-sm bg-[#005c4b] px-3 py-2 text-xs leading-relaxed text-white">
                  1 × Silk Diric Dress · $45
                  <br />2 × Oud Perfume · $70
                  <br />
                  <span className="mt-1 flex items-center justify-between gap-6 font-semibold">
                    Total: $115 <CheckCheck size={14} className="text-sky-300" />
                  </span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Float>

    </div>
  );
}
