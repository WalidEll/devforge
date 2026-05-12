"use client";

import { create } from "zustand";
import { SAMPLE_ARCHITECTURES } from "@/domain/models/sampleArchitectures";
import { applyConnectionInference, createConnection, createDefaultComponent } from "@/domain/models/factories";
import type {
  GcpComponent,
  GcpComponentKind,
  NetworkArchitecture,
  NetworkConnection,
  SimulationRequest,
  SimulationResult,
  ValidationIssue,
} from "@/domain/models/gcp-network";
import { architectureSchema } from "@/domain/models/schemas";
import { serializeArchitectureJson } from "@/exporters/json/architectureJson";
import { generateTerraform } from "@/exporters/terraform/generateTerraform";
import { generateGcloudCommands } from "@/exporters/gcloud/generateGcloudCommands";
import { generateMarkdownDocumentation } from "@/exporters/markdown/generateMarkdown";
import { simulateTraffic } from "@/domain/simulation/simulateTraffic";
import { validateArchitecture } from "@/domain/validation/validateArchitecture";

type ExportFormat = "json" | "terraform" | "gcloud" | "markdown";

interface ExportPreview {
  format: ExportFormat;
  filename: string;
  content: string;
}

interface PlannerState {
  architecture: NetworkArchitecture;
  selectedComponentId: string | null;
  selectedConnectionId: string | null;
  validationIssues: ValidationIssue[];
  simulationRequest: SimulationRequest | null;
  simulationResult: SimulationResult | null;
  exportPreview: ExportPreview | null;
  activeSampleName: string;
  setArchitecture: (architecture: NetworkArchitecture) => void;
  loadSample: (name: string) => void;
  addComponent: (kind: GcpComponentKind, position: { x: number; y: number }) => void;
  updateComponent: (componentId: string, updater: (component: GcpComponent) => GcpComponent) => void;
  selectComponent: (componentId: string | null) => void;
  selectConnection: (connectionId: string | null) => void;
  clearSelection: () => void;
  setConnections: (connections: NetworkConnection[]) => void;
  upsertConnection: (sourceId: string, targetId: string) => void;
  updateConnection: (connectionId: string, updater: (connection: NetworkConnection) => NetworkConnection) => void;
  removeConnection: (connectionId: string) => void;
  removeSelected: () => void;
  setSimulationRequest: (request: SimulationRequest) => void;
  runValidation: () => ValidationIssue[];
  runSimulation: (request?: SimulationRequest) => SimulationResult | null;
  importArchitecture: (raw: string) => { success: boolean; error?: string };
  setExportPreview: (preview: ExportPreview | null) => void;
  generateExport: (format: ExportFormat) => ExportPreview;
}

function defaultSimulationRequest(architecture: NetworkArchitecture): SimulationRequest | null {
  const vm = architecture.components.find((component) => component.kind === "vmInstance");
  const internet = architecture.components.find((component) => component.kind === "internet");

  if (vm && internet) {
    return {
      sourceComponentId: vm.id,
      destinationComponentId: internet.id,
      protocol: "tcp",
      port: 443,
      direction: "egress",
    };
  }

  return null;
}

const initialArchitecture = SAMPLE_ARCHITECTURES[0];

