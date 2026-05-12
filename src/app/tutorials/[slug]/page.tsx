import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { tutorialCategories } from "@/lib/tutorials";
import type { Tutorial, TutorialContentBlock } from "@/lib/tutorials";
import { getAllTutorials } from "@/lib/all-tutorials";
import { getToolBySlug } from "@/lib/tools";
import type { Tool } from "@/lib/tools";
import AdUnit from "@/components/AdUnit";
import MermaidDiagram from "@/components/MermaidDiagram";
import TutorialCard from "@/components/TutorialCard";
import ToolCard from "@/components/ToolCard";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllTutorials().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tutorial = getAllTutorials().find((t) => t.slug === slug);
  if (!tutorial) return {};

  return {
    title: `${tutorial.title} — DevForge Tutorial`,
    description: tutorial.description,
    keywords: tutorial.keywords.join(", "),
    openGraph: {
      title: `${tutorial.title} — DevForge Tutorial`,
      description: tutorial.description,
      url: `https://devforge.tools/tutorials/${tutorial.slug}`,
      siteName: "DevForge",
      type: "article",
    },
    alternates: {
      canonical: `https://devforge.tools/tutorials/${tutorial.slug}`,
    },
  };
}

const difficultyColors: Record<string, string> = {
  beginner: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  intermediate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  advanced: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

function renderMarkdownLine(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-gray-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="rounded bg-gray-100 px-1 py-0.5 text-[0.95em] text-gray-900 dark:bg-gray-800 dark:text-gray-100"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    return part;
  });
}

function renderBody(body: string) {
  const paragraphs = body.split("\n\n");
  return paragraphs.map((para, i) => {
    const lines = para.split("\n");
    const isList = lines.every((l) => /^[-*]\s/.test(l) || l.trim() === "");
    const isNumberedList = lines.every((l) => /^\d+\.\s/.test(l) || l.trim() === "");

    if (isList) {
      return (
        <ul key={i} className="list-disc space-y-1 pl-5 text-gray-700 dark:text-gray-300">
          {lines
            .filter((l) => l.trim())
            .map((l, j) => (
              <li key={j}>{renderMarkdownLine(l.replace(/^[-*]\s/, ""))}</li>
            ))}
        </ul>
      );
    }

    if (isNumberedList) {
      return (
        <ol key={i} className="list-decimal space-y-1 pl-5 text-gray-700 dark:text-gray-300">
          {lines
            .filter((l) => l.trim())
            .map((l, j) => (
              <li key={j}>{renderMarkdownLine(l.replace(/^\d+\.\s/, ""))}</li>
            ))}
        </ol>
      );
    }

    return (
      <p key={i} className="text-gray-700 dark:text-gray-300">
        {renderMarkdownLine(para)}
      </p>
    );
  });
}

function renderCodeBlock(code: string, language?: string) {
  if (language === "mermaid") {
    return <MermaidDiagram chart={code} />;
  }

  return (
    <pre className="mt-4 overflow-x-auto rounded-lg border border-gray-200 bg-gray-950 p-4 text-sm text-gray-100 dark:border-gray-700">
      <code>{code}</code>
    </pre>
  );
}

