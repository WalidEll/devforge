"use client";

import { useState, useCallback } from "react";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("password-generator")!;

const faqs = [
  {
    question: "How random are the generated passwords?",
    answer:
      "Passwords are generated using the Web Crypto API's crypto.getRandomValues(), which is a cryptographically secure random number generator built into your browser. This is the same randomness used in security-sensitive applications.",
  },
  {
    question: "What makes a password strong?",
    answer:
      "Password strength depends on length and character variety. A 16-character password using all character types has over 95 bits of entropy — effectively uncrackable by brute force. Aim for at least 16 characters with uppercase, lowercase, numbers, and symbols.",
  },
  {
    question: "Are generated passwords stored anywhere?",
    answer:
      "No. All passwords are generated entirely in your browser using JavaScript. Nothing is sent to any server. Closing or refreshing the page discards all generated passwords.",
  },
  {
    question: "What does 'exclude ambiguous characters' do?",
    answer:
      "It removes characters that look similar in some fonts: 0 (zero) and O (letter O), 1 (one) and l (lowercase L) and I (uppercase i). Useful when passwords need to be typed by hand.",
  },
];

const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";
const AMBIGUOUS = /[0O1lI]/g;

function entropyBits(charsetSize: number, length: number): number {
  return Math.log2(Math.pow(charsetSize, length));
}

function strengthLabel(bits: number): { label: string; color: string; width: string } {
  if (bits < 28) return { label: "Very Weak", color: "bg-red-500", width: "w-1/5" };
  if (bits < 36) return { label: "Weak", color: "bg-orange-500", width: "w-2/5" };
  if (bits < 60) return { label: "Fair", color: "bg-yellow-500", width: "w-3/5" };
  if (bits < 80) return { label: "Strong", color: "bg-blue-500", width: "w-4/5" };
  return { label: "Very Strong", color: "bg-green-500", width: "w-full" };
}

function generatePassword(opts: {
  length: number;
  lower: boolean;
  upper: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}): string {
  let charset = "";
  if (opts.lower) charset += LOWERCASE;
  if (opts.upper) charset += UPPERCASE;
  if (opts.numbers) charset += NUMBERS;
  if (opts.symbols) charset += SYMBOLS;
  if (opts.excludeAmbiguous) charset = charset.replace(AMBIGUOUS, "");
  if (!charset) return "";

  const array = new Uint32Array(opts.length);
  crypto.getRandomValues(array);

  let password = Array.from(array, (n) => charset[n % charset.length]).join("");

  // Ensure at least one char from each required set
  const required: string[] = [];
  let adjustedLower = LOWERCASE;
  let adjustedUpper = UPPERCASE;
  let adjustedNumbers = NUMBERS;
  let adjustedSymbols = SYMBOLS;
  if (opts.excludeAmbiguous) {
    adjustedLower = adjustedLower.replace(AMBIGUOUS, "");
    adjustedUpper = adjustedUpper.replace(AMBIGUOUS, "");
    adjustedNumbers = adjustedNumbers.replace(AMBIGUOUS, "");
  }
  if (opts.lower && adjustedLower) required.push(adjustedLower);
  if (opts.upper && adjustedUpper) required.push(adjustedUpper);
  if (opts.numbers && adjustedNumbers) required.push(adjustedNumbers);
  if (opts.symbols) required.push(adjustedSymbols);

  if (required.length > 0 && password.length >= required.length) {
    const positions = new Uint32Array(required.length);
    crypto.getRandomValues(positions);
    const usedPositions = new Set<number>();
    const chars = password.split("");
    required.forEach((set, i) => {
      let pos = positions[i] % opts.length;
      while (usedPositions.has(pos)) pos = (pos + 1) % opts.length;
      usedPositions.add(pos);
      const randIdx = new Uint32Array(1);
      crypto.getRandomValues(randIdx);
      chars[pos] = set[randIdx[0] % set.length];
    });
    password = chars.join("");
  }

  return password;
}

