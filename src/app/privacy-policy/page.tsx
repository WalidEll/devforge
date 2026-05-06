import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — DevForge",
  description: "DevForge privacy policy. We process all data locally in your browser and collect only aggregate analytics.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
      <p className="mb-10 text-sm text-gray-500 dark:text-gray-400">Last updated: May 2026</p>

      <div className="space-y-8 text-gray-700 dark:text-gray-300">
        <section>
          <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">1. Data Processing</h2>
          <p>
            All tool operations on DevForge (devforge.tools) are performed entirely within your browser. Text, code, tokens, or any other content you paste into our tools is <strong>never sent to our servers</strong>. We do not store, log, or have access to the data you process with our tools.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">2. Analytics</h2>
          <p>
            We use Google Analytics 4 to collect anonymous, aggregate information about how visitors use the site — including which pages are visited, how long sessions last, and what country visitors are from. This data is aggregated and cannot be used to identify individual users. You can opt out of Google Analytics by installing the{" "}
            <a href="https://tools.google.com/dlpage/gaoptout" className="text-blue-600 underline" rel="noopener noreferrer">Google Analytics Opt-out Browser Add-on</a>.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">3. Advertising</h2>
          <p>
            We use Google AdSense to display advertisements. Google AdSense may use cookies and similar technologies to show ads based on your prior visits to this website or other websites. You can opt out of personalized advertising by visiting{" "}
            <a href="https://www.google.com/settings/ads" className="text-blue-600 underline" rel="noopener noreferrer">Google Ads Settings</a>.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">4. Cookies</h2>
          <p>
            DevForge uses a single localStorage key (<code className="rounded bg-gray-100 px-1 dark:bg-gray-800">theme</code>) to remember your dark/light mode preference. This data stays in your browser and is never transmitted to us. Google Analytics and Google AdSense may set their own cookies as described in Google&apos;s Privacy Policy.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">5. Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li><strong>Google Analytics 4</strong> — anonymous usage analytics</li>
            <li><strong>Google AdSense</strong> — display advertising</li>
            <li><strong>Vercel</strong> — hosting and CDN (processes request metadata like IP addresses in server logs)</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">6. Children&apos;s Privacy</h2>
          <p>
            DevForge is not directed at children under 13 years of age. We do not knowingly collect personal information from children.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">7. Contact</h2>
          <p>
            For questions about this privacy policy, contact us at{" "}
            <a href="mailto:hi@devforge.tools" className="text-blue-600 underline">hi@devforge.tools</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
