import type { Metadata } from "next";
import { categories, getToolsByCategory } from "@/lib/tools";
import ToolCard from "@/components/ToolCard";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Converters — DevForge Tools",
  description:
    "Free online data converters: JSON to CSV, YAML to JSON, XML to JSON, Unix timestamp, color converter, and more. Convert instantly in your browser.",
  alternates: {
    canonical: absoluteUrl("/tools/converters/"),
  },
  openGraph: {
    title: "Converters — DevForge Tools",
    description: "JSON, YAML, XML, CSV, timestamps, and color converters — free browser-based conversion tools.",
    url: absoluteUrl("/tools/converters/"),
    type: "website",
  },
};

export default function ConvertersPage() {
  const tools = getToolsByCategory("converters");
  const cat = categories.converters;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: cat.label,
    description: metadata.description,
    url: absoluteUrl("/tools/converters/"),
    hasPart: tools.map((t) => ({
      "@type": "WebApplication",
      name: t.name,
      url: absoluteUrl(`/tools/converters/${t.slug}/`),
      description: t.shortDescription,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <a href="/tools/" className="hover:underline">Tools</a> &rsaquo; Converters
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            ⇄ Converters
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
            {cat.description} — transform data between formats without writing a line of code.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </div>
    </>
  );
}
