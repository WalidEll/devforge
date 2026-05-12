import type { MetadataRoute } from "next";
import { tools } from "@/lib/tools";
import { tutorials } from "@/lib/tutorials";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const toolEntries: MetadataRoute.Sitemap = tools.map((tool) => ({
    url: absoluteUrl(`/${tool.slug}/`),
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const tutorialEntries: MetadataRoute.Sitemap = tutorials.map((t) => ({
    url: absoluteUrl(`/tutorials/${t.slug}/`),
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    {
      url: absoluteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: absoluteUrl("/tutorials/"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...toolEntries,
    ...tutorialEntries,
    {
      url: absoluteUrl("/about/"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: absoluteUrl("/privacy-policy/"),
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: absoluteUrl("/terms/"),
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];
}
