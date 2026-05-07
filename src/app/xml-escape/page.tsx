"use client";

import { useState } from "react";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("xml-escape")!;

const faqs = [
  {
    question: "Which characters are escaped?",
    answer:
      "The five XML predefined entities: & → &amp;, < → &lt;, > → &gt;, \" → &quot;, and ' → &apos;. The ampersand must be escaped first to avoid double-escaping.",
  },
  {
    question: "Why do I need to escape XML?",
    answer:
      "XML parsers interpret &, <, and > as markup. If your data contains these characters, you must escape them so they are treated as literal text rather than XML syntax.",
  },
  {
    question: "Is my data sent to a server?",
    answer: "No. All processing happens in your browser. Your data never leaves your machine.",
  },
];

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function unescapeXml(str: string): string {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

export default function XmlEscapePage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"escape" | "unescape">("escape");

  function process() {
    setOutput(mode === "escape" ? escapeXml(input) : unescapeXml(input));
  }

  return (
    <ToolLayout
      tool={tool}
      faqs={faqs}
      howToUse={"Paste your string into the input, select Escape or Unescape, then click the button. Escape converts &, <, >, \" and ' to XML entity references. Unescape converts entity references back to raw characters."}
      useCases={[
        "Safely embed user text inside XML element content or attributes",
        "Decode XML entity references back to plain text",
        "Prevent XML injection when building XML documents programmatically",
      ]}
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => setMode("escape")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === "escape"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Escape
          </button>
          <button
            onClick={() => setMode("unescape")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === "unescape"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Unescape
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Input</label>
          <textarea
            className="w-full h-40 font-mono text-sm p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={mode === "escape" ? '<tag attr="value">Hello & World</tag>' : "&lt;tag&gt;Hello &amp; World&lt;/tag&gt;"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        <button
          onClick={process}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          {mode === "escape" ? "Escape" : "Unescape"}
        </button>

        {output !== "" && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Output</label>
              <CopyButton text={output} />
            </div>
            <textarea
              readOnly
              className="w-full h-40 font-mono text-sm p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none"
              value={output}
            />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
