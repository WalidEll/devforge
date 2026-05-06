"use client";

import { useEffect, useState } from "react";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("unix-timestamp-converter")!;

const faqs = [
  {
    question: "What is a Unix timestamp?",
    answer:
      "A Unix timestamp (also called Epoch time) is the number of seconds that have elapsed since January 1, 1970, at 00:00:00 UTC. It is widely used in programming to represent dates and times as a single number.",
  },
  {
    question: "Do Unix timestamps account for time zones?",
    answer:
      "Unix timestamps are always in UTC. To display a timestamp in a specific timezone, you convert the UTC time to the desired timezone when formatting for display.",
  },
  {
    question: "What is the Year 2038 problem?",
    answer:
      "Systems using a 32-bit signed integer to store Unix timestamps will overflow on January 19, 2038. Modern systems use 64-bit integers, which extends the range far beyond any practical concern.",
  },
];

export default function UnixTimestampPage() {
  const [timestamp, setTimestamp] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const updateNow = () => setNow(Math.floor(Date.now() / 1000));
    const frame = window.requestAnimationFrame(updateNow);
    const interval = window.setInterval(updateNow, 1000);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearInterval(interval);
    };
  }, []);

  function fromTimestamp() {
    const ts = parseInt(timestamp);
    if (isNaN(ts)) return;
    const ms = ts > 1e12 ? ts : ts * 1000;
    const d = new Date(ms);
    setDateStr(d.toISOString().slice(0, 19));
  }

  function fromDate() {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return;
    setTimestamp(Math.floor(d.getTime() / 1000).toString());
  }

  function setNowTimestamp() {
    const ts = Math.floor(Date.now() / 1000);
    setTimestamp(ts.toString());
    setDateStr(new Date(ts * 1000).toISOString().slice(0, 19));
  }

  const parsed = parseInt(timestamp);
  const parsedDate = !isNaN(parsed)
    ? new Date((parsed > 1e12 ? parsed : parsed * 1000))
    : null;

  const relative = parsedDate
    ? (() => {
        if (now === null) return null;
        const diff = parsedDate.getTime() / 1000 - now;
        const abs = Math.abs(diff);
        const suffix = diff < 0 ? "ago" : "from now";
        if (abs < 60) return `${Math.round(abs)} seconds ${suffix}`;
        if (abs < 3600) return `${Math.round(abs / 60)} minutes ${suffix}`;
        if (abs < 86400) return `${Math.round(abs / 3600)} hours ${suffix}`;
        return `${Math.round(abs / 86400)} days ${suffix}`;
      })()
    : null;

  return (
    <ToolLayout
      tool={tool}
      faqs={faqs}
      howToUse="Enter a Unix timestamp to convert it to a human-readable date, or enter a date to get its Unix timestamp. The tool auto-detects whether the input is in seconds or milliseconds. Click 'Now' to instantly fill in the current timestamp."
      useCases={[
        "Converting timestamps in API responses to readable dates",
        "Generating timestamps for database queries and migrations",
        "Debugging date-related issues in log files",
        "Calculating time differences between events",
      ]}
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-950">
          <div className="text-sm text-blue-600 dark:text-blue-400">Current Unix Timestamp</div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-2xl font-bold text-blue-800 dark:text-blue-300">
              {now ?? "Loading..."}
            </span>
            {now !== null && <CopyButton text={now.toString()} />}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Unix Timestamp</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                placeholder="1700000000"
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 font-mono text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              <button onClick={fromTimestamp} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">→</button>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Date & Time (UTC)</label>
            <div className="flex gap-2">
              <input
                type="datetime-local"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              <button onClick={fromDate} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">←</button>
            </div>
          </div>
        </div>

        <button
          onClick={setNowTimestamp}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Use Current Time
        </button>

        {parsedDate && (
          <div className="rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <span className="font-medium text-gray-500 dark:text-gray-400">UTC:</span>{" "}
                <span className="text-gray-900 dark:text-white">{parsedDate.toUTCString()}</span>
              </div>
              <div>
                <span className="font-medium text-gray-500 dark:text-gray-400">Local:</span>{" "}
                <span className="text-gray-900 dark:text-white">{parsedDate.toLocaleString()}</span>
              </div>
              <div>
                <span className="font-medium text-gray-500 dark:text-gray-400">ISO 8601:</span>{" "}
                <span className="font-mono text-gray-900 dark:text-white">{parsedDate.toISOString()}</span>
              </div>
              {relative && (
                <div>
                  <span className="font-medium text-gray-500 dark:text-gray-400">Relative:</span>{" "}
                  <span className="text-gray-900 dark:text-white">{relative}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
