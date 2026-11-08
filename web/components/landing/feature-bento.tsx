"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Boxes,
  CheckCheck,
  ClipboardList,
  Copy,
  MessageCircle,
  Store,
  Users,
} from "lucide-react";
import { routes } from "@/lib/routes";

/* ------------------------------------------------------------------ visuals */

const STORE_PRODUCTS = [
  { name: "Diric Dress", price: "$45", hue: "#3b82f6" },
  { name: "Garbasaar", price: "$28", hue: "#10b981" },
  { name: "Leather Bag", price: "$60", hue: "#f59e0b" },
  { name: "Oud Perfume", price: "$35", hue: "#a855f7" },
  { name: "Sandals", price: "$22", hue: "#ef4444" },
  { name: "Gold Set", price: "$120", hue: "#eab308" },
];

function StorefrontVisual() {
  return (
    <div className="overflow-hidden rounded-xl border border-cl-border bg-cl-main/80 shadow-xl">
      <div className="flex items-center gap-2 border-b border-cl-border px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-red-400/80" />
        <span className="h-2 w-2 rounded-full bg-amber-400/80" />
        <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
        <span className="ml-2 flex flex-1 items-center justify-between rounded-md bg-cl-card px-2 py-1 text-[0.7rem] text-cl-muted">
          abuur.so/hodan-fashion
          <Copy size={11} />
        </span>
      </div>
      <div className="p-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cl-blue text-[0.65rem] font-bold text-white">
            HF
          </span>
          <span>
            <span className="block text-xs font-semibold text-cl-text">Hodan Fashion</span>
            <span className="block text-[0.65rem] text-cl-muted">Mogadishu · Open now</span>
          </span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {STORE_PRODUCTS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 + i * 0.08, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-lg border border-cl-border bg-cl-card p-1.5"
            >
              <div className="h-10 rounded-md" style={{ background: `linear-gradient(135deg, ${p.hue}55, ${p.hue}15)` }} />
              <p className="mt-1 truncate text-[0.6rem] font-medium text-cl-text">{p.name}</p>
              <p className="text-[0.6rem] font-semibold text-cl-accent">{p.price}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

const CHAT = [
  { from: "customer", text: "Salaam! I'd like to order:\n1 × Diric Dress, $45\n1 × Garbasaar, $28\nTotal: $73" },
  { from: "shop", text: "Waan helnay! Order #1042 confirmed ✅" },
  { from: "shop", text: "Delivery today to Hodan district. Pay on delivery or EVC." },
] as const;

function WhatsAppVisual() {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? CHAT.length : 1);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setShown((n) => (n >= CHAT.length + 1 ? 1 : n + 1)), 1600);
    return () => clearInterval(id);
  }, [reduce]);

  const visible = CHAT.slice(0, Math.min(shown, CHAT.length));

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-cl-border bg-[#0b141a] shadow-xl">
      <div className="flex items-center gap-2 bg-[#202c33] px-3 py-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cl-blue text-[0.6rem] font-bold text-white">HF</span>
        <span>
          <span className="block text-xs font-semibold text-white">Hodan Fashion</span>
          <span className="block text-[0.6rem] text-emerald-300">online</span>
        </span>
      </div>
      <div className="flex min-h-[170px] flex-1 flex-col gap-2 p-3" aria-live="off">
        <AnimatePresence initial={false}>
          {visible.map((m, i) => (
            <motion.div
              key={`${i}-${m.text.slice(0, 8)}`}
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className={`max-w-[85%] whitespace-pre-line rounded-lg px-2.5 py-1.5 text-[0.7rem] leading-snug text-white ${
                m.from === "customer" ? "self-end bg-[#005c4b]" : "self-start bg-[#202c33]"
              }`}
            >
              {m.text}
              {m.from === "customer" && <CheckCheck size={12} className="ml-1 inline text-sky-300" />}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

const STATUSES = [
  { label: "New", color: "#0d6efd" },
  { label: "Confirmed", color: "#7c3aed" },
  { label: "Preparing", color: "#d97706" },
  { label: "Ready", color: "#0891b2" },
  { label: "Dispatched", color: "#2563eb" },
  { label: "Delivered", color: "#16a34a" },
];

function StatusVisual() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(reduce ? STATUSES.length - 1 : 0);

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setStep((s) => (s + 1) % STATUSES.length), 1300);
    return () => clearInterval(id);
  }, [reduce]);

  return (
    <div className="rounded-xl border border-cl-border bg-cl-main/70 p-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-cl-text">Order #1042</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={STATUSES[step].label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="rounded-full px-2 py-0.5 text-[0.65rem] font-semibold text-white"
            style={{ background: STATUSES[step].color }}
          >
            {STATUSES[step].label}
          </motion.span>
        </AnimatePresence>
      </div>
      <div className="mt-3 flex gap-1" aria-hidden>
        {STATUSES.map((s, i) => (
          <motion.span
            key={s.label}
            className="h-1.5 flex-1 rounded-full"
            animate={{ backgroundColor: i <= step ? STATUSES[step].color : "rgba(148,163,184,0.2)" }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
}

function ProductsVisual() {
  return (
    <ul className="space-y-1.5">
      {STORE_PRODUCTS.slice(0, 3).map((p, i) => (
        <motion.li
          key={p.name}
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 + i * 0.1 }}
          className="flex items-center gap-2 rounded-lg border border-cl-border bg-cl-main/70 px-2 py-1.5 text-xs"
        >
          <span className="h-6 w-6 rounded-md" style={{ background: `linear-gradient(135deg, ${p.hue}66, ${p.hue}22)` }} />
          <span className="flex-1 truncate font-medium text-cl-text">{p.name}</span>
          <span className="font-semibold text-cl-accent">{p.price}</span>
          <span className="rounded bg-emerald-500/15 px-1.5 text-[0.6rem] font-semibold text-emerald-500">{12 - i * 4} left</span>
        </motion.li>
      ))}
    </ul>
  );
}

function TeamVisual() {
  const team = [
    { initials: "HA", role: "Owner", color: "#0d6efd" },
    { initials: "YM", role: "Manager", color: "#7c3aed" },
    { initials: "AS", role: "Staff", color: "#0891b2" },
  ];
  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-2">
        {team.map((m) => (
          <span
            key={m.initials}
            className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-cl-card text-[0.65rem] font-bold text-white"
            style={{ background: m.color }}
          >
            {m.initials}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-1">
        {team.map((m) => (
          <span key={m.role} className="rounded-full border border-cl-border px-2 py-0.5 text-[0.65rem] font-medium text-cl-muted">
            {m.role}
          </span>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- tiles */

type TileProps = {
  className: string;
  icon: typeof Store;
  title: string;
  text: string;
  href: string;
  delay: number;
  children: React.ReactNode;
};

function Tile({ className, icon: Icon, title, text, href, delay, children }: TileProps) {
  return (
    <motion.article
      className={`abuur-tile group flex flex-col p-5 sm:p-6 ${className}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex flex-1 flex-col justify-center">{children}</div>
      <div className="mt-5 flex items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-cl-text">
            <Icon size={18} className="text-cl-accent" />
            {title}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-cl-muted">{text}</p>
        </div>
        <Link
          href={href}
          aria-label={`Learn more about ${title}`}
          className="abuur-focus flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cl-border text-cl-muted transition group-hover:border-cl-blue group-hover:bg-cl-blue group-hover:text-white"
        >
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </motion.article>
  );
}

/** Feature bento grid (layout adapted from 21st.dev "bento grid 01"). */
export function FeatureBento() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
      <Tile
        className="md:col-span-3 md:row-span-2"
        icon={Store}
        title="Online Store Builder"
        text="Your own storefront with your name, logo and a link to share on WhatsApp, TikTok and Facebook."
        href={`${routes.features}#store`}
        delay={0}
      >
        <StorefrontVisual />
      </Tile>
      <Tile
        className="md:col-span-3 md:row-span-2"
        icon={MessageCircle}
        title="WhatsApp Ordering"
        text="Customers fill a cart and send the whole order to your WhatsApp in one tap."
        href={`${routes.features}#whatsapp`}
        delay={0.08}
      >
        <WhatsAppVisual />
      </Tile>
      <Tile
        className="md:col-span-2"
        icon={Boxes}
        title="Products"
        text="Prices, photos, categories and stock."
        href={`${routes.features}#products`}
        delay={0.16}
      >
        <ProductsVisual />
      </Tile>
      <Tile
        className="md:col-span-2"
        icon={ClipboardList}
        title="Order Dashboard"
        text="Move every order from New to Delivered."
        href={`${routes.features}#orders`}
        delay={0.24}
      >
        <StatusVisual />
      </Tile>
      <Tile
        className="md:col-span-2"
        icon={Users}
        title="Your Team"
        text="Owners, managers and staff, each with the right access."
        href={`${routes.features}#orders`}
        delay={0.32}
      >
        <TeamVisual />
      </Tile>
    </div>
  );
}
