"use client";

import { useState } from "react";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("uuid-generator")!;

const faqs = [
  {
    question: "What is a UUID?",
    answer:
      "A UUID (Universally Unique Identifier) is a 128-bit identifier that is unique across space and time. It is commonly used as a primary key in databases and as an identifier in distributed systems.",
  },
  {
    question: "What is the difference between UUID v4 and v7?",
    answer:
      "UUID v4 is randomly generated and has no inherent ordering. UUID v7 is time-ordered, embedding a Unix timestamp in the first 48 bits, making it ideal for database primary keys because it maintains insertion order.",
  },
  {
    question: "Are UUIDs truly unique?",
    answer:
      "While theoretically not guaranteed to be unique, the probability of a UUID v4 collision is astronomically low — about 1 in 2^122. For practical purposes, they are considered unique.",
  },
];

function generateUUIDv4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function generateUUIDv7(): string {
  const now = Date.now();
  const timestamp = now.toString(16).padStart(12, "0");
  const random = Array.from({ length: 4 }, () =>
    Math.floor(Math.random() * 0x10000)
      .toString(16)
      .padStart(4, "0")
  ).join("");
  const hex = timestamp + "7" + random.slice(0, 3) + ((parseInt(random[3], 16) & 0x3) | 0x8).toString(16) + random.slice(4);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

export default function UuidGeneratorPage() {
  const [uuids, setUuids] = useState<string[]>([]);
  const [version, setVersion] = useState<"v4" | "v7">("v4");
  const [count, setCount] = useState(1);
  const [uppercase, setUppercase] = useState(false);

  function generate() {
    const gen = version === "v4" ? generateUUIDv4 : generateUUIDv7;
    const newUuids = Array.from({ length: Math.min(count, 100) }, () => {
      const uuid = gen();
      return uppercase ? uuid.toUpperCase() : uuid;
    });
    setUuids(newUuids);
  }

  const allText = uuids.join("\n");

  return (
    <ToolLayout
      tool={tool}
      faqs={faqs}
      howToUse="Select UUID version (v4 for random, v7 for time-ordered), choose how many to generate (up to 100), and click Generate. Each UUID is displayed individually and can be copied. Use 'Copy All' to copy all generated UUIDs at once, one per line."
      useCases={[
        "Generating unique identifiers for database records",
        "Creating correlation IDs for distributed tracing",
        "Generating unique filenames for uploaded assets",
        "Testing APIs that require UUID parameters",
      ]}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Version</label>
            <select
              value={version}
              onChange={(e) => setVersion(e.target.value as "v4" | "v7")}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
            >
              <option value="v4">v4 (Random)</option>
              <option value="v7">v7 (Time-ordered)</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Count</label>
            <input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-20 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
            />
          </div>
          <label className="flex items-center gap-2 pb-2 text-sm text-gray-700 dark:text-gray-300">
            <input type="checkbox" checked={uppercase} onChange={(e) => setUppercase(e.target.checked)} className="rounded" />
            Uppercase
          </label>
          <button
            onClick={generate}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Generate
          </button>
        </div>

        {uuids.length > 0 && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {uuids.length} UUID{uuids.length !== 1 ? "s" : ""} generated
              </label>
              <CopyButton text={allText} label="Copy All" />
            </div>
            <div className="max-h-96 overflow-auto rounded-lg border border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
              {uuids.map((uuid, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between px-4 py-2 ${
                    i > 0 ? "border-t border-gray-200 dark:border-gray-700" : ""
                  }`}
                >
                  <code className="font-mono text-sm text-gray-900 dark:text-white">{uuid}</code>
                  <CopyButton text={uuid} label="" className="!px-2" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
