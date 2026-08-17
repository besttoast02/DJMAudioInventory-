import Link from "next/link";

export function ProcessAndPricing() {
  return (
    <section className="py-24 bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        
        {/* 3-Step Process */}
        <div className="mb-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-gray-400">
              Booking professional production shouldn&apos;t be complicated.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gray-800 z-0" />
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-3xl font-black mb-6 shadow-xl shadow-blue-900/50">
                1
              </div>
              <h3 className="text-xl font-bold mb-3">Request a Quote</h3>
              <p className="text-gray-400">Tell us about your event, venue, and what you need. We&apos;ll respond with a clear, custom estimate.</p>
            </div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-3xl font-black mb-6 shadow-xl shadow-blue-900/50">
                2
              </div>
              <h3 className="text-xl font-bold mb-3">Consultation</h3>
              <p className="text-gray-400">We&apos;ll review the logistics, create a timeline, and finalize the equipment list and music curation.</p>
            </div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-3xl font-black mb-6 shadow-xl shadow-blue-900/50">
                3
              </div>
              <h3 className="text-xl font-bold mb-3">Event Execution</h3>
              <p className="text-gray-400">Our team arrives early for setup and soundcheck. You just enjoy your perfectly executed event.</p>
            </div>
          </div>
        </div>

        {/* Pricing Guidance */}
        <div className="bg-gray-800 rounded-3xl p-8 md:p-12 border border-gray-700">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Pricing Guidance</h2>
              <p className="text-gray-400 mb-6 text-lg">
                Every event is unique. Our quotes are based on guest count, venue size, equipment required, and hours of service. Here is a baseline of what to expect for our most popular setups.
              </p>
              <Link
                href="/quote"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all"
              >
                Get My Custom Quote
              </Link>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gray-900 p-6 rounded-2xl border border-gray-700">
                <h3 className="text-xl font-bold mb-2">Sound System & Engineer</h3>
                <p className="text-sm text-gray-400 mb-4">Perfect for corporate panels, live bands, and presentations.</p>
                <p className="text-blue-400 font-bold">Starting at $500</p>
              </div>
              
              <div className="bg-gray-900 p-6 rounded-2xl border border-gray-700 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-blue-600 text-xs font-bold px-3 py-1 rounded-bl-lg">POPULAR</div>
                <h3 className="text-xl font-bold mb-2">DJ, MC & Sound Package</h3>
                <p className="text-sm text-gray-400 mb-4">Complete entertainment for private parties and wedding receptions.</p>
                <p className="text-blue-400 font-bold">Starting at $800</p>
              </div>
              
              <div className="bg-gray-900 p-6 rounded-2xl border border-gray-700">
                <h3 className="text-xl font-bold mb-2">Full Production (Sound + Lighting + DJ)</h3>
                <p className="text-sm text-gray-400 mb-4">The ultimate transformation with uplighting and moving heads.</p>
                <p className="text-blue-400 font-bold">Starting at $1,200</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
