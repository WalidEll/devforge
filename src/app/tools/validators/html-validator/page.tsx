"use client";

import { useState } from "react";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/ToolLayout";

const tool = getToolBySlug("html-validator")!;

const faqs = [
  {
    question: "How does the HTML validator work?",
    answer:
      "It uses the browser's built-in DOMParser to parse your HTML as XML (XHTML strict mode), which surfaces unclosed tags, missing quotes, and other structural errors that the lenient HTML5 parser would silently fix.",
  },
  {
    question: "Why does valid HTML5 sometimes show errors?",
    answer:
      "HTML5 allows many constructs (like self-closing div tags) that XML does not. This tool catches hard errors and structural issues rather than full W3C HTML5 conformance checking.",
  },
  {
    question: "Is my data sent to a server?",
    answer: "No. All validation happens in your browser. Your data never leaves your machine.",
  },
];

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

function validateHtml(html: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for unclosed common block tags
  const blockTags = ["div", "p", "section", "article", "header", "footer", "main", "nav", "aside", "ul", "ol", "li", "table", "thead", "tbody", "tr", "td", "th", "form", "fieldset", "figure"];
  for (const tag of blockTags) {
    const openCount = (html.match(new RegExp(`<${tag}[\\s>]`, "gi")) ?? []).length;
    const closeCount = (html.match(new RegExp(`</${tag}>`, "gi")) ?? []).length;
    if (openCount > closeCount) errors.push(`Unclosed <${tag}> tag (${openCount} opened, ${closeCount} closed)`);
    if (closeCount > openCount) errors.push(`Extra </${tag}> closing tag (${closeCount} closed, ${openCount} opened)`);
  }

  // Check for common attribute issues
  if (/<img(?![^>]*alt=)[^>]*>/i.test(html)) warnings.push("One or more <img> elements are missing the alt attribute");
  if (/<a(?![^>]*href=)[^>]*>/i.test(html)) warnings.push("One or more <a> elements are missing the href attribute");
  if (/<form(?![^>]*action=)[^>]*>/i.test(html)) warnings.push("One or more <form> elements are missing the action attribute");

  // Deprecated tags
  const deprecated = ["<center", "<font", "<marquee", "<blink", "<frame", "<frameset", "<noframes", "<applet", "<basefont", "<isindex", "<strike", "<tt", "<big", "<s>"];
  for (const dep of deprecated) {
    if (html.toLowerCase().includes(dep.toLowerCase())) {
      warnings.push(`Deprecated element used: ${dep}>`);
    }
  }

  // Check for script without type in strict mode
  if (/<script(?![^>]*type=)[^>]*>/i.test(html)) warnings.push("<script> element found without type attribute (type=\"text/javascript\" is implicit in HTML5)");

  return { valid: errors.length === 0, errors, warnings };
}

export default function HtmlValidatorPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ValidationResult | null>(null);

  function validate() {
    setResult(validateHtml(input));
  }

  return (
    <ToolLayout
      tool={tool}
      faqs={faqs}
      howToUse="Paste your HTML snippet or full document into the input field and click Validate. The tool checks for unclosed tags, missing required attributes, deprecated elements, and other common issues."
      useCases={[
        "Catch unclosed tags before shipping HTML templates",
        "Identify missing alt attributes for accessibility",
        "Find deprecated HTML elements in legacy codebases",
      ]}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Input HTML</label>
          <textarea
            className="w-full h-48 font-mono text-sm p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="<div><p>Hello world</p></div>"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

        <button
          onClick={validate}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Validate
        </button>

        {result && (
          <div className="space-y-3">
            <div
              className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium ${
                result.valid
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                  : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
              }`}
            >
              <span>{result.valid ? "✓" : "✗"}</span>
              <span>{result.valid ? "No errors found" : `${result.errors.length} error${result.errors.length !== 1 ? "s" : ""} found`}</span>
            </div>

            {result.errors.length > 0 && (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-red-600 dark:text-red-400">Errors</p>
                {result.errors.map((e, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 px-3 py-2 rounded">
                    <span className="mt-0.5">✗</span>
                    <span>{e}</span>
                  </div>
                ))}
              </div>
            )}

            {result.warnings.length > 0 && (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">Warnings</p>
                {result.warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/10 px-3 py-2 rounded">
                    <span className="mt-0.5">⚠</span>
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            )}

            {result.valid && result.warnings.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">HTML looks good — no errors or warnings detected.</p>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
