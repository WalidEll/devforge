"use client";

import { useState } from "react";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("ipv4-address-converter")!;

const faqs = [
  {
    question: "Why would I need to convert an IP address to binary?",
    answer:
      "Binary representation is essential for understanding subnetting, CIDR notation, and how subnet masks work. When you AND an IP address with a subnet mask in binary, you get the network address.",
  },
  {
    question: "What is the 32-bit integer form of an IP address?",
    answer:
      "An IPv4 address is fundamentally a 32-bit unsigned integer. The four decimal octets are just a human-readable representation. For example, 192.168.1.1 equals 3,232,235,777 as a 32-bit integer.",
  },
  {
    question: "What does the hexadecimal form look like?",
    answer:
      "Each octet is represented as two hex digits. For example, 192.168.1.1 becomes C0.A8.01.01 or 0xC0A80101. This format is often used in low-level networking code and packet captures.",
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

function ipToBinary(ip: string): string {
  return ip
    .split(".")
    .map((o) => Number(o).toString(2).padStart(8, "0"))
    .join(".");
}

function ipToHex(ip: string): string {
  return ip
    .split(".")
    .map((o) => Number(o).toString(16).toUpperCase().padStart(2, "0"))
    .join(".");
}

function parseBinary(bin: string): number | null {
  const octets = bin.replace(/\s/g, "").split(".");
  if (octets.length !== 4) return null;
  if (!octets.every((o) => /^[01]{8}$/.test(o))) return null;
  return octets.reduce((acc, o) => (acc << 8) | parseInt(o, 2), 0) >>> 0;
}

function parseHex(hex: string): number | null {
  const clean = hex.replace(/^0x/i, "").replace(/\./g, "");
  if (!/^[0-9a-fA-F]{8}$/.test(clean)) return null;
  return parseInt(clean, 16) >>> 0;
}

interface Result {
  decimal: string;
  binary: string;
  hex: string;
  integer: string;
}

function compute(decimal: string): Result | null {
  if (!isValidIp(decimal)) return null;
  const n = ipToInt(decimal);
  return {
    decimal,
    binary: ipToBinary(decimal),
    hex: ipToHex(decimal),
    integer: n.toString(),
  };
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50">
      <span className="w-28 shrink-0 text-sm font-medium text-gray-600 dark:text-gray-400">{label}</span>
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
        <code className="truncate font-mono text-sm text-gray-900 dark:text-white">{value}</code>
        <CopyButton text={value} />
      </div>
    </div>
  );
}

export default function IPv4AddressConverterPage() {
  const [decimal, setDecimal] = useState("192.168.1.1");
  const [result, setResult] = useState<Result | null>(() => compute("192.168.1.1"));
  const [error, setError] = useState("");

  function handleDecimalChange(val: string) {
    setDecimal(val);
    const res = compute(val);
    if (res) {
      setResult(res);
      setError("");
    } else {
      setResult(null);
      if (val.trim()) setError("Enter a valid IPv4 address (e.g. 192.168.1.1)");
      else setError("");
    }
  }

  function handleIntegerInput(val: string) {
    const n = parseInt(val, 10);
    if (!isNaN(n) && n >= 0 && n <= 4294967295) {
      const ip = intToIp(n >>> 0);
      setDecimal(ip);
      setResult(compute(ip));
      setError("");
    }
  }

  function handleBinaryInput(val: string) {
    const n = parseBinary(val);
    if (n !== null) {
      const ip = intToIp(n);
      setDecimal(ip);
      setResult(compute(ip));
      setError("");
    }
  }

  function handleHexInput(val: string) {
    const n = parseHex(val);
    if (n !== null) {
      const ip = intToIp(n);
      setDecimal(ip);
      setResult(compute(ip));
      setError("");
    }
  }

  return (
    <ToolLayout
      tool={tool}
      faqs={faqs}
      howToUse="Type an IPv4 address in any field — dotted decimal, binary octets, hex, or 32-bit integer. All other representations update instantly."
      useCases={[
        "Understand binary subnet masking by seeing the binary representation",
        "Look up IP addresses from packet captures that show hex values",
        "Convert integer IPs stored in databases back to dotted decimal",
        "Study networking fundamentals and CIDR notation",
      ]}
    >
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Dotted Decimal
            </label>
            <input
              type="text"
              value={decimal}
              onChange={(e) => handleDecimalChange(e.target.value)}
              placeholder="192.168.1.1"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 font-mono text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              32-bit Integer
            </label>
            <input
              type="text"
              value={result?.integer ?? ""}
              onChange={(e) => handleIntegerInput(e.target.value)}
              placeholder="3232235777"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 font-mono text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Binary (octet.octet.octet.octet)
            </label>
            <input
              type="text"
              value={result?.binary ?? ""}
              onChange={(e) => handleBinaryInput(e.target.value)}
              placeholder="11000000.10101000.00000001.00000001"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 font-mono text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Hexadecimal (e.g. C0.A8.01.01 or 0xC0A80101)
            </label>
            <input
              type="text"
              value={result?.hex ?? ""}
              onChange={(e) => handleHexInput(e.target.value)}
              placeholder="C0.A8.01.01"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 font-mono text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>

        {result && (
          <div className="space-y-2 pt-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Results
            </p>
            <Row label="Decimal" value={result.decimal} />
            <Row label="Binary" value={result.binary} />
            <Row label="Hex" value={result.hex} />
            <Row label="Integer" value={result.integer} />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
