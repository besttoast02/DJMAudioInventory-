import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy | DJM Audio Productions",
  description: "Read the Booking, Cancellation, and Refund Policy of DJM Audio Productions governing our event production services and gear dry-hire rentals.",
};

export default function CancellationPolicyPage() {
  return (
    <div className="bg-gray-50 dark:bg-slate-950 min-h-screen pb-20">
      {/* Page Header */}
      <section className="pt-32 pb-16 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
            Booking, Cancellation & Refund Policy
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Last Updated: August 18, 2026
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl bg-white dark:bg-slate-900 p-8 md:p-12 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 space-y-8">
          
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Booking Retainers</h2>
            <p className="leading-relaxed">
              To reserve a date and lock in equipment/staff availability for event sound, DJ/MC, or lighting services, clients must sign a written agreement and pay a **non-refundable retainer fee of 20%** of the total contract price. This retainer secures our commitment to your date, during which we turn down other bookings for the same resources.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Event Service Cancellation Schedule</h2>
            <p className="leading-relaxed mb-4">
              If you cancel your contract for full event production services, refunds on the remaining balance (excluding the non-refundable 20% retainer) are calculated as follows:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Cancellation 30+ Days Prior:</strong> 100% of any paid balance beyond the retainer is fully refunded.</li>
              <li><strong>Cancellation 14 to 29 Days Prior:</strong> 50% of the remaining balance is refunded. The remaining 50% is due.</li>
              <li><strong>Cancellation Under 14 Days Prior:</strong> The entire remaining contract balance is due in full and is 100% non-refundable.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Dry-Hire Equipment Rental Cancellation</h2>
            <p className="leading-relaxed mb-4">
              For client self-pickup (dry-hire) equipment rental orders:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Cancellation 48+ Hours Before Pick-Up:</strong> A full refund is issued, minus a 10% credit card processing and administrative fee.</li>
              <li><strong>Cancellation Under 48 Hours Before Pick-Up:</strong> A 50% cancellation fee is assessed. The remaining paid amount is returned as store credit valid for 12 months.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Rain & Weather Policy</h2>
            <p className="leading-relaxed">
              Outdoor events present risk of electrical hazards and equipment damage. The client is responsible for providing adequate cover (canopies, tents, or indoor alternatives) in the event of rain, extreme sun, or wind. If an event is cancelled or cut short due to lack of adequate weather protection, no refunds will be issued, and the full contract price remains payable.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Force Majeure</h2>
            <p className="leading-relaxed">
              Neither party shall be liable for failures or delays in performing their obligations due to causes beyond their reasonable control, including acts of God, war, strikes, government mandates, pandemics, or state/national emergencies. In the event of a verified Force Majeure cancellation, any paid amounts (minus actual expenses incurred) may be applied as credit toward a rescheduled date within 12 months.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Contact for Cancellations</h2>
            <p className="leading-relaxed">
              All cancellation requests must be submitted in writing via email to <a href="mailto:info@djmaudio.com" className="text-blue-600 hover:underline">info@djmaudio.com</a>. The cancellation date will be recorded as the date the email is received.
            </p>
          </div>

        </div>
      </section>
    </div>
  );
}
