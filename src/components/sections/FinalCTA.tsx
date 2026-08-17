import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="py-24 bg-blue-600 relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-black blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
          Ready to Make Your Event Sound Amazing?
        </h2>
        <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
          Contact us today to lock in your date. We&apos;ll send you a custom production proposal within 24 hours.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link
            href="/quote"
            className="w-full sm:w-auto flex items-center justify-center bg-white text-blue-700 hover:bg-gray-100 px-10 py-5 rounded-full font-bold text-xl transition-all transform hover:-translate-y-1 shadow-2xl"
          >
            Get My Event Quote
            <ArrowRight className="ml-2 w-6 h-6" />
          </Link>
          <a
            href="tel:+16265063824"
            className="w-full sm:w-auto flex items-center justify-center bg-blue-700 hover:bg-blue-800 text-white border border-blue-500 px-10 py-5 rounded-full font-semibold text-xl transition-all"
          >
            <Phone className="mr-2 w-6 h-6" />
            Call (626) 506-3824
          </a>
        </div>
      </div>
    </section>
  );
}
