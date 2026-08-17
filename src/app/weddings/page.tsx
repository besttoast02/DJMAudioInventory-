import type { Metadata } from "next";
import { ServicePageTemplate } from "@/components/templates/ServicePageTemplate";

export const metadata: Metadata = {
  title: "Wedding DJ & Sound Services | DJM Audio Los Angeles",
  description: "Flawless audio for your ceremony and an unforgettable party for your reception.",
};

export default function WeddingsPage() {
  return (
    <ServicePageTemplate
      title="Wedding Receptions & Ceremonies"
      description="Flawless audio for your ceremony and an unforgettable party for your reception."
      heroImage="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=2000"
      benefits={[
        "Separate, discreet sound system for the ceremony",
        "Wireless lapel microphones for the officiant and vows",
        "Cocktail hour music programming",
        "Reception DJ and professional MC duties",
        "Dance floor lighting and ambient venue uplighting",
      ]}
      pricingText="Wedding Packages starting at $1,200"
      pricingSubtext="Includes ceremony audio, cocktail hour, reception DJ/MC, and lighting."
    />
  );
}
