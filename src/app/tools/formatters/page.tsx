import type { Metadata } from "next";
import { categories, getToolsByCategory } from "@/lib/tools";
import ToolCard from "@/components/ToolCard";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Code Formatters — DevForge Tools",
  description:
    "Free online code formatters: JSON, XML, SQL, HTML, CSS, JavaScript, Markdown, and more. Paste and format instantly — no signup required.",
  alternates: {
    canonical: absoluteUrl("/tools/formatters/"),
  },
  openGraph: {
    title: "Code Formatters — DevForge Tools",
    description: "Format and beautify JSON, XML, SQL, HTML, CSS, and JavaScript instantly in your browser.",
    url: absoluteUrl("/tools/formatters/"),
    type: "website",
  },
};

export default function FormattersPage() {
  const tools = getToolsByCategory("formatters");
  const cat = categories.formatters;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: cat.label,
    description: metadata.description,
    url: absoluteUrl("/tools/formatters/"),
    hasPart: tools.map((t) => ({
      "@type": "WebApplication",
      name: t.name,
      url: absoluteUrl(`/tools/formatters/${t.slug}/`),
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
            <a href="/tools/" className="hover:underline">Tools</a> &rsaquo; Formatters
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            { }  Code Formatters
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
            {cat.description} — paste your code and get back clean, readable output instantly.
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
