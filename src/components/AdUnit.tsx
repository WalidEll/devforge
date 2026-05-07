"use client";

import { useEffect, useRef } from "react";

const ADSENSE_SLOT_IDS = {
  TOP_LEADERBOARD: process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP_LEADERBOARD,
  BELOW_TOOL: process.env.NEXT_PUBLIC_ADSENSE_SLOT_BELOW_TOOL,
  SIDEBAR_RECT: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR_RECT,
} as const;

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

function resolveAdSlot(slot: string) {
  if (/^\d+$/.test(slot)) {
    return slot;
  }

  return ADSENSE_SLOT_IDS[slot as keyof typeof ADSENSE_SLOT_IDS];
}

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
      // AdSense not loaded yet or ad blocker active
    }
  }, []);

  if (!adSlot) {
    return null;
  }

  return (
    <div className={`ad-container my-4 text-center ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-2011454284047011"
        data-ad-slot={adSlot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
