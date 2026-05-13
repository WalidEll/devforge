import type { Metadata } from "next";
import Link from "next/link";
import { categories, getToolsByCategory } from "@/lib/tools";
import type { ToolCategory } from "@/lib/tools";
import { getAllTutorials } from "@/lib/all-tutorials";
import ToolCard from "@/components/ToolCard";
import TutorialCard from "@/components/TutorialCard";
import { absoluteUrl } from "@/lib/site";
import { learningPaths } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "DevForge — Free Cloud Engineering Tools & Tutorials",
  description:
    "Cloud engineering tutorials and free browser tools for GCP, Kubernetes, and Terraform. 40+ utilities: CIDR, JSON, Base64, and more. No signup required.",
  alternates: {
    canonical: absoluteUrl("/"),
  },
  openGraph: {
    title: "DevForge — Free Cloud Engineering Tools & Tutorials",
    description:
      "Cloud engineering tutorials and free browser tools for GCP, Kubernetes, and Terraform. 40+ utilities. No signup required.",
    url: absoluteUrl("/"),
    type: "website",
  },
};

// Networking first — most relevant for the cloud engineering audience
const categoryOrder: ToolCategory[] = ["networking", "formatters", "encoders", "generators", "converters", "validators"];

const difficultyColors: Record<string, string> = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-yellow-100 text-yellow-700",
  advanced: "bg-red-100 text-red-700",
};

export default function HomePage() {
  const featuredTutorials = getAllTutorials().slice(0, 3);
  const featuredPaths = learningPaths.slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">

      {/* Hero */}
      <section className="mb-14 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
          The cloud engineer&apos;s reference
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
          GCP tutorials, Kubernetes guides, Terraform playbooks, and the browser tools to build alongside them — all free, no signup required.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/paths/"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            🎯 Start a Learning Path
          </Link>
          <Link
            href="/tutorials/"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Browse Tutorials →
          </Link>
        </div>
      </section>

      {/* Featured Learning Paths */}
      <section className="mb-14">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Learning Paths</h2>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Structured curricula for cloud engineers at every level
            </p>
          </div>
          <Link
            href="/paths/"
            className="shrink-0 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            View all paths →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredPaths.map((path) => (
            <Link
              key={path.slug}
              href={`/paths/${path.slug}/`}
              className="group flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl dark:bg-blue-950">
                  {path.icon}
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                    {path.title}
                  </h3>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${difficultyColors[path.difficulty]}`}>
                      {path.difficulty}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">~{path.estimatedHours}h</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{path.description}</p>
              <div className="flex flex-wrap gap-1">
                {path.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Tutorials */}
      <section className="mb-14">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Latest Tutorials</h2>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              In-depth guides on GCP, Kubernetes, Terraform, and more
            </p>
          </div>
          <Link
            href="/tutorials/"
            className="shrink-0 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            View all tutorials →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredTutorials.map((tutorial) => (
            <TutorialCard key={tutorial.slug} tutorial={tutorial} />
          ))}
        </div>
      </section>

      {/* Tools by Category */}
      <section className="mb-14">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Developer Tools</h2>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              40+ free utilities that run entirely in your browser
            </p>
          </div>
          <Link
            href="/tools/"
            className="shrink-0 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            All tools →
          </Link>
        </div>

        {categoryOrder.map((catKey) => {
          const cat = categories[catKey];
          const catTools = getToolsByCategory(catKey);
          return (
            <section key={catKey} className="mb-10">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{cat.label}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{cat.description}</p>
                </div>
                <Link
                  href={`/tools/${catKey}/`}
                  className="shrink-0 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  All {cat.label} →
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {catTools.map((tool) => (
                  <ToolCard key={tool.slug} tool={tool} />
                ))}
              </div>
            </section>
          );
        })}
      </section>

      {/* Why DevForge */}
      <section className="mb-12 rounded-xl border border-gray-200 bg-gray-50 p-8 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
          Why DevForge?
        </h2>
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          DevForge was built to give cloud engineers, DevOps practitioners, and platform engineers a single place for both reference material and the utilities they reach for every day. Unlike generic tool aggregators, every tutorial and tool on DevForge is written with production cloud infrastructure in mind — covering real GCP architectures, Kubernetes workloads, Terraform patterns, and CI/CD pipelines used in professional environments.
        </p>
        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">100% Client-Side Tools</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Every tool runs entirely in your browser using JavaScript. Your data — IP ranges, JSON payloads, JWT tokens, certificates — never leaves your machine. No server processing, no uploads, no logging.
            </p>
          </div>
          <div>
            <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">No Signup Required</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No accounts, no email gates, no rate limits, no paywalls. Every tool and every tutorial is free and instantly available. Bookmark the tools you use most and come back any time.
            </p>
          </div>
          <div>
            <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">Cloud-Engineering Focused</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Content is written for working engineers, not beginners learning general programming. Tutorials cover production-grade GCP networking, Kubernetes cluster operations, Terraform module design, and real-world DevOps workflows.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
