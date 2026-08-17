import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Image from "next/image";

interface ServicePageProps {
  title: string;
  description: string;
  heroImage: string;
  benefits: string[];
  pricingText: string;
  pricingSubtext: string;
}

export function ServicePageTemplate({ title, description, heroImage, benefits, pricingText, pricingSubtext }: ServicePageProps) {
  return (
    <div className="bg-white dark:bg-slate-950">
      {/* Service Hero */}
      <section className="relative w-full h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gray-900/70 z-10" />
          <Image
            src={heroImage}
            alt={title}
            fill
            priority
            sizes="100vw"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzFlMjkzYiIvPjwvc3ZnPg=="
            className="object-cover"
          />
        </div>
        <div className="container mx-auto px-4 relative z-20 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6">{title}</h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">{description}</p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">What&apos;s Included</h2>
              <ul className="space-y-6 mb-10">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle2 className="w-6 h-6 text-blue-600 mr-4 flex-shrink-0 mt-1" />
                    <span className="text-lg text-gray-700 dark:text-gray-300">{benefit}</span>
                  </li>
                ))}
              </ul>
              
              <div className="bg-gray-50 dark:bg-slate-900 p-8 rounded-2xl border border-gray-200 dark:border-slate-800">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Pricing</h3>
                <p className="text-2xl text-blue-600 dark:text-blue-400 font-black mb-2">{pricingText}</p>
                <p className="text-gray-500 dark:text-gray-400">{pricingSubtext}</p>
              </div>
            </div>

            <div className="bg-blue-600 rounded-3xl p-12 text-white shadow-2xl">
              <h2 className="text-3xl font-bold mb-6">Get a Custom Quote for {title}</h2>
              <p className="text-blue-100 text-lg mb-10">
                Every event is unique. Contact us today to check availability and get a precise estimate based on your venue size and guest count.
              </p>
              <Link
                href="/quote"
                className="w-full flex items-center justify-center bg-white text-blue-700 hover:bg-gray-100 px-8 py-4 rounded-xl font-bold text-xl transition-all shadow-lg"
              >
                Request Quote
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
