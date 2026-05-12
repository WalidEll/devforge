"use client";

import { Download, FileCode2, FileJson2, FileText, ImageDown, Play, ShieldCheck, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SAMPLE_ARCHITECTURES } from "@/domain/models/sampleArchitectures";

interface PlannerToolbarProps {
  activeSampleName: string;
  onLoadSample: (name: string) => void;
  onRunValidation: () => void;
  onRunSimulation: () => void;
  onImportClick: () => void;
  onExportJson: () => void;
  onExportTerraform: () => void;
  onExportGcloud: () => void;
  onExportMarkdown: () => void;
  onExportPng: () => void;
  onExportSvg: () => void;
}

export function PlannerToolbar(props: PlannerToolbarProps) {
  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={props.onRunValidation}>
            <ShieldCheck className="h-4 w-4" />
            Run Validation
          </Button>
          <Button onClick={props.onRunSimulation}>
            <Play className="h-4 w-4" />
            Simulate Traffic
          </Button>
          <Button variant="outline" onClick={props.onImportClick}>
            <Upload className="h-4 w-4" />
            Import JSON
          </Button>
          <Button variant="outline" onClick={props.onExportJson}>
            <FileJson2 className="h-4 w-4" />
            Export JSON
          </Button>
          <Button variant="outline" onClick={props.onExportTerraform}>
            <FileCode2 className="h-4 w-4" />
            Terraform
          </Button>
          <Button variant="outline" onClick={props.onExportGcloud}>
            <Download className="h-4 w-4" />
            gcloud
          </Button>
          <Button variant="outline" onClick={props.onExportMarkdown}>
            <FileText className="h-4 w-4" />
            Markdown
          </Button>
          <Button variant="outline" onClick={props.onExportPng}>
            <ImageDown className="h-4 w-4" />
            PNG
          </Button>
          <Button variant="outline" onClick={props.onExportSvg}>
            <ImageDown className="h-4 w-4" />
            SVG
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Sample architecture
          </label>
          <select
            value={props.activeSampleName}
            onChange={(event) => props.onLoadSample(event.target.value)}
            className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
          >
            {SAMPLE_ARCHITECTURES.map((sample) => (
              <option key={sample.name} value={sample.name}>
                {sample.name}
              </option>
            ))}
          </select>
        </div>
      </CardContent>
    </Card>
  );
}
