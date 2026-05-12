"use client";

import { useEffect, useId, useRef, useState } from "react";

interface MermaidDiagramProps {
  chart: string;
}

let mermaidPromise: Promise<typeof import("mermaid").default> | null = null;

function getMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import("mermaid").then((module) => {
      const mermaid = module.default;

      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: "neutral",
        fontFamily: "inherit",
        flowchart: {
          useMaxWidth: true,
        },
      });

      return mermaid;
    });
  }

  return mermaidPromise;
}

export default function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const chartId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;

    if (!container) return;

    const target = container;

    async function renderDiagram() {
      try {
        const mermaid = await getMermaid();
        const { svg, bindFunctions } = await mermaid.render(`mermaid-${chartId}`, chart);

        if (cancelled) return;

        target.innerHTML = svg;
        bindFunctions?.(target);
        setError(null);
      } catch (err) {
        if (cancelled) return;

        target.innerHTML = "";
        setError(err instanceof Error ? err.message : "Unable to render Mermaid diagram.");
      }
    }

    target.innerHTML = "";

    void renderDiagram();

    return () => {
      cancelled = true;
      target.innerHTML = "";
    };
  }, [chart, chartId]);

  if (error) {
    return (
      <pre className="mt-4 overflow-x-auto rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
        <code>{chart}</code>
      </pre>
    );
  }

  return (
    <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-white">
      <div
        ref={containerRef}
        aria-label="Mermaid diagram"
        className="[&_svg]:h-auto [&_svg]:max-w-full"
      />
    </div>
  );
}
