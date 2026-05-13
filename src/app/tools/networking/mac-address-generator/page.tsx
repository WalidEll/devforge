"use client";

import { useState, useCallback } from "react";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("mac-address-generator")!;

const faqs = [
  {
    question: "What is a unicast vs multicast MAC address?",
    answer:
      "The least significant bit of the first octet determines the type. If it is 0, the address is unicast (sent to a single device). If it is 1, it is multicast (sent to a group). Most device MAC addresses are unicast.",
  },
  {
    question: "What is a locally administered MAC address?",
    answer:
      "The second least significant bit of the first octet indicates whether the address is globally unique (0, assigned by the manufacturer) or locally administered (1, assigned by the user or software). Locally administered addresses are used in virtual machines and testing.",
  },
  {
    question: "Are generated MAC addresses real device addresses?",
    answer:
      "No. These are randomly generated addresses for testing, development, and simulation purposes. They should not be used to impersonate real network hardware.",
  },
];

type Separator = ":" | "-" | "." | "";

function randomByte(): number {
  const arr = new Uint8Array(1);
  crypto.getRandomValues(arr);
  return arr[0];
}

function generateMAC(
  separator: Separator,
  upper: boolean,
  unicast: boolean,
  localAdmin: boolean
): string {
  const bytes: number[] = [];
  for (let i = 0; i < 6; i++) bytes.push(randomByte());

  // Apply bit flags to first byte
  if (unicast) bytes[0] = bytes[0] & 0xfe; // clear multicast bit
  else bytes[0] = bytes[0] | 0x01;         // set multicast bit

  if (localAdmin) bytes[0] = bytes[0] | 0x02;  // set LAA bit
  else bytes[0] = bytes[0] & 0xfd;             // clear LAA bit

  const hex = bytes.map((b) => b.toString(16).padStart(2, "0"));
  const result = upper ? hex.map((h) => h.toUpperCase()) : hex;

  if (separator === ".") {
    // Cisco dot notation: groups of 4 hex digits
    const flat = result.join("");
    return [flat.slice(0, 4), flat.slice(4, 8), flat.slice(8, 12)].join(".");
  }
  return result.join(separator);
}

export default function MacAddressGeneratorPage() {
  const [separator, setSeparator] = useState<Separator>(":");
  const [upper, setUpper] = useState(false);
  const [unicast, setUnicast] = useState(true);
  const [localAdmin, setLocalAdmin] = useState(false);
  const [count, setCount] = useState(5);
  const [macs, setMacs] = useState<string[]>([]);

  const generate = useCallback(() => {
    const result = Array.from({ length: Math.min(count, 20) }, () =>
      generateMAC(separator, upper, unicast, localAdmin)
    );
    setMacs(result);
  }, [separator, upper, unicast, localAdmin, count]);

  const allText = macs.join("\n");

  const separatorOptions: { label: string; value: Separator }[] = [
    { label: "Colon  AA:BB", value: ":" },
    { label: "Dash   AA-BB", value: "-" },
    { label: "Dot    AABB.CCDD", value: "." },
    { label: "None   AABBCC", value: "" },
  ];

  return (
    <ToolLayout
      tool={tool}
      faqs={faqs}
      howToUse="Configure the separator format, case, unicast/multicast, and locally administered flags, set how many addresses to generate (up to 20), then click Generate."
      useCases={[
        "Create test MAC addresses for network simulation labs",
        "Populate mock data for DHCP server testing",
        "Generate locally administered addresses for virtual machines",
        "Test network monitoring tools and dashboards",
      ]}
    >
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Separator Format
            </label>
            <select
              value={separator}
              onChange={(e) => setSeparator(e.target.value as Separator)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              {separatorOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Count (max 20)
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={count}
              onChange={(e) => setCount(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={upper}
              onChange={(e) => setUpper(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600"
            />
            Uppercase (AA:BB vs aa:bb)
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={unicast}
              onChange={(e) => setUnicast(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600"
            />
            Unicast (clear multicast bit)
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={localAdmin}
              onChange={(e) => setLocalAdmin(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600"
            />
            Locally Administered
          </label>
        </div>

        <button
          onClick={generate}
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Generate
        </button>

        {macs.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {macs.length} address{macs.length !== 1 ? "es" : ""} generated
              </p>
              <CopyButton text={allText} label="Copy All" />
            </div>
            <div className="space-y-1.5">
              {macs.map((m, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 dark:border-gray-700 dark:bg-gray-800/50"
                >
                  <code className="font-mono text-sm text-gray-900 dark:text-white">{m}</code>
                  <CopyButton text={m} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
