"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import Image from "next/image";

interface DynamicCarouselProps {
  setup: {
    subs: number;
    tops: number;
    towers: number;
    dj: boolean;
  };
}

// Hardcoded examples mapping setup configurations to actual media paths
const MEDIA_CATALOG = [
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800",
    tags: ["large", "band", "4-towers"],
    description: "Full Band + DJ Setup with 4 Lighting Towers"
  },
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800",
    tags: ["medium", "dj"],
    description: "Standard DJ Setup"
  },
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800",
    tags: ["small", "dj", "no-towers"],
    description: "Compact DJ Setup (No Truss Towers)"
  },
  {
    type: "image",
    url: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=800",
    tags: ["large", "band"],
    description: "Live Band Stage Setup"
  }
];

export default function DynamicCarousel({ setup }: DynamicCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeMedia, setActiveMedia] = useState(MEDIA_CATALOG);

  useEffect(() => {
    // Basic logic to filter media based on the user's active configuration
    // This makes the carousel feel magically responsive to their 3D build
    let filtered = MEDIA_CATALOG;
    
    const totalSpeakers = setup.subs + setup.tops;
    
    if (totalSpeakers >= 6) {
      filtered = MEDIA_CATALOG.filter(m => m.tags.includes("large"));
    } else if (totalSpeakers >= 3) {
      filtered = MEDIA_CATALOG.filter(m => m.tags.includes("medium") || m.tags.includes("large"));
    } else {
      filtered = MEDIA_CATALOG.filter(m => m.tags.includes("small") || m.tags.includes("medium"));
    }

    if (setup.towers >= 2) {
      filtered = filtered.filter(m => !m.tags.includes("no-towers"));
    }

    if (filtered.length === 0) {
      filtered = MEDIA_CATALOG; // Fallback to all if too specific
    }

    setActiveMedia(filtered);
    setCurrentIndex(0);
  }, [setup]);

  const handleNext = () => setCurrentIndex(prev => (prev + 1) % activeMedia.length);
  const handlePrev = () => setCurrentIndex(prev => (prev - 1 + activeMedia.length) % activeMedia.length);

  const currentItem = activeMedia[currentIndex];

  return (
    <div className="w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-xl relative aspect-video flex flex-col group">
      
      {/* Media Viewer */}
      <div className="flex-1 relative">
        <img 
          src={currentItem.url} 
          alt={currentItem.description}
          className="w-full h-full object-cover transition-opacity duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      </div>

      {/* Controls overlay */}
      <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={handlePrev} className="bg-black/50 hover:bg-black text-white p-2 rounded-full backdrop-blur transition-all">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button onClick={handleNext} className="bg-black/50 hover:bg-black text-white p-2 rounded-full backdrop-blur transition-all">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Description overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-white font-medium">{currentItem.description}</h3>
        <div className="flex gap-2 mt-2">
          {activeMedia.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 rounded-full transition-all ${idx === currentIndex ? 'w-6 bg-blue-500' : 'w-2 bg-gray-500 cursor-pointer hover:bg-gray-400'}`}
              onClick={() => setCurrentIndex(idx)}
            />
          ))}
        </div>
      </div>
      
    </div>
  );
}
