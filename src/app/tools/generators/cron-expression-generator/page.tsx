"use client";

import { useState, useMemo } from "react";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("cron-expression-generator")!;

const faqs = [
  {
    question: "What is a cron expression?",
    answer:
      "A cron expression is a string of five (or six) fields separated by spaces that represents a schedule. The fields are: minute, hour, day of month, month, and day of week.",
  },
  {
    question: "What does * mean in a cron expression?",
    answer:
      "The asterisk (*) means 'every' or 'any value'. For example, * in the minute field means 'every minute', and * in the month field means 'every month'.",
  },
  {
    question: "How do I schedule a job to run every 5 minutes?",
    answer:
      "Use */5 in the minute field: '*/5 * * * *'. This means 'every 5th minute of every hour of every day'.",
  },
];

const presets = [
  { label: "Every minute", cron: "* * * * *" },
  { label: "Every 5 minutes", cron: "*/5 * * * *" },
  { label: "Every 15 minutes", cron: "*/15 * * * *" },
  { label: "Every hour", cron: "0 * * * *" },
  { label: "Every day at midnight", cron: "0 0 * * *" },
  { label: "Every day at noon", cron: "0 12 * * *" },
  { label: "Every Monday at 9am", cron: "0 9 * * 1" },
  { label: "Every weekday at 9am", cron: "0 9 * * 1-5" },
  { label: "First of every month", cron: "0 0 1 * *" },
  { label: "Every Sunday at 3am", cron: "0 3 * * 0" },
];

function describeCron(expr: string): string {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return "Invalid: need exactly 5 fields";

  const [min, hour, dom, month, dow] = parts;
  const pieces: string[] = [];

  if (min === "*" && hour === "*") pieces.push("Every minute");
  else if (min.startsWith("*/")) pieces.push(`Every ${min.slice(2)} minutes`);
  else if (hour === "*") pieces.push(`At minute ${min} of every hour`);
  else if (min === "0" && hour === "*") pieces.push("Every hour, on the hour");
  else if (min === "0") pieces.push(`At ${hour}:00`);
  else pieces.push(`At ${hour}:${min.padStart(2, "0")}`);

  if (dom !== "*" && month !== "*") pieces.push(`on day ${dom} of month ${month}`);
  else if (dom !== "*") pieces.push(`on day ${dom} of the month`);
  else if (month !== "*") pieces.push(`in month ${month}`);

  const dowNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  if (dow !== "*") {
    if (dow === "1-5") pieces.push("on weekdays");
    else if (dow === "0,6") pieces.push("on weekends");
    else {
      const days = dow.split(",").map((d) => dowNames[parseInt(d)] || d);
      pieces.push(`on ${days.join(", ")}`);
    }
  }

  return pieces.join(" ");
}

function getNextRuns(expr: string, count: number = 5): string[] {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return [];

  const runs: string[] = [];
  const now = new Date();
  const check = new Date(now);
  check.setSeconds(0, 0);
  check.setMinutes(check.getMinutes() + 1);

  const matchField = (field: string, value: number): boolean => {
    if (field === "*") return true;
    if (field.startsWith("*/")) return value % parseInt(field.slice(2)) === 0;
    if (field.includes(",")) return field.split(",").map(Number).includes(value);
    if (field.includes("-")) {
      const [a, b] = field.split("-").map(Number);
      return value >= a && value <= b;
    }
    return parseInt(field) === value;
  };

  for (let i = 0; i < 525960 && runs.length < count; i++) {
    const min = check.getMinutes();
    const hour = check.getHours();
    const dom = check.getDate();
    const month = check.getMonth() + 1;
    const dow = check.getDay();

    if (
      matchField(parts[0], min) &&
      matchField(parts[1], hour) &&
      matchField(parts[2], dom) &&
      matchField(parts[3], month) &&
      matchField(parts[4], dow)
    ) {
      runs.push(check.toLocaleString());
    }
    check.setMinutes(check.getMinutes() + 1);
  }

  return runs;
}

export default function CronPage() {
  const [expression, setExpression] = useState("0 9 * * 1-5");

  const description = useMemo(() => describeCron(expression), [expression]);
  const nextRuns = useMemo(() => getNextRuns(expression), [expression]);

  return (
    <ToolLayout
      tool={tool}
      faqs={faqs}
      howToUse="Type a cron expression directly or choose from common presets. The tool shows a human-readable description and the next 5 scheduled execution times. Each field accepts standard cron syntax: numbers, ranges (1-5), lists (1,3,5), steps (*/5), and wildcards (*)."
      useCases={[
        "Building cron schedules for CI/CD pipelines",
        "Setting up scheduled tasks in Kubernetes CronJobs",
        "Configuring backup schedules for databases",
        "Testing cron expressions before deploying to production",
      ]}
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Cron Expression
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              placeholder="* * * * *"
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 font-mono text-lg text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
            />
            <CopyButton text={expression} />
          </div>
          <div className="mt-2 flex gap-8 text-center text-xs text-gray-500 dark:text-gray-500 font-mono">
            <span className="flex-1">minute</span>
            <span className="flex-1">hour</span>
            <span className="flex-1">day (month)</span>
            <span className="flex-1">month</span>
            <span className="flex-1">day (week)</span>
          </div>
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
          {description}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Common Presets</label>
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p.cron}
                onClick={() => setExpression(p.cron)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  expression === p.cron
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-600 dark:bg-blue-950 dark:text-blue-400"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {nextRuns.length > 0 && (
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Next 5 Runs</label>
            <div className="rounded-lg border border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
              {nextRuns.map((run, i) => (
                <div
                  key={i}
                  className={`px-4 py-2 text-sm font-mono text-gray-700 dark:text-gray-300 ${
                    i > 0 ? "border-t border-gray-200 dark:border-gray-700" : ""
                  }`}
                >
                  {run}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
