"use client";

import { useState } from "react";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("xml-to-json")!;

const faqs = [
  {
    question: "How are XML attributes handled?",
    answer:
      "Attributes are placed in a key prefixed with '@' (e.g. @id). Text content is stored under '#text'. This convention is a common XML-to-JSON mapping.",
  },
  {
    question: "What happens with repeated child elements?",
    answer:
      "If multiple sibling elements share the same tag name, they are collected into a JSON array.",
  },
  {
    question: "Is my data sent to a server?",
    answer: "No. All conversion happens in your browser using the built-in DOMParser. Your data never leaves your machine.",
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function nodeToObject(node: Element): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const obj: Record<string, any> = {};
  for (const attr of Array.from(node.attributes)) {
    obj[`@${attr.name}`] = attr.value;
  }
  const children = Array.from(node.childNodes);
  const textChildren = children.filter((c) => c.nodeType === Node.TEXT_NODE);
  const elementChildren = children.filter((c) => c.nodeType === Node.ELEMENT_NODE) as Element[];

  if (elementChildren.length === 0) {
    const text = textChildren.map((c) => c.textContent ?? "").join("").trim();
    if (Object.keys(obj).length === 0) return text;
    if (text) obj["#text"] = text;
    return obj;
  }

  const tagCounts: Record<string, number> = {};
  for (const child of elementChildren) tagCounts[child.tagName] = (tagCounts[child.tagName] ?? 0) + 1;

  for (const child of elementChildren) {
    const val = nodeToObject(child);
    if (tagCounts[child.tagName] > 1) {
      if (!Array.isArray(obj[child.tagName])) obj[child.tagName] = [];
      obj[child.tagName].push(val);
    } else {
      obj[child.tagName] = val;
    }
  }
  return obj;
}

function xmlToJson(xml: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "application/xml");
  const errorNode = doc.querySelector("parsererror");
  if (errorNode) throw new Error(errorNode.textContent ?? "Invalid XML");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: Record<string, any> = {};
  result[doc.documentElement.tagName] = nodeToObject(doc.documentElement);
  return JSON.stringify(result, null, 2);
}

export default function XmlToJsonPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  function convert() {
    setError("");
    try {
      setOutput(xmlToJson(input));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed");
      setOutput("");
    }
  }

  return (
    <ToolLayout
      tool={tool}
      faqs={faqs}
      howToUse="Paste your XML into the input field and click Convert. Attributes are prefixed with @, text content is stored under #text, and repeated sibling elements become arrays."
      useCases={[
        "Convert XML API responses to JSON for easier processing",
        "Migrate data from XML-based systems to JSON-based ones",
        "Inspect XML structure in a more readable format",
      ]}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Input XML</label>
          <textarea
            className="w-full h-48 font-mono text-sm p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder='<users><user id="1"><name>Alice</name></user></users>'
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
              className="w-full h-64 font-mono text-sm p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none"
              value={output}
            />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
