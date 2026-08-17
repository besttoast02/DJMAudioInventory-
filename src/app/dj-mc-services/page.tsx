import type { Metadata } from "next";
import { ServicePageTemplate } from "@/components/templates/ServicePageTemplate";

export const metadata: Metadata = {
  title: "DJ & MC Services | DJM Audio Los Angeles",
  description: "Professional entertainment, seamless mixing, and expert crowd engagement for weddings, private parties, and corporate events.",
};

export default function DjMcPage() {
  return (
    <ServicePageTemplate
      title="DJ & MC Services"
      description="Professional entertainment, seamless mixing, and expert crowd engagement."
      heroImage="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=75&w=2000"
      benefits={[
        "Custom curated playlists based on your preferences",
        "Professional MC announcements for timelines and formalities",
        "Seamless mixing to keep the dance floor packed",
        "Clean, professional setup with no messy wires",
        "Includes premium sound system and dance floor lighting",
      ]}
      pricingText="Packages starting at $800"
      pricingSubtext="Includes DJ/MC, sound system, and basic dance lighting for up to 4 hours."
    />
  );
}