export const useNetworkPlannerStore = create<PlannerState>()((set, get) => ({
  architecture: initialArchitecture,
  selectedComponentId: null,
  selectedConnectionId: null,
  validationIssues: validateArchitecture(initialArchitecture),
  simulationRequest: defaultSimulationRequest(initialArchitecture),
  simulationResult: null,
  exportPreview: null,
  activeSampleName: initialArchitecture.name,
  setArchitecture: (architecture) =>
    set({
      architecture,
      validationIssues: validateArchitecture(architecture),
      simulationRequest: defaultSimulationRequest(architecture),
      simulationResult: null,
      selectedComponentId: null,
      selectedConnectionId: null,
    }),
  loadSample: (name) => {
    const sample = SAMPLE_ARCHITECTURES.find((entry) => entry.name === name) ?? SAMPLE_ARCHITECTURES[0];
    set({
      architecture: sample,
      validationIssues: validateArchitecture(sample),
      simulationRequest: defaultSimulationRequest(sample),
      simulationResult: null,
      selectedComponentId: null,
      selectedConnectionId: null,
      activeSampleName: sample.name,
      exportPreview: null,
    });
  },
  addComponent: (kind, position) =>
    set((state) => {
      const component = createDefaultComponent(kind, position);
      const architecture = {
        ...state.architecture,
        components: [...state.architecture.components, component],
      };

      return {
        architecture,
        selectedComponentId: component.id,
        selectedConnectionId: null,
        validationIssues: validateArchitecture(architecture),
      };
    }),
  updateComponent: (componentId, updater) =>
    set((state) => {
      const architecture = {
        ...state.architecture,
        components: state.architecture.components.map((component) =>
          component.id === componentId ? updater(component) : component
        ),
      };

      return {
        architecture,
        validationIssues: validateArchitecture(architecture),
      };
    }),
  selectComponent: (componentId) => set({ selectedComponentId: componentId, selectedConnectionId: null }),
  selectConnection: (connectionId) => set({ selectedConnectionId: connectionId, selectedComponentId: null }),
  clearSelection: () => set({ selectedComponentId: null, selectedConnectionId: null }),
  setConnections: (connections) =>
    set((state) => ({
      architecture: {
        ...state.architecture,
        connections,
      },
    })),
  upsertConnection: (sourceId, targetId) =>
    set((state) => {
      const exists = state.architecture.connections.some(
        (connection) => connection.sourceId === sourceId && connection.targetId === targetId
      );

      if (exists) return state;

      let architecture: NetworkArchitecture = {
        ...state.architecture,
        connections: [...state.architecture.connections, createConnection(sourceId, targetId)],
      };
      architecture = applyConnectionInference(architecture, sourceId, targetId);

      return {
        architecture,
        validationIssues: validateArchitecture(architecture),
      };
    }),
  updateConnection: (connectionId, updater) =>
    set((state) => ({
      architecture: {
        ...state.architecture,
        connections: state.architecture.connections.map((connection) =>
          connection.id === connectionId ? updater(connection) : connection
        ),
      },
    })),
  removeConnection: (connectionId) =>
    set((state) => ({
      architecture: {
        ...state.architecture,
        connections: state.architecture.connections.filter((connection) => connection.id !== connectionId),
      },
      selectedConnectionId: state.selectedConnectionId === connectionId ? null : state.selectedConnectionId,
    })),
  removeSelected: () =>
    set((state) => {
      if (state.selectedComponentId) {
        const architecture = {
          ...state.architecture,
          components: state.architecture.components.filter((component) => component.id !== state.selectedComponentId),
          connections: state.architecture.connections.filter(
            (connection) =>
              connection.sourceId !== state.selectedComponentId &&
              connection.targetId !== state.selectedComponentId
          ),
        };

        return {
          architecture,
          selectedComponentId: null,
          validationIssues: validateArchitecture(architecture),
        };
      }

      if (state.selectedConnectionId) {
        const architecture = {
          ...state.architecture,
          connections: state.architecture.connections.filter(
            (connection) => connection.id !== state.selectedConnectionId
          ),
        };

        return {
          architecture,
          selectedConnectionId: null,
          validationIssues: validateArchitecture(architecture),
        };
      }

      return state;
    }),
  setSimulationRequest: (request) => set({ simulationRequest: request }),
  runValidation: () => {
    const issues = validateArchitecture(get().architecture);
    set({ validationIssues: issues });
    return issues;
  },
  runSimulation: (request) => {
    const simulationRequest = request ?? get().simulationRequest;
    if (!simulationRequest) return null;
    const result = simulateTraffic(get().architecture, simulationRequest);
    set({ simulationRequest, simulationResult: result });
    return result;
  },
  importArchitecture: (raw) => {
    try {
      const parsed = architectureSchema.safeParse(JSON.parse(raw));
      if (!parsed.success) {
        return { success: false, error: parsed.error.issues.map((issue) => issue.message).join("; ") };
      }

      const architecture = parsed.data;
      set({
        architecture,
        validationIssues: validateArchitecture(architecture),
        simulationRequest: defaultSimulationRequest(architecture),
        simulationResult: null,
        selectedComponentId: null,
        selectedConnectionId: null,
        activeSampleName: architecture.name,
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unable to parse architecture JSON.",
      };
    }
  },
  setExportPreview: (preview) => set({ exportPreview: preview }),
  generateExport: (format) => {
    const architecture = get().architecture;
    const content =
      format === "json"
        ? serializeArchitectureJson(architecture)
        : format === "terraform"
          ? generateTerraform(architecture)
          : format === "gcloud"
            ? generateGcloudCommands(architecture)
            : generateMarkdownDocumentation(architecture);

    const preview = {
      format,
      filename:
        format === "json"
          ? "gcp-network-planner.json"
          : format === "terraform"
            ? "main.tf"
            : format === "gcloud"
              ? "gcloud-commands.sh"
              : "architecture.md",
      content,
    } satisfies ExportPreview;

    set({ exportPreview: preview });
    return preview;
  },
}));
