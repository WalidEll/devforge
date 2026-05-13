import type { Metadata } from "next";
import { categories, getToolsByCategory } from "@/lib/tools";
import ToolCard from "@/components/ToolCard";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Validators — DevForge Tools",
  description:
    "Free online validators: HTML validator, XPath tester, regex tester, credit card validator, and more. Validate data formats instantly in your browser.",
  alternates: {
    canonical: absoluteUrl("/tools/validators/"),
  },
  openGraph: {
    title: "Validators — DevForge Tools",
    description: "HTML, regex, XPath, and data validators — free browser-based validation tools for developers.",
    url: absoluteUrl("/tools/validators/"),
    type: "website",
  },
};

export default function ValidatorsPage() {
  const tools = getToolsByCategory("validators");
  const cat = categories.validators;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: cat.label,
    description: metadata.description,
    url: absoluteUrl("/tools/validators/"),
    hasPart: tools.map((t) => ({
      "@type": "WebApplication",
      name: t.name,
      url: absoluteUrl(`/tools/validators/${t.slug}/`),
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
            <a href="/tools/" className="hover:underline">Tools</a> &rsaquo; Validators
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            ✓ Validators
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
            {cat.description} — test patterns, validate markup, and check data correctness before it reaches production.
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
