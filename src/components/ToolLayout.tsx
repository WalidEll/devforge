import type { Tool } from "@/lib/tools";
import { getRelatedTools } from "@/lib/tools";
import { generateToolJsonLd, generateFaqJsonLd } from "@/lib/seo";
import RelatedTools from "./RelatedTools";
import AdUnit from "./AdUnit";
import SidebarNav from "./navigation/SidebarNav";
import Breadcrumbs from "./navigation/Breadcrumbs";

interface FAQ {
  question: string;
  answer: string;
}

interface ToolLayoutProps {
  tool: Tool;
  children: React.ReactNode;
  faqs?: FAQ[];
  howToUse?: string;
  useCases?: string[];
}

export default function ToolLayout({ tool, children, faqs, howToUse, useCases }: ToolLayoutProps) {
  const related = getRelatedTools(tool.slug);
  const toolJsonLd = generateToolJsonLd(tool);
  const faqJsonLd = faqs ? generateFaqJsonLd(faqs) : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      {/* 3-column layout: left sidebar | tool | right related */}
      <div className="mx-auto flex max-w-[1400px] gap-0 px-4 py-6">
        {/* Left sidebar */}
        <aside className="hidden w-56 shrink-0 xl:block">
          <div className="sticky top-20 overflow-y-auto pr-4" style={{ maxHeight: "calc(100vh - 5rem)" }}>
            <SidebarNav />
          </div>
        </aside>

        {/* Main content */}
        <div className="min-w-0 flex-1 xl:px-8">
          <AdUnit slot="TOP_LEADERBOARD" format="horizontal" />

          <div className="mt-4">
            <Breadcrumbs />
          </div>

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{tool.name}</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{tool.description}</p>
          </div>

          {children}

          <AdUnit slot="BELOW_TOOL" format="rectangle" className="mt-8" />

          <p className="mt-4 text-center text-sm text-gray-400 dark:text-gray-500">
            DevForge is free and ad-supported.{" "}
            <a
              href="https://ko-fi.com/devforgetools"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-600 hover:underline dark:text-amber-400"
            >
              Buy me a coffee
            </a>{" "}
            if it saved you time.
          </p>

          {howToUse && (
            <section className="mt-10">
              <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                How to Use This Tool
              </h2>
              <div className="prose prose-gray dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                <p>{howToUse}</p>
              </div>
            </section>
          )}

          {useCases && useCases.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                Common Use Cases
              </h2>
              <ul className="list-disc space-y-2 pl-5 text-gray-700 dark:text-gray-300">
                {useCases.map((uc, i) => (
                  <li key={i}>{uc}</li>
                ))}
              </ul>
            </section>
          )}

          {faqs && faqs.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <div key={i}>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {faq.question}
                    </h3>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block xl:w-72">
          <div className="sticky top-20 space-y-6">
            <AdUnit slot="SIDEBAR_RECT" format="rectangle" />
            <RelatedTools tools={related} />
          </div>
        </aside>
      </div>
    </>
  );
}
