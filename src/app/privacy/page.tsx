import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | DJM Audio Productions",
  description: "Read the Privacy Policy of DJM Audio Productions to understand how we collect, use, and protect your personal information in accordance with California (CCPA/CalOPPA) and US privacy regulations.",
};

export default function PrivacyPage() {
  return (
    <div className="bg-gray-50 dark:bg-slate-950 min-h-screen pb-20">
      {/* Page Header */}
      <section className="pt-32 pb-16 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
            Privacy Policy
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Introduction</h2>
            <p className="leading-relaxed">
              DJM Audio Productions ("we," "us," or "our") respects your privacy and is committed to protecting the personal data you share with us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website (including <a href="https://www.djmaudio.com" className="text-blue-600 hover:underline">djmaudio.com</a>) and use our online booking, catalog selection, and event consultation services.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Information We Collect</h2>
            <p className="leading-relaxed mb-4">
              We collect information that you voluntarily provide to us when requesting a quote, contacting us, or signing up for our services:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Contact Information:</strong> Name, phone number, and email address.</li>
              <li><strong>Event Details:</strong> Event date, return date, event type (e.g. Wedding, Corporate), setting (Indoor/Outdoor), venue or city name, and estimated guest count.</li>
              <li><strong>Cart Items:</strong> Physical audio, lighting, and performance equipment selections added to your inquiry quote.</li>
              <li><strong>Message Details:</strong> Custom notes, special instructions, and attachments sent through contact forms.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. How We Use Your Information</h2>
            <p className="leading-relaxed mb-4">
              We process your personal information for the following business purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To construct custom event audio/lighting proposals and final price estimates.</li>
              <li>To communicate with you regarding booking confirmations, scheduling, and invoice billing.</li>
              <li>To assign on-site technician staff and coordinate gear logistics for your venue location.</li>
              <li>To comply with legal obligations (e.g., California tax rules and jurisdiction business permits).</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Sharing and Disclosure</h2>
            <p className="leading-relaxed mb-4">
              We do not sell, rent, or trade your personal information. We only share data with trusted third parties in the following scenarios:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Contractors and Staff:</strong> To DJs, sound engineers, or setup staff assigned to perform services at your event.</li>
              <li><strong>Service Providers:</strong> To hosting providers, database platforms (Supabase), and email gateways supporting our backend operations.</li>
              <li><strong>Legal Compliance:</strong> To comply with court orders, local government regulations, or tax auditing processes.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Cookies and Tracking Technologies</h2>
            <p className="leading-relaxed">
              We use functional cookies to remember items added to your rental cart and maintain website preferences (such as light/dark mode selection). We do not run third-party tracking cookies or behavioral tracking ads on this site.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. California Privacy Rights (CCPA / CalOPPA)</h2>
            <p className="leading-relaxed mb-4">
              Under California law, California residents have the following rights regarding their personal data:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Right to Know:</strong> The right to request disclosure of the categories and specific pieces of personal information we have collected.</li>
              <li><strong>Right to Delete:</strong> The right to request the deletion of your personal information collected by us.</li>
              <li><strong>Right to Opt-Out:</strong> The right to opt-out of the sale of personal information (Note: We do not sell your personal data).</li>
            </ul>
            <p className="leading-relaxed mt-4">
              To exercise any of these rights, please email us at <a href="mailto:info@djmaudio.com" className="text-blue-600 hover:underline">info@djmaudio.com</a>.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Children's Privacy (COPPA)</h2>
            <p className="leading-relaxed">
              Our website is intended for adults planning events. We do not knowingly collect or solicit personal information from children under the age of 13.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Contact Us</h2>
            <p className="leading-relaxed">
              If you have any questions or concerns about this Privacy Policy or our data handling practices, please contact us at:
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
