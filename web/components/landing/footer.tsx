import Link from "next/link";
import { ArrowRight, Mail, MapPin, MessageCircle } from "lucide-react";
import { Logo } from "./logo";
import { CONTACT_EMAIL, routes } from "@/lib/routes";

const COLUMNS = [
  {
    title: "Platform",
    links: [
      { label: "Online Store Builder", href: `${routes.features}#store` },
      { label: "Product Management", href: `${routes.features}#products` },
      { label: "WhatsApp Ordering", href: `${routes.features}#whatsapp` },
      { label: "Order Dashboard", href: `${routes.features}#orders` },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: routes.about },
      { label: "Pricing", href: routes.pricing },
      { label: "How It Works", href: routes.howItWorks },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact Us", href: routes.contact },
      { label: "Business Login", href: routes.login },
      { label: "Privacy Policy", href: routes.privacy },
      { label: "Terms of Service", href: routes.terms },
    ],
  },
];

export function Footer() {
  return (
    <footer className="site-footer relative overflow-hidden border-t border-cl-border">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cl-blue/60 to-transparent" />
      <div className="cl-container grid gap-12 py-16 lg:grid-cols-[1.3fr_2fr]">
        <div>
          <Logo />
          <p className="site-footer__text mt-5 max-w-sm text-sm leading-relaxed">
            Online stores, WhatsApp ordering and order management built for Somali businesses.
          </p>
          <Link href={routes.register} className="cl-btn cl-btn-primary group mt-6 !min-h-11 !rounded-full text-sm">
            Open your store free
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <ul className="mt-8 space-y-3 text-sm">
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 shrink-0 text-cl-accent" />
              <a href={`mailto:${CONTACT_EMAIL}`} className="site-footer__link">
                {CONTACT_EMAIL}
              </a>
            </li>
            <li className="flex items-center gap-2.5 text-cl-muted">
              <MapPin className="h-4 w-4 shrink-0 text-cl-accent" />
              Mogadishu, Somalia
            </li>
            <li className="flex items-center gap-2.5 text-cl-muted">
              <MessageCircle className="h-4 w-4 shrink-0 text-cl-accent" />
              Support on WhatsApp for every business
            </li>
          </ul>
        </div>
        <div className="grid gap-10 sm:grid-cols-3">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="site-footer__heading">{col.title}</p>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="site-footer__link text-sm">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Oversized wordmark */}
      <div aria-hidden className="pointer-events-none select-none overflow-hidden">
        <p className="cl-container -mb-[0.18em] bg-gradient-to-b from-cl-blue/25 to-transparent bg-clip-text text-center text-[22vw] font-black leading-none tracking-tighter text-transparent lg:text-[15rem]">
          ABUUR
        </p>
      </div>

      <div className="site-footer__divider relative">
        <div className="cl-container flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="site-footer__bottom">© {new Date().getFullYear()} ABUUR Digital. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href={routes.privacy} className="site-footer__link text-sm">
              Privacy
            </Link>
            <Link href={routes.terms} className="site-footer__link text-sm">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
