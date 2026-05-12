"use client";

import type { DragEvent } from "react";
import { COMPONENT_CATALOG } from "@/domain/models/gcp-network";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const groupedCatalog = COMPONENT_CATALOG.reduce<Record<string, typeof COMPONENT_CATALOG>>((acc, item) => {
  acc[item.category] ??= [];
  acc[item.category].push(item);
  return acc;
}, {});

export function ComponentPalette() {
  function onDragStart(event: DragEvent<HTMLButtonElement>, kind: string) {
    event.dataTransfer.setData("application/devforge-gcp-kind", kind);
    event.dataTransfer.effectAllowed = "move";
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Component Palette</CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-72px)]">
        <ScrollArea className="h-full pr-3">
          <div className="space-y-5">
            {Object.entries(groupedCatalog).map(([category, entries]) => (
              <section key={category} className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {category}
                </h3>
                <div className="space-y-2">
                  {entries.map((entry) => (
                    <button
                      key={entry.kind}
                      draggable
                      onDragStart={(event) => onDragStart(event, entry.kind)}
                      className="flex w-full items-start justify-between rounded-lg border border-gray-200 bg-white px-3 py-3 text-left hover:border-blue-400 hover:bg-blue-50/40 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-blue-500 dark:hover:bg-blue-950/20"
                    >
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{entry.label}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{entry.description}</div>
                      </div>
                      <Badge variant={entry.mvpReady ? "success" : "secondary"}>
                        {entry.mvpReady ? "MVP" : "Preview"}
                      </Badge>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
