"use client";

import { useState } from "react";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("json-to-xml")!;

const faqs = [
  {
    question: "What JSON structures are supported?",
    answer:
      "Objects, arrays, strings, numbers, and booleans are all supported. Array items are wrapped in a child element named after the key with 'Item' appended.",
  },
  {
    question: "How is the root element named?",
    answer:
      "You can set a custom root element name. If your JSON is a single-key object, that key becomes the root. Otherwise the configured root name wraps everything.",
  },
  {
    question: "Is my data sent to a server?",
    answer: "No. All conversion happens in your browser. Your data never leaves your machine.",
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function valueToXml(key: string, value: any, indent: string, depth: number): string {
  const pad = indent.repeat(depth);
  const safeKey = key.replace(/[^a-zA-Z0-9_.-]/g, "_") || "item";
  if (value === null || value === undefined) return `${pad}<${safeKey}/>`;
  if (Array.isArray(value)) {
    return value.map((v) => valueToXml(safeKey, v, indent, depth)).join("\n");
  }
  if (typeof value === "object") {
    const children = Object.entries(value)
      .map(([k, v]) => valueToXml(k, v, indent, depth + 1))
      .join("\n");
    return `${pad}<${safeKey}>\n${children}\n${pad}</${safeKey}>`;
  }
  const escaped = String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `${pad}<${safeKey}>${escaped}</${safeKey}>`;
}

function jsonToXml(json: string, rootEl: string): string {
  const parsed = JSON.parse(json);
  const indent = "  ";
  let body: string;
  if (typeof parsed === "object" && !Array.isArray(parsed)) {
    const keys = Object.keys(parsed);
    if (keys.length === 1 && typeof parsed[keys[0]] === "object") {
      const inner = Object.entries(parsed[keys[0]] as Record<string, unknown>)
        .map(([k, v]) => valueToXml(k, v, indent, 1))
        .join("\n");
      return `<?xml version="1.0" encoding="UTF-8"?>\n<${keys[0]}>\n${inner}\n</${keys[0]}>`;
    }
    body = Object.entries(parsed).map(([k, v]) => valueToXml(k, v, indent, 1)).join("\n");
  } else {
    body = valueToXml("item", parsed, indent, 1);
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootEl}>\n${body}\n</${rootEl}>`;
}

export default function JsonToXmlPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [rootEl, setRootEl] = useState("root");

  function convert() {
    setError("");
    try {
      setOutput(jsonToXml(input, rootEl || "root"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed");
      setOutput("");
    }
  }

  return (
    <ToolLayout
      tool={tool}
      faqs={faqs}
      howToUse="Paste your JSON into the input field, set a root element name, and click Convert. Objects become XML elements, arrays become repeated elements, and primitive values become element text content."
      useCases={[
        "Convert JSON data to XML for legacy system integration",
        "Generate XML configuration files from JSON data",
        "Transform API responses to XML for XML-based pipelines",
      ]}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Root element</label>
          <input
            type="text"
            value={rootEl}
            onChange={(e) => setRootEl(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="root"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Input JSON</label>
          <textarea
            className="w-full h-48 font-mono text-sm p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder='{"users": [{"name": "Alice", "age": 30}]}'
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
              className="w-full h-64 font-mono text-sm p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none"
              value={output}
            />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
