import type { Metadata } from "next";
import Link from "next/link";
import { learningPaths } from "@/lib/navigation";
import { getAllTutorials } from "@/lib/all-tutorials";

export const metadata: Metadata = {
  title: "Learning Paths — DevForge",
  description:
    "Structured learning paths for cloud engineers. Master GCP networking, Kubernetes, Terraform, and DevOps with curated tutorial sequences.",
  alternates: { canonical: "/paths/" },
};

const difficultyColors: Record<string, string> = {
  beginner: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400",
  intermediate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400",
  advanced: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400",
};

export default function PathsPage() {
  const allTutorials = getAllTutorials();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Hero */}
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Learning Paths
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
          Curated sequences of tutorials designed to take you from beginner to production-ready.
          Built for cloud engineers, DevOps practitioners, and platform teams.
        </p>
      </section>

      {/* Path cards */}
      <div className="grid gap-6 sm:grid-cols-2">
        {learningPaths.map((path) => {
          const totalTutorials = path.modules.reduce(
            (sum, m) => sum + m.tutorials.length,
            0
          );
          const availableTutorials = path.modules
            .flatMap((m) => m.tutorials)
            .filter((slug) => allTutorials.some((t) => t.slug === slug)).length;

          return (
            <Link
              key={path.slug}
              href={`/paths/${path.slug}/`}
              className="group flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-blue-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-700"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-2xl dark:bg-blue-950">
                  {path.icon}
                </span>
                <div className="min-w-0">
                  <h2 className="font-bold text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                    {path.title}
                  </h2>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${difficultyColors[path.difficulty]}`}>
                      {path.difficulty}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                      ~{path.estimatedHours}h
                    </span>
                    {availableTutorials > 0 && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                        {availableTutorials} tutorial{availableTutorials !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                {path.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {path.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Module list preview */}
              <div className="border-t border-gray-100 pt-3 dark:border-gray-800">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Modules
                </p>
                <ul className="space-y-1">
                  {path.modules.map((module, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gray-200 text-[10px] font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                        {i + 1}
                      </span>
                      {module.title}
                    </li>
                  ))}
                </ul>
              </div>
            </Link>
          );
        })}
      </div>

      {/* CTA */}
      <section className="mt-16 rounded-2xl border border-blue-200 bg-blue-50 p-8 text-center dark:border-blue-900 dark:bg-blue-950/30">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Looking for something specific?
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Browse all tutorials or use the search to find what you need.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Link
            href="/tutorials/"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Browse Tutorials
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          >
            Explore Tools
          </Link>
        </div>
      </section>
    </div>
  );
}
