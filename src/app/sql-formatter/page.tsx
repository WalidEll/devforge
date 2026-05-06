"use client";

import { useState } from "react";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("sql-formatter")!;

const faqs = [
  {
    question: "What SQL dialects are supported?",
    answer:
      "This formatter works with standard SQL syntax including SELECT, INSERT, UPDATE, DELETE, CREATE TABLE, and JOIN statements. It handles most ANSI SQL and is compatible with MySQL, PostgreSQL, and SQLite syntax.",
  },
  {
    question: "Does this tool modify my query logic?",
    answer:
      "No. The formatter only changes whitespace and indentation to improve readability. The query logic, table names, column names, and conditions remain completely unchanged.",
  },
  {
    question: "Can I minify SQL?",
    answer:
      "Yes. The Minify option removes all extra whitespace and condenses the query to a single line, which is useful for embedding SQL in code strings or configuration files.",
  },
];

const KEYWORDS = new Set([
  "SELECT","FROM","WHERE","JOIN","LEFT","RIGHT","INNER","OUTER","FULL","CROSS","ON","AND","OR","NOT","IN","IS",
  "NULL","AS","DISTINCT","ORDER","BY","GROUP","HAVING","LIMIT","OFFSET","UNION","ALL","INSERT","INTO","VALUES",
  "UPDATE","SET","DELETE","CREATE","TABLE","DROP","ALTER","ADD","COLUMN","PRIMARY","KEY","FOREIGN","REFERENCES",
  "INDEX","VIEW","WITH","CASE","WHEN","THEN","ELSE","END","EXISTS","BETWEEN","LIKE","ASC","DESC","RETURNING",
  "TRUNCATE","COMMIT","ROLLBACK","BEGIN","TRANSACTION","IF",
]);

function formatSQL(sql: string): string {
  const indent = "  ";
  let result = "";
  let depth = 0;
  let i = 0;
  const tokens: string[] = [];

  // Tokenize
  while (i < sql.length) {
    // String literals
    if (sql[i] === "'" || sql[i] === '"' || sql[i] === "`") {
      const quote = sql[i];
      let j = i + 1;
      while (j < sql.length && sql[j] !== quote) {
        if (sql[j] === "\\") j++;
        j++;
      }
      tokens.push(sql.slice(i, j + 1));
      i = j + 1;
    }
    // Comments
    else if (sql.slice(i, i + 2) === "--") {
      let j = i;
      while (j < sql.length && sql[j] !== "\n") j++;
      tokens.push(sql.slice(i, j));
      i = j;
    }
    // Punctuation
    else if ("(),;".includes(sql[i])) {
      tokens.push(sql[i]);
      i++;
    }
    // Whitespace
    else if (/\s/.test(sql[i])) {
      tokens.push(" ");
      while (i < sql.length && /\s/.test(sql[i])) i++;
    }
    // Words / numbers
    else {
      let j = i;
      while (j < sql.length && !/[\s(),;'"` ]/.test(sql[j])) j++;
      tokens.push(sql.slice(i, j));
      i = j;
    }
  }

  const clean = tokens.filter((t) => t !== " " || true);
  const words: string[] = [];
  for (const t of clean) {
    if (t === " ") {
      if (words.length && words[words.length - 1] !== " ") words.push(" ");
    } else {
      words.push(t);
    }
  }

  const newlineBeforeKeywords = new Set(["SELECT","FROM","WHERE","JOIN","LEFT","RIGHT","INNER","OUTER","FULL","CROSS","ON","AND","OR","ORDER","GROUP","HAVING","LIMIT","OFFSET","UNION","SET","VALUES","RETURNING"]);

  result = "";
  let prev = "";
  for (let k = 0; k < words.length; k++) {
    const w = words[k];
    const upper = w.toUpperCase();

    if (w === "(") {
      result += "(";
      depth++;
      prev = w;
    } else if (w === ")") {
      depth = Math.max(0, depth - 1);
      result += ")";
      prev = w;
    } else if (w === ",") {
      result += ",\n" + indent.repeat(depth);
      prev = w;
    } else if (w === ";") {
      result += ";\n";
      prev = w;
    } else if (w === " ") {
      // skip raw spaces, we handle manually
    } else if (KEYWORDS.has(upper) && newlineBeforeKeywords.has(upper)) {
      result += "\n" + indent.repeat(depth) + upper + " ";
      prev = upper;
    } else if (KEYWORDS.has(upper)) {
      result += (prev && prev !== "(" && prev !== "\n" ? " " : "") + upper + " ";
      prev = upper;
    } else {
      result += (prev === "(" || prev === "," || result.endsWith(" ") ? "" : " ") + w;
      prev = w;
    }
  }

  return result.trim();
}

function minifySQL(sql: string): string {
  return sql.replace(/\s+/g, " ").trim();
}

export default function SqlFormatterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  function format() {
    setOutput(formatSQL(input));
  }

  function minify() {
    setOutput(minifySQL(input));
  }

  return (
    <ToolLayout
      tool={tool}
      faqs={faqs}
      howToUse="Paste your SQL query into the input field and click Format to beautify it with proper indentation and line breaks. Click Minify to remove all extra whitespace. The formatter handles SELECT, INSERT, UPDATE, DELETE, CREATE, and JOIN statements."
      useCases={[
        "Making complex queries readable for code review",
        "Formatting SQL before adding to documentation",
        "Debugging queries from ORMs by making them readable",
        "Minifying SQL for use in configuration files",
      ]}
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">SQL Query</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="SELECT u.id, u.name, COUNT(o.id) as order_count FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.active = 1 GROUP BY u.id ORDER BY order_count DESC LIMIT 10;"
            rows={10}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-mono text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
          />
        </div>

        <div className="flex gap-3">
          <button onClick={format} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
            Format
          </button>
          <button onClick={minify} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
            Minify
          </button>
        </div>

        {output && (
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Output</label>
              <CopyButton text={output} />
            </div>
            <pre className="max-h-96 overflow-auto rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 font-mono text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
              {output}
            </pre>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
