import "server-only";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type {
  Tutorial,
  TutorialContentBlock,
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

function isTableSeparator(line: string): boolean {
  return /^\s*\|?(?:\s*:?-{3,}:?\s*\|)+\s*:?-{3,}:?\s*\|?\s*$/.test(line);
}

function isTableRow(line: string): boolean {
  return line.includes("|");
}

function splitTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function parseSectionBlocks(markdown: string): TutorialContentBlock[] {
  const blocks: TutorialContentBlock[] = [];
  const lines = markdown.split("\n");
  let index = 0;

  const isUnorderedListItem = (line: string) => /^[-*]\s+/.test(line);
  const isOrderedListItem = (line: string) => /^\d+\.\s+/.test(line);

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (line.startsWith("```")) {
      const language = line.slice(3).trim() || undefined;
      index += 1;

      const codeLines: string[] = [];
      while (index < lines.length && !lines[index].startsWith("```")) {
        codeLines.push(lines[index]);
        index += 1;
      }

      if (index < lines.length && lines[index].startsWith("```")) {
        index += 1;
      }

      blocks.push({
        type: "code",
        code: codeLines.join("\n").trimEnd(),
        ...(language ? { language } : {}),
      });
      continue;
    }

    if (
      index + 1 < lines.length &&
      isTableRow(line) &&
      isTableSeparator(lines[index + 1])
    ) {
      const headers = splitTableRow(line);
      index += 2;

      const rows: string[][] = [];
      while (index < lines.length && lines[index].trim() && isTableRow(lines[index])) {
        rows.push(splitTableRow(lines[index]));
        index += 1;
      }

      blocks.push({
        type: "table",
        headers,
        rows,
      });
      continue;
    }

    if (isUnorderedListItem(line)) {
      const items: string[] = [];

      while (index < lines.length && isUnorderedListItem(lines[index])) {
        items.push(lines[index].replace(/^[-*]\s+/, "").trim());
        index += 1;
      }

      blocks.push({
        type: "unordered-list",
        items,
      });
      continue;
    }

    if (isOrderedListItem(line)) {
      const items: string[] = [];

      while (index < lines.length && isOrderedListItem(lines[index])) {
        items.push(lines[index].replace(/^\d+\.\s+/, "").trim());
        index += 1;
      }

      blocks.push({
        type: "ordered-list",
        items,
      });
      continue;
    }

    const paragraphLines: string[] = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !lines[index].startsWith("```") &&
      !isUnorderedListItem(lines[index]) &&
      !isOrderedListItem(lines[index]) &&
      !(
        index + 1 < lines.length &&
        isTableRow(lines[index]) &&
        isTableSeparator(lines[index + 1])
      )
    ) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }

    blocks.push({
      type: "paragraph",
      text: paragraphLines.join("\n"),
    });
  }

  return blocks;
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
    const blocks = parseSectionBlocks(rest.trim());
    const firstCodeBlock = blocks.find((block) => block.type === "code");
    const body = blocks
      .filter((block): block is Extract<TutorialContentBlock, { type: "paragraph" }> => block.type === "paragraph")
      .map((block) => block.text)
      .join("\n\n");

    sections.push({
      heading: headingLine,
      body: body.trim(),
      ...(firstCodeBlock && { code: firstCodeBlock.code }),
      ...(firstCodeBlock?.language && { codeLanguage: firstCodeBlock.language }),
      blocks,
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
