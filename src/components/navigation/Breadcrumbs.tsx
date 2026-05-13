"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getBreadcrumbs } from "@/lib/navigation";
import { absoluteUrl } from "@/lib/site";

export default function Breadcrumbs({ overrideTitle }: { overrideTitle?: string } = {}) {
  const pathname = usePathname();
  const raw = getBreadcrumbs(pathname);
  const crumbs =
    overrideTitle && raw.length > 0
      ? [...raw.slice(0, -1), { ...raw[raw.length - 1], label: overrideTitle }]
      : raw;

  if (crumbs.length <= 1) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.label,
      item: absoluteUrl(crumb.href),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
        {crumbs.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {i > 0 && (
              <svg className="h-3 w-3 shrink-0 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            )}
            {i === crumbs.length - 1 ? (
              <span className="max-w-[200px] truncate font-medium text-gray-900 dark:text-white" aria-current="page">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="truncate hover:text-gray-900 dark:hover:text-white"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}
