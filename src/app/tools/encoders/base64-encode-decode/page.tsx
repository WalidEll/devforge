"use client";

import { useState } from "react";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("base64-encode-decode")!;

const faqs = [
  {
    question: "What is Base64 encoding?",
    answer:
      "Base64 is a binary-to-text encoding scheme that represents binary data using 64 ASCII characters. It is commonly used to embed binary data in text-based formats like JSON, XML, HTML, and email.",
  },
  {
    question: "Does Base64 encoding encrypt data?",
    answer:
      "No. Base64 is an encoding, not encryption. Anyone can decode a Base64 string. It should never be used to protect sensitive data.",
  },
  {
    question: "Why does Base64 increase data size?",
    answer:
      "Base64 encoding increases data size by approximately 33% because it represents 3 bytes of binary data using 4 ASCII characters.",
  },
];

export default function Base64Page() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [error, setError] = useState("");

  function process() {
    try {
      if (mode === "encode") {
        setOutput(btoa(unescape(encodeURIComponent(input))));
      } else {
        setOutput(decodeURIComponent(escape(atob(input.trim()))));
      }
      setError("");
    } catch {
      setError(mode === "decode" ? "Invalid Base64 string" : "Encoding failed");
      setOutput("");
    }
  }

  function swap() {
    setInput(output);
    setOutput("");
    setMode(mode === "encode" ? "decode" : "encode");
    setError("");
  }

  return (
    <ToolLayout
      tool={tool}
      faqs={faqs}
      howToUse="Enter text in the input field, select Encode or Decode mode, and click the action button. When encoding, your plain text is converted to a Base64 string. When decoding, a Base64 string is converted back to readable text. Supports full UTF-8 text."
      useCases={[
        "Encoding binary data for embedding in JSON or XML payloads",
        "Decoding Base64 strings from API responses or JWT tokens",
        "Preparing data URIs for inline images in HTML or CSS",
        "Debugging encoded strings in configuration files or logs",
      ]}
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => { setMode("encode"); setError(""); }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              mode === "encode"
                ? "bg-blue-600 text-white"
                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            Encode
          </button>
          <button
            onClick={() => { setMode("decode"); setError(""); }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              mode === "decode"
                ? "bg-blue-600 text-white"
                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
            }`}
          >
            Decode
          </button>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {mode === "encode" ? "Plain Text" : "Base64 String"}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "encode" ? "Enter text to encode..." : "Enter Base64 string to decode..."}
            rows={8}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-mono text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={process}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            {mode === "encode" ? "Encode" : "Decode"}
          </button>
          {output && (
            <button
              onClick={swap}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Swap
            </button>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
            {error}
          </div>
        )}

        {output && (
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {mode === "encode" ? "Base64 Output" : "Decoded Text"}
              </label>
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
