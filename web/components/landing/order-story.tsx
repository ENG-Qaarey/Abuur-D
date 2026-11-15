"use client";

import { useRef } from "react";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  ClipboardList,
  Footprints,
  Lock,
  MessageCircle,
  Minus,
  Mic,
  Plus,
  Search,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Store,
  type LucideIcon,
} from "lucide-react";
import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/components/motion/gsap";
import { StoryFloaters, StoryRings } from "./story-backdrop";

/* ------------------------------------------------------------------ screens */
/* Realistic phone screens, in light UI like a real phone. Height-agnostic so the
   same markup works in the pinned phone and in the stacked mobile cards. */

function StatusBar({ dark = false }: { dark?: boolean }) {
  return (
    <div className={`flex items-center justify-between px-5 pb-1 pt-3 text-[0.65rem] font-semibold ${dark ? "text-white" : "text-slate-900"}`}>
      <span>10:24</span>
      <span className="flex items-center gap-1">
        <span className="flex items-end gap-[2px]">
          {[3, 5, 7, 9].map((h) => (
            <span key={h} className={`w-[3px] rounded-sm ${dark ? "bg-white" : "bg-slate-900"}`} style={{ height: h }} />
          ))}
        </span>
        <span className={`ml-1 h-2.5 w-5 rounded-[3px] border ${dark ? "border-white" : "border-slate-900"} p-[1px]`}>
          <span className={`block h-full w-3/4 rounded-[1px] ${dark ? "bg-white" : "bg-slate-900"}`} />
        </span>
      </span>
    </div>
  );
}

const PRODUCTS = [
  { icon: Shirt, name: "Silk Diric Dress", price: 45, hue: "#3b82f6" },
  { icon: Sparkles, name: "Oud Perfume", price: 35, hue: "#a855f7" },
  { icon: ShoppingBag, name: "Leather Handbag", price: 60, hue: "#f59e0b" },
  { icon: Footprints, name: "Comfort Sandals", price: 22, hue: "#ef4444" },
];

