import type { Metadata } from "next";
import { ServicePageTemplate } from "@/components/templates/ServicePageTemplate";

export const metadata: Metadata = {
  title: "Corporate Event Audio & AV | DJM Audio Los Angeles",
  description: "Reliable, clear sound reinforcement and AV services for conferences, holiday parties, and brand activations.",
};

export default function CorporateEventsPage() {
  return (
    <ServicePageTemplate
      title="Corporate Events & Brand Activations"
      description="Reliable, clear sound reinforcement and AV services for conferences, holiday parties, and brand activations."
      heroImage="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=2000"
      benefits={[
        "Flawless microphone audio for keynote speakers and panels",
        "Background music programming for networking and dinners",
        "High-energy DJ performances for holiday parties",
        "Custom gobo lighting with your company logo",
        "Punctual, professional crew dressed in appropriate corporate attire",
      ]}
      pricingText="Corporate Packages starting at $800"
      pricingSubtext="Can be scaled from single-speaker conferences to multi-room gala events."
    />
  );
}
