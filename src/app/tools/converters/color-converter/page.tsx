"use client";

import { useState } from "react";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("color-converter")!;

const faqs = [
  {
    question: "What is the difference between HEX, RGB, and HSL?",
    answer:
      "HEX is a hexadecimal representation (#FF5733). RGB defines colors by Red, Green, Blue components (0-255). HSL uses Hue (0-360), Saturation (0-100%), and Lightness (0-100%), which is more intuitive for color manipulation.",
  },
  {
    question: "When should I use HSL over RGB?",
    answer:
      "HSL is easier for making color adjustments — changing lightness to create tints/shades, adjusting saturation for vibrancy, or rotating hue for complementary colors. RGB is more common in code and design tools.",
  },
  {
    question: "What does the # in hex colors mean?",
    answer:
      "The # prefix is a convention to indicate that the following digits are a hexadecimal color value. Most systems support both 3-digit (#F00) and 6-digit (#FF0000) hex notation.",
  },
];

function hexToRgb(hex: string): [number, number, number] | null {
  const h = hex.replace("#", "");
  const expanded = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  if (expanded.length !== 6) return null;
  const n = parseInt(expanded, 16);
  if (isNaN(n)) return null;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0")).join("");
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360; s /= 100; l /= 100;
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [Math.round(hue2rgb(p, q, h + 1 / 3) * 255), Math.round(hue2rgb(p, q, h) * 255), Math.round(hue2rgb(p, q, h - 1 / 3) * 255)];
}

export default function ColorConverterPage() {
  const [hex, setHex] = useState("#3B82F6");
  const [r, setR] = useState(59);
  const [g, setG] = useState(130);
  const [b, setB] = useState(246);
  const [h, setH] = useState(217);
  const [s, setS] = useState(91);
  const [l, setL] = useState(60);

  function updateFromHex(val: string) {
    setHex(val);
    const rgb = hexToRgb(val);
    if (rgb) {
      setR(rgb[0]); setG(rgb[1]); setB(rgb[2]);
      const [hh, ss, ll] = rgbToHsl(rgb[0], rgb[1], rgb[2]);
      setH(hh); setS(ss); setL(ll);
    }
  }

  function updateFromRgb(nr: number, ng: number, nb: number) {
    setR(nr); setG(ng); setB(nb);
    setHex(rgbToHex(nr, ng, nb));
    const [hh, ss, ll] = rgbToHsl(nr, ng, nb);
    setH(hh); setS(ss); setL(ll);
  }

  function updateFromHsl(nh: number, ns: number, nl: number) {
    setH(nh); setS(ns); setL(nl);
    const [nr, ng, nb] = hslToRgb(nh, ns, nl);
    setR(nr); setG(ng); setB(nb);
    setHex(rgbToHex(nr, ng, nb));
  }

  const hexStr = hex.startsWith("#") ? hex : `#${hex}`;
  const rgbStr = `rgb(${r}, ${g}, ${b})`;
  const hslStr = `hsl(${h}, ${s}%, ${l}%)`;

  return (
    <ToolLayout
      tool={tool}
      faqs={faqs}
      howToUse="Enter a color in any format — HEX, RGB, or HSL — and the other formats are calculated instantly. Use the color picker or sliders to adjust values visually. Click copy on any format to use it in your code."
      useCases={[
        "Converting design tool colors (HEX) to CSS values (RGB/HSL)",
        "Adjusting color lightness and saturation for UI themes",
        "Creating consistent color palettes across different formats",
        "Debugging CSS color values in web applications",
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div
            className="h-24 w-24 rounded-xl border border-gray-300 shadow-inner dark:border-gray-600"
            style={{ backgroundColor: hexStr }}
          />
          <input
            type="color"
            value={hexStr}
            onChange={(e) => updateFromHex(e.target.value)}
            className="h-12 w-12 cursor-pointer rounded border-0"
          />
        </div>

        <div className="space-y-4">
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">HEX</label>
              <CopyButton text={hexStr} />
            </div>
            <input
              type="text"
              value={hex}
              onChange={(e) => updateFromHex(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 font-mono text-sm text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">RGB</label>
              <CopyButton text={rgbStr} />
            </div>
            <div className="flex gap-2">
              {[
                { label: "R", value: r, set: (v: number) => updateFromRgb(v, g, b) },
                { label: "G", value: g, set: (v: number) => updateFromRgb(r, v, b) },
                { label: "B", value: b, set: (v: number) => updateFromRgb(r, g, v) },
              ].map(({ label, value, set }) => (
                <div key={label} className="flex-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
                  <input
                    type="number"
                    min={0}
                    max={255}
                    value={value}
                    onChange={(e) => set(Math.min(255, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">HSL</label>
              <CopyButton text={hslStr} />
            </div>
            <div className="flex gap-2">
              {[
                { label: "H", value: h, max: 360, set: (v: number) => updateFromHsl(v, s, l) },
                { label: "S%", value: s, max: 100, set: (v: number) => updateFromHsl(h, v, l) },
                { label: "L%", value: l, max: 100, set: (v: number) => updateFromHsl(h, s, v) },
              ].map(({ label, value, max, set }) => (
                <div key={label} className="flex-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
                  <input
                    type="number"
                    min={0}
                    max={max}
                    value={value}
                    onChange={(e) => set(Math.min(max, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
