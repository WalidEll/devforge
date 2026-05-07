"use client";

import { useState } from "react";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("html-formatter")!;

const faqs = [
  {
    question: "What does the HTML formatter do?",
    answer:
      "It parses your HTML and reformats it with consistent indentation and line breaks, making minified or messy markup easy to read.",
  },
  {
    question: "Will it change my HTML content?",
    answer:
      "The formatter only changes whitespace — text content, attributes, and structure remain intact. Inline elements may be collapsed onto one line.",
  },
  {
    question: "Is my data sent to a server?",
    answer: "No. All parsing and formatting uses the browser's built-in DOMParser. Your data never leaves your machine.",
  },
];

const INLINE_TAGS = new Set([
  "a","abbr","acronym","b","bdo","big","br","cite","code","dfn","em","i","img",
  "input","kbd","label","map","object","output","q","samp","select","small",
  "span","strong","sub","sup","textarea","time","tt","var",
]);

const VOID_TAGS = new Set([
  "area","base","br","col","embed","hr","img","input","link","meta","param",
  "source","track","wbr",
]);

function formatHtml(html: string, indent: number): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const pad = " ".repeat(indent);

  function serializeNode(node: Node, depth: number): string {
    const prefix = pad.repeat(depth);
    if (node.nodeType === Node.TEXT_NODE) {
      const text = (node.textContent ?? "").replace(/\s+/g, " ").trim();
      return text ? `${prefix}${text}` : "";
    }
    if (node.nodeType === Node.COMMENT_NODE) {
      return `${prefix}<!--${node.textContent}-->`;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    const attrs = Array.from(el.attributes)
      .map((a) => ` ${a.name}="${a.value}"`)
      .join("");
    if (VOID_TAGS.has(tag)) return `${prefix}<${tag}${attrs}>`;
    const children = Array.from(el.childNodes)
      .map((c) => serializeNode(c, depth + 1))
      .filter(Boolean);
    if (children.length === 0) return `${prefix}<${tag}${attrs}></${tag}>`;
    const isInline = INLINE_TAGS.has(tag);
    if (isInline || children.every((c) => !c.includes("\n"))) {
      return `${prefix}<${tag}${attrs}>${children.map((c) => c.trim()).join("")}</${tag}>`;
    }
    return `${prefix}<${tag}${attrs}>\n${children.join("\n")}\n${prefix}</${tag}>`;
  }

  const bodyChildren = Array.from(doc.body.childNodes)
    .map((n) => serializeNode(n, 0))
    .filter(Boolean)
    .join("\n");

  // If input looks like a full document, wrap it
  const trimmed = html.trim().toLowerCase();
  if (trimmed.startsWith("<!doctype") || trimmed.startsWith("<html")) {
    const headContent = Array.from(doc.head.childNodes)
      .map((n) => serializeNode(n, 2))
      .filter(Boolean)
      .join("\n");
    return `<!DOCTYPE html>\n<html${Array.from(doc.documentElement.attributes).map((a) => ` ${a.name}="${a.value}"`).join("")}>\n  <head>\n${headContent}\n  </head>\n  <body>\n${Array.from(doc.body.childNodes).map((n) => serializeNode(n, 2)).filter(Boolean).join("\n")}\n  </body>\n</html>`;
  }
  return bodyChildren;
}

export default function HtmlFormatterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [indent, setIndent] = useState(2);

  function format() {
    setError("");
    try {
      setOutput(formatHtml(input, indent));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Formatting failed");
      setOutput("");
    }
  }

  return (
    <ToolLayout
      tool={tool}
      faqs={faqs}
      howToUse="Paste your HTML into the input field, choose your indentation size, and click Format. The tool parses the markup and reformats it with consistent indentation. Supports full HTML documents and partial snippets."
      useCases={[
        "Beautify minified HTML from production pages",
        "Make template snippets readable before editing",
        "Standardise indentation across HTML files",
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Input HTML</label>
          <textarea
            className="w-full h-48 font-mono text-sm p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="<div><p>Hello <strong>world</strong></p></div>"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        <button
          onClick={format}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Format
        </button>

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
