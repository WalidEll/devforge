"use client";

import { useState } from "react";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("xml-formatter")!;

const faqs = [
  {
    question: "What is an XML formatter?",
    answer:
      "An XML formatter (or XML beautifier) takes raw or minified XML and reformats it with proper indentation and line breaks, making it easier to read and debug.",
  },
  {
    question: "Can I minify XML with this tool?",
    answer:
      "Yes. Click Minify to strip all whitespace between tags and produce the most compact valid XML representation.",
  },
  {
    question: "Is my data sent to a server?",
    answer: "No. All parsing and formatting happens in your browser using the built-in DOMParser. Your data never leaves your machine.",
  },
];

function formatXml(xml: string, indent: number): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "application/xml");
  const errorNode = doc.querySelector("parsererror");
  if (errorNode) throw new Error(errorNode.textContent ?? "Invalid XML");

  const pad = " ".repeat(indent);

  function serializeNode(node: Node, depth: number): string {
    const prefix = pad.repeat(depth);
    if (node.nodeType === Node.TEXT_NODE) {
      const text = (node.textContent ?? "").trim();
      return text ? `${prefix}${text}` : "";
    }
    if (node.nodeType === Node.COMMENT_NODE) {
      return `${prefix}<!--${node.textContent}-->`;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const el = node as Element;
    const attrs = Array.from(el.attributes)
      .map((a) => ` ${a.name}="${a.value}"`)
      .join("");
    const tag = el.tagName;
    const children = Array.from(el.childNodes)
      .map((c) => serializeNode(c, depth + 1))
      .filter(Boolean);
    if (children.length === 0) return `${prefix}<${tag}${attrs}/>`;
    if (children.length === 1 && !children[0].includes("\n")) {
      return `${prefix}<${tag}${attrs}>${children[0].trim()}</${tag}>`;
    }
    return `${prefix}<${tag}${attrs}>\n${children.join("\n")}\n${prefix}</${tag}>`;
  }

  const decl = '<?xml version="1.0" encoding="UTF-8"?>';
  const body = Array.from(doc.childNodes)
    .filter((n) => n.nodeType !== Node.PROCESSING_INSTRUCTION_NODE)
    .map((n) => serializeNode(n, 0))
    .filter(Boolean)
    .join("\n");
  return `${decl}\n${body}`;
}

function minifyXml(xml: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "application/xml");
  const errorNode = doc.querySelector("parsererror");
  if (errorNode) throw new Error(errorNode.textContent ?? "Invalid XML");
  const serializer = new XMLSerializer();
  return serializer.serializeToString(doc).replace(/>\s+</g, "><").trim();
}

export default function XmlFormatterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [indent, setIndent] = useState(2);

  function format() {
    setError("");
    try {
      setOutput(formatXml(input, indent));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid XML");
      setOutput("");
    }
  }

  function minify() {
    setError("");
    try {
      setOutput(minifyXml(input));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid XML");
      setOutput("");
    }
  }

  return (
    <ToolLayout
      tool={tool}
      faqs={faqs}
      howToUse="Paste your XML into the input field, select your preferred indentation level, and click Format to pretty-print it. Use Minify to compress it into a single line. The tool validates your XML and reports any parse errors."
      useCases={[
        "Pretty-print minified XML API responses for debugging",
        "Validate XML structure before processing",
        "Compress XML for transmission or storage",
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
              <option value={8}>8 spaces</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Input XML</label>
          <textarea
            className="w-full h-48 font-mono text-sm p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder='<root><item id="1"><name>Alice</name></item></root>'
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={format}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Format
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
