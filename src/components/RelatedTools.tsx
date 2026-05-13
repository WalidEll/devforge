import Link from "next/link";
import type { Tool } from "@/lib/tools";
import { getToolPath } from "@/lib/navigation";

export default function RelatedTools({ tools }: { tools: Tool[] }) {
  if (tools.length === 0) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        Related Tools
      </h3>
      <div className="flex flex-col gap-2">
        {tools.map((tool) => (
          <Link
            key={tool.slug}
            href={getToolPath(tool.slug)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded bg-gray-100 font-mono text-xs font-bold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              {tool.icon}
            </span>
            {tool.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
