"use client";

import { useState } from "react";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("javascript-beautifier")!;

const faqs = [
  {
    question: "What is a JavaScript beautifier?",
    answer:
      "A JavaScript beautifier (or formatter) takes minified or poorly-formatted JS code and reformats it with consistent indentation, line breaks, and spacing, making it readable and maintainable.",
  },
  {
    question: "How does the minifier work?",
    answer:
      "The minifier strips whitespace, comments, and newlines while preserving the code's functionality, producing a compact version suitable for production.",
  },
  {
    question: "Is my code sent to a server?",
    answer: "No. Beautification and minification happen entirely in your browser using the js-beautify library. Your code never leaves your machine.",
  },
];

export default function JavaScriptBeautifierPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [indent, setIndent] = useState(2);
  const [loading, setLoading] = useState(false);

  async function beautify() {
    setError("");
    setLoading(true);
    try {
      const { js_beautify } = await import("js-beautify");
      setOutput(
        js_beautify(input, {
          indent_size: indent,
          space_in_empty_paren: false,
          end_with_newline: true,
        })
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Beautification failed");
      setOutput("");
    } finally {
      setLoading(false);
    }
  }

  function minify() {
    setError("");
    try {
      const result = input
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\/\/.*$/gm, "")
        .replace(/\s+/g, " ")
        .replace(/\s*([{};:,=+\-*/<>!&|^~?%()])\s*/g, "$1")
        .trim();
      setOutput(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Minification failed");
      setOutput("");
    }
  }

  return (
    <ToolLayout
      tool={tool}
      faqs={faqs}
      howToUse="Paste your JavaScript code into the input field. Click Beautify to format it with proper indentation, or Minify to remove whitespace and comments for production use."
      useCases={[
        "Reverse-engineer minified JavaScript from production pages",
        "Standardise code style before committing to a repo",
        "Minify scripts for improved page load performance",
      ]}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Indent</label>
            <select
              value={indent}
              onChange={(e) => setIndent(Number(e.target.value))}
              className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Input JavaScript</label>
          <textarea
            className="w-full h-48 font-mono text-sm p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="function hello(name){console.log('Hello, '+name+'!')}"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={beautify}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
          >
            {loading ? "Beautifying…" : "Beautify"}
          </button>
          <button
            onClick={minify}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            Minify
          </button>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {output && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Output</label>
              <CopyButton text={output} />
            </div>
            <textarea
              readOnly
              className="w-full h-64 font-mono text-sm p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none"
              value={output}
            />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
