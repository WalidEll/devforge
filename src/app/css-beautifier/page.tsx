"use client";

import { useState } from "react";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("css-beautifier")!;

const faqs = [
  {
    question: "What does CSS beautification do?",
    answer:
      "It parses your CSS and reformats it with one property per line, consistent indentation, and proper spacing around braces and colons, making stylesheets easy to read and edit.",
  },
  {
    question: "Does minification change the styles?",
    answer:
      "No. Minification only removes whitespace and comments — the visual result is identical. It reduces file size for faster page loads.",
  },
  {
    question: "Is my code sent to a server?",
    answer: "No. All formatting happens in your browser using the js-beautify library. Your code never leaves your machine.",
  },
];

export default function CssBeautifierPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [indent, setIndent] = useState(2);
  const [loading, setLoading] = useState(false);

  async function beautify() {
    setError("");
    setLoading(true);
    try {
      const { css_beautify } = await import("js-beautify");
      setOutput(css_beautify(input, { indent_size: indent, end_with_newline: true }));
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
        .replace(/\s+/g, " ")
        .replace(/\s*([{};:,>~+])\s*/g, "$1")
        .replace(/;\}/g, "}")
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
      howToUse="Paste your CSS into the input field. Click Beautify to reformat it with one property per line and proper indentation, or Minify to compress it for production."
      useCases={[
        "Beautify minified CSS from production stylesheets for debugging",
        "Standardise CSS formatting before code review",
        "Minify stylesheets to reduce page load time",
      ]}
    >
      <div className="space-y-4">
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

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Input CSS</label>
          <textarea
            className="w-full h-48 font-mono text-sm p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder=".btn{display:inline-block;padding:8px 16px;background:#007bff;color:#fff;border-radius:4px}"
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
