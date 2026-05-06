import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — DevForge",
  description: "DevForge terms of service. Free developer tools provided as-is.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-white">Terms of Service</h1>
      <p className="mb-10 text-sm text-gray-500 dark:text-gray-400">Last updated: May 2026</p>

      <div className="space-y-8 text-gray-700 dark:text-gray-300">
        <section>
          <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">1. Acceptance</h2>
          <p>
            By using DevForge (devforge.tools), you agree to these terms. If you do not agree, please stop using the site.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">2. Use of Tools</h2>
          <p>
            All tools on DevForge are provided free of charge for personal and commercial use. You may use the output of these tools (formatted JSON, generated UUIDs, converted data, etc.) for any lawful purpose without restriction or attribution.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">3. No Warranty</h2>
          <p>
            DevForge tools are provided &ldquo;as is&rdquo; without warranty of any kind. We do not guarantee the accuracy, completeness, or fitness of the tools for any particular purpose. Hash functions, format converters, and other tools are provided for convenience — always verify critical outputs independently.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">4. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, DevForge and its operators shall not be liable for any damages arising from the use or inability to use these tools, including but not limited to data loss, system failures, or incorrect outputs.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">5. Prohibited Use</h2>
          <p>You may not use DevForge to:</p>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li>Attempt to scrape, mirror, or redistribute the site content</li>
            <li>Attempt to probe or attack the site infrastructure</li>
            <li>Use automated scripts to access the tools at a rate that degrades service for other users</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">6. Changes</h2>
          <p>
            We may update these terms at any time. Continued use of the site after changes constitutes acceptance of the updated terms.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">7. Contact</h2>
          <p>
            Questions about these terms:{" "}
            <a href="mailto:hi@devforge.tools" className="text-blue-600 underline">hi@devforge.tools</a>
          </p>
        </section>
      </div>
    </div>
  );
}
