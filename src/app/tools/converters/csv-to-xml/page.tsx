"use client";

import { useState } from "react";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("csv-to-xml")!;

const faqs = [
  {
    question: "How does the conversion work?",
    answer:
      "The first CSV row is used as XML element names for each column. Each subsequent row becomes a record element containing child elements named after the headers.",
  },
  {
    question: "What if a header contains spaces or special characters?",
    answer:
      "Spaces and invalid XML name characters are replaced with underscores to produce valid XML element names.",
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
      fields.push(current); current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

function safeXmlName(name: string): string {
  return name.trim().replace(/[^a-zA-Z0-9_.-]/g, "_") || "field";
}

function escapeXml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function csvToXml(csv: string, rootEl: string, recordEl: string): string {
  const lines = csv.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) throw new Error("CSV must have at least a header row and one data row");
  const headers = parseCsvLine(lines[0]).map(safeXmlName);
  const rows = lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const children = headers.map((h, i) => `    <${h}>${escapeXml((values[i] ?? "").trim())}</${h}>`).join("\n");
    return `  <${recordEl}>\n${children}\n  </${recordEl}>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootEl}>\n${rows.join("\n")}\n</${rootEl}>`;
}

export default function CsvToXmlPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [rootEl, setRootEl] = useState("root");
  const [recordEl, setRecordEl] = useState("record");

  function convert() {
    setError("");
    try {
      setOutput(csvToXml(input, rootEl || "root", recordEl || "record"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed");
      setOutput("");
    }
  }

  return (
    <ToolLayout
      tool={tool}
      faqs={faqs}
      howToUse="Paste your CSV data, configure the root and record element names, and click Convert. The first row becomes the child element names for each column. Each data row becomes one record element."
      useCases={[
        "Convert spreadsheet exports to XML for legacy system import",
        "Prepare CSV data for XML-based configuration files",
        "Transform tabular data into XML for XSLT processing",
      ]}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Root element</label>
            <input
              type="text"
              value={rootEl}
              onChange={(e) => setRootEl(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 w-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="root"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Record element</label>
            <input
              type="text"
              value={recordEl}
              onChange={(e) => setRecordEl(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 w-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="record"
            />
          </div>
        </div>

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
          Convert to XML
        </button>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {output && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">XML Output</label>
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