export default function PasswordGeneratorPage() {
  const [length, setLength] = useState(16);
  const [lower, setLower] = useState(true);
  const [upper, setUpper] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [bulkCount, setBulkCount] = useState(1);
  const [passwords, setPasswords] = useState<string[]>([]);

  const charsetSize = (() => {
    let s = 0;
    let lo = LOWERCASE, up = UPPERCASE, nu = NUMBERS;
    if (excludeAmbiguous) { lo = lo.replace(AMBIGUOUS, ""); up = up.replace(AMBIGUOUS, ""); nu = nu.replace(AMBIGUOUS, ""); }
    if (lower) s += lo.length;
    if (upper) s += up.length;
    if (numbers) s += nu.length;
    if (symbols) s += SYMBOLS.length;
    return s;
  })();

  const bits = charsetSize > 0 ? entropyBits(charsetSize, length) : 0;
  const strength = strengthLabel(bits);

  const generate = useCallback(() => {
    const opts = { length, lower, upper, numbers, symbols, excludeAmbiguous };
    const result = Array.from({ length: bulkCount }, () => generatePassword(opts));
    setPasswords(result);
  }, [length, lower, upper, numbers, symbols, excludeAmbiguous, bulkCount]);

  const atLeastOne = lower || upper || numbers || symbols;

  return (
    <ToolLayout
      tool={tool}
      faqs={faqs}
      howToUse="Set your desired password length using the slider, choose which character types to include, then click Generate. Use the bulk option to generate multiple passwords at once. The strength meter shows entropy-based password strength."
      useCases={[
        "Generating secure credentials for new accounts and services",
        "Creating API keys and service account passwords",
        "Generating bulk test passwords for staging environments",
        "Producing temporary passwords for user onboarding flows",
      ]}
    >
      <div className="space-y-5">
        {/* Length */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Length</label>
            <span className="text-sm font-mono font-semibold text-blue-600 dark:text-blue-400">{length}</span>
          </div>
          <input
            type="range"
            min={4}
            max={128}
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value))}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-0.5">
            <span>4</span>
            <span>128</span>
          </div>
        </div>

        {/* Character sets */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Character Sets</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: "Lowercase (a–z)", value: lower, set: setLower },
              { label: "Uppercase (A–Z)", value: upper, set: setUpper },
              { label: "Numbers (0–9)", value: numbers, set: setNumbers },
              { label: "Symbols (!@#…)", value: symbols, set: setSymbols },
            ].map(({ label, value, set }) => (
              <label key={label} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => set(e.target.checked)}
                  className="rounded"
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={excludeAmbiguous}
              onChange={(e) => setExcludeAmbiguous(e.target.checked)}
              className="rounded"
            />
            Exclude ambiguous characters (0, O, 1, l, I)
          </label>
        </div>

        {/* Entropy / strength */}
        {atLeastOne && (
          <div>
            <div className="mb-1 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Strength: <span className="font-semibold">{strength.label}</span></span>
              <span>{Math.round(bits)} bits of entropy</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
              <div className={`h-2 rounded-full transition-all ${strength.color} ${strength.width}`} />
            </div>
          </div>
        )}

        {/* Bulk count + generate */}
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Count</label>
            <input
              type="number"
              min={1}
              max={100}
              value={bulkCount}
              onChange={(e) => setBulkCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
              className="w-20 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
            />
          </div>
          <button
            onClick={generate}
            disabled={!atLeastOne}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Generate
          </button>
        </div>

        {/* Output */}
        {passwords.length > 0 && (
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {passwords.length === 1 ? "Password" : `${passwords.length} Passwords`}
              </label>
              <CopyButton text={passwords.join("\n")} label={passwords.length > 1 ? "Copy All" : "Copy"} />
            </div>
            <div className="max-h-72 overflow-auto rounded-lg border border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
              {passwords.map((pw, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b border-gray-200 px-4 py-2 last:border-b-0 dark:border-gray-700"
                >
                  <span className="font-mono text-sm text-gray-900 dark:text-white break-all">{pw}</span>
                  <CopyButton text={pw} label="" className="ml-2 shrink-0 !px-2 !py-1 text-xs" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
