import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const TITLE = "ABUUR Digital | Sell online. Take orders on WhatsApp.";
const DESCRIPTION =
  "ABUUR Digital gives Somali businesses their own online store, product catalogue, WhatsApp ordering and an order dashboard — in one place.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://abuur.so"),
  title: TITLE,
  description: DESCRIPTION,
  robots: { index: true, follow: true },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    locale: "en_SO",
    siteName: "ABUUR Digital",
    images: [{ url: "/brand/sprout/og-image.png", width: 1200, height: 630, alt: "ABUUR Digital" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/brand/sprout/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/brand/sprout/favicon.ico", sizes: "any" },
      { url: "/brand/sprout/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/brand/sprout/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

const themeInitScript = `
(function(){
  document.documentElement.classList.add('js');
  try {
    var stored = localStorage.getItem('abuur-theme');
    var prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    var theme = stored === 'light' || stored === 'dark'
      ? stored
      : (prefersLight ? 'light' : 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
      </head>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
