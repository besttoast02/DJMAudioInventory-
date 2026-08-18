import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accessibility Statement | DJM Audio Productions",
  description: "Read the Accessibility Statement of DJM Audio Productions detailing our commitment and conformance to WCAG 2.1 AA accessibility guidelines.",
};

export default function AccessibilityPage() {
  return (
    <div className="bg-gray-50 dark:bg-slate-950 min-h-screen pb-20">
      {/* Page Header */}
      <section className="pt-32 pb-16 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
            Accessibility Statement
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Our Commitment</h2>
            <p className="leading-relaxed">
              DJM Audio Productions is committed to ensuring digital accessibility for all users, including individuals with disabilities. We strive to continually improve the accessibility of our website (including <a href="https://www.djmaudio.com" className="text-blue-600 hover:underline">djmaudio.com</a>) and our booking workflow to provide a seamless experience for everyone, regardless of ability.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Conformance Standard</h2>
            <p className="leading-relaxed">
              We aim to conform to the **Web Content Accessibility Guidelines (WCAG) 2.1, Level AA** standards. These guidelines outline how to make web content more accessible to people with wide ranges of disabilities, including visual, auditory, physical, speech, cognitive, language, learning, and neurological disabilities.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Measures Implemented</h2>
            <p className="leading-relaxed mb-4">
              To support accessibility, we have integrated the following design and technical practices into our website:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Semantic HTML:</strong> We use appropriate HTML5 structure (headings, main, nav, section, footer) to assist screen reader users with page layout navigation.</li>
              <li><strong>Contrast Ratio:</strong> Text and interactive components meet WCAG 2.1 AA color contrast standards against their background elements.</li>
              <li><strong>Keyboard Navigation:</strong> Standard navigation elements, forms, and custom components are designed to be accessible via keyboard interfaces.</li>
              <li><strong>Responsive Scaling:</strong> Viewports are configured to allow fluid zooming up to 200% without breaking page layouts.</li>
              <li><strong>Dynamic UI Controls:</strong> Expand/collapse widgets, modals, and input forms are labeled with descriptive aria tags.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Compatibility</h2>
            <p className="leading-relaxed">
              Our website is designed to be compatible with major modern browsers (Chrome, Safari, Firefox, Edge) and standard screen reader softwares (such as VoiceOver on iOS/macOS, NVDA, and JAWS on Windows).
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Feedback & Reporting Barriers</h2>
            <p className="leading-relaxed">
              Despite our efforts, some areas of the website may still present accessibility limitations. If you encounter any barriers, have questions, or require assistance with any part of our site (including cart selection or quote submission), please contact us:
            </p>
            <p className="mt-4 font-semibold text-gray-900 dark:text-white">
              DJM Audio Productions<br />
              Email: <a href="mailto:info@djmaudio.com" className="text-blue-600 hover:underline">info@djmaudio.com</a><br />
              Phone: (626) 506-3824
            </p>
            <p className="leading-relaxed mt-4">
              We value your feedback and will work to address your concerns or provide alternative means to access our services as quickly as possible.
            </p>
          </div>

        </div>
      </section>
    </div>
  );
}
