"use client";

import { useState } from "react";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("sql-escape")!;

const faqs = [
  {
    question: "What characters are escaped?",
    answer:
      "Single quotes are doubled ('' instead of \\') and backslashes are escaped. This covers the most common SQL injection vectors when embedding strings in queries.",
  },
  {
    question: "Does this prevent SQL injection?",
    answer:
      "Escaping reduces risk, but parameterised queries / prepared statements are the gold standard for prevention. Use this tool for quick checks or when manual string construction is unavoidable.",
  },
  {
    question: "Is my data sent to a server?",
    answer: "No. All processing happens in your browser. Your data never leaves your machine.",
  },
];

function escapeSql(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/'/g, "''");
}

function unescapeSql(str: string): string {
  return str.replace(/''/g, "'").replace(/\\\\/g, "\\");
}

export default function SqlEscapePage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"escape" | "unescape">("escape");

  function process() {
    setOutput(mode === "escape" ? escapeSql(input) : unescapeSql(input));
  }

  return (
    <ToolLayout
      tool={tool}
      faqs={faqs}
      howToUse="Paste your string into the input, choose Escape or Unescape, then click the button. Escape doubles single quotes and escapes backslashes so the string is safe to embed inside a SQL query."
      useCases={[
        "Safely embed user-supplied text in SQL string literals",
        "Prepare strings for legacy code that builds queries by concatenation",
        "Reverse-engineer escaped SQL strings for debugging",
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
            placeholder={mode === "escape" ? "O'Brien's data" : "O''Brien''s data"}
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
