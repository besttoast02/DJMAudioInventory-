import { CaseStudies } from "@/components/sections/CaseStudies";
import { Star } from "lucide-react";

export const metadata = {
  title: "Reviews & Case Studies | DJM Audio",
  description: "See what our past clients have to say and explore some of our recent events and case studies.",
};

const REVIEWS = [
  {
    id: 1,
    name: "Sarah & Mark",
    role: "Wedding at The Langham",
    content: "DJM Audio absolutely crushed it at our wedding! Jesus and his team were professional, on time, and kept the dance floor packed all night. The uplighting transformed the room completely. We couldn't have asked for a better experience.",
    rating: 5,
  },
  {
    id: 2,
    name: "Jessica T.",
    role: "Corporate Event Coordinator",
    content: "We've used DJM for our annual corporate gala two years in a row. Their sound engineers are top-notch. They handled the wireless mics for our keynote speakers flawlessly and transitioned right into high-energy music for the after-party. Highly recommended.",
    rating: 5,
  },
  {
    id: 3,
    name: "Michael R.",
    role: "Private Birthday Party",
    content: "I rented equipment for a backyard party and they made the process so easy. They dropped it off, set it up, and picked it up the next day. The QSC speakers sounded incredible. Definitely my go-to for audio rentals from now on.",
    rating: 5,
  },
  {
    id: 4,
    name: "Elena G.",
    role: "Quinceañera",
    content: "The lighting and sound were spectacular! They played all the right music and really knew how to read the crowd. Every single guest told me how much fun they had. Thank you DJM!",
    rating: 5,
  }
];

export default function ReviewsPage() {
  return (
    <div className="bg-gray-50 dark:bg-slate-950 min-h-screen pb-20">
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">
            Client <span className="text-blue-600 dark:text-blue-500">Love</span> & Results
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Don&apos;t just take our word for it. See what our clients are saying and explore real examples of how we bring events to life.
          </p>
        </div>
      </section>

      {/* Reviews Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {REVIEWS.map((review) => (
              <div 
                key={review.id} 
                className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col h-full"
              >
                <div className="flex space-x-1 mb-6 text-yellow-400">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed flex-grow italic mb-8">
                  &ldquo;{review.content}&rdquo;
                </p>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-lg">{review.name}</h4>
                  <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">{review.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies Section (re-used component) */}
      <CaseStudies />
    </div>
  );
}
