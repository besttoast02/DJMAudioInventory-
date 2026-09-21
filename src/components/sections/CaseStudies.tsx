import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

const CASE_STUDIES = [
  {
    title: "National Night Out - LAPD Hollenbeck",
    tags: ["Event Sound", "Community Event", "PA System"],
    attendance: "August 2025",
    description:
      "Provided robust sound reinforcement for the LAPD Hollenbeck division's National Night Out. Ensured clear public address audio across the large outdoor space for community leaders and live entertainment.",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=75&w=800",
  },
  {
    title: "St. Louis of France Parish Fiesta",
    tags: ["DJ", "MC", "Live Audio", "Festival Sound"],
    attendance: "May 2026",
    description:
      "Delivered full weekend production for the annual parish fiesta. Handled live band mixing, DJ entertainment between sets, and a comprehensive PA system to cover the entire festival grounds.",
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=75&w=800",
  },
];

export function CaseStudies() {
  return (
    <section id="case-studies" className="py-24 bg-white dark:bg-slate-950">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Recent Events & Case Studies</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              See how we handle production challenges and deliver unforgettable experiences.
            </p>
          </div>
          <Link href="/event-gallery" className="hidden md:flex items-center text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 mt-4 md:mt-0">
            View full gallery <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {CASE_STUDIES.map((study, i) => (
            <div key={i} className="group flex flex-col bg-gray-50 dark:bg-slate-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-800">
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={study.image}
                  alt={study.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzFlMjkzYiIvPjwvc3ZnPg=="
                  loading="lazy"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <div className="flex flex-wrap gap-2 mb-4">
                  {study.tags.map((tag) => (
                    <span key={tag} className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs font-bold px-3 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{study.title}</h3>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4">{study.attendance}</p>
                <p className="text-gray-600 dark:text-gray-300 flex-grow">{study.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link href="/event-gallery" className="inline-flex items-center text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700">
            View full gallery <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
}