function StoreScreen() {
  return (
    <div className="flex h-full flex-col bg-white text-slate-900">
      <StatusBar />
      <div className="mx-3 mt-1 flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-[0.62rem] text-slate-500">
        <Lock size={9} className="text-emerald-600" />
        abuur.so/hodan-fashion
      </div>
      <div className="flex items-center gap-2.5 px-4 pt-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#0d6efd] text-xs font-bold text-white">
          HF
        </span>
        <span className="leading-tight">
          <span className="block text-sm font-bold">Hodan Fashion</span>
          <span className="flex items-center gap-1 text-[0.65rem] text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Open now, Mogadishu
          </span>
        </span>
      </div>
      <div className="mx-4 mt-3 flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-[0.7rem] text-slate-400">
        <Search size={12} /> Search dresses, perfume…
      </div>
      <div className="grid grid-cols-2 gap-2.5 px-4 pt-3">
        {PRODUCTS.map(({ icon: Icon, name, price, hue }) => (
          <div key={name} className="rounded-xl border border-slate-200 p-1.5">
            <div className="flex h-16 items-center justify-center rounded-lg" style={{ background: `radial-gradient(circle at 30% 20%, ${hue}40, ${hue}10 70%)` }}>
              <Icon size={24} style={{ color: hue }} strokeWidth={1.6} />
            </div>
            <p className="mt-1.5 truncate text-[0.65rem] font-medium">{name}</p>
            <div className="mt-0.5 flex items-center justify-between">
              <span className="text-xs font-bold">${price}</span>
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#0d6efd] text-white">
                <Plus size={11} />
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-auto p-3">
        <div className="flex items-center justify-between rounded-xl bg-slate-900 px-3.5 py-2.5 text-white">
          <span className="flex items-center gap-2 text-xs">
            <ShoppingCart size={14} /> 3 items
          </span>
          <span className="text-xs font-semibold">View cart · $115</span>
        </div>
      </div>
    </div>
  );
}

const CART = [
  { name: "Silk Diric Dress", detail: "Size M, navy", qty: 1, price: 45, icon: Shirt, hue: "#3b82f6" },
  { name: "Oud Perfume", detail: "50 ml", qty: 2, price: 35, icon: Sparkles, hue: "#a855f7" },
];

function CartScreen() {
  return (
    <div className="flex h-full flex-col bg-slate-50 text-slate-900">
      <StatusBar />
      <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <ArrowLeft size={16} />
        <span className="text-sm font-bold">Your cart</span>
        <span className="ml-auto text-[0.65rem] text-slate-500">Hodan Fashion</span>
      </div>
      <ul className="space-y-2.5 p-4">
        {CART.map(({ name, detail, qty, price, icon: Icon, hue }) => (
          <li key={name} data-line-item className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg" style={{ background: `${hue}18` }}>
              <Icon size={20} style={{ color: hue }} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-semibold">{name}</span>
              <span className="block text-[0.65rem] text-slate-500">{detail}</span>
              <span className="mt-1 inline-flex items-center gap-2 rounded-md border border-slate-200 px-1.5 text-[0.65rem]">
                <Minus size={9} /> <b>{qty}</b> <Plus size={9} />
              </span>
            </span>
            <span className="text-xs font-bold">${qty * price}</span>
          </li>
        ))}
      </ul>
      <div data-line-item className="mx-4 rounded-xl border border-dashed border-slate-300 p-3 text-[0.65rem] leading-relaxed text-slate-500">
        Delivery and payment are agreed with the shop on WhatsApp: EVC Plus, Zaad, Sahal or cash.
      </div>
      <div className="mt-auto space-y-2.5 border-t border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Total</span>
          <span className="text-lg font-bold">$115</span>
        </div>
        <div className="flex items-center justify-center gap-2 rounded-xl bg-[#25d366] py-2.5 text-xs font-bold text-[#052e16]">
          <MessageCircle size={15} /> Order on WhatsApp
        </div>
      </div>
    </div>
  );
}

function ChatScreen() {
  return (
    <div className="flex h-full flex-col bg-[#efeae2] text-slate-900">
      <div className="bg-[#008069] text-white">
        <StatusBar dark />
        <div className="flex items-center gap-2.5 px-3 pb-2.5 pt-1">
          <ArrowLeft size={16} />
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-[0.65rem] font-bold">HF</span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold">Hodan Fashion</span>
            <span className="block text-[0.62rem] text-white/80">online</span>
          </span>
        </div>
      </div>
      <div className="flex-1 space-y-2.5 p-3 text-[0.7rem] leading-relaxed">
        <p className="mx-auto w-fit rounded-md bg-white/80 px-2 py-0.5 text-[0.6rem] text-slate-500">Today</p>
        <div data-bubble className="ml-auto w-[85%] rounded-lg rounded-tr-none bg-[#d9fdd3] px-2.5 py-2 shadow-sm">
          <p>Salaam! I&apos;d like to order from your ABUUR store:</p>
          <p className="mt-1.5">
            1 × Silk Diric Dress (M) $45
            <br />2 × Oud Perfume $70
          </p>
          <p className="mt-1.5 font-semibold">Total: $115</p>
          <p className="mt-1.5 text-slate-600">Name: Amina · Area: Hodan</p>
          <p className="mt-1 flex items-center justify-end gap-1 text-[0.58rem] text-slate-500">
            10:24 <CheckCheck size={12} className="text-[#53bdeb]" />
          </p>
        </div>
        <div data-bubble className="w-[80%] rounded-lg rounded-tl-none bg-white px-2.5 py-2 shadow-sm">
          <p>Wa calaykum salaam Amina, order received. Delivery today before 4pm. EVC Plus or cash is fine.</p>
          <p className="mt-1 text-right text-[0.58rem] text-slate-500">10:26</p>
        </div>
        <div data-bubble className="ml-auto w-fit rounded-lg rounded-tr-none bg-[#d9fdd3] px-2.5 py-2 shadow-sm">
          <p>EVC sent. Mahadsanid!</p>
          <p className="mt-1 flex items-center justify-end gap-1 text-[0.58rem] text-slate-500">
            10:27 <CheckCheck size={12} className="text-[#53bdeb]" />
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 p-2">
        <span className="flex-1 rounded-full bg-white px-3 py-2 text-[0.65rem] text-slate-400">Message</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00a884] text-white">
          <Mic size={14} />
        </span>
      </div>
    </div>
  );
}

const STAGES = [
  { label: "New", time: "10:24" },
  { label: "Confirmed", time: "10:26" },
  { label: "Preparing", time: "10:40" },
  { label: "Ready", time: "11:15" },
  { label: "Dispatched", time: "12:30" },
  { label: "Delivered", time: "13:42" },
];

function DashboardScreen() {
  return (
    <div className="flex h-full flex-col bg-slate-50 text-slate-900">
      <StatusBar />
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-3">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#0d6efd] text-[0.6rem] font-bold text-white">A</span>
        <span className="text-sm font-bold">Orders</span>
        <span className="ml-auto rounded-full bg-[#0d6efd]/10 px-2 py-0.5 text-[0.6rem] font-semibold text-[#0d6efd]">Hodan Fashion</span>
      </div>
      <div className="m-3 rounded-xl border border-slate-200 bg-white p-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-bold">Order #1042</p>
            <p className="text-[0.65rem] text-slate-500">Amina · +252 61 ••• ••42 · Hodan</p>
          </div>
          <p className="text-sm font-bold">$115</p>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[0.62rem]">
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">via WhatsApp</span>
          <span data-paid className="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-700">Paid · EVC Plus</span>
        </div>
      </div>
      <ol className="mx-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
        {STAGES.map((s, i) => (
          <li key={s.label} data-stage className="relative flex items-center gap-3 py-1.5">
            {i < STAGES.length - 1 && <span className="absolute left-[9px] top-[22px] h-[calc(100%-10px)] w-px bg-slate-200" />}
            <span className="relative flex h-[19px] w-[19px] items-center justify-center rounded-full border border-slate-300 bg-white">
              <span data-dot className="absolute inset-0 flex items-center justify-center rounded-full bg-emerald-500 text-white">
                <Check size={11} strokeWidth={3} />
              </span>
            </span>
            <span className="text-xs font-medium">{s.label}</span>
            <span className="ml-auto text-[0.62rem] text-slate-400">{s.time}</span>
          </li>
        ))}
      </ol>
      <p className="px-4 pb-1.5 pt-3 text-[0.62rem] font-semibold text-slate-500">Earlier today</p>
      <ul className="mx-3 space-y-1.5">
        {[
          { id: "#1041", who: "Faadumo · Wadajir", total: "$60", status: "Dispatched", tone: "bg-sky-100 text-sky-700" },
          { id: "#1040", who: "Cabdi · Hodan", total: "$22", status: "Delivered", tone: "bg-emerald-100 text-emerald-700" },
        ].map((o) => (
          <li key={o.id} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2">
            <span className="leading-tight">
              <span className="block text-[0.7rem] font-semibold">{o.id}</span>
              <span className="block text-[0.6rem] text-slate-500">{o.who}</span>
            </span>
            <span className={`ml-auto rounded-full px-2 py-0.5 text-[0.58rem] font-semibold ${o.tone}`}>{o.status}</span>
            <span className="w-8 text-right text-[0.7rem] font-bold">{o.total}</span>
          </li>
        ))}
      </ul>
      <p className="mt-auto p-3 text-center text-[0.6rem] text-slate-400">Every order saved, even if the chat gets buried.</p>
    </div>
  );
}

/* ------------------------------------------------------------------- scenes */

const SCENES: { icon: LucideIcon; title: string; text: string; Screen: () => React.JSX.Element }[] = [
  {
    icon: Store,
    title: "A customer opens your link",
    text: "From your WhatsApp status, TikTok or Facebook. Your store opens in the browser: no app, no sign-up.",
    Screen: StoreScreen,
  },
  {
    icon: ShoppingCart,
    title: "They fill the cart",
    text: "Sizes, quantities and the total are clear before anything is sent.",
    Screen: CartScreen,
  },
  {
    icon: MessageCircle,
    title: "The order lands in your WhatsApp",
    text: "Written out in full. You reply, agree delivery and payment, the way you already work.",
    Screen: ChatScreen,
  },
  {
    icon: ClipboardList,
    title: "Your team tracks it to the door",
    text: "The same order is saved in your dashboard. Move it from New to Delivered and mark it paid.",
    Screen: DashboardScreen,
  },
];

function Phone({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-[2.6rem] border-[10px] border-[#111827] bg-[#111827] shadow-[0_50px_100px_-30px_rgba(13,110,253,0.6)] ring-1 ring-white/10 ${className}`}>
      <span className="absolute left-1/2 top-1.5 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-[#111827]" aria-hidden />
      <div className="relative h-full overflow-hidden rounded-[2rem]">{children}</div>
    </div>
  );
}

function Heading() {
  return (
    <>
      <p className="inline-flex items-center gap-2 rounded-full border border-[#25d366]/40 bg-[#25d366]/10 px-3.5 py-1.5 text-xs font-semibold text-[#4ade80]">
        <MessageCircle size={14} /> One order, start to finish
      </p>
      <h2 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
        From your link to their door
      </h2>
    </>
  );
}

/* -------------------------------------------------------------------- story */

/**
 * Pinned scroll story (desktop, motion allowed): the phone stays put while scroll
 * moves the same order through store → cart → WhatsApp → dashboard.
 * Everywhere else it renders as a plain list of cards.
 */
export function OrderStory() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const mm = gsap.matchMedia();
      mm.add({ desktop: "(min-width: 1024px)", ok: MOTION_OK }, (ctx) => {
        const { desktop, ok } = ctx.conditions as { desktop: boolean; ok: boolean };
        if (!desktop || !ok) {
          el.dataset.mode = "list";
          return;
        }
        el.dataset.mode = "pin";

        const q = gsap.utils.selector(el.querySelector("[data-story-pin]"));
        const screens = q("[data-screen]");
        const captions = q("[data-caption]");
        const bubbles = q("[data-bubble]");
        const lines = q("[data-line-item]");
        const dots = q("[data-dot]");
        const stages = q("[data-stage]");

        gsap.set(screens.slice(1), { autoAlpha: 0, yPercent: 6 });
        gsap.set(captions.slice(1), { opacity: 0.3 });
        gsap.set(dots, { scale: 0 });
        gsap.set(stages, { opacity: 0.45 });
        gsap.set(q("[data-paid]"), { autoAlpha: 0 });


        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            trigger: q("[data-pin]")[0],
            start: "top top",
            end: () => `+=${window.innerHeight * 5}`,
            scrub: 1.5,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // The order travels across the map for the whole story and arrives at "Delivered".
        // Background, driven by the same scroll:
        // floating icons drift at their own parallax speed,
        q("[data-float]").forEach((icon) => {
          const speed = Number((icon as HTMLElement).dataset.speed ?? 1);
          tl.fromTo(icon, { y: speed * 90, rotate: -speed * 6 }, { y: -speed * 140, rotate: speed * 8, ease: "none", duration: 4.4 }, 0);
        });
        // the rings around the phone turn (alternate directions) and grow slightly,
        q("[data-ring]").forEach((ring, i) => {
          tl.fromTo(ring, { rotate: 0, scale: 0.92 }, { rotate: i % 2 ? -140 : 200, scale: 1.04, ease: "none", duration: 4.4, transformOrigin: "50% 50%" }, 0);
        });
        // and each step has its own colour: store and cart blue, WhatsApp and delivery green.
        const pinEl = q("[data-pin]")[0];
        const rings = q("[data-rings]")[0];
        tl.to(pinEl, { backgroundColor: "#081233", duration: 0.5 }, 1)
          .to(pinEl, { backgroundColor: "#04190f", duration: 0.5 }, 2)
          .to(rings, { color: "#25d366", duration: 0.5 }, 2)
          .to(pinEl, { backgroundColor: "#061a1f", duration: 0.5 }, 3);

        for (let i = 1; i < screens.length; i++) {
          tl.to(screens[i - 1], { autoAlpha: 0, yPercent: -5, scale: 0.97, duration: 0.5 }, i)
            .fromTo(screens[i], { autoAlpha: 0, yPercent: 6 }, { autoAlpha: 1, yPercent: 0, duration: 0.5 }, i)
            .to(captions[i - 1], { opacity: 0.3, duration: 0.3 }, i)
            .to(captions[i], { opacity: 1, duration: 0.3 }, i);
        }
        tl.from(lines, { autoAlpha: 0, x: 24, stagger: 0.12, duration: 0.3 }, 1.35)
          .from(bubbles, { autoAlpha: 0, y: 24, scale: 0.92, transformOrigin: "bottom", stagger: 0.25, duration: 0.3 }, 2.35);
        dots.forEach((dot, i) => {
          tl.to(dot, { scale: 1, duration: 0.12, ease: "back.out(2)" }, 3.35 + i * 0.13).to(stages[i], { opacity: 1, duration: 0.12 }, "<");
        });
        tl.to(q("[data-paid]"), { autoAlpha: 1, duration: 0.2 }, ">").to({}, { duration: 0.4 });

        ScrollTrigger.refresh();
        return () => {
          el.dataset.mode = "list";
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} data-mode="list" className="order-story relative overflow-hidden bg-[#050a14]">

      {/* Pinned layout (desktop + motion) */}
      <div data-story-pin className="relative">
        <div data-pin className="relative flex h-screen items-center overflow-hidden bg-[#050a14]">
            <StoryFloaters />
          <div className="cl-container relative grid w-full grid-cols-[1fr_auto] items-center gap-16 xl:gap-24">
            <div className="max-w-lg">
              <Heading />
              <ol className="mt-10 space-y-7">
                {SCENES.map(({ icon: Icon, title, text }, i) => (
                  <li key={title} data-caption className="flex gap-4">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white ${i === 2 ? "bg-[#25d366]" : "bg-cl-blue"}`}>
                      <Icon size={18} />
                    </span>
                    <span>
                      <span className="block text-lg font-semibold text-white">{title}</span>
                      <span className="mt-1 block text-sm leading-relaxed text-blue-100/70">{text}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <div aria-hidden className="relative">
              <StoryRings />
              <Phone className="h-[min(640px,82vh)] w-[min(320px,41vh)]">
                {SCENES.map(({ title, Screen }) => (
                  <div key={title} data-screen className="absolute inset-0">
                    <Screen />
                  </div>
                ))}
              </Phone>
            </div>
          </div>
        </div>
      </div>

      {/* List layout (mobile, reduced motion, no JS) */}
      <div data-story-list className="relative">
        <StoryFloaters />
      <div className="cl-container relative py-20 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <Heading />
        </div>
        <ol className="mt-12 grid gap-6 md:grid-cols-2">
          {SCENES.map(({ icon: Icon, title, text, Screen }, i) => (
            <li key={title} className="flex flex-col rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center gap-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${i === 2 ? "bg-[#25d366]" : "bg-cl-blue"}`}>
                  <Icon size={18} />
                </span>
                <span className="text-sm font-semibold text-blue-200/80">Step {i + 1}</span>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-white">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-blue-100/70">{text}</p>
              <div className="mx-auto mt-5 w-full max-w-[280px]" aria-hidden>
                <Phone className="h-[500px]">
                  <Screen />
                </Phone>
              </div>
            </li>
          ))}
        </ol>
      </div>
      </div>
    </section>
  );
}
