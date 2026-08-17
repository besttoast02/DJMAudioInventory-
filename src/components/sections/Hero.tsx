"use client";

import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

const BACKGROUND_IMAGES = [
  "https://images.unsplash.com/photo-1470229722913-7c090be5c5a4?auto=format&fit=crop&q=75&w=2000", // DJ Setup and Lighting
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=75&w=2000", // Dancefloor/Crowd
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=75&w=2000", // Live Performance/Event Lighting
  "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&q=75&w=2000"  // Event/Stage Setup
];

export function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % BACKGROUND_IMAGES.length);
    }, 60000); // 60,000 ms = 1 minute

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full min-h-[85vh] flex items-center justify-center bg-gray-950 overflow-hidden">
      {/* Background Image Slideshow */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-900/80 to-transparent z-10" />
        {BACKGROUND_IMAGES.map((src, index) => (
          <Image
            key={src}
            src={src}
            alt="Event Sound and Lighting Background"
            fill
            priority={index === 0}
            sizes="100vw"
            className={`object-cover transition-opacity duration-1000 ${
              index === currentImageIndex ? "opacity-50" : "opacity-0"
            }`}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-20">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight mb-6">
            Los Angeles Event Sound, DJ/MC and Lighting
            <span className="block text-blue-500 mt-2">—Handled From Setup to the Last Song.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl leading-relaxed">
            Professional audio, entertainment, and lighting for events of every size, backed by more than 10 years of experience.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/quote"
              className="w-full sm:w-auto flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-blue-500/30"
            >
              Get My Event Quote
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <a
              href="tel:+16265063824"
              className="w-full sm:w-auto flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-full font-semibold text-lg transition-all"
            >
              <Phone className="mr-2 w-5 h-5" />
              Call (626) 506-3824
            </a>
          </div>
          
          <p className="mt-6 text-sm text-gray-400">
            ✓ Quick online quotes ✓ Fully insured ✓ Backup equipment included
          </p>
        </div>
      </div>
    </section>
  );
}
