"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Tutorial } from "@/lib/tutorials";
import { tutorials } from "@/lib/tutorials";
import { getToolPath } from "@/lib/navigation";
import { getToolBySlug } from "@/lib/tools";

interface Props {
  tutorial: Tutorial;
}

const difficultyColors: Record<string, string> = {
  beginner: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400",
  intermediate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400",
  advanced: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400",
};

function useActiveSection(sectionCount: number): number {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const ids = Array.from({ length: sectionCount }, (_, i) => `section-${i}`);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = ids.indexOf(entry.target.id);
            if (idx !== -1) setActive(idx);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sectionCount]);

  return active;
}

export default function TableOfContents({ tutorial }: Props) {
  const activeSection = useActiveSection(tutorial.sections.length);
  // Find the next tutorial in the related list (static tutorials only; markdown tutorials not included)
  const nextTutorial = (tutorial.relatedSlugs ?? [])
    .map((s) => tutorials.find((t) => t.slug === s))
    .find(Boolean);

  const linkedTools = (tutorial.toolSlugs ?? [])
    .map((s) => getToolBySlug(s))
    .filter(Boolean);

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: tutorial.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  }

  return (
    <aside className="w-full shrink-0 lg:w-64 xl:w-72">
      <div className="sticky top-20 space-y-5">
        {/* Metadata */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-wrap gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${difficultyColors[tutorial.difficulty]}`}>
              {tutorial.difficulty}
            </span>
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              {tutorial.readingTime} min read
            </span>
          </div>
          {tutorial.keywords.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {tutorial.keywords.slice(0, 5).map((kw) => (
                <span key={kw} className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Table of contents */}
        {tutorial.sections.length > 0 && (
          <nav aria-label="Table of contents" className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-600">
              On this page
            </p>
            <ol className="space-y-1.5">
              {tutorial.sections.map((section, i) => (
                <li key={i}>
                  <a
                    href={`#section-${i}`}
                    className={`block text-sm transition-colors ${
                      activeSection === i
                        ? "font-medium text-blue-600 dark:text-blue-400"
                        : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                    }`}
                  >
                    {section.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Next tutorial */}
        {nextTutorial && (
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-600">
              Up next
            </p>
            <Link
              href={`/tutorials/${nextTutorial.slug}/`}
              className="group flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm dark:bg-blue-950">
                {nextTutorial.icon}
              </span>
              <span className="min-w-0 truncate group-hover:underline">{nextTutorial.title}</span>
              <svg className="h-4 w-4 shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}

        {/* Related tools */}
        {linkedTools.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-600">
              Related tools
            </p>
            <ul className="space-y-1.5">
              {linkedTools.map((tool) => (
                <li key={tool!.slug}>
                  <Link
                    href={getToolPath(tool!.slug)}
                    className="flex items-center gap-2 rounded-md px-1 py-1 text-sm text-gray-700 transition-colors hover:bg-gray-100 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-blue-400"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-gray-100 font-mono text-[10px] font-bold text-gray-500 dark:bg-gray-800">
                      {tool!.icon}
                    </span>
                    {tool!.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>
        </div>
      </div>
    </aside>
  );
}
