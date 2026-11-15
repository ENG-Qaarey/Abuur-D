import { SiteShell } from "@/components/landing/site-shell";
import { OrderSteps } from "@/components/landing/order-steps";
import { Hero } from "@/components/landing/hero";
import { BusinessMarquee } from "@/components/landing/business-marquee";
import {
  FAQSection,
  FeatureGrid,
  ForBusinesses,
  WhyAbuur,
} from "@/components/landing/home-sections";
import { FinalCTA } from "@/components/landing/final-cta";
import { OrderStory } from "@/components/landing/order-story";

export default function HomePage() {
  return (
    <SiteShell>
      <Hero />
      <BusinessMarquee />
      <FeatureGrid />
      <OrderSteps />
      <ForBusinesses />
      <OrderStory />
      <WhyAbuur />
      <FAQSection />
      <FinalCTA />
    </SiteShell>
  );
}
