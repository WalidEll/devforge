import Link from "next/link";
import { categories, getToolsByCategory, tools } from "@/lib/tools";
import type { ToolCategory } from "@/lib/tools";
import { getAllTutorials } from "@/lib/all-tutorials";
import ToolCard from "@/components/ToolCard";
import TutorialCard from "@/components/TutorialCard";

const categoryOrder: ToolCategory[] = ["formatters", "encoders", "generators", "converters"];

export default function HomePage() {
  const featuredTutorials = getAllTutorials().slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <section className="mb-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
          Free Developer Tools &amp; Tutorials
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          Fast, free utilities and in-depth IT guides.
          No signup, no tracking — just paste and go.
        </p>
      </section>

      {categoryOrder.map((catKey) => {
        const cat = categories[catKey];
        const catTools = getToolsByCategory(catKey);
        return (
          <section key={catKey} className="mb-12">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{cat.label}</h2>
              <p className="mt-1 text-gray-600 dark:text-gray-400">{cat.description}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {catTools.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          </section>
        );
      })}

      <section className="mb-12">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Latest Tutorials</h2>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Learn IT fundamentals with clear, practical guides
            </p>
          </div>
          <Link
            href="/tutorials"
            className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            View all tutorials &rarr;
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredTutorials.map((tutorial) => (
            <TutorialCard key={tutorial.slug} tutorial={tutorial} />
          ))}
        </div>
      </section>

      <section className="mb-12 rounded-xl border border-gray-200 bg-gray-50 p-8 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
          Why DevForge?
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">100% Client-Side</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              All tools run in your browser. Your data never leaves your machine — no server processing, no uploads.
            </p>
          </div>
          <div>
            <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">No Signup Required</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No accounts, no email gates, no rate limits. Every tool is free and instantly available.
            </p>
          </div>
          <div>
            <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">Developer-First</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Built by developers, for developers. Clean interfaces, keyboard-friendly, dark mode included.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
