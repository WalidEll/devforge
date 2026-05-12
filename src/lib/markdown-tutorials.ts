import "server-only";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type {
  Tutorial,
  TutorialSection,
  TutorialCategory,
  TutorialDifficulty,
} from "./tutorials";

const CONTENT_DIR = path.join(process.cwd(), "content", "tutorials");

const VALID_CATEGORIES: TutorialCategory[] = [
  "networking",
  "security",
  "devops",
  "web",
  "databases",
  "linux",
  "programming",
];

const VALID_DIFFICULTIES: TutorialDifficulty[] = [
  "beginner",
  "intermediate",
  "advanced",
];

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseFrontmatterDate(value: unknown, file: string): string {
  if (value instanceof Date) {
    return formatDate(value);
  }

  if (typeof value !== "string") {
    throw new Error(`Tutorial "${file}": "date" frontmatter must be a string or Date`);
  }

  if (DATE_ONLY_PATTERN.test(value)) {
    return value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Tutorial "${file}": invalid "date" frontmatter value "${value}"`);
  }

  return formatDate(parsed);
}

function parseMarkdownSections(markdown: string): TutorialSection[] {
  // Split on lines starting with ## (but not ###)
  const chunks = markdown.split(/^(?=## )/m).filter((c) => c.trim());
  const sections: TutorialSection[] = [];

  for (const chunk of chunks) {
    const lines = chunk.split("\n");
    const headingLine = lines[0].replace(/^## /, "").trim();
    if (!headingLine) continue;

    const rest = lines.slice(1).join("\n");

    // Extract the first fenced code block
    const codeMatch = rest.match(/```(\w*)\n([\s\S]*?)```/);
    let code: string | undefined;
    let codeLanguage: string | undefined;
    let body = rest;

    if (codeMatch) {
      codeLanguage = codeMatch[1] || undefined;
      code = codeMatch[2].trimEnd();
      body = rest.replace(codeMatch[0], "").trim();
    }

    sections.push({
      heading: headingLine,
      body: body.trim(),
      ...(code !== undefined && { code }),
      ...(codeLanguage !== undefined && { codeLanguage }),
    });
  }

  return sections;
}

function validateFrontmatter(data: Record<string, unknown>, file: string): void {
  const required = [
    "title",
    "slug",
    "description",
    "category",
    "difficulty",
    "keywords",
    "icon",
    "readingTime",
    "date",
  ];
  for (const field of required) {
    if (data[field] === undefined || data[field] === null) {
      throw new Error(`Tutorial "${file}": missing required frontmatter field "${field}"`);
    }
  }
  if (!VALID_CATEGORIES.includes(data.category as TutorialCategory)) {
    throw new Error(
      `Tutorial "${file}": invalid category "${data.category}". Must be one of: ${VALID_CATEGORIES.join(", ")}`
    );
  }
  if (!VALID_DIFFICULTIES.includes(data.difficulty as TutorialDifficulty)) {
    throw new Error(
      `Tutorial "${file}": invalid difficulty "${data.difficulty}". Must be one of: ${VALID_DIFFICULTIES.join(", ")}`
    );
  }
}

export function loadMarkdownTutorials(): Tutorial[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md"));

  return files.map((file) => {
    const filePath = path.join(CONTENT_DIR, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);

    validateFrontmatter(data as Record<string, unknown>, file);

    return {
      title: data.title as string,
      slug: data.slug as string,
      description: data.description as string,
      category: data.category as TutorialCategory,
      difficulty: data.difficulty as TutorialDifficulty,
      keywords: (data.keywords as string[]) ?? [],
      icon: data.icon as string,
      readingTime: data.readingTime as number,
      relatedSlugs: (data.relatedSlugs as string[]) ?? [],
      toolSlugs: (data.toolSlugs as string[]) ?? [],
      date: parseFrontmatterDate(data.date, file),
      sections: parseMarkdownSections(content),
    } satisfies Tutorial;
  });
}
