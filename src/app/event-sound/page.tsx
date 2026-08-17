import type { Metadata } from "next";
import { ServicePageTemplate } from "@/components/templates/ServicePageTemplate";

export const metadata: Metadata = {
  title: "Event Sound & PA Services | DJM Audio Los Angeles",
  description: "Professional sound systems, wireless microphones, and audio engineers for live bands, corporate panels, and ceremonies in Los Angeles.",
};

export default function EventSoundPage() {
  return (
    <ServicePageTemplate
      title="Event Sound & PA Systems"
      description="Crystal clear audio reinforcement for live bands, corporate panels, ceremonies, and speeches."
      heroImage="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=2000"
      benefits={[
        "Premium JBL and QSC active speakers and subwoofers",
        "Shure wireless microphones (handheld and lapel)",
        "Digital mixing consoles operated by experienced engineers",
        "On-site soundcheck and frequency management",
        "Complete setup, teardown, and live mixing during the event",
      ]}
      pricingText="Packages starting at $500"
      pricingSubtext="Includes delivery, setup, basic PA, and wireless microphone."
    />
  );
}
