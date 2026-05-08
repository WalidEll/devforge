"use client";

import { useEffect, useRef } from "react";

const CLIENT = "ca-pub-2011454284047011";

// Each named position first checks its own slot var, then falls back to the
// single NEXT_PUBLIC_ADSENSE_SLOT — so you only need ONE ad unit to get started.
const DEFAULT_SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT ?? "1716663113";

const NAMED_SLOTS: Record<string, string | undefined> = {
  TOP_LEADERBOARD:
    process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP_LEADERBOARD ?? DEFAULT_SLOT,
  BELOW_TOOL:
    process.env.NEXT_PUBLIC_ADSENSE_SLOT_BELOW_TOOL ?? DEFAULT_SLOT,
  SIDEBAR_RECT:
    process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR_RECT ?? DEFAULT_SLOT,
};

interface AdUnitProps {
  slot: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

function resolveAdSlot(slot: string): string | undefined {
  if (/^\d+$/.test(slot)) return slot; // already a numeric slot ID
  return NAMED_SLOTS[slot as keyof typeof NAMED_SLOTS];
}

const IS_DEV = process.env.NODE_ENV === "development";

const PLACEHOLDER_HEIGHT: Record<string, number> = {
  horizontal: 90,
  rectangle: 250,
  vertical: 280,
  auto: 120,
};

export default function AdUnit({ slot, format = "auto", className = "" }: AdUnitProps) {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);
  const adSlot = resolveAdSlot(slot);

  useEffect(() => {
    if (!adSlot) return;
    if (pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense not loaded yet or blocked by an ad blocker
    }
  }, [adSlot]);

  if (!adSlot) {
    if (!IS_DEV) return null;
    // Dev-only placeholder so ad positions are visible during local development
    return (
      <div
        className={`ad-container my-4 flex items-center justify-center rounded border border-dashed border-gray-300 bg-gray-50 text-xs text-gray-400 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-600 ${className}`}
        style={{ minHeight: PLACEHOLDER_HEIGHT[format] ?? 120 }}
        title="Set NEXT_PUBLIC_ADSENSE_SLOT in .env.local to see real ads"
      >
        AdSense · {slot} · {format}
      </div>
    );
  }

  return (
    <div className={`ad-container my-4 text-center ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={CLIENT}
        data-ad-slot={adSlot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
