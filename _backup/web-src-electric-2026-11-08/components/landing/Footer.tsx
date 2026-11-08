"use client";

import Link from "next/link";
import Image from "next/image";
import { DIcons } from "dicons";
import { Zap } from "lucide-react";

import ThemeToggle from "@/components/ui/footer";
import { APP_NAME } from "@/lib/constants";
import { useBrandSettings } from "@/store/brand-settings.store";

const navigation = {
  categories: [
    {
      id: "main",
      name: "Main",
      sections: [
        {
          id: "company",
          name: "Company",
          items: [
            { name: "About Us", href: "#about" },
            { name: "Features", href: "#features" },
            { name: "Pricing", href: "#pricing" },
            { name: "Contact", href: "#" },
          ],
        },
        {
          id: "product",
          name: "Product",
          items: [
            { name: "Bill Payment", href: "#" },
            { name: "Meter Installation", href: "#" },
            { name: "Outage Reporting", href: "#" },
            { name: "Customer Portal", href: "#" },
          ],
        },
        {
          id: "resources",
          name: "Resources",
          items: [
            { name: "FAQ", href: "#faq" },
            { name: "Blog", href: "#" },
            { name: "API Docs", href: "#" },
            { name: "Support", href: "#" },
          ],
        },
        {
          id: "legal",
          name: "Legal",
          items: [
            { name: "Privacy Policy", href: "#" },
            { name: "Terms of Service", href: "#" },
            { name: "Cookie Policy", href: "#" },
          ],
        },
        {
          id: "partners",
          name: "Partners",
          items: [
            { name: "BECO", href: "#" },
            { name: "Som Power", href: "#" },
            { name: "Telesom Electric", href: "#" },
            { name: "NECSOM", href: "#" },
          ],
        },
        {
          id: "more",
          name: "More",
          items: [
            { name: "Careers", href: "#" },
            { name: "Press Kit", href: "#" },
            { name: "System Status", href: "#" },
          ],
        },
      ],
    },
  ],
};

const socialLinks = [
  { icon: DIcons.Mail, href: "mailto:hello@saomalielectric.com", label: "Email" },
  { icon: DIcons.X, href: "https://x.com/saomalielectric", label: "X" },
  { icon: DIcons.Instagram, href: "https://instagram.com/saomalielectric", label: "Instagram" },
  { icon: DIcons.WhatsApp, href: "https://wa.me/252614463895", label: "WhatsApp" },
  { icon: DIcons.Facebook, href: "https://facebook.com/saomalielectric", label: "Facebook" },
  { icon: DIcons.LinkedIn, href: "https://linkedin.com/company/saomalielectric", label: "LinkedIn" },
  { icon: DIcons.YouTube, href: "https://youtube.com/@saomalielectric", label: "YouTube" },
  { icon: DIcons.Behance, href: "#", label: "Behance" },
];

const Underline = "hover:-translate-y-1 border border-dotted rounded-xl p-2.5 transition-transform";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { branding } = useBrandSettings();
  const brandName = branding.brandName || APP_NAME;

  return (
    <footer className="border-ali/20 mx-auto w-full border-t px-2">
      {/* Top section: logo + description */}
      <div className="relative mx-auto grid max-w-7xl items-center justify-center gap-6 p-10 pb-0 md:flex">
        <Link href="/">
          <div className="flex items-center justify-center rounded-full">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-900">
              <Image
                src={branding.logoDark || "/iconDark.png"}
                alt={brandName}
                fill
                sizes="40px"
                className="object-contain"
              />
            </div>
          </div>
        </Link>
        <p className="bg-transparent text-center text-xs leading-4 text-primary/60 md:text-left">
          SEA bridges the gap between power utility companies and consumers across Somalia —
          automating billing, enabling smart metering, and driving measurable progress.
          Built for Somali utilities, by a team that understands the local energy landscape.
          We are passionate about transforming how energy is managed and delivered
          to every Somali household and business.
        </p>
      </div>

      {/* Navigation grid */}
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="border-b border-dotted" />
        <div className="py-10">
          {navigation.categories.map((category) => (
            <div
              key={category.name}
              className="grid grid-cols-3 flex-row justify-between gap-6 leading-6 md:flex"
            >
              {category.sections.map((section) => (
                <div key={section.name}>
                  <ul
                    role="list"
                    aria-labelledby={`${category.id}-${section.id}-heading-mobile`}
                    className="flex flex-col space-y-2"
                  >
                    {section.items.map((item) => (
                      <li key={item.name} className="flow-root">
                        <Link
                          href={item.href}
                          className="text-sm text-slate-600 hover:text-black dark:text-slate-400 hover:dark:text-white md:text-xs"
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="border-b border-dotted" />
      </div>

      {/* Social links + theme toggle */}
      <div className="flex flex-wrap justify-center gap-y-6">
        <div className="flex flex-wrap items-center justify-center gap-6 gap-y-4 px-6">
          {socialLinks.map(({ icon: Icon, href, label }) => (
            <Link
              key={label}
              aria-label={label}
              href={href}
              rel="noreferrer"
              target="_blank"
              className={Underline}
            >
              <Icon strokeWidth={1.5} className="h-5 w-5" />
            </Link>
          ))}
        </div>
        <ThemeToggle />
      </div>

      {/* Copyright bar */}
      <div className="mx-auto mb-10 mt-10 flex flex-col justify-between text-center text-xs md:max-w-7xl">
        <div className="flex flex-row items-center justify-center gap-1 text-slate-600 dark:text-slate-400">
          <span>©</span>
          <span>{currentYear}</span>
          <span>Made with</span>
          <DIcons.Heart1 className="mx-1 h-4 w-4 animate-pulse text-red-600" />
          <span>by</span>
          <span className="cursor-pointer text-black hover:text-blue-600 dark:text-white dark:hover:text-blue-400">
            <Link
              aria-label="Logo"
              className="font-bold"
              href="/"
            >
              {brandName}
            </Link>
          </span>
          <span className="mx-1">—</span>
          <span className="cursor-pointer text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400">
            <Link aria-label="Logo" href="/">
              Powering Somalia&apos;s Energy Future
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
