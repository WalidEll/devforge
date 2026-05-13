"use client";

import { useState } from "react";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("html-entity-encoder")!;

const faqs = [
  {
    question: "What are HTML entities?",
    answer:
      "HTML entities are special codes used to represent characters that have a special meaning in HTML (like < and >) or characters that are not easily typed. They start with & and end with ;, for example &lt; represents <.",
  },
  {
    question: "When do I need to encode HTML entities?",
    answer:
      "You need to encode HTML entities whenever you want to display special characters as text in HTML without them being interpreted as HTML code. This is especially important for user-generated content to prevent XSS attacks.",
  },
  {
    question: "What is the difference between named and numeric entities?",
    answer:
      "Named entities use a descriptive name (e.g. &amp;), while numeric entities use a decimal (&#38;) or hexadecimal (&#x26;) code point. Named entities are more readable; numeric entities work for any Unicode character.",
  },
];

const commonEntities = [
  { char: "<", entity: "&lt;", numeric: "&#60;" },
  { char: ">", entity: "&gt;", numeric: "&#62;" },
  { char: "&", entity: "&amp;", numeric: "&#38;" },
  { char: '"', entity: "&quot;", numeric: "&#34;" },
  { char: "'", entity: "&apos;", numeric: "&#39;" },
  { char: "©", entity: "&copy;", numeric: "&#169;" },
  { char: "®", entity: "&reg;", numeric: "&#174;" },
  { char: "™", entity: "&trade;", numeric: "&#8482;" },
  { char: "€", entity: "&euro;", numeric: "&#8364;" },
  { char: "£", entity: "&pound;", numeric: "&#163;" },
  { char: "¥", entity: "&yen;", numeric: "&#165;" },
  { char: " ", entity: "&nbsp;", numeric: "&#160;" },
];

function encodeEntities(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function decodeEntities(str: string): string {
  const txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
}

export default function HtmlEntityPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");

  function process() {
    setOutput(mode === "encode" ? encodeEntities(input) : decodeEntities(input));
  }

  return (
    <ToolLayout
      tool={tool}
      faqs={faqs}
      howToUse="Paste your text or HTML into the input field. Select Encode to convert special characters to HTML entities, or Decode to convert entities back to characters. The reference table below shows the most commonly used HTML entities."
      useCases={[
        "Sanitizing user input before inserting into HTML",
        "Displaying code examples with < and > on web pages",
        "Encoding email addresses and special characters in HTML",
        "Decoding entities from API responses or database content",
      ]}
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          {(["encode", "decode"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
                mode === m
                  ? "bg-blue-600 text-white"
                  : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {mode === "encode" ? "Plain Text / HTML" : "Encoded HTML"}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "encode" ? '<script>alert("XSS")</script>' : "&lt;b&gt;Hello&lt;/b&gt;"}
            rows={8}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-mono text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
          />
        </div>

        <button
          onClick={process}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          {mode === "encode" ? "Encode" : "Decode"}
        </button>

        {output && (
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Output</label>
              <CopyButton text={output} />
            </div>
            <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-all rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 font-mono text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
              {output}
            </pre>
          </div>
        )}

        <div>
          <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Common HTML Entities</h3>
          <div className="overflow-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-2 font-medium text-gray-700 dark:text-gray-300">Char</th>
                  <th className="px-4 py-2 font-medium text-gray-700 dark:text-gray-300">Named</th>
                  <th className="px-4 py-2 font-medium text-gray-700 dark:text-gray-300">Numeric</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {commonEntities.map((e, i) => (
                  <tr key={i} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-2 font-mono text-gray-900 dark:text-white">{e.char === " " ? "nbsp" : e.char}</td>
                    <td className="px-4 py-2 font-mono text-blue-600 dark:text-blue-400">{e.entity}</td>
                    <td className="px-4 py-2 font-mono text-gray-600 dark:text-gray-400">{e.numeric}</td>
                    <td className="px-4 py-2">
                      <CopyButton text={e.entity} label="" className="!px-2 !py-1 text-xs" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
