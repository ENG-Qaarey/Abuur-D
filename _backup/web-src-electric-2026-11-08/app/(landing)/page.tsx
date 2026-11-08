import { Header } from "@/components/ui/header-1";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Pricing } from "@/components/landing/Pricing";
import { Statistics } from "@/components/landing/Statistics";
import { Impact } from "@/components/landing/Impact";
import { Testimonials } from "@/components/landing/Testimonials";
import { DownloadApp } from "@/components/landing/DownloadApp";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";
import { WhatsAppFab } from "@/components/landing/WhatsAppFab";

export default function LandingPage() {
  return (
    <main suppressHydrationWarning className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Header />
      <Hero />
      <Statistics />
      <Features />
      <Impact />
      <Testimonials />
      <Pricing />
      <DownloadApp />
      <FAQ />
      <Footer />
      <WhatsAppFab />
    </main>
  );
}

