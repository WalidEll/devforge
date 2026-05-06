import type { Tool } from "@/lib/tools";
import { getRelatedTools } from "@/lib/tools";
import { generateToolJsonLd, generateFaqJsonLd } from "@/lib/seo";
import RelatedTools from "./RelatedTools";
import AdUnit from "./AdUnit";

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

      <div className="mx-auto max-w-7xl px-4 py-8">
        <AdUnit slot="TOP_LEADERBOARD" format="horizontal" />

        <div className="mt-6 flex flex-col gap-8 lg:flex-row">
          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{tool.name}</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">{tool.description}</p>
            </div>

            {children}

            <AdUnit slot="BELOW_TOOL" format="rectangle" className="mt-8" />

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

          <aside className="w-full shrink-0 lg:w-72">
            <div className="sticky top-20 space-y-6">
              <AdUnit slot="SIDEBAR_RECT" format="rectangle" />
              <RelatedTools tools={related} />
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
