import "server-only";
import { tutorials as hardcodedTutorials } from "./tutorials";
import { loadMarkdownTutorials } from "./markdown-tutorials";
import type { Tutorial } from "./tutorials";

let _cache: Tutorial[] | null = null;

export function getAllTutorials(): Tutorial[] {
  if (_cache) return _cache;

  const markdownTutorials = loadMarkdownTutorials();
  const markdownSlugs = new Set(markdownTutorials.map((t) => t.slug));

  _cache = [
    ...hardcodedTutorials.filter((t) => !markdownSlugs.has(t.slug)),
    ...markdownTutorials,
  ];

  return _cache;
}
