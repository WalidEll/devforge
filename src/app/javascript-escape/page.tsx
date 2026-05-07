"use client";

import { useState } from "react";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("javascript-escape")!;

const faqs = [
  {
    question: "What characters are escaped?",
    answer:
      "Backslashes, single quotes, double quotes, newlines (\\n), carriage returns (\\r), tabs (\\t), and null characters (\\0) are escaped. Unicode characters above U+FFFF are escaped as \\uXXXX sequences.",
  },
  {
    question: "What is the difference between escape and unescape?",
    answer:
      "Escape converts a raw string into a JavaScript string literal — adding backslashes before special characters. Unescape does the reverse, converting a JavaScript string literal back to its raw form.",
  },
  {
    question: "Is my data sent to a server?",
    answer: "No. All escaping and unescaping happens entirely in your browser. Your data never leaves your machine.",
  },
];

function escapeJs(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\0/g, "\\0")
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n")
    .replace(/\t/g, "\\t")
    .replace(/[-￿]/g, (c) => "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0"));
}

function unescapeJs(str: string): string {
  return str
    .replace(/\\0/g, "\0")
    .replace(/\\r/g, "\r")
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
}

export default function JavaScriptEscapePage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"escape" | "unescape">("escape");

  function process() {
    setOutput(mode === "escape" ? escapeJs(input) : unescapeJs(input));
  }

  return (
    <ToolLayout
      tool={tool}
      faqs={faqs}
      howToUse="Paste your string into the input field, choose Escape or Unescape, then click the button. Escape converts a raw string into a safe JavaScript string literal. Unescape converts it back."
      useCases={[
        "Embed user-supplied text safely inside JavaScript string literals",
        "Debug escaped strings by reverting them to raw form",
        "Prepare strings for use in JSON or HTML attributes",
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
            placeholder={mode === "escape" ? 'He said "hello"\nNew line here' : 'He said \\"hello\\"\\nNew line here'}
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
