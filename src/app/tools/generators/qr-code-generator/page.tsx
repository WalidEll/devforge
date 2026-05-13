"use client";

import { useState, useRef, useEffect } from "react";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/ToolLayout";

const tool = getToolBySlug("qr-code-generator")!;

const faqs = [
  {
    question: "What can I encode in a QR code?",
    answer:
      "Any text including URLs, plain text, email addresses (mailto:), phone numbers (tel:), Wi-Fi credentials, and vCard contact information.",
  },
  {
    question: "What is error correction level?",
    answer:
      "Error correction allows the QR code to be read even if part of it is damaged or obscured. L = 7%, M = 15%, Q = 25%, H = 30% of the code can be restored. Higher levels make the QR code denser.",
  },
  {
    question: "Is my data sent to a server?",
    answer: "No. QR codes are generated entirely in your browser using the qrcode library. Your data never leaves your machine.",
  },
];

type ErrorLevel = "L" | "M" | "Q" | "H";

export default function QrCodeGeneratorPage() {
  const [text, setText] = useState("");
  const [errorLevel, setErrorLevel] = useState<ErrorLevel>("M");
  const [size, setSize] = useState(256);
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  async function generate() {
    if (!text.trim()) return;
    setError("");
    try {
      const QRCode = (await import("qrcode")).default;
      await QRCode.toCanvas(canvasRef.current!, text, {
        errorCorrectionLevel: errorLevel,
        width: size,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate QR code");
    }
  }

  useEffect(() => {
    if (text) generate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, errorLevel, size]);

  function downloadPng() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <ToolLayout
      tool={tool}
      faqs={faqs}
      howToUse="Type or paste your text or URL into the input field. The QR code updates automatically. Adjust size and error correction level as needed, then download the result as a PNG."
      useCases={[
        "Generate QR codes for URLs to share on printed materials",
        "Create Wi-Fi QR codes for easy network sharing",
        "Encode contact information as a QR code for business cards",
      ]}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Text or URL</label>
          <textarea
            className="w-full h-24 font-mono text-sm p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Error correction</label>
            <select
              value={errorLevel}
              onChange={(e) => setErrorLevel(e.target.value as ErrorLevel)}
              className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="L">L — Low (7%)</option>
              <option value="M">M — Medium (15%)</option>
              <option value="Q">Q — Quartile (25%)</option>
              <option value="H">H — High (30%)</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Size</label>
            <select
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value={128}>128 px</option>
              <option value={256}>256 px</option>
              <option value={512}>512 px</option>
            </select>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex flex-col items-start gap-3">
          <canvas
            ref={canvasRef}
            className={`rounded-lg border border-gray-200 dark:border-gray-700 bg-white ${!text ? "opacity-0" : ""}`}
          />
          {text && (
            <button
              onClick={downloadPng}
              className="px-5 py-2 bg-gray-700 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors text-sm"
            >
              Download PNG
            </button>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
