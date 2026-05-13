"use client";

import { useState, useMemo } from "react";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("regex-tester")!;

const faqs = [
  {
    question: "What regex flavor does this tool use?",
    answer:
      "This tool uses JavaScript's built-in RegExp engine, which implements a flavor of regex similar to PCRE but with some differences (e.g., no lookbehind in older browsers, no atomic groups).",
  },
  {
    question: "What are regex flags?",
    answer:
      "Flags modify how the regex engine processes the pattern. 'g' enables global matching (find all matches), 'i' makes matching case-insensitive, and 'm' enables multiline mode where ^ and $ match line boundaries.",
  },
  {
    question: "Why is my regex not matching?",
    answer:
      "Common issues include: forgetting the 'g' flag for multiple matches, not escaping special characters like dots and parentheses, or using features not supported in JavaScript regex.",
  },
];

const cheatSheet = [
  { pattern: ".", desc: "Any character except newline" },
  { pattern: "\\d", desc: "Digit [0-9]" },
  { pattern: "\\w", desc: "Word char [a-zA-Z0-9_]" },
  { pattern: "\\s", desc: "Whitespace" },
  { pattern: "^", desc: "Start of string" },
  { pattern: "$", desc: "End of string" },
  { pattern: "*", desc: "0 or more" },
  { pattern: "+", desc: "1 or more" },
  { pattern: "?", desc: "0 or 1" },
  { pattern: "{n,m}", desc: "Between n and m" },
  { pattern: "(abc)", desc: "Capture group" },
  { pattern: "[abc]", desc: "Character class" },
  { pattern: "a|b", desc: "Alternation" },
  { pattern: "(?=...)", desc: "Positive lookahead" },
  { pattern: "(?!...)", desc: "Negative lookahead" },
];

interface MatchInfo {
  match: string;
  index: number;
  groups: string[];
}

export default function RegexTesterPage() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [testString, setTestString] = useState("");

  const { matches, error } = useMemo(() => {
    if (!pattern || !testString) return { matches: [] as MatchInfo[], error: "", highlighted: testString };

    try {
      const re = new RegExp(pattern, flags);
      const matchList: MatchInfo[] = [];
      let m: RegExpExecArray | null;

      if (flags.includes("g")) {
        while ((m = re.exec(testString)) !== null) {
          matchList.push({ match: m[0], index: m.index, groups: m.slice(1) });
          if (m[0].length === 0) re.lastIndex++;
        }
      } else {
        m = re.exec(testString);
        if (m) matchList.push({ match: m[0], index: m.index, groups: m.slice(1) });
      }

      let hl = "";
      let last = 0;
      for (const match of matchList) {
        hl += testString.slice(last, match.index);
        hl += `<<MATCH_START>>${match.match}<<MATCH_END>>`;
        last = match.index + match.match.length;
      }
      hl += testString.slice(last);

      return { matches: matchList, error: "", highlighted: hl };
    } catch (e) {
      return { matches: [] as MatchInfo[], error: e instanceof Error ? e.message : "Invalid regex", highlighted: testString };
    }
  }, [pattern, flags, testString]);

  return (
    <ToolLayout
      tool={tool}
      faqs={faqs}
      howToUse="Enter a regular expression pattern and flags, then type or paste your test string. Matches are highlighted in real-time as you type. The matches table shows each match with its position and capture groups. Use the cheat sheet on the side for quick reference."
      useCases={[
        "Testing regex patterns before using them in code",
        "Debugging data validation rules for forms and APIs",
        "Extracting patterns from log files and structured text",
        "Learning regular expressions with real-time feedback",
      ]}
    >
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Pattern</label>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="[A-Za-z]+@[A-Za-z]+\\.com"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 font-mono text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
            />
          </div>
          <div className="w-24">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Flags</label>
            <input
              type="text"
              value={flags}
              onChange={(e) => setFlags(e.target.value)}
              placeholder="gim"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 font-mono text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">{error}</div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Test String</label>
          <textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="Enter test string..."
            rows={6}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-mono text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
          />
        </div>

        {matches.length > 0 && (
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {matches.length} match{matches.length !== 1 ? "es" : ""} found
              </label>
              <CopyButton text={matches.map((m) => m.match).join("\n")} label="Copy matches" />
            </div>
            <div className="max-h-48 overflow-auto rounded-lg border border-gray-300 dark:border-gray-700">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-2 font-medium text-gray-700 dark:text-gray-300">#</th>
                    <th className="px-4 py-2 font-medium text-gray-700 dark:text-gray-300">Match</th>
                    <th className="px-4 py-2 font-medium text-gray-700 dark:text-gray-300">Index</th>
                    <th className="px-4 py-2 font-medium text-gray-700 dark:text-gray-300">Groups</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((m, i) => (
                    <tr key={i} className="border-t border-gray-200 dark:border-gray-700">
                      <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{i + 1}</td>
                      <td className="px-4 py-2 font-mono text-blue-600 dark:text-blue-400">{m.match}</td>
                      <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{m.index}</td>
                      <td className="px-4 py-2 font-mono text-gray-600 dark:text-gray-400">
                        {m.groups.length > 0 ? m.groups.join(", ") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <details className="rounded-lg border border-gray-200 dark:border-gray-700">
          <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            Regex Cheat Sheet
          </summary>
          <div className="border-t border-gray-200 px-4 py-3 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {cheatSheet.map((item) => (
                <div key={item.pattern} className="text-sm">
                  <code className="font-mono text-blue-600 dark:text-blue-400">{item.pattern}</code>{" "}
                  <span className="text-gray-600 dark:text-gray-400">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </details>
      </div>
    </ToolLayout>
  );
}
