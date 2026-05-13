"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toolNavSections, tutorialNavSections } from "@/lib/navigation";
import CommandPalette from "./CommandPalette";
import MobileNav from "./MobileNav";

// ── Theme persistence (same logic as old Navbar) ──────────────────────────────

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
  const handle = () => callback();
  media.addEventListener("change", handle);
  window.addEventListener(THEME_EVENT, handle);
  window.addEventListener("storage", handle);
  return () => {
    media.removeEventListener("change", handle);
    window.removeEventListener(THEME_EVENT, handle);
    window.removeEventListener("storage", handle);
  };
}

// ── Mega-menu dropdown ────────────────────────────────────────────────────────

function MegaMenu({
  label,
  sections,
  isOpen,
  onClose,
}: {
  label: string;
  sections: typeof toolNavSections;
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <div className="relative">
      <button
        className={`flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-medium transition-colors ${
          isOpen
            ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        }`}
        onClick={() => onClose()}
      >
        {label}
        <svg className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 w-[640px] rounded-xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-900">
          <div className="grid grid-cols-3 gap-4">
            {sections.slice(0, 9).map((section) => (
              <div key={section.slug}>
                <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  <span>{section.icon}</span>
                  {section.title}
                </p>
                <ul className="space-y-1">
                  {section.items.slice(0, 4).map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className="block truncate rounded px-1.5 py-1 text-sm text-gray-700 transition-colors hover:bg-gray-100 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-blue-400"
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-3 border-t border-gray-100 pt-3 dark:border-gray-800">
            <Link
              href={label === "Tutorials" ? "/tutorials/" : "/tools/"}
              onClick={onClose}
              className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              View all {label} →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tutorial dropdown sections (build from tutorialNavSections, filtered to non-empty) ──

function TutorialMegaMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const tutorialSections = tutorialNavSections.map((s) => ({
    ...s,
    items: [
      { title: `All ${s.title}`, href: `/tutorials/?category=${s.slug}`, badge: undefined },
    ],
  }));

  return (
    <div className="relative">
      <button
        className={`flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-medium transition-colors ${
          isOpen
            ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        }`}
        onClick={onClose}
      >
        Tutorials
        <svg className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 w-[600px] rounded-xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-900">
          <div className="grid grid-cols-3 gap-x-4 gap-y-3">
            {tutorialNavSections.map((section) => (
              <Link
                key={section.slug}
                href={`/tutorials/`}
                onClick={onClose}
                className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <span className="text-base">{section.icon}</span>
                <span className="text-gray-700 dark:text-gray-300">{section.title}</span>
              </Link>
            ))}
          </div>
          <div className="mt-3 border-t border-gray-100 pt-3 dark:border-gray-800">
            <Link
              href="/tutorials/"
              onClick={onClose}
              className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              Browse all tutorials →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function GlobalNavbar() {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<"tutorials" | "tools" | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const dark = useSyncExternalStore(subscribeToThemeChange, getThemePreference, () => false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  function toggleDark() {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("theme", next ? "dark" : "light");
    window.dispatchEvent(new Event(THEME_EVENT));
  }

  // Close menus on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close on route change
  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
  }, [pathname]);

  function toggleMenu(menu: "tutorials" | "tools") {
    setOpenMenu((prev) => (prev === menu ? null : menu));
  }

  return (
    <>
      <CommandPalette />
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <nav
        ref={navRef}
        className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/90"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5">
          {/* Left: Logo + primary nav */}
          <div className="flex items-center gap-1">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="mr-1 rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
              aria-label="Open navigation menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <Link href="/" className="mr-3 text-xl font-bold text-gray-900 dark:text-white">
              <span className="text-blue-600">Dev</span>Forge
            </Link>

            {/* Desktop nav links */}
            <div className="hidden items-center gap-0.5 lg:flex">
              <TutorialMegaMenu
                isOpen={openMenu === "tutorials"}
                onClose={() => toggleMenu("tutorials")}
              />
              <MegaMenu
                label="Tools"
                sections={toolNavSections}
                isOpen={openMenu === "tools"}
                onClose={() => toggleMenu("tools")}
              />
              <Link
                href="/paths/"
                className="rounded-md px-2 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
              >
                Learning Paths
              </Link>
            </div>
          </div>

          {/* Right: Search trigger + GitHub + dark mode */}
          <div className="flex items-center gap-2">
            {/* Cmd+K search trigger */}
            <button
              onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }))}
              className="hidden items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-800 sm:flex"
              aria-label="Open search"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <span className="hidden md:inline">Search…</span>
              <kbd className="hidden rounded border border-gray-200 px-1 py-0.5 text-[10px] dark:border-gray-700 lg:inline">
                ⌘K
              </kbd>
            </button>

            {/* GitHub */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 sm:block"
              aria-label="GitHub"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>

            {/* Dark mode toggle */}
            <button
              onClick={toggleDark}
              aria-label="Toggle dark mode"
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              {dark ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
