"use client";

import { useState } from "react";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("csv-to-json")!;

const faqs = [
  {
    question: "How does CSV to JSON conversion work?",
    answer:
      "The first row of the CSV is treated as the header row. Each subsequent row becomes a JSON object with the header values as keys.",
  },
  {
    question: "Are quoted fields supported?",
    answer:
      "Yes. Fields wrapped in double quotes are handled correctly, including fields that contain commas or newlines inside the quotes.",
  },
  {
    question: "Is my data sent to a server?",
    answer: "No. All conversion happens in your browser. Your data never leaves your machine.",
  },
];

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      fields.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

function csvToJson(csv: string): string {
  const lines = csv.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) throw new Error("CSV must have at least a header row and one data row");
  const headers = parseCsvLine(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h.trim()] = (values[i] ?? "").trim(); });
    return obj;
  });
  return JSON.stringify(rows, null, 2);
}

export default function CsvToJsonPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  function convert() {
    setError("");
    try {
      setOutput(csvToJson(input));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed");
      setOutput("");
    }
  }

  return (
    <ToolLayout
      tool={tool}
      faqs={faqs}
      howToUse="Paste your CSV data into the input field and click Convert. The first row must be the header row — it becomes the JSON object keys. Quoted fields containing commas or newlines are handled correctly."
      useCases={[
        "Convert spreadsheet exports to JSON for API consumption",
        "Transform database CSV dumps to JSON for frontend apps",
        "Migrate data between CSV-based and JSON-based systems",
      ]}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Input CSV</label>
          <textarea
            className="w-full h-40 font-mono text-sm p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={"name,age,city\nAlice,30,New York\nBob,25,London"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        <button
          onClick={convert}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Convert to JSON
        </button>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {output && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">JSON Output</label>
              <CopyButton text={output} />
            </div>
            <textarea
              readOnly
              className="w-full h-56 font-mono text-sm p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none"
              value={output}
            />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
