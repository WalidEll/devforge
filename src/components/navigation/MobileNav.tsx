"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { toolNavSections, tutorialNavSections } from "@/lib/navigation";
import SidebarNav from "./SidebarNav";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileNav({ open, onClose }: MobileNavProps) {
  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    onClose();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 left-0 flex w-80 max-w-[85vw] flex-col bg-white shadow-xl dark:bg-gray-950">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
          <Link href="/" onClick={onClose} className="text-xl font-bold text-gray-900 dark:text-white">
            <span className="text-blue-600">Dev</span>Forge
          </Link>
          <button
            onClick={onClose}
            aria-label="Close navigation"
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search hint */}
        <button
          onClick={() => {
            onClose();
            setTimeout(() => {
              window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }));
            }, 150);
          }}
          className="mx-4 mt-3 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          Search tools & tutorials…
        </button>

        {/* Full sidebar navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          <SidebarNav />
        </div>

        {/* Footer links */}
        <div className="border-t border-gray-200 px-4 py-3 dark:border-gray-800">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
            <Link href="/about/" onClick={onClose} className="hover:text-gray-900 dark:hover:text-white">About</Link>
            <Link href="/privacy-policy/" onClick={onClose} className="hover:text-gray-900 dark:hover:text-white">Privacy</Link>
            <Link href="/terms/" onClick={onClose} className="hover:text-gray-900 dark:hover:text-white">Terms</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
