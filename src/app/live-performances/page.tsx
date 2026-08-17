import type { Metadata } from "next";
import { ServicePageTemplate } from "@/components/templates/ServicePageTemplate";

export const metadata: Metadata = {
  title: "Live Band Audio Engineering | DJM Audio Los Angeles",
  description: "FOH mixing, monitor engineering, and full PA setups for live bands and outdoor concerts.",
};

export default function LivePerformancesPage() {
  return (
    <ServicePageTemplate
      title="Live Performances & Concerts"
      description="FOH mixing, monitor engineering, and full PA setups for live bands and outdoor concerts."
      heroImage="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=2000"
      benefits={[
        "Multi-channel digital mixing consoles",
        "Wedge monitors and IEM (In-Ear Monitor) support",
        "Full drum mic kits and DI boxes for instruments",
        "Front-of-House (FOH) and Monitor engineering",
        "High-output PA systems to cover large outdoor or indoor crowds",
      ]}
      pricingText="Production Packages starting at $800"
      pricingSubtext="Pricing varies heavily based on band size and venue requirements."
    />
  );
}
