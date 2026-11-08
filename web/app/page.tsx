import { SiteShell } from "@/components/landing/site-shell";
import { Hero } from "@/components/landing/hero";
import { BusinessMarquee } from "@/components/landing/business-marquee";
import {
  FAQSection,
  FeatureGrid,
  ForBusinesses,
  HowItWorks,
  OrderDashboardSection,
  ShopperSection,
  WhyAbuur,
} from "@/components/landing/home-sections";
import { FinalCTA } from "@/components/landing/final-cta";

export default function HomePage() {
  return (
    <SiteShell>
      <Hero />
      <BusinessMarquee />
      <FeatureGrid />
      <HowItWorks />
      <ForBusinesses />
      <OrderDashboardSection />
      <ShopperSection />
      <WhyAbuur />
      <FAQSection />
      <FinalCTA />
    </SiteShell>
  );
}
