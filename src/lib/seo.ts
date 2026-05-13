import type { Metadata } from "next";
import type { Tool } from "./tools";
import { absoluteUrl } from "./site";
import { getToolPath } from "./navigation";

const SITE_NAME = "DevForge";

export function generateToolMetadata(tool: Tool): Metadata {
  const title = `${tool.name} — Free Online`;
  const description = tool.description;
  const toolPath = getToolPath(tool.slug);
  const toolUrl = absoluteUrl(toolPath);

  return {
    title,
    description,
    keywords: tool.keywords.join(", "),
    openGraph: {
      title,
      description,
      url: toolUrl,
      siteName: SITE_NAME,
      type: "website",
      images: [
        {
          url: absoluteUrl(`/og/${tool.slug}.png`),
          width: 1200,
          height: 630,
          alt: tool.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: toolPath,
    },
  };
}

export function generateToolJsonLd(tool: Tool) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.name,
    description: tool.description,
    url: absoluteUrl(getToolPath(tool.slug)),
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

export function generateFaqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
