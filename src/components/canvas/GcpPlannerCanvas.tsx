"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  addEdge,
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Edge,
  type OnConnect,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { GcpComponent, NetworkConnection } from "@/domain/models/gcp-network";
import { useNetworkPlannerStore } from "@/store/useNetworkPlannerStore";
import GcpPlannerNode, { type PlannerFlowNode } from "./GcpPlannerNode";

const nodeTypes = {
  gcp: GcpPlannerNode,
} satisfies NodeTypes;

function toFlowNode(component: GcpComponent): PlannerFlowNode {
  return {
    id: component.id,
    type: "gcp",
    position: component.position,
    data: { component },
  };
}

function toFlowEdge(connection: NetworkConnection): Edge {
  return {
    id: connection.id,
    source: connection.sourceId,
    target: connection.targetId,
    label: connection.label,
    markerEnd: { type: MarkerType.ArrowClosed },
    animated: connection.kind === "routing" || connection.kind === "vpn",
    style: {
      strokeWidth: 2,
    },
  };
}

function FlowCanvas({ exportRef }: { exportRef: React.RefObject<HTMLDivElement | null> }) {
  const architecture = useNetworkPlannerStore((state) => state.architecture);
  const addComponent = useNetworkPlannerStore((state) => state.addComponent);
  const updateComponent = useNetworkPlannerStore((state) => state.updateComponent);
  const selectComponent = useNetworkPlannerStore((state) => state.selectComponent);
  const selectConnection = useNetworkPlannerStore((state) => state.selectConnection);
  const clearSelection = useNetworkPlannerStore((state) => state.clearSelection);
  const upsertConnection = useNetworkPlannerStore((state) => state.upsertConnection);
  const removeConnection = useNetworkPlannerStore((state) => state.removeConnection);
  const removeSelected = useNetworkPlannerStore((state) => state.removeSelected);
  const reactFlow = useReactFlow();

  const mappedNodes = useMemo(
    () => architecture.components.map((component) => toFlowNode(component)),
    [architecture.components]
  );
  const mappedEdges = useMemo(
    () => architecture.connections.map((connection) => toFlowEdge(connection)),
    [architecture.connections]
  );

  const [nodes, setNodes] = useNodesState<PlannerFlowNode>(mappedNodes);
  const [edges, setEdges] = useEdgesState(mappedEdges);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNodes(mappedNodes);
  }, [mappedNodes, setNodes]);

  useEffect(() => {
    setEdges(mappedEdges);
  }, [mappedEdges, setEdges]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Delete" || event.key === "Backspace") {
        removeSelected();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [removeSelected]);

  const onConnect: OnConnect = (connection) => {
    if (!connection.source || !connection.target) return;
    upsertConnection(connection.source, connection.target);
    setEdges((current) => addEdge({ ...connection, markerEnd: { type: MarkerType.ArrowClosed } }, current));
  };

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const kind = event.dataTransfer.getData("application/devforge-gcp-kind") as GcpComponent["kind"];
    if (!kind) return;
    if (!wrapperRef.current) return;

    const position = reactFlow.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    addComponent(kind, position);
  };

  return (
    <div ref={wrapperRef} className="h-full w-full" onDragOver={onDragOver} onDrop={onDrop}>
      <div ref={exportRef} className="h-full w-full rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          snapToGrid
          snapGrid={[24, 24]}
          minZoom={0.3}
          maxZoom={1.6}
          onConnect={onConnect}
          onPaneClick={clearSelection}
          onNodeClick={(_, node) => selectComponent(node.id)}
          onEdgeClick={(_, edge) => selectConnection(edge.id)}
          onNodeDragStop={(_, node) =>
            updateComponent(node.id, (component) => ({
              ...component,
              position: node.position,
            }))
          }
          onNodesDelete={(deletedNodes) => {
            for (const node of deletedNodes) {
              selectComponent(node.id);
            }
            removeSelected();
          }}
          onEdgesDelete={(deletedEdges) => {
            for (const edge of deletedEdges) {
              removeConnection(edge.id);
            }
          }}
          onSelectionChange={({ nodes: selectedNodes, edges: selectedEdges }) => {
            if (selectedNodes[0]) {
              selectComponent(selectedNodes[0].id);
              return;
            }

            if (selectedEdges[0]) {
              selectConnection(selectedEdges[0].id);
              return;
            }

            clearSelection();
          }}
          connectionMode={ConnectionMode.Loose}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1.2} />
          <MiniMap pannable zoomable />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  );
}

export function GcpPlannerCanvas({ exportRef }: { exportRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <ReactFlowProvider>
      <FlowCanvas exportRef={exportRef} />
    </ReactFlowProvider>
  );
}
