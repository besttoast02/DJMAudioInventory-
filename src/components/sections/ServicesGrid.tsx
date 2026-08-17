import Link from "next/link";
import { ArrowRight, Music, Mic2, Lightbulb, Speaker } from "lucide-react";

const SERVICES = [
  {
    title: "Event Sound & PA",
    description: "Crystal clear audio reinforcement for live bands, corporate panels, and ceremonies.",
    icon: Speaker,
    href: "/event-sound",
    color: "bg-blue-500",
  },
  {
    title: "DJ & MC Services",
    description: "Professional entertainment, seamless mixing, and expert crowd engagement.",
    icon: Music,
    href: "/dj-mc-services",
    color: "bg-purple-500",
  },
  {
    title: "Event Lighting",
    description: "Uplighting, dance floor lighting, and moving heads to transform your venue.",
    icon: Lightbulb,
    href: "/event-lighting",
    color: "bg-amber-500",
  },
  {
    title: "Equipment Rentals",
    description: "Industry-standard gear available for rent for your own events and gigs.",
    icon: Mic2,
    href: "/equipment-rentals",
    color: "bg-emerald-500",
  },
];

export function ServicesGrid() {
  return (
    <section id="services" className="py-24 bg-gray-50 dark:bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Complete Production Services</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            We provide everything you need to make your event look and sound incredible.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {SERVICES.map((service, i) => {
            const Icon = service.icon;
            return (
              <Link
                key={i}
                href={service.href}
                className="group bg-white dark:bg-slate-950 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all border border-gray-100 dark:border-slate-800 flex flex-col"
              >
                <div className={`${service.color} text-white w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-md`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{service.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 flex-grow">{service.description}</p>
                <div className="flex items-center text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-2 transition-transform">
                  Learn more <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
