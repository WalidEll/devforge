"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toolNavSections, tutorialNavSections, getTutorialNavItems } from "@/lib/navigation";
import type { NavSection, NavItem } from "@/lib/navigation";

interface RecentItem {
  title: string;
  href: string;
}

function useRecentPages(): RecentItem[] {
  const [recent, setRecent] = useState<RecentItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("devforge-recent");
      if (stored) setRecent(JSON.parse(stored));
    } catch {}
  }, []);

  return recent;
}

function useActiveSection(pathname: string): string {
  if (pathname.startsWith("/tools/networking")) return "networking-tools";
  if (pathname.startsWith("/tools/formatters")) return "formatters";
  if (pathname.startsWith("/tools/encoders")) return "encoders";
  if (pathname.startsWith("/tools/generators")) return "generators";
  if (pathname.startsWith("/tools/converters")) return "converters";
  if (pathname.startsWith("/tools/validators")) return "validators";
  if (pathname.startsWith("/tutorials")) return "tutorials";
  return "";
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-3.5 w-3.5 shrink-0 text-gray-400 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function NavItemLink({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname === item.href.replace(/\/$/, "");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (item.children?.some((c) => pathname.startsWith(c.href.replace(/\/$/, "")))) {
      setOpen(true);
    }
  }, [pathname, item.children]);

  if (item.children?.length) {
    return (
      <div>
        <button
          onClick={() => setOpen((v) => !v)}
          className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
            isActive
              ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
              : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          }`}
          style={{ paddingLeft: `${0.5 + depth * 0.75}rem` }}
        >
          {item.title}
          <ChevronIcon open={open} />
        </button>
        {open && (
          <div className="mt-0.5 space-y-0.5">
            {item.children.map((child) => (
              <NavItemLink key={child.href} item={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={`flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors ${
        isActive
          ? "bg-blue-50 font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
      }`}
      style={{ paddingLeft: `${0.5 + depth * 0.75}rem` }}
    >
      <span className="min-w-0 truncate">{item.title}</span>
      {item.badge && (
        <span
          className={`ml-1.5 shrink-0 rounded px-1 py-0.5 text-[10px] font-medium ${
            item.badge === "beginner"
              ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400"
              : item.badge === "intermediate"
              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400"
              : item.badge === "advanced"
              ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400"
              : "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400"
          }`}
        >
          {item.badge}
        </span>
      )}
    </Link>
  );
}

function SectionGroup({
  section,
  defaultOpen = false,
  isTutorialSection = false,
}: {
  section: NavSection;
  defaultOpen?: boolean;
  isTutorialSection?: boolean;
}) {
  const pathname = usePathname();
  const isPathInSection = section.items.some(
    (item) => pathname === item.href || pathname.startsWith(item.href.replace(/\/$/, ""))
  );
  const [open, setOpen] = useState(defaultOpen || isPathInSection);

  const items = isTutorialSection ? getTutorialNavItems(section.slug) : section.items;

  if (!items.length) return null;

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <span className="text-base leading-none">{section.icon}</span>
        <span className="flex-1 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {section.title}
        </span>
        <ChevronIcon open={open} />
      </button>
      {open && (
        <div className="mt-0.5 space-y-0.5 pb-1">
          {items.map((item) => (
            <NavItemLink key={item.href} item={item} depth={1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SidebarNav({ className = "" }: { className?: string }) {
  const recent = useRecentPages();

  return (
    <nav
      className={`flex flex-col gap-1 text-sm ${className}`}
      aria-label="Sidebar navigation"
    >
      {/* Learning Paths quick link */}
      <Link
        href="/paths/"
        className="mb-1 flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <span className="text-base">🎯</span>
        <span>Learning Paths</span>
      </Link>

      <div className="my-1 border-t border-gray-200 dark:border-gray-800" />

      {/* Tutorials sections */}
      <p className="px-2 pt-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600">
        Tutorials
      </p>
      <div className="space-y-0.5">
        {tutorialNavSections.map((section, i) => (
          <SectionGroup
            key={section.slug}
            section={section}
            isTutorialSection
            defaultOpen={i === 0}
          />
        ))}
      </div>

      <div className="my-1 border-t border-gray-200 dark:border-gray-800" />

      {/* Tools sections */}
      <p className="px-2 pt-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600">
        Tools
      </p>
      <div className="space-y-0.5">
        {toolNavSections.map((section, i) => (
          <SectionGroup
            key={section.slug}
            section={section}
            defaultOpen={i === 0}
          />
        ))}
      </div>

      {/* Recently viewed */}
      {recent.length > 0 && (
        <>
          <div className="my-1 border-t border-gray-200 dark:border-gray-800" />
          <p className="px-2 pt-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600">
            Recently Viewed
          </p>
          <div className="space-y-0.5">
            {recent.slice(0, 5).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              >
                <span className="text-gray-400">↩</span>
                <span className="min-w-0 truncate">{item.title}</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </nav>
  );
}
