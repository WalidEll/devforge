import type { Metadata } from "next";
import { categories, getToolsByCategory } from "@/lib/tools";
import ToolCard from "@/components/ToolCard";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Networking Tools — DevForge",
  description:
    "Free online networking tools: CIDR calculator, IPv4 subnet calculator, IP range expander, MAC address lookup, IPv6 ULA generator, GCP network planner, and more.",
  alternates: {
    canonical: absoluteUrl("/tools/networking/"),
  },
  openGraph: {
    title: "Networking Tools — DevForge",
    description: "CIDR, subnet, IP range, MAC address, and GCP network planning tools — free, browser-based.",
    url: absoluteUrl("/tools/networking/"),
    type: "website",
  },
};

export default function NetworkingToolsPage() {
  const tools = getToolsByCategory("networking");
  const cat = categories.networking;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: cat.label,
    description: metadata.description,
    url: absoluteUrl("/tools/networking/"),
    hasPart: tools.map((t) => ({
      "@type": "WebApplication",
      name: t.name,
      url: absoluteUrl(`/tools/networking/${t.slug}/`),
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
            <a href="/tools/" className="hover:underline">Tools</a> &rsaquo; Networking
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            🔗 Networking Tools
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
            {cat.description} — calculate subnets, plan GCP VPCs, look up MAC vendors, and work with IP ranges.
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
