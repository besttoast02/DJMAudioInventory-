import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | DJM Audio Productions",
  description: "Read the Terms of Service of DJM Audio Productions outlining agreements for quote requests, equipment rentals, event production services, and governing laws.",
};

export default function TermsPage() {
  return (
    <div className="bg-gray-50 dark:bg-slate-950 min-h-screen pb-20">
      {/* Page Header */}
      <section className="pt-32 pb-16 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Last Updated: August 17, 2026
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl bg-white dark:bg-slate-900 p-8 md:p-12 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 space-y-8">
          
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
            <p className="leading-relaxed">
              By accessing and using the website of DJM Audio Productions (the "Site"), you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our Site or request services.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Non-Binding Quote Requests</h2>
            <p className="leading-relaxed">
              Our Site allows you to add audio/lighting items to a virtual cart and submit a request for an event quote. Submission of this request does <strong>NOT</strong> constitute a binding contract, purchase order, or booking confirmation. A booking is only finalized when both parties sign a written event agreement and the required deposit is paid and cleared.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Rental Equipment Policy</h2>
            <p className="leading-relaxed mb-4">
              If your booking involves dry-hire equipment rentals, you agree to the following conditions:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Care of Gear:</strong> You are responsible for returning all gear (mixers, speakers, mic systems, cables) in the same condition as received.</li>
              <li><strong>Damage and Loss:</strong> Renter assumes all financial risk for damage, theft, or loss. Repair or replacement costs will be billed at full retail price.</li>
              <li><strong>Late Fees:</strong> Gear returned past the agreed return date will incur daily rental charges at the standard retail rate.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Event Production and Staging</h2>
            <p className="leading-relaxed mb-4">
              For events where we provide on-site setup, sound engineering, or DJ/MC services:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Venue Access:</strong> Client is responsible for ensuring safe, timely access for load-in and load-out.</li>
              <li><strong>Power Requirements:</strong> Client must ensure the venue provides adequate, dedicated electrical circuits as detailed in your booking spec.</li>
              <li><strong>Outdoor Events:</strong> Suitable overhead coverage (tents/canopies) must be provided to protect electronic equipment from sun and rain.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Limitation of Liability</h2>
            <p className="leading-relaxed">
              DJM Audio Productions shall not be held liable for any indirect, incidental, or consequential damages resulting from the use of our services or equipment failure. In all circumstances, our maximum liability is strictly limited to the total fees paid by the client for that specific booking.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Governing Law</h2>
            <p className="leading-relaxed">
              These Terms of Service shall be governed by, construed, and enforced in accordance with the laws of the State of California, United States, without regard to conflicts of law principles. Any legal disputes shall be handled in courts located in Los Angeles County, California.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Contact Information</h2>
            <p className="leading-relaxed">
              For any questions regarding these Terms of Service, please contact us at:
            </p>
            <p className="mt-4 font-semibold text-gray-900 dark:text-white">
              DJM Audio Productions<br />
              Email: <a href="mailto:info@djmaudio.com" className="text-blue-600 hover:underline">info@djmaudio.com</a><br />
              Phone: (626) 506-3824
            </p>
          </div>

        </div>
      </section>
    </div>
  );
}
