"use client";

import { useState } from "react";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("lorem-ipsum-generator")!;

const faqs = [
  {
    question: "What is Lorem Ipsum?",
    answer:
      "Lorem Ipsum is placeholder text derived from a work by Cicero written in 45 BC. It has been the standard dummy text of the printing industry since the 1500s and is used by designers to fill space in mockups and prototypes.",
  },
  {
    question: "Why use Lorem Ipsum instead of real text?",
    answer:
      "Lorem Ipsum prevents readers from being distracted by the content and allows designers to focus on visual elements. It also prevents clients from making premature editorial decisions before the layout is approved.",
  },
  {
    question: "Can I use Lorem Ipsum for production?",
    answer:
      "No. Lorem Ipsum should only be used during design and development. Always replace it with real, meaningful content before publishing.",
  },
];

const WORDS = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum".split(" ");

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function randomWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function generateSentence(wordCount = 8 + Math.floor(Math.random() * 10)): string {
  const words = Array.from({ length: wordCount }, randomWord);
  return capitalize(words.join(" ")) + ".";
}

function generateParagraph(sentenceCount = 3 + Math.floor(Math.random() * 4)): string {
  return Array.from({ length: sentenceCount }, generateSentence).join(" ");
}

export default function LoremIpsumPage() {
  const [unit, setUnit] = useState<"paragraphs" | "sentences" | "words">("paragraphs");
  const [count, setCount] = useState(3);
  const [output, setOutput] = useState("");
  const [startWithLorem, setStartWithLorem] = useState(true);

  function generate() {
    let result = "";

    if (unit === "paragraphs") {
      const paras = Array.from({ length: count }, generateParagraph);
      if (startWithLorem) paras[0] = "Lorem ipsum dolor sit amet, " + paras[0].charAt(0).toLowerCase() + paras[0].slice(1);
      result = paras.join("\n\n");
    } else if (unit === "sentences") {
      const sentences = Array.from({ length: count }, generateSentence);
      if (startWithLorem) sentences[0] = "Lorem ipsum dolor sit amet.";
      result = sentences.join(" ");
    } else {
      const words = Array.from({ length: count }, randomWord);
      if (startWithLorem) { words[0] = "lorem"; words[1] = "ipsum"; }
      result = words.join(" ");
    }

    setOutput(result);
  }

  return (
    <ToolLayout
      tool={tool}
      faqs={faqs}
      howToUse="Choose how many paragraphs, sentences, or words you need, then click Generate. Toggle the 'Start with Lorem ipsum' option to begin with the classic opening phrase. Copy the result with one click."
      useCases={[
        "Filling wireframes and design mockups with realistic text",
        "Testing typography and font sizes in UI components",
        "Generating placeholder content for development and testing",
        "Filling database fields for staging environment testing",
      ]}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as typeof unit)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
            >
              <option value="paragraphs">Paragraphs</option>
              <option value="sentences">Sentences</option>
              <option value="words">Words</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Count</label>
            <input
              type="number"
              min={1}
              max={unit === "words" ? 500 : unit === "sentences" ? 50 : 20}
              value={count}
              onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
            />
          </div>
          <label className="flex items-center gap-2 pb-2 text-sm text-gray-700 dark:text-gray-300">
            <input type="checkbox" checked={startWithLorem} onChange={(e) => setStartWithLorem(e.target.checked)} className="rounded" />
            Start with &ldquo;Lorem ipsum&rdquo;
          </label>
          <button
            onClick={generate}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Generate
          </button>
        </div>

        {output && (
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Generated Text ({output.split(" ").length} words)
              </label>
              <CopyButton text={output} />
            </div>
            <div className="max-h-96 overflow-auto rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
              {unit === "paragraphs" ? (
                output.split("\n\n").map((p, i) => (
                  <p key={i} className="mb-4 text-sm text-gray-700 dark:text-gray-300 last:mb-0">
                    {p}
                  </p>
                ))
              ) : (
                <p className="text-sm text-gray-700 dark:text-gray-300">{output}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
