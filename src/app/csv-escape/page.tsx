"use client";

import { useState } from "react";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("csv-escape")!;

const faqs = [
  {
    question: "How does CSV escaping work?",
    answer:
      "Per RFC 4180, if a field contains a comma, double quote, or newline it must be wrapped in double quotes. Any double quote inside the field is itself doubled (\"\").",
  },
  {
    question: "What is the CSV delimiter used here?",
    answer:
      "This tool uses the standard comma delimiter. For TSV (tab-separated) or other delimiters, adjust your source accordingly.",
  },
  {
    question: "Is my data sent to a server?",
    answer: "No. All processing happens in your browser. Your data never leaves your machine.",
  },
];

function escapeCsvField(field: string): string {
  if (/[",\r\n]/.test(field)) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

function unescapeCsvField(field: string): string {
  if (field.startsWith('"') && field.endsWith('"')) {
    return field.slice(1, -1).replace(/""/g, '"');
  }
  return field;
}

export default function CsvEscapePage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"escape" | "unescape">("escape");

  function process() {
    const lines = input.split("\n");
    const result = lines
      .map((line) =>
        line
          .split(",")
          .map((field) => (mode === "escape" ? escapeCsvField(field) : unescapeCsvField(field)))
          .join(",")
      )
      .join("\n");
    setOutput(result);
  }

  return (
    <ToolLayout
      tool={tool}
      faqs={faqs}
      howToUse="Paste your CSV data into the input, choose Escape or Unescape, then click the button. Escape wraps fields containing commas, quotes, or newlines in double quotes per RFC 4180. Unescape strips the wrapping quotes."
      useCases={[
        "Prepare data fields that contain commas or quotes for CSV export",
        "Validate that your CSV escaping matches RFC 4180",
        "Strip CSV quoting to recover raw field values",
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
            placeholder={mode === "escape" ? 'John,Smith,"New York, NY",He said "hello"' : '"John","Smith","New York, NY","He said ""hello"""'}
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
