"use client";

import { useState } from "react";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("ipv4-subnet-calculator")!;

const faqs = [
  {
    question: "What is CIDR notation?",
    answer:
      "CIDR (Classless Inter-Domain Routing) notation represents an IP address and its associated network mask as a single string, e.g. 192.168.1.0/24. The number after the slash indicates how many bits are used for the network portion.",
  },
  {
    question: "How many usable hosts are in a /24 subnet?",
    answer:
      "A /24 subnet has 256 total addresses (2^8). Subtracting the network address and broadcast address leaves 254 usable host addresses.",
  },
  {
    question: "What is the difference between network address and broadcast address?",
    answer:
      "The network address is the first address in a subnet (all host bits set to 0) and identifies the subnet itself. The broadcast address is the last address (all host bits set to 1) and is used to send data to all hosts on the subnet.",
  },
  {
    question: "What is a wildcard mask?",
    answer:
      "A wildcard mask is the inverse of a subnet mask. It is used in access control lists (ACLs) to specify which bits of an IP address must match. For a /24 subnet mask of 255.255.255.0, the wildcard mask is 0.0.0.255.",
  },
];

function ipToInt(ip: string): number {
  const parts = ip.split(".").map(Number);
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function intToIp(n: number): string {
  return [
    (n >>> 24) & 0xff,
    (n >>> 16) & 0xff,
    (n >>> 8) & 0xff,
    n & 0xff,
  ].join(".");
}

function isValidIp(ip: string): boolean {
  const parts = ip.split(".");
  if (parts.length !== 4) return false;
  return parts.every((p) => {
    const n = Number(p);
    return /^\d+$/.test(p) && n >= 0 && n <= 255;
  });
}

interface SubnetInfo {
  networkAddress: string;
  broadcastAddress: string;
  subnetMask: string;
  wildcardMask: string;
  firstHost: string;
  lastHost: string;
  totalHosts: number;
  usableHosts: number;
  cidr: string;
  ipClass: string;
}

function calculateSubnet(cidrInput: string): SubnetInfo | null {
  const parts = cidrInput.trim().split("/");
  if (parts.length !== 2) return null;
  const ip = parts[0];
  const prefix = parseInt(parts[1], 10);
  if (!isValidIp(ip) || isNaN(prefix) || prefix < 0 || prefix > 32) return null;

  const ipInt = ipToInt(ip);
  const maskInt = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const wildcardInt = (~maskInt) >>> 0;
  const networkInt = (ipInt & maskInt) >>> 0;
  const broadcastInt = (networkInt | wildcardInt) >>> 0;

  const totalHosts = Math.pow(2, 32 - prefix);
  const usableHosts = prefix >= 31 ? totalHosts : Math.max(0, totalHosts - 2);
  const firstHost = prefix >= 31 ? intToIp(networkInt) : intToIp(networkInt + 1);
  const lastHost = prefix >= 31 ? intToIp(broadcastInt) : intToIp(broadcastInt - 1);

  const firstOctet = (networkInt >>> 24) & 0xff;
  let ipClass = "A";
  if (firstOctet >= 192) ipClass = "C";
  else if (firstOctet >= 128) ipClass = "B";

  return {
    networkAddress: intToIp(networkInt),
    broadcastAddress: intToIp(broadcastInt),
    subnetMask: intToIp(maskInt),
    wildcardMask: intToIp(wildcardInt),
    firstHost,
    lastHost,
    totalHosts,
    usableHosts,
    cidr: `${intToIp(networkInt)}/${prefix}`,
    ipClass,
  };
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50">
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</span>
      <div className="flex items-center gap-2">
        <code className="font-mono text-sm text-gray-900 dark:text-white">{value}</code>
        <CopyButton text={value} />
      </div>
    </div>
  );
}

export default function IPv4SubnetCalculatorPage() {
  const [input, setInput] = useState("192.168.1.0/24");
  const [result, setResult] = useState<SubnetInfo | null>(() => calculateSubnet("192.168.1.0/24"));
  const [error, setError] = useState("");

  function calculate() {
    const res = calculateSubnet(input);
    if (!res) {
      setError("Invalid CIDR notation. Example: 192.168.1.0/24");
      setResult(null);
    } else {
      setError("");
      setResult(res);
    }
  }

  return (
    <ToolLayout
      tool={tool}
      faqs={faqs}
      howToUse="Enter an IPv4 address with CIDR prefix length (e.g. 192.168.1.0/24) and click Calculate. The tool computes network address, broadcast address, subnet mask, wildcard mask, host range, and total usable hosts."
      useCases={[
        "Plan IP address allocation for a new network segment",
        "Verify subnet configurations on routers and firewalls",
        "Calculate available host addresses before provisioning servers",
        "Study for networking certifications (CCNA, CompTIA Network+)",
      ]}
    >
      <div className="space-y-6">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            IP Address / CIDR
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && calculate()}
              placeholder="e.g. 192.168.1.0/24"
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 font-mono text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400"
            />
            <button
              onClick={calculate}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Calculate
            </button>
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>

        {result && (
          <div className="space-y-2">
            <Row label="CIDR Notation" value={result.cidr} />
            <Row label="Network Address" value={result.networkAddress} />
            <Row label="Subnet Mask" value={result.subnetMask} />
            <Row label="Wildcard Mask" value={result.wildcardMask} />
            <Row label="Broadcast Address" value={result.broadcastAddress} />
            <Row label="First Usable Host" value={result.firstHost} />
            <Row label="Last Usable Host" value={result.lastHost} />
            <Row label="Usable Hosts" value={result.usableHosts.toLocaleString()} />
            <Row label="Total Addresses" value={result.totalHosts.toLocaleString()} />
            <Row label="IP Class" value={`Class ${result.ipClass}`} />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
