import { Hero } from "@/components/sections/Hero";
import { TrustBar } from "@/components/sections/TrustBar";
import { ServicesGrid } from "@/components/sections/ServicesGrid";

import { ProcessAndPricing } from "@/components/sections/ProcessAndPricing";
import { FinalCTA } from "@/components/sections/FinalCTA";

export default function Home() {
  return (
    <>
      <Hero />
      <TrustBar />
      <ServicesGrid />

      <ProcessAndPricing />
      <FinalCTA />
    </>
  );
}
