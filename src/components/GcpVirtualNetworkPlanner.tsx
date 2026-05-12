"use client";

import { useRef, useState } from "react";
import { toPng, toSvg } from "html-to-image";
import { AlertTriangle } from "lucide-react";
import { ComponentPalette } from "@/components/palette/ComponentPalette";
import { GcpPlannerCanvas } from "@/components/canvas/GcpPlannerCanvas";
import { PropertiesEditor } from "@/components/properties/PropertiesEditor";
import { PlannerToolbar } from "@/components/toolbar/PlannerToolbar";
import { ValidationPanel } from "@/components/validation/ValidationPanel";
import { downloadTextFile, readFileAsText } from "@/utils/download";
import { useNetworkPlannerStore } from "@/store/useNetworkPlannerStore";

export default function GcpVirtualNetworkPlanner() {
  const activeSampleName = useNetworkPlannerStore((state) => state.activeSampleName);
  const loadSample = useNetworkPlannerStore((state) => state.loadSample);
  const runValidation = useNetworkPlannerStore((state) => state.runValidation);
  const runSimulation = useNetworkPlannerStore((state) => state.runSimulation);
  const importArchitecture = useNetworkPlannerStore((state) => state.importArchitecture);
  const generateExport = useNetworkPlannerStore((state) => state.generateExport);
  const [activeBottomTab, setActiveBottomTab] = useState("validation");
  const [importError, setImportError] = useState<string | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const canvasExportRef = useRef<HTMLDivElement>(null);

  function downloadDataUrl(filename: string, dataUrl: string) {
    const anchor = document.createElement("a");
    anchor.href = dataUrl;
    anchor.download = filename;
    anchor.click();
  }

  async function exportCanvas(format: "png" | "svg") {
    if (!canvasExportRef.current) return;

    const dataUrl =
      format === "png"
        ? await toPng(canvasExportRef.current, { cacheBust: true, backgroundColor: "#ffffff" })
        : await toSvg(canvasExportRef.current, { cacheBust: true, backgroundColor: "#ffffff" });

    downloadDataUrl(`gcp-virtual-network-planner.${format}`, dataUrl);
  }

  function exportText(format: "json" | "terraform" | "gcloud" | "markdown") {
    const preview = generateExport(format);
    downloadTextFile(
      preview.filename,
      preview.content,
      format === "json" ? "application/json" : "text/plain"
    );
    setActiveBottomTab("exports");
  }

  async function onImportFile(file: File) {
    const contents = await readFileAsText(file);
    const result = importArchitecture(contents);
    if (!result.success) {
      setImportError(result.error ?? "Unable to import architecture JSON.");
      return;
    }

    setImportError(null);
    setActiveBottomTab("validation");
  }

  return (
    <div className="space-y-6">
      <PlannerToolbar
        activeSampleName={activeSampleName}
        onLoadSample={loadSample}
        onRunValidation={() => {
          runValidation();
          setActiveBottomTab("validation");
        }}
        onRunSimulation={() => {
          runSimulation();
          setActiveBottomTab("simulation");
        }}
        onImportClick={() => importInputRef.current?.click()}
        onExportJson={() => exportText("json")}
        onExportTerraform={() => exportText("terraform")}
        onExportGcloud={() => exportText("gcloud")}
        onExportMarkdown={() => exportText("markdown")}
        onExportPng={() => void exportCanvas("png")}
        onExportSvg={() => void exportCanvas("svg")}
      />

      <input
        ref={importInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          await onImportFile(file);
          event.target.value = "";
        }}
      />

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <div className="font-semibold">Educational simulation, not authoritative verification</div>
            <p className="mt-1">
              This planner approximates GCP routing, firewall, and NAT behavior to support learning and
              early design reviews. It is not a replacement for Google Cloud Network Intelligence Center,
              live policy testing, or production validation.
            </p>
          </div>
        </div>
      </div>

      {importError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
          {importError}
        </div>
      ) : null}

      <div className="grid gap-4 2xl:grid-cols-[280px_minmax(0,1fr)_340px] xl:grid-cols-[280px_minmax(0,1fr)]">
        <div className="min-h-[680px]">
          <ComponentPalette />
        </div>
        <div className="min-h-[680px]">
          <GcpPlannerCanvas exportRef={canvasExportRef} />
        </div>
        <div className="min-h-[680px] xl:col-span-2 2xl:col-span-1">
          <PropertiesEditor />
        </div>
      </div>

      <div className="min-h-[420px]">
        <ValidationPanel
          activeTab={activeBottomTab}
          onActiveTabChange={setActiveBottomTab}
          onRunSimulation={() => {
            runSimulation();
            setActiveBottomTab("simulation");
          }}
        />
      </div>
    </div>
  );
}
