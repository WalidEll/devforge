"use client";

import type { Node, NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";
import {
  Blocks,
  Building2,
  Cloud,
  Globe,
  Router,
  Server,
  Shield,
  Waypoints,
  Network,
  LockKeyhole,
  GlobeLock,
  Database,
  Cable,
  Component,
  HardDrive,
} from "lucide-react";
import type { GcpComponent } from "@/domain/models/gcp-network";
import { COMPONENT_CATALOG } from "@/domain/models/gcp-network";
import { cn } from "@/utils/cn";

export type PlannerFlowNode = Node<{ component: GcpComponent }, "gcp">;

const COMPONENT_ICONS = {
  project: Building2,
  vpc: Network,
  subnet: Blocks,
  vmInstance: Server,
  firewallRule: Shield,
  cloudRouter: Router,
  cloudNat: GlobeLock,
  loadBalancer: Waypoints,
  dnsZone: Database,
  privateServiceConnect: Cable,
  vpcPeering: Component,
  vpnGateway: LockKeyhole,
  gkeCluster: HardDrive,
  internet: Globe,
  onPremNetwork: Cloud,
} satisfies Record<GcpComponent["kind"], typeof Building2>;

function componentMeta(component: GcpComponent) {
  switch (component.kind) {
    case "subnet":
      return component.cidr;
    case "vmInstance":
      return component.zone;
    case "firewallRule":
      return `${component.direction} ${component.action}`;
    case "cloudNat":
      return component.region ?? "regional";
    case "cloudRouter":
      return component.region ?? "regional";
    case "dnsZone":
      return component.domain;
    case "gkeCluster":
      return `maxPods=${component.maxPodsPerNode}`;
    case "vpnGateway":
      return component.tunnelMode;
    case "onPremNetwork":
      return component.cidr;
    case "vpc":
      return component.routingMode;
    case "project":
      return component.projectId;
    default:
      return component.region ?? component.kind;
  }
}

function GcpPlannerNode({ data, selected }: NodeProps<PlannerFlowNode>) {
  const { component } = data;
  const meta = COMPONENT_CATALOG.find((entry) => entry.kind === component.kind);
  const Icon = COMPONENT_ICONS[component.kind];

  return (
    <div
      className={cn(
        "min-w-[170px] rounded-xl border bg-white shadow-md transition-all dark:bg-gray-950",
        selected ? "border-blue-500 ring-2 ring-blue-500/20" : "border-gray-200 dark:border-gray-800"
      )}
    >
      <Handle type="target" position={Position.Left} className="!h-3 !w-3 !bg-blue-500" />
      <Handle type="source" position={Position.Right} className="!h-3 !w-3 !bg-blue-500" />

      <div className={cn("rounded-t-xl bg-gradient-to-r px-3 py-2 text-white", meta?.colorClass)}>
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">{meta?.shortLabel ?? component.kind}</span>
        </div>
      </div>

      <div className="space-y-1 px-3 py-3">
        <div className="text-sm font-semibold text-gray-900 dark:text-white">{component.name}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{componentMeta(component)}</div>
      </div>
    </div>
  );
}

export default GcpPlannerNode;
