import type { Metadata } from "next";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | DJM Audio Productions Los Angeles",
  description: "Get in touch with DJM Audio Productions for event sound system rentals, professional DJ/MC talent, and event lighting services in Southern California.",
};

export default function ContactPage() {
  return (
    <div className="bg-gray-50 dark:bg-slate-950 min-h-screen pb-20">
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
            Connect With Our <span className="text-blue-600 dark:text-blue-500">Event Experts</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Have questions about gear, pricing, or availability? Reach out today and we will get back to you within 24 hours.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Info Side */}
            <div className="lg:col-span-5 space-y-12">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Contact Information</h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  We are based in Los Angeles and serve the surrounding Southern California areas including Pasadena, Glendale, Orange County, and the Inland Empire.
                </p>
              </div>

              <div className="space-y-6">
                <a 
                  href="tel:+16265063824" 
                  className="flex items-start p-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 hover:shadow-md transition-all group"
                >
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-655 dark:text-blue-400 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Call or Text</h4>
                    <p className="text-blue-600 dark:text-blue-400 font-semibold mt-1 hover:underline">(626) 506-3824</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Mon - Sun, 8:00 AM - 8:00 PM</p>
                  </div>
                </a>

                <a 
                  href="mailto:info@djmaudio.com" 
                  className="flex items-start p-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 hover:shadow-md transition-all group"
                >
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Email Us</h4>
                    <p className="text-blue-600 dark:text-blue-400 font-semibold mt-1 hover:underline">info@djmaudio.com</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Response within 24 hours</p>
                  </div>
                </a>

                <div className="flex items-start p-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Service Area</h4>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Los Angeles, CA & Surrounding Areas</p>
                  </div>
                </div>

                <div className="flex items-start p-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">Business Hours</h4>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Daily: 8:00 AM - 8:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Side */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-8 md:p-10 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Send Us a Message</h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Name *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Your Name"
                      className="w-full px-4 py-3 rounded-xl border border-gray-350 dark:border-slate-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Phone *</label>
                    <input 
                      type="tel" 
                      required 
                      placeholder="(555) 555-5555"
                      className="w-full px-4 py-3 rounded-xl border border-gray-350 dark:border-slate-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email *</label>
                  <input 
                    type="email" 
                    required 
                    placeholder="yourname@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-350 dark:border-slate-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Subject</label>
                  <input 
                    type="text" 
                    placeholder="General Inquiry, Booking Query, etc."
                    className="w-full px-4 py-3 rounded-xl border border-gray-350 dark:border-slate-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Message *</label>
                  <textarea 
                    rows={5}
                    required
                    placeholder="Tell us about your event details, gear requirements, or questions..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-350 dark:border-slate-700 bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none" 
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-md transition-all"
                >
                  Send Message
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
