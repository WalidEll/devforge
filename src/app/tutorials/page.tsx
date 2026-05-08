import type { Metadata } from "next";
import { getAllTutorials } from "@/lib/all-tutorials";
import TutorialSearch from "@/components/TutorialSearch";

export const metadata: Metadata = {
  title: "Tutorials — Free IT Guides for Developers",
  description:
    "Searchable IT tutorials covering networking, security, DevOps, databases, Linux, and web development. Clear explanations with practical examples.",
  keywords:
    "developer tutorials, IT guides, programming tutorials, devops tutorials, networking guides, security tutorials",
};

export default function TutorialsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <section className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
          Tutorials
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          Clear, practical guides on IT fundamentals. Search by topic, category, or difficulty.
        </p>
      </section>

      <TutorialSearch tutorials={getAllTutorials()} />
    </div>
  );
}
