import type { Metadata } from "next";
import { ServicePageTemplate } from "@/components/templates/ServicePageTemplate";

export const metadata: Metadata = {
  title: "Private Parties & Birthdays | DJM Audio Los Angeles",
  description: "Turn your backyard or rented venue into a nightclub experience with professional DJs and lighting.",
};

export default function PrivateEventsPage() {
  return (
    <ServicePageTemplate
      title="Private Parties & Birthdays"
      description="Turn your backyard or rented venue into a nightclub experience."
      heroImage="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=75&w=2000"
      benefits={[
        "Club-style DJ mixing for high-energy dance floors",
        "Subwoofers to bring the bass to any space",
        "Intelligent lighting to create a true party atmosphere",
        "Clean setup suitable for residential homes and backyards",
        "Custom playlist curation to match the host's style",
      ]}
      pricingText="Party Packages starting at $600"
      pricingSubtext="Includes DJ, sound, and lighting for standard private events."
    />
  );
}
