"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { tools } from "@/lib/tools";
import { tutorials } from "@/lib/tutorials";
import { getToolPath } from "@/lib/navigation";

type ResultItem = {
  type: "tool" | "tutorial" | "path";
  title: string;
  description: string;
  href: string;
  icon: string;
  badge?: string;
};

const PATHS: ResultItem[] = [
  { type: "path", title: "GCP Networking Engineer", description: "Learning path", href: "/paths/gcp-networking-engineer/", icon: "🌐" },
  { type: "path", title: "Kubernetes Administrator", description: "Learning path", href: "/paths/kubernetes-administrator/", icon: "☸" },
  { type: "path", title: "Terraform Practitioner", description: "Learning path", href: "/paths/terraform-practitioner/", icon: "🏗" },
  { type: "path", title: "DevOps Foundations", description: "Learning path", href: "/paths/devops-foundations/", icon: "🛠" },
  { type: "path", title: "GCP Security Engineer", description: "Learning path", href: "/paths/gcp-security-engineer/", icon: "🔒" },
];

function fuzzyMatch(text: string, query: string): boolean {
  const t = text.toLowerCase();
  const q = query.toLowerCase().trim();
  if (!q) return true;
  return q.split(/\s+/).every((word) => t.includes(word));
}

function buildResults(query: string): ResultItem[] {
  const toolResults: ResultItem[] = tools
    .filter((t) =>
      fuzzyMatch(`${t.name} ${t.shortDescription} ${t.keywords.join(" ")}`, query)
    )
    .slice(0, 8)
    .map((t) => ({
      type: "tool" as const,
      title: t.name,
      description: t.shortDescription,
      href: getToolPath(t.slug),
      icon: t.icon,
    }));

  const tutorialResults: ResultItem[] = tutorials
    .filter((t) =>
      fuzzyMatch(`${t.title} ${t.description} ${t.keywords.join(" ")}`, query)
    )
    .slice(0, 8)
    .map((t) => ({
      type: "tutorial" as const,
      title: t.title,
      description: `${t.readingTime} min · ${t.difficulty}`,
      href: `/tutorials/${t.slug}/`,
      icon: t.icon,
      badge: t.difficulty,
    }));

  const pathResults: ResultItem[] = PATHS.filter((p) =>
    fuzzyMatch(p.title, query)
  );

  if (!query.trim()) {
    return [...PATHS.slice(0, 3), ...toolResults.slice(0, 4), ...tutorialResults.slice(0, 4)];
  }

  return [...pathResults, ...toolResults, ...tutorialResults];
}

const difficultyClass: Record<string, string> = {
  beginner: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  intermediate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
  advanced: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const results = buildResults(query);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setCursor(0);
  }, []);

  // Cmd+K / Ctrl+K toggle
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 10);
      setCursor(0);
    }
  }, [open]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === "Enter" && results[cursor]) {
      window.location.href = results[cursor].href;
      close();
    }
  }

  // Scroll cursor into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${cursor}"]`) as HTMLElement | null;
    el?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4"
      onClick={close}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative w-full max-w-xl overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search tools, tutorials, paths…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setCursor(0); }}
            onKeyDown={onKeyDown}
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none dark:text-white"
          />
          <kbd className="hidden rounded border border-gray-200 px-1.5 py-0.5 text-[10px] text-gray-400 dark:border-gray-700 sm:block">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[55vh] overflow-y-auto">
          {results.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-gray-500">No results for &ldquo;{query}&rdquo;</p>
          ) : (
            <>
              {/* Group by type */}
              {(["path", "tool", "tutorial"] as const).map((type) => {
                const group = results.filter((r) => r.type === type);
                if (!group.length) return null;
                const groupLabel = type === "path" ? "Learning Paths" : type === "tool" ? "Tools" : "Tutorials";
                return (
                  <div key={type}>
                    <p className="border-b border-gray-100 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:border-gray-800 dark:text-gray-600">
                      {groupLabel}
                    </p>
                    {group.map((item) => {
                      const idx = results.indexOf(item);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          data-idx={idx}
                          onClick={close}
                          className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
                            idx === cursor
                              ? "bg-blue-50 dark:bg-blue-950/50"
                              : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          }`}
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 font-mono text-xs font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                            {item.icon}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                              {item.title}
                            </p>
                            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                              {item.description}
                            </p>
                          </div>
                          {item.badge && (
                            <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${difficultyClass[item.badge] ?? ""}`}>
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center gap-3 border-t border-gray-100 px-4 py-2 dark:border-gray-800">
          <span className="text-[10px] text-gray-400">
            <kbd className="rounded border border-gray-200 px-1 py-0.5 dark:border-gray-700">↑↓</kbd> navigate
          </span>
          <span className="text-[10px] text-gray-400">
            <kbd className="rounded border border-gray-200 px-1 py-0.5 dark:border-gray-700">↵</kbd> open
          </span>
          <span className="text-[10px] text-gray-400">
            <kbd className="rounded border border-gray-200 px-1 py-0.5 dark:border-gray-700">Esc</kbd> close
          </span>
        </div>
      </div>
    </div>
  );
}
