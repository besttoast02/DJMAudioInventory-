import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Event Gallery & Production Photos | DJM Audio",
  description: "Browse photos of our recent live band sound setups, wedding lighting designs, DJ performances, and equipment rentals in Southern California.",
};

const GALLERY_ITEMS = [
  {
    title: "Live Band Front of House Setup",
    category: "Audio",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=75&w=800",
    span: "md:col-span-2 md:row-span-2",
  },
  {
    title: "Elegant Ballroom Uplighting",
    category: "Lighting",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=75&w=800",
    span: "md:col-span-1 md:row-span-1",
  },
  {
    title: "Pioneer DJ Performance Setup",
    category: "DJ & MC",
    image: "https://images.unsplash.com/photo-1516873240891-4bf014598ab4?auto=format&fit=crop&q=75&w=800",
    span: "md:col-span-1 md:row-span-2",
  },
  {
    title: "Outdoor Corporate Sound Reinforcement",
    category: "Audio",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=75&w=800",
    span: "md:col-span-1 md:row-span-1",
  },
  {
    title: "Custom Wedding Reception DJ Booth",
    category: "DJ & MC",
    image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=75&w=800",
    span: "md:col-span-2 md:row-span-1",
  },
  {
    title: "Intelligent Dance Floor Moving Heads",
    category: "Lighting",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=75&w=800",
    span: "md:col-span-1 md:row-span-1",
  },
];

export default function EventGalleryPage() {
  return (
    <div className="bg-gray-50 dark:bg-slate-950 min-h-screen pb-20">
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
            Our Production <span className="text-blue-600 dark:text-blue-500">Gallery</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            A visual showcase of our recent events, sound configurations, concert lighting, and premium entertainment setups across SoCal.
          </p>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
            {GALLERY_ITEMS.map((item, index) => (
              <div 
                key={index} 
                className={`group relative rounded-3xl overflow-hidden shadow-sm border border-gray-250/20 bg-slate-900 ${item.span || ""}`}
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                />
                
                {/* Overlay details */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent flex flex-col justify-end p-6 md:p-8 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <span className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
                    {item.category}
                  </span>
                  <h3 className="text-white text-lg md:text-xl font-bold leading-snug">
                    {item.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
