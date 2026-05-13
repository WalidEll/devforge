"use client";

import { useState } from "react";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/ToolLayout";

const tool = getToolBySlug("credit-card-validator")!;

const faqs = [
  {
    question: "How does credit card validation work?",
    answer:
      "The Luhn algorithm checks if a card number has a valid checksum. It doubles every second digit from the right, sums all digits, and verifies the total is divisible by 10.",
  },
  {
    question: "Does passing validation mean the card is real?",
    answer:
      "No. The Luhn check only validates the number format and checksum. It cannot verify whether the card account actually exists, is active, or has sufficient funds.",
  },
  {
    question: "Is my data sent to a server?",
    answer: "No. All validation happens in your browser using the Luhn algorithm. Your card number never leaves your machine.",
  },
];

interface CardInfo {
  valid: boolean;
  type: string;
  formatted: string;
  length: number;
}

const CARD_PATTERNS: { type: string; pattern: RegExp; lengths: number[] }[] = [
  { type: "Visa", pattern: /^4/, lengths: [13, 16, 19] },
  { type: "Mastercard", pattern: /^5[1-5]|^2(2[2-9]|[3-6]\d|7[01])/, lengths: [16] },
  { type: "American Express", pattern: /^3[47]/, lengths: [15] },
  { type: "Discover", pattern: /^6(?:011|22(?:1(?:2[6-9]|[3-9]\d)|[2-8]\d{2}|9(?:[01]\d|2[0-5]))|4[4-9]\d|5\d{2})/, lengths: [16] },
  { type: "Diners Club", pattern: /^3(?:0[0-5]|[68])/, lengths: [14] },
  { type: "JCB", pattern: /^35/, lengths: [16, 17, 18, 19] },
  { type: "UnionPay", pattern: /^62/, lengths: [16, 17, 18, 19] },
  { type: "Maestro", pattern: /^(?:5018|5020|5038|5893|6304|6759|676[1-3])/, lengths: [12, 13, 14, 15, 16, 17, 18, 19] },
];

function luhn(num: string): boolean {
  let sum = 0;
  let alt = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let n = parseInt(num[i], 10);
    if (alt) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function detectCard(digits: string): CardInfo {
  let type = "Unknown";
  for (const card of CARD_PATTERNS) {
    if (card.pattern.test(digits)) { type = card.type; break; }
  }
  const valid = digits.length >= 12 && luhn(digits);
  const formatted = digits.replace(/(.{4})/g, "$1 ").trim();
  return { valid, type, formatted, length: digits.length };
}

export default function CreditCardValidatorPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<CardInfo | null>(null);

  function handleChange(val: string) {
    const digits = val.replace(/\D/g, "").slice(0, 19);
    setInput(digits);
    if (digits.length >= 12) setResult(detectCard(digits));
    else setResult(null);
  }

  function formatDisplay(digits: string): string {
    return digits.replace(/(.{4})/g, "$1 ").trim();
  }

  const cardColors: Record<string, string> = {
    Visa: "bg-blue-600",
    Mastercard: "bg-red-600",
    "American Express": "bg-green-600",
    Discover: "bg-orange-500",
    "Diners Club": "bg-gray-600",
    JCB: "bg-purple-600",
    UnionPay: "bg-red-700",
    Maestro: "bg-blue-500",
    Unknown: "bg-gray-500",
  };

  return (
    <ToolLayout
      tool={tool}
      faqs={faqs}
      howToUse="Type or paste a credit card number. The tool automatically detects the card network (Visa, Mastercard, Amex, etc.) using BIN prefix rules and validates the number using the Luhn algorithm."
      useCases={[
        "Validate test card numbers during payment integration development",
        "Verify that a card number follows the correct format before submission",
        "Learn how the Luhn algorithm works with live examples",
      ]}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Card Number</label>
          <input
            type="text"
            inputMode="numeric"
            className="w-full font-mono text-lg tracking-widest px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="4111 1111 1111 1111"
            value={formatDisplay(input)}
            onChange={(e) => handleChange(e.target.value)}
            maxLength={23}
          />
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Enter digits only — spaces are added automatically</p>
        </div>

        {result && (
          <div className="space-y-3">
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-white font-medium ${
                result.valid ? "bg-green-600" : "bg-red-500"
              }`}
            >
              <span className="text-xl">{result.valid ? "✓" : "✗"}</span>
              <span>{result.valid ? "Valid card number" : "Invalid card number (Luhn check failed)"}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Card Network</p>
                <div className="flex items-center gap-2">
                  <span className={`inline-block w-3 h-3 rounded-full ${cardColors[result.type] ?? "bg-gray-500"}`} />
                  <span className="font-medium text-gray-900 dark:text-gray-100">{result.type}</span>
                </div>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Length</p>
                <span className="font-medium text-gray-900 dark:text-gray-100">{result.length} digits</span>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Luhn Check</p>
                <span className={`font-medium ${result.valid ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
                  {result.valid ? "Passed" : "Failed"}
                </span>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Formatted</p>
                <span className="font-mono text-sm text-gray-900 dark:text-gray-100">{result.formatted}</span>
              </div>
            </div>

            <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-700 dark:text-amber-400">
              ⚠ Luhn validation only checks the number format. It cannot verify if the card account exists or is active.
            </div>
          </div>
        )}

        <div className="mt-4">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Example test numbers</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Visa", num: "4111111111111111" },
              { label: "Mastercard", num: "5500005555555559" },
              { label: "Amex", num: "378282246310005" },
              { label: "Discover", num: "6011111111111117" },
            ].map(({ label, num }) => (
              <button
                key={num}
                onClick={() => handleChange(num)}
                className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-mono"
              >
                {label}: {num.slice(0, 4)}…
              </button>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
