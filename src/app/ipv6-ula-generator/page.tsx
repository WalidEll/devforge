"use client";

import { useState, useCallback } from "react";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("ipv6-ula-generator")!;

const faqs = [
  {
    question: "What is a ULA (Unique Local Address)?",
    answer:
      "A ULA is an IPv6 address in the fc00::/7 range, defined by RFC 4193. ULAs are intended for local communications within a site and are not routable on the global internet, similar to RFC 1918 private IPv4 addresses (10.x.x.x, 192.168.x.x).",
  },
  {
    question: "Why does the prefix start with 'fd'?",
    answer:
      "The fc00::/7 block is split into two halves. The 'fc00::/8' half (L=0) is reserved for future use. The 'fd00::/8' half (L=1) is for locally assigned addresses generated with a random global ID — which is what this tool produces.",
  },
  {
    question: "What is the Global ID?",
    answer:
      "The Global ID is a 40-bit randomly generated value that makes the ULA prefix unique to your site. It occupies bits 8–47 of the address. Because it is random, the probability of collision with another site's ULA is extremely low.",
  },
  {
    question: "What is the /48 prefix used for?",
    answer:
      "The /48 prefix (fd + Global ID) is the site prefix. Within it you can create up to 65,536 subnets (/64 each) using the 16-bit Subnet ID field. Each /64 subnet can hold a virtually unlimited number of hosts.",
  },
];

function randomHex(bytes: number): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

interface ULAResult {
  prefix48: string;
  globalId: string;
  exampleSubnet: string;
  exampleRange: string;
}

function generateULA(): ULAResult {
  const globalIdHex = randomHex(5); // 40 bits
  const g1 = globalIdHex.slice(0, 2);
  const g2 = globalIdHex.slice(2, 4);
  const g3 = globalIdHex.slice(4, 6);
  const g4 = globalIdHex.slice(6, 8);
  const g5 = globalIdHex.slice(8, 10);

  // fd + global id spread across groups
  const grp1 = `fd${g1}`;
  const grp2 = `${g2}${g3}`;
  const grp3 = `${g4}${g5}`;

  const prefix48 = `${grp1}:${grp2}:${grp3}::/48`;
  const globalId = `${g1}:${g2}${g3}:${g4}${g5}`;

  const exampleSubnet = `${grp1}:${grp2}:${grp3}:0001::/64`;
  const exampleRange = `${grp1}:${grp2}:${grp3}:0001::1 – ${grp1}:${grp2}:${grp3}:0001::ffff:ffff:ffff:ffff`;

  return { prefix48, globalId, exampleSubnet, exampleRange };
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50 sm:flex-row sm:items-center sm:justify-between">
      <span className="shrink-0 text-sm font-medium text-gray-600 dark:text-gray-400">{label}</span>
      <div className="flex min-w-0 items-center gap-2">
        <code className="break-all font-mono text-sm text-gray-900 dark:text-white">{value}</code>
        <CopyButton text={value} />
      </div>
    </div>
  );
}

export default function IPv6UlaGeneratorPage() {
  const [count, setCount] = useState(1);
  const [results, setResults] = useState<ULAResult[]>([]);

  const generate = useCallback(() => {
    setResults(Array.from({ length: Math.min(count, 10) }, generateULA));
  }, [count]);

  return (
    <ToolLayout
      tool={tool}
      faqs={faqs}
      howToUse="Set how many ULA prefixes to generate (up to 10) and click Generate. Each result includes the /48 site prefix, the 40-bit Global ID, and an example /64 subnet."
      useCases={[
        "Assign a private IPv6 address space to a home or office network",
        "Set up IPv6 in a lab environment without a public prefix",
        "Prepare for IPv6 deployment by reserving internal address space",
        "Create isolated IPv6 segments for containers or VMs",
      ]}
    >
      <div className="space-y-5">
        <div className="flex items-end gap-3">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Count (max 10)
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={count}
              onChange={(e) => setCount(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-28 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <button
            onClick={generate}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Generate
          </button>
        </div>

        {results.length > 0 && (
          <div className="space-y-6">
            {results.map((r, i) => (
              <div key={i} className="space-y-2">
                {results.length > 1 && (
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    ULA #{i + 1}
                  </p>
                )}
                <Row label="/48 Prefix" value={r.prefix48} />
                <Row label="Global ID" value={r.globalId} />
                <Row label="Example /64 Subnet" value={r.exampleSubnet} />
                <Row label="Example Host Range" value={r.exampleRange} />
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
