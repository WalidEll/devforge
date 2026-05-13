import type { MetadataRoute } from "next";
import { tools } from "@/lib/tools";
import type { ToolCategory } from "@/lib/tools";
import { getAllTutorials } from "@/lib/all-tutorials";
import { learningPaths, getToolPath } from "@/lib/navigation";
import { absoluteUrl } from "@/lib/site";

const toolCategories: ToolCategory[] = ["formatters", "encoders", "generators", "converters", "validators", "networking"];

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const allTutorials = getAllTutorials();

  const toolEntries: MetadataRoute.Sitemap = tools.map((tool) => ({
    url: absoluteUrl(getToolPath(tool.slug)),
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const tutorialEntries: MetadataRoute.Sitemap = allTutorials.map((t) => ({
    url: absoluteUrl(`/tutorials/${t.slug}/`),
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const pathEntries: MetadataRoute.Sitemap = learningPaths.map((p) => ({
    url: absoluteUrl(`/paths/${p.slug}/`),
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const toolCategoryEntries: MetadataRoute.Sitemap = toolCategories.map((cat) => ({
    url: absoluteUrl(`/tools/${cat}/`),
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: absoluteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: absoluteUrl("/tools/"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/tutorials/"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/paths/"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...toolCategoryEntries,
    ...toolEntries,
    ...tutorialEntries,
    ...pathEntries,
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
