"use client";

import { useState } from "react";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("hash-generator")!;

const faqs = [
  {
    question: "What is a hash function?",
    answer:
      "A hash function takes an input of any size and produces a fixed-size string of characters. The same input always produces the same hash, but it is computationally infeasible to reverse the process.",
  },
  {
    question: "Which hash algorithm should I use?",
    answer:
      "For security purposes, use SHA-256 or SHA-512. MD5 and SHA-1 are considered insecure for cryptographic use but are still useful for checksums and non-security fingerprinting.",
  },
  {
    question: "Is MD5 still safe to use?",
    answer:
      "MD5 should not be used for security-sensitive applications like password hashing or digital signatures. It is still acceptable for non-security checksums, like verifying file integrity during transfers.",
  },
];

async function computeHash(algo: string, text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const buffer = await crypto.subtle.digest(algo, data);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Simple MD5 implementation for browser
function md5(str: string): string {
  function md5cycle(x: number[], k: number[]) {
    let a = x[0], b = x[1], c = x[2], d = x[3];
    a = ff(a, b, c, d, k[0], 7, -680876936); d = ff(d, a, b, c, k[1], 12, -389564586); c = ff(c, d, a, b, k[2], 17, 606105819); b = ff(b, c, d, a, k[3], 22, -1044525330);
    a = ff(a, b, c, d, k[4], 7, -176418897); d = ff(d, a, b, c, k[5], 12, 1200080426); c = ff(c, d, a, b, k[6], 17, -1473231341); b = ff(b, c, d, a, k[7], 22, -45705983);
    a = ff(a, b, c, d, k[8], 7, 1770035416); d = ff(d, a, b, c, k[9], 12, -1958414417); c = ff(c, d, a, b, k[10], 17, -42063); b = ff(b, c, d, a, k[11], 22, -1990404162);
    a = ff(a, b, c, d, k[12], 7, 1804603682); d = ff(d, a, b, c, k[13], 12, -40341101); c = ff(c, d, a, b, k[14], 17, -1502002290); b = ff(b, c, d, a, k[15], 22, 1236535329);
    a = gg(a, b, c, d, k[1], 5, -165796510); d = gg(d, a, b, c, k[6], 9, -1069501632); c = gg(c, d, a, b, k[11], 14, 643717713); b = gg(b, c, d, a, k[0], 20, -373897302);
    a = gg(a, b, c, d, k[5], 5, -701558691); d = gg(d, a, b, c, k[10], 9, 38016083); c = gg(c, d, a, b, k[15], 14, -660478335); b = gg(b, c, d, a, k[4], 20, -405537848);
    a = gg(a, b, c, d, k[9], 5, 568446438); d = gg(d, a, b, c, k[14], 9, -1019803690); c = gg(c, d, a, b, k[3], 14, -187363961); b = gg(b, c, d, a, k[8], 20, 1163531501);
    a = gg(a, b, c, d, k[13], 5, -1444681467); d = gg(d, a, b, c, k[2], 9, -51403784); c = gg(c, d, a, b, k[7], 14, 1735328473); b = gg(b, c, d, a, k[12], 20, -1926607734);
    a = hh(a, b, c, d, k[5], 4, -378558); d = hh(d, a, b, c, k[8], 11, -2022574463); c = hh(c, d, a, b, k[11], 16, 1839030562); b = hh(b, c, d, a, k[14], 23, -35309556);
    a = hh(a, b, c, d, k[1], 4, -1530992060); d = hh(d, a, b, c, k[4], 11, 1272893353); c = hh(c, d, a, b, k[7], 16, -155497632); b = hh(b, c, d, a, k[10], 23, -1094730640);
    a = hh(a, b, c, d, k[13], 4, 681279174); d = hh(d, a, b, c, k[0], 11, -358537222); c = hh(c, d, a, b, k[3], 16, -722521979); b = hh(b, c, d, a, k[6], 23, 76029189);
    a = hh(a, b, c, d, k[9], 4, -640364487); d = hh(d, a, b, c, k[12], 11, -421815835); c = hh(c, d, a, b, k[15], 16, 530742520); b = hh(b, c, d, a, k[2], 23, -995338651);
    a = ii(a, b, c, d, k[0], 6, -198630844); d = ii(d, a, b, c, k[7], 10, 1126891415); c = ii(c, d, a, b, k[14], 15, -1416354905); b = ii(b, c, d, a, k[5], 21, -57434055);
    a = ii(a, b, c, d, k[12], 6, 1700485571); d = ii(d, a, b, c, k[3], 10, -1894986606); c = ii(c, d, a, b, k[10], 15, -1051523); b = ii(b, c, d, a, k[1], 21, -2054922799);
    a = ii(a, b, c, d, k[8], 6, 1873313359); d = ii(d, a, b, c, k[15], 10, -30611744); c = ii(c, d, a, b, k[6], 15, -1560198380); b = ii(b, c, d, a, k[13], 21, 1309151649);
    a = ii(a, b, c, d, k[4], 6, -145523070); d = ii(d, a, b, c, k[11], 10, -1120210379); c = ii(c, d, a, b, k[2], 15, 718787259); b = ii(b, c, d, a, k[9], 21, -343485551);
    x[0] = add32(a, x[0]); x[1] = add32(b, x[1]); x[2] = add32(c, x[2]); x[3] = add32(d, x[3]);
  }
  function cmn(q: number, a: number, b: number, x: number, s: number, t: number) { a = add32(add32(a, q), add32(x, t)); return add32((a << s) | (a >>> (32 - s)), b); }
  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn((b & c) | (~b & d), a, b, x, s, t); }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn((b & d) | (c & ~d), a, b, x, s, t); }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn(b ^ c ^ d, a, b, x, s, t); }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn(c ^ (b | ~d), a, b, x, s, t); }
  function add32(a: number, b: number) { return (a + b) & 0xffffffff; }

  const n = str.length;
  const state = [1732584193, -271733879, -1732584194, 271733878];
  let i: number;
  const tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (i = 64; i <= n; i += 64) {
    const blk = [];
    for (let j = 0; j < 64; j += 4) blk.push(str.charCodeAt(i - 64 + j) + (str.charCodeAt(i - 64 + j + 1) << 8) + (str.charCodeAt(i - 64 + j + 2) << 16) + (str.charCodeAt(i - 64 + j + 3) << 24));
    md5cycle(state, blk);
  }
  for (let j = 0; j < 16; j++) tail[j] = 0;
  for (let j = 0; j < n % 64; j++) tail[j >> 2] |= str.charCodeAt(i - 64 + (n % 64) - (n % 64) + j) << ((j % 4) << 3);
  tail[(n % 64) >> 2] |= 0x80 << (((n % 64) % 4) << 3);
  if ((n % 64) > 55) { md5cycle(state, tail); for (let j = 0; j < 16; j++) tail[j] = 0; }
  tail[14] = n * 8;
  md5cycle(state, tail);
  const hex = "0123456789abcdef";
  let s = "";
  for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++) s += hex.charAt((state[j] >> (k * 8 + 4)) & 0xf) + hex.charAt((state[j] >> (k * 8)) & 0xf);
  return s;
}

