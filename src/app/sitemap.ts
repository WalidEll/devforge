import type { MetadataRoute } from "next";
import { tools } from "@/lib/tools";
import { tutorials } from "@/lib/tutorials";

export const dynamic = "force-static";

const SITE_URL = "https://devforge.tools";

export default function sitemap(): MetadataRoute.Sitemap {
  const toolEntries: MetadataRoute.Sitemap = tools.map((tool) => ({
    url: `${SITE_URL}/${tool.slug}/`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const tutorialEntries: MetadataRoute.Sitemap = tutorials.map((t) => ({
    url: `${SITE_URL}/tutorials/${t.slug}/`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/tutorials/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...toolEntries,
    ...tutorialEntries,
    {
      url: `${SITE_URL}/about/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/privacy-policy/`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/terms/`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];
}
