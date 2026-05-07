import type { Metadata } from "next";
import Link from "next/link";
import { tools } from "@/lib/tools";

export const metadata: Metadata = {
  title: "About DevForge — Free Developer Tools",
  description: "DevForge is a free collection of developer utilities. No signup, no tracking, no ads between you and your work.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="mb-6 text-4xl font-bold text-gray-900 dark:text-white">
        About <span className="text-blue-600">Dev</span>Forge
      </h1>

      <div className="space-y-6 text-gray-700 dark:text-gray-300">
        <p className="text-lg">
          DevForge is a free, fast collection of {tools.length} developer utilities designed for one purpose: get out of your way and let you get back to building.
        </p>

        <p>
          No signup required. No data ever leaves your browser. Every tool runs 100% client-side — your JSON, your tokens, your hashes never touch a server.
        </p>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Why DevForge?</h2>
        <p>
          There are plenty of developer tool sites online, but most are slow, cluttered with ads, or require you to create an account. DevForge is built to be the opposite: fast enough to bookmark and use daily, clean enough not to frustrate, and free enough not to think twice about.
        </p>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Privacy</h2>
        <p>
          All processing happens locally in your browser. We use Google Analytics to understand aggregate usage (page views, most-used tools), but we never collect, store, or transmit the actual data you paste into the tools.
        </p>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Ads</h2>
        <p>
          DevForge is supported by Google AdSense ads. We keep them minimal and non-intrusive — never between you and the tool. If you find the ads useful, clicking through supports keeping these tools free.
        </p>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-950/20">
          <h2 className="mb-3 text-lg font-semibold text-amber-900 dark:text-amber-200">
            ☕ Support DevForge
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            DevForge is free and always will be. If it saves you time, you can{" "}
            <a
              href="https://ko-fi.com/devforgetools"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-amber-700 underline hover:text-amber-900 dark:text-amber-400"
            >
              buy me a coffee on Ko-fi
            </a>
            . No account required — takes 30 seconds.
          </p>
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-950">
          <h3 className="mb-3 font-semibold text-blue-900 dark:text-blue-300">Found a bug or have a request?</h3>
          <p className="text-sm text-blue-800 dark:text-blue-400">
            All {tools.length} tools are maintained by a solo developer. If something isn&apos;t working or you&apos;d like to see a new tool added, reach out at{" "}
            <a href="mailto:hi@devforge.tools" className="underline">hi@devforge.tools</a>.
          </p>
        </div>

        <div className="mt-8">
          <Link href="/" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Browse all tools →
          </Link>
        </div>
      </div>
    </div>
  );
}
