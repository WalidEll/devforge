import Link from "next/link";
import type { Tool } from "@/lib/tools";

export default function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link
      href={`/${tool.slug}`}
      className="group flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-blue-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-700"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 font-mono text-sm font-bold text-blue-600 dark:bg-blue-950 dark:text-blue-400">
          {tool.icon}
        </span>
        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
          {tool.name}
        </h3>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">{tool.shortDescription}</p>
    </Link>
  );
}
