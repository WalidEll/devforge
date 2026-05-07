"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { tools } from "@/lib/tools";
import { tutorials } from "@/lib/tutorials";

const THEME_EVENT = "theme-change";

function getThemePreference() {
  if (typeof window === "undefined") return false;

  const stored = window.localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  return stored === "dark" || (!stored && prefersDark);
}

function subscribeToThemeChange(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const handleChange = () => callback();

  media.addEventListener("change", handleChange);
  window.addEventListener(THEME_EVENT, handleChange);
  window.addEventListener("storage", handleChange);

  return () => {
    media.removeEventListener("change", handleChange);
    window.removeEventListener(THEME_EVENT, handleChange);
    window.removeEventListener("storage", handleChange);
  };
}

export default function Navbar() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const dark = useSyncExternalStore(
    subscribeToThemeChange,
    getThemePreference,
    () => false
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  function toggleDark() {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("theme", next ? "dark" : "light");
    window.dispatchEvent(new Event(THEME_EVENT));
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const q = query.trim().toLowerCase();
  const filteredTools = q
    ? tools.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.keywords.some((k) => k.toLowerCase().includes(q))
      )
    : [];
  const filteredTutorials = q
    ? tutorials.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.keywords.some((k) => k.toLowerCase().includes(q))
      )
    : [];

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
            <span className="text-blue-600">Dev</span>Forge
          </Link>
          <div className="hidden items-center gap-4 text-sm font-medium sm:flex">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              Tools
            </Link>
            <Link
              href="/tutorials"
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              Tutorials
            </Link>
          </div>
        </div>

        <div ref={ref} className="relative hidden sm:block">
          <input
            type="text"
            placeholder="Search tools & tutorials..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(e.target.value.trim().length > 0);
            }}
            onFocus={() => query.trim() && setOpen(true)}
            className="w-64 rounded-lg border border-gray-300 bg-gray-50 px-3 py-1.5 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400"
          />
          {open && (filteredTools.length > 0 || filteredTutorials.length > 0) && (
            <div className="absolute top-full mt-1 w-80 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
              {filteredTools.length > 0 && (
                <>
                  <div className="px-4 py-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500">
                    Tools
                  </div>
                  {filteredTools.slice(0, 5).map((tool) => (
                    <Link
                      key={tool.slug}
                      href={`/${tool.slug}`}
                      onClick={() => {
                        setOpen(false);
                        setQuery("");
                      }}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded bg-gray-100 font-mono text-xs font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                        {tool.icon}
                      </span>
                      <div>
                        <div className="font-medium">{tool.name}</div>
                        <div className="text-xs text-gray-500">{tool.shortDescription}</div>
                      </div>
                    </Link>
                  ))}
                </>
              )}
              {filteredTutorials.length > 0 && (
                <>
                  <div className="px-4 py-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500">
                    Tutorials
                  </div>
                  {filteredTutorials.slice(0, 5).map((tut) => (
                    <Link
                      key={tut.slug}
                      href={`/tutorials/${tut.slug}`}
                      onClick={() => {
                        setOpen(false);
                        setQuery("");
                      }}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 font-mono text-xs font-bold text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                        {tut.icon}
                      </span>
                      <div>
                        <div className="font-medium">{tut.title}</div>
                        <div className="text-xs text-gray-500">{tut.readingTime} min read</div>
                      </div>
                    </Link>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        <button
          onClick={toggleDark}
          aria-label="Toggle dark mode"
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          {dark ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          )}
        </button>
      </div>
    </nav>
  );
}
