"use client";

import { useState } from "react";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("mac-address-lookup")!;

const faqs = [
  {
    question: "What is an OUI?",
    answer:
      "OUI stands for Organizationally Unique Identifier. It is the first 24 bits (6 hex digits) of a MAC address and is assigned by the IEEE to manufacturers. It identifies which company made the network interface.",
  },
  {
    question: "What MAC address formats are accepted?",
    answer:
      "This tool accepts MAC addresses in the most common formats: colon-separated (AA:BB:CC:DD:EE:FF), dash-separated (AA-BB-CC-DD-EE-FF), and dot-separated (AABB.CCDD.EEFF). The lookup uses only the first 6 hex digits (OUI prefix).",
  },
  {
    question: "What data source is used?",
    answer:
      "Vendor information is fetched from the macvendors.com API, which is based on the IEEE OUI database. An internet connection is required.",
  },
  {
    question: "Why might a lookup return 'Unknown'?",
    answer:
      "Some OUI prefixes are not in the public IEEE database — this is common for private, locally administered, or recently assigned addresses.",
  },
];

function normalizeMAC(raw: string): string | null {
  const clean = raw.replace(/[:\-\.]/g, "").toUpperCase();
  if (!/^[0-9A-F]{12}$/.test(clean)) return null;
  return clean.match(/.{2}/g)!.join(":");
}

export default function MacAddressLookupPage() {
  const [mac, setMac] = useState("");
  const [vendor, setVendor] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function lookup() {
    const normalized = normalizeMAC(mac);
    if (!normalized) {
      setErrorMsg("Enter a valid 12-digit MAC address (e.g. AA:BB:CC:DD:EE:FF)");
      setStatus("error");
      setVendor("");
      return;
    }
    setStatus("loading");
    setVendor("");
    setErrorMsg("");
    try {
      const res = await fetch(`https://api.macvendors.com/${encodeURIComponent(normalized)}`);
      if (res.status === 404) {
        setVendor("Unknown — OUI not found in database");
        setStatus("success");
      } else if (!res.ok) {
        throw new Error(`API error ${res.status}`);
      } else {
        const text = await res.text();
        setVendor(text.trim());
        setStatus("success");
      }
    } catch {
      setErrorMsg("Lookup failed. Check your connection and try again.");
      setStatus("error");
    }
  }

  const normalized = normalizeMAC(mac);
  const oui = normalized ? normalized.split(":").slice(0, 3).join(":") : null;

  return (
    <ToolLayout
      tool={tool}
      faqs={faqs}
      howToUse="Enter a MAC address in any common format (AA:BB:CC:DD:EE:FF, AA-BB-CC-DD-EE-FF, or AABB.CCDD.EEFF) and click Look Up. The vendor name is fetched from the IEEE OUI database via the macvendors.com API."
      useCases={[
        "Identify unknown devices on your network by their MAC address",
        "Verify the manufacturer of a network interface card",
        "Investigate suspicious ARP entries or DHCP leases",
        "Network forensics and inventory auditing",
      ]}
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            MAC Address
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={mac}
              onChange={(e) => { setMac(e.target.value); setStatus("idle"); setVendor(""); setErrorMsg(""); }}
              onKeyDown={(e) => e.key === "Enter" && lookup()}
              placeholder="e.g. AA:BB:CC:DD:EE:FF"
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 font-mono text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            <button
              onClick={lookup}
              disabled={status === "loading"}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
            >
              {status === "loading" ? "Looking up…" : "Look Up"}
            </button>
          </div>
          {oui && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              OUI prefix: <code className="font-mono">{oui}</code>
            </p>
          )}
        </div>

        {status === "error" && (
          <p className="text-sm text-red-600 dark:text-red-400">{errorMsg}</p>
        )}

        {status === "success" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Vendor</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-gray-900 dark:text-white">{vendor}</span>
                {!vendor.startsWith("Unknown") && <CopyButton text={vendor} />}
              </div>
            </div>
            {normalized && (
              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Normalized MAC</span>
                <div className="flex items-center gap-2">
                  <code className="font-mono text-sm text-gray-900 dark:text-white">{normalized}</code>
                  <CopyButton text={normalized} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
