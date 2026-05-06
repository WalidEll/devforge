"use client";

import { useState } from "react";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("json-to-csv")!;

const faqs = [
  {
    question: "What JSON format does this tool accept?",
    answer:
      "This tool accepts a JSON array of objects, e.g. [{\"name\": \"Alice\", \"age\": 30}, {\"name\": \"Bob\", \"age\": 25}]. Each object becomes a row and each key becomes a column header.",
  },
  {
    question: "Can I download the CSV file?",
    answer:
      "Yes, click the Download CSV button to save the converted data as a .csv file to your computer.",
  },
  {
    question: "What happens with nested objects?",
    answer:
      "Nested objects and arrays are serialized as JSON strings within the CSV cell. For best results, flatten your data before converting.",
  },
];

function jsonToCsv(jsonStr: string): string {
  const data = JSON.parse(jsonStr);
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("Input must be a non-empty JSON array of objects");
  }

  const headers = Array.from(new Set(data.flatMap((obj: Record<string, unknown>) => Object.keys(obj))));

  const escape = (val: unknown): string => {
    if (val === null || val === undefined) return "";
    const str = typeof val === "object" ? JSON.stringify(val) : String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = data.map((obj: Record<string, unknown>) =>
    headers.map((h) => escape(obj[h])).join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}

export default function JsonToCsvPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  function convert() {
    try {
      setOutput(jsonToCsv(input));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid input");
      setOutput("");
    }
  }

  function download() {
    if (!output) return;
    const blob = new Blob([output], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <ToolLayout
      tool={tool}
      faqs={faqs}
      howToUse="Paste a JSON array of objects into the input field and click Convert. The tool extracts all unique keys as column headers and maps each object to a CSV row. You can copy the result or download it as a .csv file."
      useCases={[
        "Converting API response data to spreadsheet format",
        "Preparing JSON datasets for Excel or Google Sheets",
        "Exporting database query results to CSV for reporting",
        "Transforming log data from JSON format to tabular data",
      ]}
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Input JSON Array
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='[{"name": "Alice", "age": 30}, {"name": "Bob", "age": 25}]'
            rows={10}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-mono text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
          />
        </div>

        <button
          onClick={convert}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Convert to CSV
        </button>

        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
            {error}
          </div>
        )}

        {output && (
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                CSV Output
              </label>
              <div className="flex gap-2">
                <CopyButton text={output} />
                <button
                  onClick={download}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Download CSV
                </button>
              </div>
            </div>
            <pre className="max-h-96 overflow-auto rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 font-mono text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
              {output}
            </pre>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
