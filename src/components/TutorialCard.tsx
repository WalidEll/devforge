import Link from "next/link";
import type { Tutorial } from "@/lib/tutorials";
import { tutorialCategories } from "@/lib/tutorials";

const difficultyColors: Record<string, string> = {
  beginner: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  intermediate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  advanced: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

export default function TutorialCard({ tutorial }: { tutorial: Tutorial }) {
  const cat = tutorialCategories[tutorial.category];

  return (
    <Link
      href={`/tutorials/${tutorial.slug}`}
      className="group flex flex-col rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-blue-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-700"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 font-mono text-sm font-bold text-blue-600 dark:bg-blue-950 dark:text-blue-400">
          {tutorial.icon}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${difficultyColors[tutorial.difficulty]}`}
        >
          {tutorial.difficulty}
        </span>
      </div>
      <h3 className="mb-1 font-semibold text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
        {tutorial.title}
      </h3>
      <p className="mb-3 flex-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
        {tutorial.description}
      </p>
      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
        <span>{cat.label}</span>
        <span>·</span>
        <span>{tutorial.readingTime} min read</span>
      </div>
    </Link>
  );
}
