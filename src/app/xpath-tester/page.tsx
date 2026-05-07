"use client";

import { useState } from "react";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("xpath-tester")!;

const faqs = [
  {
    question: "What is XPath?",
    answer:
      "XPath (XML Path Language) is a query language for selecting nodes from an XML document. It uses path expressions to navigate elements and attributes, similar to how file paths work.",
  },
  {
    question: "What XPath version is supported?",
    answer:
      "The browser's built-in document.evaluate supports XPath 1.0, which covers the most common use cases including element selection, attribute filtering, and text matching.",
  },
  {
    question: "Is my data sent to a server?",
    answer: "No. All XPath evaluation happens in your browser using the native XPath API. Your data never leaves your machine.",
  },
];

interface XPathResult {
  type: string;
  value: string;
}

function evaluateXPath(xml: string, expression: string): XPathResult[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "application/xml");
  const errorNode = doc.querySelector("parsererror");
  if (errorNode) throw new Error("Invalid XML: " + (errorNode.textContent ?? "parse error"));

  const result = doc.evaluate(expression, doc, null, XPathResult.ANY_TYPE, null);
  const results: XPathResult[] = [];

  switch (result.resultType) {
    case XPathResult.NUMBER_TYPE:
      results.push({ type: "number", value: String(result.numberValue) });
      break;
    case XPathResult.STRING_TYPE:
      results.push({ type: "string", value: result.stringValue });
      break;
    case XPathResult.BOOLEAN_TYPE:
      results.push({ type: "boolean", value: String(result.booleanValue) });
      break;
    default: {
      let node = result.iterateNext();
      while (node) {
        const el = node as Element;
        const serializer = new XMLSerializer();
        const type = node.nodeType === Node.ELEMENT_NODE ? "element" : node.nodeType === Node.ATTRIBUTE_NODE ? "attribute" : "text";
        const value = node.nodeType === Node.ELEMENT_NODE ? serializer.serializeToString(el) : (node.textContent ?? "");
        results.push({ type, value });
        node = result.iterateNext();
      }
    }
  }
  return results;
}

export default function XpathTesterPage() {
  const [xml, setXml] = useState("");
  const [expression, setExpression] = useState("");
  const [results, setResults] = useState<XPathResult[]>([]);
  const [error, setError] = useState("");
  const [evaluated, setEvaluated] = useState(false);

  function evaluate() {
    setError("");
    setEvaluated(false);
    try {
      const res = evaluateXPath(xml, expression);
      setResults(res);
      setEvaluated(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Evaluation failed");
      setResults([]);
    }
  }

  return (
    <ToolLayout
      tool={tool}
      faqs={faqs}
      howToUse="Paste your XML document in the top field, enter an XPath expression in the expression field, and click Evaluate. Results show matching nodes with their type and content."
      useCases={[
        "Extract specific elements from large XML documents",
        "Test XPath queries before using them in code",
        "Debug XML data transformation pipelines",
      ]}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">XML Document</label>
          <textarea
            className="w-full h-40 font-mono text-sm p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder='<bookstore><book genre="fiction"><title>Alice</title><price>12.99</price></book></bookstore>'
            value={xml}
            onChange={(e) => setXml(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">XPath Expression</label>
          <input
            type="text"
            className="w-full font-mono text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="//book[@genre='fiction']/title"
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && evaluate()}
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={evaluate}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Evaluate
          </button>
          <div className="flex flex-wrap gap-2 text-xs">
            {["//book", "//book/@genre", "//title/text()", "count(//book)"].map((expr) => (
              <button
                key={expr}
                onClick={() => setExpression(expr)}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded font-mono hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {expr}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {evaluated && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {results.length} result{results.length !== 1 ? "s" : ""}
              </p>
            </div>
            {results.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No nodes matched the expression.</p>
            ) : (
              <div className="space-y-2">
                {results.map((r, i) => (
                  <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium uppercase text-gray-400 dark:text-gray-500">{r.type}</span>
                      <CopyButton text={r.value} />
                    </div>
                    <pre className="text-sm font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-all">{r.value}</pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
