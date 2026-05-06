"use client";

import { useState } from "react";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("yaml-to-json")!;

const faqs = [
  {
    question: "What is YAML?",
    answer:
      "YAML (YAML Ain't Markup Language) is a human-friendly data serialization format. It uses indentation and minimal syntax to represent structured data, making it popular for configuration files like docker-compose.yml, GitHub Actions, and Kubernetes manifests.",
  },
  {
    question: "When should I use YAML vs JSON?",
    answer:
      "YAML is preferred for configuration files where humans write and read the data (it supports comments and is less verbose). JSON is preferred for API payloads and data interchange where machine processing is the priority.",
  },
  {
    question: "Can YAML represent everything JSON can?",
    answer:
      "Yes. YAML is a superset of JSON — all valid JSON is also valid YAML. YAML adds features like comments, multi-line strings, and anchors that JSON doesn't support.",
  },
];

// Minimal YAML to JSON parser supporting common cases
function parseYaml(yaml: string): unknown {
  const lines = yaml.split("\n");

  function parseValue(val: string): unknown {
    const v = val.trim();
    if (v === "true" || v === "yes") return true;
    if (v === "false" || v === "no") return false;
    if (v === "null" || v === "~" || v === "") return null;
    if (/^-?\d+$/.test(v)) return parseInt(v, 10);
    if (/^-?\d+\.\d+$/.test(v)) return parseFloat(v);
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      return v.slice(1, -1);
    }
    if (v.startsWith("[")) {
      try { return JSON.parse(v); } catch { return v; }
    }
    return v;
  }

  function getIndent(line: string) {
    return line.match(/^(\s*)/)?.[1].length ?? 0;
  }

  function parseBlock(startLine: number, baseIndent: number): [unknown, number] {
    const firstLine = lines[startLine];
    const indent = getIndent(firstLine);

    // Check if it's a mapping
    if (firstLine.trim().match(/^[^-:][^:]*:/)) {
      const obj: Record<string, unknown> = {};
      let i = startLine;
      while (i < lines.length) {
        const line = lines[i];
        if (line.trim() === "" || line.trim().startsWith("#")) { i++; continue; }
        const lineIndent = getIndent(line);
        if (lineIndent < indent && i !== startLine) break;

        const match = line.match(/^(\s*)([^:]+):\s*(.*)?$/);
        if (!match) { i++; continue; }

        const [, , key, rest] = match;
        if (rest && rest.trim() !== "") {
          obj[key.trim()] = parseValue(rest.trim());
          i++;
        } else {
          // Multi-line value
          i++;
          if (i < lines.length && getIndent(lines[i]) > lineIndent) {
            const [val, nextI] = parseBlock(i, lineIndent);
            obj[key.trim()] = val;
            i = nextI;
          } else {
            obj[key.trim()] = null;
          }
        }
      }
      return [obj, i];
    }

    // Check if it's a sequence
    if (firstLine.trim().startsWith("- ")) {
      const arr: unknown[] = [];
      let i = startLine;
      while (i < lines.length) {
        const line = lines[i];
        if (line.trim() === "" || line.trim().startsWith("#")) { i++; continue; }
        const lineIndent = getIndent(line);
        if (lineIndent < indent && i !== startLine) break;

        const match = line.match(/^(\s*)-\s*(.*)?$/);
        if (!match) { i++; continue; }

        const [, , rest] = match;
        if (rest && rest.trim() !== "") {
          arr.push(parseValue(rest.trim()));
          i++;
        } else {
          i++;
          if (i < lines.length && getIndent(lines[i]) > lineIndent) {
            const [val, nextI] = parseBlock(i, lineIndent);
            arr.push(val);
            i = nextI;
          } else {
            arr.push(null);
          }
        }
      }
      return [arr, i];
    }

    return [parseValue(firstLine.trim()), startLine + 1];
  }

  const nonEmpty = lines.findIndex((l) => l.trim() !== "" && !l.trim().startsWith("#"));
  if (nonEmpty === -1) return null;
  const [result] = parseBlock(nonEmpty, 0);
  return result;
}

export default function YamlToJsonPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"yaml-to-json" | "json-to-yaml">("yaml-to-json");

  function convert() {
    try {
      if (mode === "yaml-to-json") {
        const parsed = parseYaml(input);
        setOutput(JSON.stringify(parsed, null, 2));
      } else {
        const parsed = JSON.parse(input);
        // Simple JSON to YAML
        function toYaml(obj: unknown, depth = 0): string {
          const pad = "  ".repeat(depth);
          if (obj === null) return "null";
          if (typeof obj === "boolean" || typeof obj === "number") return String(obj);
          if (typeof obj === "string") {
            if (obj.includes("\n") || obj.includes(":") || obj.includes("#")) return `"${obj.replace(/"/g, '\\"')}"`;
            return obj;
          }
          if (Array.isArray(obj)) {
            if (obj.length === 0) return "[]";
            return obj.map((v) => `${pad}- ${toYaml(v, depth + 1)}`).join("\n");
          }
          if (typeof obj === "object") {
            const entries = Object.entries(obj as Record<string, unknown>);
            if (entries.length === 0) return "{}";
            return entries
              .map(([k, v]) => {
                if (typeof v === "object" && v !== null) {
                  return `${pad}${k}:\n${toYaml(v, depth + 1)}`;
                }
                return `${pad}${k}: ${toYaml(v, depth)}`;
              })
              .join("\n");
          }
          return String(obj);
        }
        setOutput(toYaml(parsed));
      }
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed");
      setOutput("");
    }
  }

  return (
    <ToolLayout
      tool={tool}
      faqs={faqs}
      howToUse="Paste YAML or JSON into the input field, select the conversion direction, and click Convert. The tool converts YAML to JSON or JSON to YAML while preserving all data types including strings, numbers, booleans, arrays, and nested objects."
      useCases={[
        "Converting Kubernetes manifests from YAML to JSON for API calls",
        "Transforming docker-compose files for documentation",
        "Converting GitHub Actions workflow configs for analysis",
        "Migrating config files between YAML and JSON formats",
      ]}
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => setMode("yaml-to-json")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${mode === "yaml-to-json" ? "bg-blue-600 text-white" : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"}`}
          >
            YAML → JSON
          </button>
          <button
            onClick={() => setMode("json-to-yaml")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${mode === "json-to-yaml" ? "bg-blue-600 text-white" : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"}`}
          >
            JSON → YAML
          </button>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {mode === "yaml-to-json" ? "YAML Input" : "JSON Input"}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "yaml-to-json" ? "name: John\nage: 30\nhobbies:\n  - coding\n  - reading" : '{\n  "name": "John",\n  "age": 30\n}'}
            rows={10}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-mono text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
          />
        </div>

        <button onClick={convert} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
          Convert
        </button>

        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">{error}</div>
        )}

        {output && (
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {mode === "yaml-to-json" ? "JSON Output" : "YAML Output"}
              </label>
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
