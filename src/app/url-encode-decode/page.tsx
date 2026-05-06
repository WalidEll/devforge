"use client";

import { useState } from "react";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("url-encode-decode")!;

const faqs = [
  {
    question: "What is URL encoding?",
    answer:
      "URL encoding (percent-encoding) replaces unsafe ASCII characters with a '%' followed by two hexadecimal digits. This ensures special characters are transmitted correctly in URLs.",
  },
  {
    question: "What is the difference between encodeURI and encodeURIComponent?",
    answer:
      "encodeURI encodes a full URI, preserving characters like :, /, ?, and #. encodeURIComponent encodes individual URI components, also encoding those reserved characters. Use encodeURIComponent for query parameter values.",
  },
  {
    question: "When should I use URL encoding?",
    answer:
      "Use URL encoding whenever you include user input or special characters in URL query parameters, path segments, or form data.",
  },
];

export default function UrlEncodePage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [component, setComponent] = useState(true);
  const [error, setError] = useState("");

  function process() {
    try {
      if (mode === "encode") {
        setOutput(component ? encodeURIComponent(input) : encodeURI(input));
      } else {
        setOutput(component ? decodeURIComponent(input) : decodeURI(input));
      }
      setError("");
    } catch {
      setError("Invalid input for " + (mode === "decode" ? "decoding" : "encoding"));
      setOutput("");
    }
  }

  return (
    <ToolLayout
      tool={tool}
      faqs={faqs}
      howToUse="Enter a URL or text string, choose Encode or Decode mode, and click the button. Toggle between full URI and component encoding depending on whether you are encoding a complete URL or just a query parameter value."
      useCases={[
        "Encoding query parameter values for API requests",
        "Decoding percent-encoded URLs from logs or analytics",
        "Preparing form data for URL-encoded POST requests",
        "Debugging URL-encoded strings in redirects and callbacks",
      ]}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setMode("encode"); setError(""); }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${mode === "encode" ? "bg-blue-600 text-white" : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"}`}
          >
            Encode
          </button>
          <button
            onClick={() => { setMode("decode"); setError(""); }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${mode === "decode" ? "bg-blue-600 text-white" : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"}`}
          >
            Decode
          </button>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={component}
              onChange={(e) => setComponent(e.target.checked)}
              className="rounded"
            />
            Component mode
          </label>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "encode" ? "Hello World & more" : "Hello%20World%20%26%20more"}
            rows={6}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-mono text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
          />
        </div>

        <button onClick={process} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
          {mode === "encode" ? "Encode" : "Decode"}
        </button>

        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">{error}</div>
        )}

        {output && (
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Output</label>
              <CopyButton text={output} />
            </div>
            <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-all rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 font-mono text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
              {output}
            </pre>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
