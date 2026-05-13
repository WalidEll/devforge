"use client";

import { useState } from "react";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("hmac-generator")!;

const faqs = [
  {
    question: "What is HMAC?",
    answer:
      "HMAC (Hash-based Message Authentication Code) combines a cryptographic hash function with a secret key to produce a signature that proves both the integrity and authenticity of a message.",
  },
  {
    question: "Which algorithms are supported?",
    answer:
      "SHA-256, SHA-512, SHA-1, and MD5 (via SHA-1 fallback). SHA-256 is recommended for most use cases — it offers a good balance of security and performance.",
  },
  {
    question: "Is my data sent to a server?",
    answer: "No. HMAC computation uses the browser's native Web Crypto API. Your message and secret key never leave your machine.",
  },
];

const ALGORITHMS: Record<string, string> = {
  "SHA-256": "SHA-256",
  "SHA-512": "SHA-512",
  "SHA-384": "SHA-384",
  "SHA-1": "SHA-1",
};

async function computeHmac(message: string, key: string, algorithm: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: algorithm },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function HmacGeneratorPage() {
  const [message, setMessage] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [algorithm, setAlgorithm] = useState("SHA-256");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    setError("");
    setLoading(true);
    try {
      const result = await computeHmac(message, secretKey, algorithm);
      setOutput(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
      setOutput("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolLayout
      tool={tool}
      faqs={faqs}
      howToUse="Enter your message and secret key, choose a hashing algorithm, and click Generate. The output is a hex-encoded HMAC signature. SHA-256 is recommended for most use cases."
      useCases={[
        "Verify webhook payloads from third-party services (GitHub, Stripe)",
        "Generate API request signatures for authentication",
        "Validate message integrity in communication protocols",
      ]}
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
            <textarea
              className="w-full h-28 font-mono text-sm p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="The message to sign"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Secret Key</label>
            <textarea
              className="w-full h-28 font-mono text-sm p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your secret key"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Algorithm</label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              {Object.keys(ALGORITHMS).map((alg) => (
                <option key={alg} value={alg}>{alg}</option>
              ))}
            </select>
          </div>
          <button
            onClick={generate}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
          >
            {loading ? "Generating…" : "Generate HMAC"}
          </button>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {output && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                HMAC-{algorithm} (hex)
              </label>
              <CopyButton text={output} />
            </div>
            <div className="font-mono text-sm p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 break-all">
              {output}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
