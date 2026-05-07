import type { Metadata } from "next";
import type { Tool } from "./tools";

const SITE_NAME = "DevForge";
const SITE_URL = "https://devforge.tools";

export function generateToolMetadata(tool: Tool): Metadata {
  const title = `${tool.name} — Free Online`;
  const description = tool.description;

  return {
    title,
    description,
    keywords: tool.keywords.join(", "),
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${tool.slug}`,
      siteName: SITE_NAME,
      type: "website",
      images: [
        {
          url: `${SITE_URL}/og/${tool.slug}.png`,
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
      canonical: `${SITE_URL}/${tool.slug}`,
    },
  };
}

export function generateToolJsonLd(tool: Tool) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.name,
    description: tool.description,
    url: `${SITE_URL}/${tool.slug}`,
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
