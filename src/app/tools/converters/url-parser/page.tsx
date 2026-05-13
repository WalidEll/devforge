"use client";

import { useState } from "react";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("url-parser")!;

const faqs = [
  {
    question: "What URL components are shown?",
    answer:
      "Protocol, hostname, port, pathname, full query string, individual query parameters, and hash fragment — everything exposed by the browser's URL API.",
  },
  {
    question: "Does it support relative URLs?",
    answer:
      "No. The tool requires fully-formed absolute URLs with a protocol (e.g. https://). Relative URLs lack the host information needed to parse completely.",
  },
  {
    question: "Is my data sent to a server?",
    answer: "No. All parsing uses the browser's built-in URL API. Your data never leaves your machine.",
  },
];

interface ParsedUrl {
  protocol: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  origin: string;
  host: string;
  params: [string, string][];
}

function parseUrl(raw: string): ParsedUrl {
  const u = new URL(raw);
  return {
    protocol: u.protocol,
    hostname: u.hostname,
    port: u.port,
    pathname: u.pathname,
    search: u.search,
    hash: u.hash,
    origin: u.origin,
    host: u.host,
    params: Array.from(u.searchParams.entries()),
  };
}

function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <span className="w-28 shrink-0 text-xs font-semibold uppercase text-gray-400 dark:text-gray-500 pt-0.5">{label}</span>
      <span className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all flex-1">{value}</span>
      <CopyButton text={value} />
    </div>
  );
}

export default function UrlParserPage() {
  const [input, setInput] = useState("");
  const [parsed, setParsed] = useState<ParsedUrl | null>(null);
  const [error, setError] = useState("");

  function parse() {
    setError("");
    setParsed(null);
    try {
      setParsed(parseUrl(input.trim()));
    } catch {
      setError("Invalid URL. Make sure it includes the protocol (e.g. https://).");
    }
  }

  return (
    <ToolLayout
      tool={tool}
      faqs={faqs}
      howToUse="Paste any absolute URL into the input field and click Parse. The tool breaks it into its components: protocol, host, port, path, query parameters (individually), and hash fragment."
      useCases={[
        "Inspect redirect URLs and their query parameters",
        "Debug API endpoint paths and query strings",
        "Extract individual parameters from complex URLs",
      ]}
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 font-mono text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com/path?foo=bar&baz=qux#section"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && parse()}
          />
          <button
            onClick={parse}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors whitespace-nowrap"
          >
            Parse
          </button>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {parsed && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-0">
            <Row label="Protocol" value={parsed.protocol} />
            <Row label="Hostname" value={parsed.hostname} />
            <Row label="Port" value={parsed.port} />
            <Row label="Pathname" value={parsed.pathname} />
            <Row label="Origin" value={parsed.origin} />
            <Row label="Host" value={parsed.host} />
            <Row label="Search" value={parsed.search} />
            <Row label="Hash" value={parsed.hash} />

            {parsed.params.length > 0 && (
              <div className="pt-3">
                <p className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-500 mb-2">Query Parameters</p>
                <div className="space-y-1">
                  {parsed.params.map(([key, value], i) => (
                    <div key={i} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded px-3 py-1.5">
                      <span className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400">{key}</span>
                      <span className="text-gray-400">=</span>
                      <span className="font-mono text-sm text-gray-800 dark:text-gray-200 flex-1 break-all">{value}</span>
                      <CopyButton text={value} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
