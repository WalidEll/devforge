import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { learningPaths } from "@/lib/navigation";
import { getAllTutorials } from "@/lib/all-tutorials";
import TutorialCard from "@/components/TutorialCard";
import SidebarNav from "@/components/navigation/SidebarNav";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return learningPaths.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const path = learningPaths.find((p) => p.slug === slug);
  if (!path) return {};
  return {
    title: `${path.title} — DevForge Learning Path`,
    description: path.description,
    alternates: { canonical: `/paths/${slug}/` },
  };
}

const difficultyColors: Record<string, string> = {
  beginner: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400",
  intermediate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400",
  advanced: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400",
};

export default async function PathDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const path = learningPaths.find((p) => p.slug === slug);
  if (!path) notFound();

  const allTutorials = getAllTutorials();

  return (
    <div className="mx-auto flex max-w-[1400px] gap-0 px-4 py-6">
      {/* Left sidebar */}
      <aside className="hidden w-56 shrink-0 xl:block">
        <div className="sticky top-20 overflow-y-auto pr-4" style={{ maxHeight: "calc(100vh - 5rem)" }}>
          <SidebarNav />
        </div>
      </aside>

      <div className="min-w-0 flex-1 xl:px-8">
    <div className="mx-auto max-w-4xl py-4">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
        <Link href="/" className="hover:text-gray-900 dark:hover:text-white">Home</Link>
        <span className="text-gray-300 dark:text-gray-600">›</span>
        <Link href="/paths/" className="hover:text-gray-900 dark:hover:text-white">Learning Paths</Link>
        <span className="text-gray-300 dark:text-gray-600">›</span>
        <span className="font-medium text-gray-900 dark:text-white">{path.title}</span>
      </nav>

      {/* Header */}
      <div className="mb-8 flex items-start gap-6">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-3xl dark:bg-blue-950">
          {path.icon}
        </span>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{path.title}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${difficultyColors[path.difficulty]}`}>
              {path.difficulty}
            </span>
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              ~{path.estimatedHours} hours
            </span>
            {path.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                {tag}
              </span>
            ))}
          </div>
          <p className="mt-3 text-gray-600 dark:text-gray-400">{path.description}</p>
        </div>
      </div>

      {/* Modules */}
      <div className="space-y-10">
        {path.modules.map((module, moduleIdx) => {
          const moduleTutorials = module.tutorials
            .map((s) => allTutorials.find((t) => t.slug === s))
            .filter(Boolean);

          return (
            <section key={moduleIdx}>
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {moduleIdx + 1}
                </span>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {module.title}
                </h2>
              </div>

              {moduleTutorials.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {moduleTutorials.map((tutorial, tutIdx) => (
                    <div key={tutorial!.slug} className="relative">
                      {tutIdx > 0 && (
                        <div className="absolute -top-2 left-4 flex items-center gap-1 text-[10px] text-gray-400">
                          <span className="rounded bg-gray-100 px-1.5 py-0.5 dark:bg-gray-800">Step {tutIdx + 1}</span>
                        </div>
                      )}
                      <TutorialCard tutorial={tutorial!} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-900/50">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Tutorials coming soon for this module.
                  </p>
                  <Link
                    href="/tutorials/"
                    className="mt-2 inline-block text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Browse all tutorials →
                  </Link>
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Back link */}
      <div className="mt-12 border-t border-gray-200 pt-6 dark:border-gray-800">
        <Link
          href="/paths/"
          className="text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          ← All Learning Paths
        </Link>
      </div>
    </div>
      </div>
    </div>
  );
}
