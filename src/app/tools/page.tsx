import type { Metadata } from "next";
import Link from "next/link";
import { categories, getToolsByCategory } from "@/lib/tools";
import type { ToolCategory } from "@/lib/tools";
import ToolCard from "@/components/ToolCard";
import { absoluteUrl } from "@/lib/site";

const categoryOrder: ToolCategory[] = ["networking", "formatters", "encoders", "generators", "converters", "validators"];

const categoryIcons: Record<ToolCategory, string> = {
  networking: "🔗",
  formatters: "{ }",
  encoders: "🔐",
  generators: "✨",
  converters: "⇄",
  validators: "✓",
};

export const metadata: Metadata = {
  title: "Developer Tools — DevForge",
  description:
    "Free online developer tools: JSON formatter, Base64 encoder, UUID generator, CIDR calculator, regex tester, and 40+ more. No signup, no tracking — runs in your browser.",
  alternates: {
    canonical: absoluteUrl("/tools/"),
  },
  openGraph: {
    title: "Developer Tools — DevForge",
    description: "40+ free browser-based developer tools for cloud engineers, DevOps practitioners, and developers.",
    url: absoluteUrl("/tools/"),
    type: "website",
  },
};

export default function ToolsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Developer Tools",
    description: metadata.description,
    url: absoluteUrl("/tools/"),
    hasPart: categoryOrder.map((cat) => ({
      "@type": "WebPage",
      name: categories[cat].label,
      url: absoluteUrl(`/tools/${cat}/`),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            Developer Tools
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
            40+ free utilities that run entirely in your browser. No signup, no tracking.
          </p>
        </div>

        {/* Category quick-nav */}
        <nav aria-label="Tool categories" className="mb-10 flex flex-wrap gap-2">
          {categoryOrder.map((cat) => (
            <Link
              key={cat}
              href={`/tools/${cat}/`}
              className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-blue-700 dark:hover:bg-blue-950/40 dark:hover:text-blue-400"
            >
              <span>{categoryIcons[cat]}</span>
              {categories[cat].label}
            </Link>
          ))}
        </nav>

        {categoryOrder.map((cat) => {
          const catTools = getToolsByCategory(cat);
          return (
            <section key={cat} className="mb-12" aria-labelledby={`cat-${cat}`}>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 id={`cat-${cat}`} className="text-xl font-bold text-gray-900 dark:text-white">
                    {categoryIcons[cat]} {categories[cat].label}
                  </h2>
                  <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                    {categories[cat].description}
                  </p>
                </div>
                <Link
                  href={`/tools/${cat}/`}
                  className="shrink-0 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  All {categories[cat].label} &rarr;
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {catTools.map((tool) => (
                  <ToolCard key={tool.slug} tool={tool} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
