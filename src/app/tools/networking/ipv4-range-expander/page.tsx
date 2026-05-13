"use client";

import { useState } from "react";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("ipv4-range-expander")!;

const MAX_DISPLAY = 1024;

const faqs = [
  {
    question: "What is the maximum number of addresses expanded?",
    answer: `This tool displays up to ${MAX_DISPLAY.toLocaleString()} addresses to avoid browser slowdowns. For larger ranges, it shows the total count and the first ${MAX_DISPLAY.toLocaleString()} addresses.`,
  },
  {
    question: "What CIDR ranges can I enter?",
    answer:
      "Enter any valid IPv4 CIDR notation such as 10.0.0.0/24 or 192.168.1.128/25. Prefix lengths from /0 to /32 are supported.",
  },
  {
    question: "Can I enter a start–end range instead of CIDR?",
    answer:
      "Yes. Switch to Range mode and enter a start IP and end IP. The tool will expand every address between them inclusive.",
  },
];

function isValidIp(ip: string): boolean {
  const parts = ip.split(".");
  if (parts.length !== 4) return false;
  return parts.every((p) => /^\d+$/.test(p) && Number(p) >= 0 && Number(p) <= 255);
}

function ipToInt(ip: string): number {
  const parts = ip.split(".").map(Number);
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function intToIp(n: number): string {
  return [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff].join(".");
}

interface ExpandResult {
  addresses: string[];
  total: number;
  truncated: boolean;
}

function expandCidr(cidr: string): ExpandResult | string {
  const parts = cidr.trim().split("/");
  if (parts.length !== 2) return "Invalid CIDR — use format 10.0.0.0/24";
  const ip = parts[0];
  const prefix = parseInt(parts[1], 10);
  if (!isValidIp(ip)) return "Invalid IP address";
  if (isNaN(prefix) || prefix < 0 || prefix > 32) return "Prefix must be 0–32";
  const maskInt = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const start = (ipToInt(ip) & maskInt) >>> 0;
  const total = Math.pow(2, 32 - prefix);
  const count = Math.min(total, MAX_DISPLAY);
  const addresses: string[] = [];
  for (let i = 0; i < count; i++) addresses.push(intToIp((start + i) >>> 0));
  return { addresses, total, truncated: total > MAX_DISPLAY };
}

function expandRange(startIp: string, endIp: string): ExpandResult | string {
  if (!isValidIp(startIp)) return "Invalid start IP address";
  if (!isValidIp(endIp)) return "Invalid end IP address";
  const start = ipToInt(startIp);
  const end = ipToInt(endIp);
  if (start > end) return "Start IP must be ≤ end IP";
  const total = end - start + 1;
  const count = Math.min(total, MAX_DISPLAY);
  const addresses: string[] = [];
  for (let i = 0; i < count; i++) addresses.push(intToIp((start + i) >>> 0));
  return { addresses, total, truncated: total > MAX_DISPLAY };
}

export default function IPv4RangeExpanderPage() {
  const [mode, setMode] = useState<"cidr" | "range">("cidr");
  const [cidr, setCidr] = useState("192.168.1.0/28");
  const [startIp, setStartIp] = useState("10.0.0.1");
  const [endIp, setEndIp] = useState("10.0.0.10");
  const [result, setResult] = useState<ExpandResult | null>(null);
  const [error, setError] = useState("");

  function expand() {
    const res = mode === "cidr" ? expandCidr(cidr) : expandRange(startIp, endIp);
    if (typeof res === "string") {
      setError(res);
      setResult(null);
    } else {
      setError("");
      setResult(res);
    }
  }

  const allText = result?.addresses.join("\n") ?? "";

  return (
    <ToolLayout
      tool={tool}
      faqs={faqs}
      howToUse="Choose CIDR mode to expand a network block (e.g. 192.168.1.0/28), or Range mode to expand between a start and end IP. Click Expand to list all addresses. Results are capped at 1,024 for performance."
      useCases={[
        "Audit which IPs are allocated in a network block",
        "Generate test data with sequential IP addresses",
        "Verify the size of a subnet before assignment",
        "Check overlap between two IP ranges",
      ]}
    >
      <div className="space-y-5">
        <div className="flex gap-2">
          {(["cidr", "range"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setResult(null); setError(""); }}
              className={`rounded-lg border px-4 py-1.5 text-sm font-medium transition-colors ${
                mode === m
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              {m === "cidr" ? "CIDR" : "Start – End"}
            </button>
          ))}
        </div>

        {mode === "cidr" ? (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              CIDR Block
            </label>
            <input
              type="text"
              value={cidr}
              onChange={(e) => setCidr(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && expand()}
              placeholder="192.168.1.0/28"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 font-mono text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start IP</label>
              <input
                type="text"
                value={startIp}
                onChange={(e) => setStartIp(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && expand()}
                placeholder="10.0.0.1"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 font-mono text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">End IP</label>
              <input
                type="text"
                value={endIp}
                onChange={(e) => setEndIp(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && expand()}
                placeholder="10.0.0.10"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 font-mono text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <button
          onClick={expand}
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Expand
        </button>

        {result && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {result.truncated
                  ? `Showing first ${result.addresses.length.toLocaleString()} of ${result.total.toLocaleString()} addresses`
                  : `${result.total.toLocaleString()} address${result.total !== 1 ? "es" : ""}`}
              </p>
              <CopyButton text={allText} label="Copy All" />
            </div>
            <div className="max-h-80 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
              <ol className="space-y-0.5">
                {result.addresses.map((ip, i) => (
                  <li key={i} className="flex items-center justify-between gap-2 py-0.5">
                    <span className="w-8 shrink-0 text-right text-xs text-gray-400">{i + 1}.</span>
                    <code className="flex-1 font-mono text-sm text-gray-900 dark:text-white">{ip}</code>
                    <CopyButton text={ip} />
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