function renderSectionBlock(block: TutorialContentBlock, index: number) {
  if (block.type === "paragraph") {
    return (
      <p key={index} className="text-gray-700 dark:text-gray-300">
        {renderMarkdownLine(block.text)}
      </p>
    );
  }

  if (block.type === "unordered-list") {
    return (
      <ul key={index} className="list-disc space-y-1 pl-5 text-gray-700 dark:text-gray-300">
        {block.items.map((item, itemIndex) => (
          <li key={itemIndex}>{renderMarkdownLine(item)}</li>
        ))}
      </ul>
    );
  }

  if (block.type === "ordered-list") {
    return (
      <ol key={index} className="list-decimal space-y-1 pl-5 text-gray-700 dark:text-gray-300">
        {block.items.map((item, itemIndex) => (
          <li key={itemIndex}>{renderMarkdownLine(item)}</li>
        ))}
      </ol>
    );
  }

  if (block.type === "table") {
    return (
      <div key={index} className="mt-4 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-gray-100 dark:bg-gray-900">
            <tr>
              {block.headers.map((header, headerIndex) => (
                <th
                  key={headerIndex}
                  className="border-b border-gray-200 px-4 py-3 font-semibold text-gray-900 dark:border-gray-700 dark:text-white"
                >
                  {renderMarkdownLine(header)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="bg-white dark:bg-gray-950/20">
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="border-b border-gray-200 px-4 py-3 align-top text-gray-700 dark:border-gray-800 dark:text-gray-300"
                  >
                    {renderMarkdownLine(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (block.type === "code") {
    return <div key={index}>{renderCodeBlock(block.code, block.language)}</div>;
  }

  return null;
}

export default async function TutorialPage({ params }: PageProps) {
  const { slug } = await params;
  const allTutorials = getAllTutorials();
  const tutorial = allTutorials.find((t) => t.slug === slug);
  if (!tutorial) notFound();

  const related = (tutorial.relatedSlugs ?? [])
    .map((s) => allTutorials.find((t) => t.slug === s))
    .filter(Boolean) as Tutorial[];
  const cat = tutorialCategories[tutorial.category];
  const linkedTools = (tutorial.toolSlugs ?? [])
    .map((s) => getToolBySlug(s))
    .filter(Boolean) as Tool[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: tutorial.title,
    description: tutorial.description,
    url: `https://devforge.tools/tutorials/${tutorial.slug}`,
    publisher: {
      "@type": "Organization",
      name: "DevForge",
      url: "https://devforge.tools",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-8">
        <AdUnit slot="TOP_LEADERBOARD" format="horizontal" />

        <div className="mt-6 flex flex-col gap-8 lg:flex-row">
          <article className="min-w-0 flex-1">
            <div className="mb-2">
              <Link
                href="/tutorials"
                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                &larr; All Tutorials
              </Link>
            </div>

            <div className="mb-6">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  {cat.label}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${difficultyColors[tutorial.difficulty]}`}
                >
                  {tutorial.difficulty}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  {tutorial.readingTime} min read
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {tutorial.title}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">{tutorial.description}</p>
            </div>

            <nav className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
              <p className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                In this tutorial
              </p>
              <ol className="list-decimal space-y-1 pl-5 text-sm">
                {tutorial.sections.map((section, i) => (
                  <li key={i}>
                    <a
                      href={`#section-${i}`}
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {section.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="space-y-8">
              {tutorial.sections.map((section, i) => (
                <section key={i} id={`section-${i}`}>
                  <h2 className="mb-3 text-xl font-bold text-gray-900 dark:text-white">
                    {section.heading}
                  </h2>
                  <div className="space-y-3">
                    {section.blocks?.length
                      ? section.blocks.map((block, blockIndex) => renderSectionBlock(block, blockIndex))
                      : renderBody(section.body)}
                  </div>
                  {!section.blocks?.length && section.code && renderCodeBlock(section.code, section.codeLanguage)}
                </section>
              ))}
            </div>

            {linkedTools.length > 0 && (
              <section className="mt-10 rounded-xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950/30">
                <h2 className="mb-1 text-lg font-bold text-gray-900 dark:text-white">
                  Try it on DevForge
                </h2>
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                  Free online tools related to this tutorial — no signup required.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {linkedTools.map((tool) => (
                    <ToolCard key={tool.slug} tool={tool} />
                  ))}
                </div>
              </section>
            )}

            <AdUnit slot="BELOW_TOOL" format="rectangle" className="mt-8" />

            {related.length > 0 && (
              <section className="mt-10">
                <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                  Related Tutorials
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {related.map((t) => (
                    <TutorialCard key={t.slug} tutorial={t} />
                  ))}
                </div>
              </section>
            )}
          </article>

          <aside className="w-full shrink-0 lg:w-72">
            <div className="sticky top-20 space-y-6">
              <AdUnit slot="SIDEBAR_RECT" format="rectangle" />
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
