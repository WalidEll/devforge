"use client";

import { useState } from "react";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("json-escape")!;

const faqs = [
  {
    question: "What does JSON escape do?",
    answer:
      "JSON escape takes a plain string and adds backslash escapes so it can be safely embedded inside a JSON string value. It handles quotes, backslashes, newlines, tabs, and control characters.",
  },
  {
    question: "When do I need to escape a string for JSON?",
    answer:
      "Whenever you are building a JSON string manually or embedding text into JSON without using a serialiser. Unescaped double quotes or backslashes will break JSON parsing.",
  },
  {
    question: "Is my data sent to a server?",
    answer: "No. All processing happens in your browser. Your data never leaves your machine.",
  },
];

function escapeJson(str: string): string {
  return JSON.stringify(str).slice(1, -1);
}

function unescapeJson(str: string): string {
  try {
    return JSON.parse(`"${str}"`);
  } catch {
    throw new Error("Invalid JSON-escaped string");
  }
}

export default function JsonEscapePage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"escape" | "unescape">("escape");

  function process() {
    setError("");
    try {
      setOutput(mode === "escape" ? escapeJson(input) : unescapeJson(input));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Processing failed");
      setOutput("");
    }
  }

  return (
    <ToolLayout
      tool={tool}
      faqs={faqs}
      howToUse="Paste your string into the input, choose Escape or Unescape, then click the button. Escape wraps control characters and quotes for safe use inside a JSON string value. Unescape reverses the process."
      useCases={[
        "Embed user text safely inside a JSON string value",
        "Debug JSON payloads with escaped characters",
        "Prepare strings for programmatic JSON construction",
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
            placeholder={mode === "escape" ? 'Hello "world"\nNew line' : 'Hello \\"world\\"\\nNew line'}
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

        {error && <p className="text-red-500 text-sm">{error}</p>}

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
