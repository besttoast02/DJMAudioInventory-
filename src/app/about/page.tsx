import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Award, Music, Shield, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | DJM Audio Productions Los Angeles",
  description: "Learn more about DJM Audio Productions, our founder Jesus, and our mission to deliver premium event sound, DJ/MC, and lighting services across Southern California.",
};

const VALUES = [
  {
    icon: Music,
    title: "Acoustic Excellence",
    description: "We use only premium professional audio equipment (QSC, dBTechnologies, Pioneer DJ) to deliver crystal-clear sound at any volume.",
  },
  {
    icon: Shield,
    title: "100% Reliable",
    description: "With backup systems on-site, comprehensive liability insurance, and detailed pre-event planning, we guarantee seamless execution.",
  },
  {
    icon: Award,
    title: "Professional Craftsmanship",
    description: "From tidy cabling to clean facade setups, we respect the aesthetics of your venue. No messy wires, no compromise.",
  },
  {
    icon: Sparkles,
    title: "Bespoke Production",
    description: "Every event is unique. We tailor our music selection, lighting designs, and hardware configurations to match your exact vision.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-gray-50 dark:bg-slate-950 min-h-screen pb-20">
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
            Crafting Unforgettable <span className="text-blue-600 dark:text-blue-500">Audio Experiences</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
            DJM Audio Productions was founded in Los Angeles with a single mission: to elevate event entertainment through pristine sound engineering, beautiful lighting, and top-tier talent.
          </p>
        </div>
      </section>

      {/* Founder & Story Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* Image side */}
            <div className="lg:col-span-5 relative h-[500px] w-full rounded-3xl overflow-hidden shadow-lg">
              <Image
                src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=75&w=800"
                alt="DJM Audio founder Jesus performing"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                <div>
                  <h3 className="text-xl font-bold text-white">Jesus Davalos</h3>
                  <p className="text-gray-300 text-sm">Founder & Lead Production Engineer</p>
                </div>
              </div>
            </div>

            {/* Content side */}
            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Our Story</h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                Founded by Jesus, an experienced audio engineer and DJ/MC, DJM Audio Productions grew from a passion for musical clarity and dance floor energy. Having spent over a decade working in different venues across Southern California, Jesus saw a common problem: event audio and lighting setups were often treated as an afterthought, resulting in muddy sound, messy cables, and uninspired production.
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                We set out to build an event company that values professionalism and visual perfection as much as acoustic brilliance. Today, we handle sound reinforcement, corporate production, lighting designs, and premium DJ/MC entertainment from setup to the last song.
              </p>
              <div className="pt-4 flex flex-wrap gap-4">
                <Link
                  href="/quote"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all inline-block shadow-md"
                >
                  Plan Your Event
                </Link>
                <Link
                  href="/contact"
                  className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 px-8 py-4 rounded-xl font-bold transition-all inline-block"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-24 bg-white dark:bg-slate-900 border-y border-gray-100 dark:border-slate-850">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Core Philosophy</h2>
            <p className="text-gray-600 dark:text-gray-400">
              We hold ourselves to a higher standard. Here is the promise we bring to every event we produce.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {VALUES.map((val, i) => (
              <div key={i} className="flex space-x-6">
                <div className="flex-shrink-0 w-14 h-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center">
                  <val.icon className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{val.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{val.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