export default function HashGeneratorPage() {
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState<Record<string, string>>({});

  async function generate() {
    if (!input) return;
    const results: Record<string, string> = {};
    results["MD5"] = md5(input);
    for (const algo of ["SHA-1", "SHA-256", "SHA-512"]) {
      results[algo] = await computeHash(algo, input);
    }
    setHashes(results);
  }

  return (
    <ToolLayout
      tool={tool}
      faqs={faqs}
      howToUse="Enter any text in the input field and click Generate Hashes. The tool computes MD5, SHA-1, SHA-256, and SHA-512 hashes simultaneously. Click the copy button next to any hash to copy it to your clipboard."
      useCases={[
        "Generating checksums for file integrity verification",
        "Creating content-based fingerprints for deduplication",
        "Computing hashes for API request signing",
        "Verifying data integrity during transfers",
      ]}
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Input Text
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter text to hash..."
            rows={5}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-mono text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
          />
        </div>

        <button
          onClick={generate}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Generate Hashes
        </button>

        {Object.keys(hashes).length > 0 && (
          <div className="space-y-3">
            {Object.entries(hashes).map(([algo, hash]) => (
              <div key={algo} className="rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{algo}</span>
                  <CopyButton text={hash} />
                </div>
                <code className="block break-all font-mono text-sm text-gray-600 dark:text-gray-400">{hash}</code>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
