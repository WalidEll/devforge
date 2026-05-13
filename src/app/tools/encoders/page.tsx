import type { Metadata } from "next";
import { categories, getToolsByCategory } from "@/lib/tools";
import ToolCard from "@/components/ToolCard";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Encoders & Decoders — DevForge Tools",
  description:
    "Free online encoders and decoders: Base64, URL, HTML entities, JWT, hash generator (MD5, SHA-256), and more. Encode or decode instantly in your browser.",
  alternates: {
    canonical: absoluteUrl("/tools/encoders/"),
  },
  openGraph: {
    title: "Encoders & Decoders — DevForge Tools",
    description: "Base64, URL, HTML, JWT, and hash tools. Encode and decode data instantly — no signup required.",
    url: absoluteUrl("/tools/encoders/"),
    type: "website",
  },
};

export default function EncodersPage() {
  const tools = getToolsByCategory("encoders");
  const cat = categories.encoders;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: cat.label,
    description: metadata.description,
    url: absoluteUrl("/tools/encoders/"),
    hasPart: tools.map((t) => ({
      "@type": "WebApplication",
      name: t.name,
      url: absoluteUrl(`/tools/encoders/${t.slug}/`),
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
            <a href="/tools/" className="hover:underline">Tools</a> &rsaquo; Encoders &amp; Decoders
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            🔐 Encoders &amp; Decoders
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
            {cat.description} — encode text, decode tokens, and generate cryptographic hashes instantly.
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
