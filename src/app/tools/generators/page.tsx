import type { Metadata } from "next";
import { categories, getToolsByCategory } from "@/lib/tools";
import ToolCard from "@/components/ToolCard";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Generators — DevForge Tools",
  description:
    "Free online generators: UUID / GUID, cron expression builder, lorem ipsum text, QR code, password, and more. Generate instantly in your browser.",
  alternates: {
    canonical: absoluteUrl("/tools/generators/"),
  },
  openGraph: {
    title: "Generators — DevForge Tools",
    description: "UUID, cron expression, lorem ipsum, QR code, and password generators — free, no signup required.",
    url: absoluteUrl("/tools/generators/"),
    type: "website",
  },
};

export default function GeneratorsPage() {
  const tools = getToolsByCategory("generators");
  const cat = categories.generators;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: cat.label,
    description: metadata.description,
    url: absoluteUrl("/tools/generators/"),
    hasPart: tools.map((t) => ({
      "@type": "WebApplication",
      name: t.name,
      url: absoluteUrl(`/tools/generators/${t.slug}/`),
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
            <a href="/tools/" className="hover:underline">Tools</a> &rsaquo; Generators
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            ✨ Generators
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
            {cat.description} — generate unique identifiers, test data, and scheduled expressions on demand.
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
