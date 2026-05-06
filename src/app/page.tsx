import { categories, getToolsByCategory } from "@/lib/tools";
import type { ToolCategory } from "@/lib/tools";
import ToolCard from "@/components/ToolCard";

const categoryOrder: ToolCategory[] = ["formatters", "encoders", "generators", "converters"];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <section className="mb-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
          Free Developer Tools
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          16 fast, free utilities for developers. No signup, no tracking — just paste and go.
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
    </div>
  );
}
