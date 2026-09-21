import type { Metadata } from "next";
import { ServicePageTemplate } from "@/components/templates/ServicePageTemplate";

export const metadata: Metadata = {
  title: "Event Lighting Services | DJM Audio Los Angeles",
  description: "Uplighting, dance floor lighting, and moving heads to completely transform your venue.",
};

export default function EventLightingPage() {
  return (
    <ServicePageTemplate
      title="Event Lighting"
      description="Uplighting, dance floor lighting, and moving heads to completely transform your venue."
      heroImage="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=75&w=2000"
      benefits={[
        "Wireless, battery-powered LED uplighting (any color)",
        "Intelligent moving head lights for the dance floor",
        "Custom gobo projection (monograms and logos)",
        "DMX lighting programming perfectly synced to the music",
        "Safe, secure rigging and stand setups",
      ]}
      pricingText="Packages starting at $300"
      pricingSubtext="Can be booked as a standalone service or added to any DJ/Sound package."
    />
  );
}
