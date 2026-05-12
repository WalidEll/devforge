"use client";

import type { ChangeEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { COMPONENT_CATALOG, REGION_OPTIONS, ZONE_OPTIONS } from "@/domain/models/gcp-network";
import type { GcpComponent, NetworkConnection } from "@/domain/models/gcp-network";
import { getComponentById } from "@/domain/models/selectors";
import { parseCsvList, parseNumberList } from "@/domain/validation/cidr";
import { useNetworkPlannerStore } from "@/store/useNetworkPlannerStore";

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {hint ? <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p> : null}
    </div>
  );
}

function NativeSelect({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
    >
      {children}
    </select>
  );
}

function patchRegion(current: GcpComponent, region: string): GcpComponent {
  switch (current.kind) {
    case "subnet":
    case "vmInstance":
    case "cloudRouter":
    case "cloudNat":
    case "loadBalancer":
    case "gkeCluster":
      return { ...current, region: region || undefined };
    case "privateServiceConnect":
      return { ...current, region: region || current.region };
    default:
      return current;
  }
}

function ConnectionEditor({ connection }: { connection: NetworkConnection }) {
  const architecture = useNetworkPlannerStore((state) => state.architecture);
  const updateConnection = useNetworkPlannerStore((state) => state.updateConnection);
  const removeConnection = useNetworkPlannerStore((state) => state.removeConnection);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Connection</CardTitle>
        <CardDescription>
          {getComponentById(architecture, connection.sourceId)?.name} {"->"}{" "}
          {getComponentById(architecture, connection.targetId)?.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Field label="Label">
          <Input
            value={connection.label ?? ""}
            onChange={(event) =>
              updateConnection(connection.id, (current) => ({ ...current, label: event.target.value }))
            }
          />
        </Field>
        <Field label="Connection Type">
          <NativeSelect
            value={connection.kind}
            onChange={(event) =>
              updateConnection(connection.id, (current) => ({
                ...current,
                kind: event.target.value as NetworkConnection["kind"],
              }))
            }
          >
            <option value="attachment">Attachment</option>
            <option value="dependency">Dependency</option>
            <option value="routing">Routing</option>
            <option value="peering">Peering</option>
            <option value="vpn">VPN</option>
            <option value="reference">Reference</option>
          </NativeSelect>
        </Field>

        <Button variant="destructive" onClick={() => removeConnection(connection.id)}>
          Delete Connection
        </Button>
      </CardContent>
    </Card>
  );
}

function ComponentEditor({ component }: { component: GcpComponent }) {
  const architecture = useNetworkPlannerStore((state) => state.architecture);
  const updateComponent = useNetworkPlannerStore((state) => state.updateComponent);
  const removeSelected = useNetworkPlannerStore((state) => state.removeSelected);
  const meta = COMPONENT_CATALOG.find((entry) => entry.kind === component.kind);

  function patch(updater: (current: GcpComponent) => GcpComponent) {
    updateComponent(component.id, updater);
  }

  const vpcs = architecture.components.filter((entry) => entry.kind === "vpc");
  const subnets = architecture.components.filter((entry) => entry.kind === "subnet");
  const routers = architecture.components.filter((entry) => entry.kind === "cloudRouter");

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>{component.name}</CardTitle>
            <CardDescription>{meta?.description}</CardDescription>
          </div>
          <Badge variant={meta?.mvpReady ? "success" : "secondary"}>
            {meta?.mvpReady ? "MVP" : "Preview"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="h-[calc(100%-88px)]">
        <ScrollArea className="h-full pr-3">
          <div className="space-y-4">
            <Field label="Name">
              <Input
                value={component.name}
                onChange={(event) => patch((current) => ({ ...current, name: event.target.value }))}
              />
            </Field>

            <Field label="Label">
              <Input
                value={component.label}
                onChange={(event) => patch((current) => ({ ...current, label: event.target.value }))}
              />
            </Field>

            {"region" in component ? (
              <Field label="Region">
                <NativeSelect
                  value={component.region ?? ""}
                  onChange={(event) => patch((current) => patchRegion(current, event.target.value))}
                >
                  <option value="">Select a region</option>
                  {REGION_OPTIONS.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
            ) : null}

            <Field label="Description">
              <Textarea
                value={component.description ?? ""}
                onChange={(event) =>
                  patch((current) => ({ ...current, description: event.target.value || undefined }))
                }
              />
            </Field>

            {component.kind === "project" ? (
              <>
                <Field label="Project ID">
                  <Input
                    value={component.projectId}
                    onChange={(event) =>
                      patch((current) =>
                        current.kind === "project"
                          ? { ...current, projectId: event.target.value }
                          : current
                      )
                    }
                  />
                </Field>
                <Field label="Environment">
                  <NativeSelect
                    value={component.environment}
                    onChange={(event) =>
                      patch((current) =>
                        current.kind === "project"
                          ? { ...current, environment: event.target.value as typeof current.environment }
                          : current
                      )
                    }
                  >
                    <option value="dev">dev</option>
                    <option value="staging">staging</option>
                    <option value="prod">prod</option>
                    <option value="shared">shared</option>
                  </NativeSelect>
                </Field>
              </>
            ) : null}

            {component.kind === "vpc" ? (
              <>
                <Field label="Routing Mode">
                  <NativeSelect
                    value={component.routingMode}
                    onChange={(event) =>
                      patch((current) =>
                        current.kind === "vpc"
                          ? { ...current, routingMode: event.target.value as typeof current.routingMode }
                          : current
                      )
                    }
                  >
                    <option value="REGIONAL">REGIONAL</option>
                    <option value="GLOBAL">GLOBAL</option>
                  </NativeSelect>
                </Field>
                <Field label="MTU">
                  <Input
                    type="number"
                    value={component.mtu}
                    onChange={(event) =>
                      patch((current) =>
                        current.kind === "vpc"
                          ? { ...current, mtu: Number(event.target.value) || 1460 }
                          : current
                      )
                    }
                  />
                </Field>
              </>
            ) : null}

            {component.kind === "subnet" ? (
              <>
                <Field label="VPC">
                  <NativeSelect
                    value={component.vpcId ?? ""}
                    onChange={(event) =>
                      patch((current) =>
                        current.kind === "subnet" ? { ...current, vpcId: event.target.value || undefined } : current
                      )
                    }
                  >
                    <option value="">Select a VPC</option>
                    {vpcs.map((vpc) => (
                      <option key={vpc.id} value={vpc.id}>
                        {vpc.name}
                      </option>
                    ))}
                  </NativeSelect>
                </Field>
                <Field label="CIDR">
                  <Input
                    value={component.cidr}
                    onChange={(event) =>
                      patch((current) => (current.kind === "subnet" ? { ...current, cidr: event.target.value } : current))
                    }
                  />
                </Field>
                <Field label="Purpose">
                  <NativeSelect
                    value={component.purpose}
                    onChange={(event) =>
                      patch((current) =>
                        current.kind === "subnet"
                          ? { ...current, purpose: event.target.value as typeof current.purpose }
                          : current
                      )
                    }
                  >
                    <option value="GENERAL">GENERAL</option>
                    <option value="PRIVATE">PRIVATE</option>
                    <option value="PUBLIC">PUBLIC</option>
                    <option value="GKE">GKE</option>
                    <option value="PROXY">PROXY</option>
                  </NativeSelect>
                </Field>
                <Field
                  label="Secondary Ranges"
                  hint="One per line as name=cidr:usage, e.g. pods=10.40.0.0/20:pods"
                >
                  <Textarea
                    value={component.secondaryRanges
                      .map((range) => `${range.name}=${range.cidr}:${range.usage}`)
                      .join("\n")}
                    onChange={(event) =>
                      patch((current) =>
                        current.kind === "subnet"
                          ? {
                              ...current,
                              secondaryRanges: event.target.value
                                .split("\n")
                                .map((line) => line.trim())
                                .filter(Boolean)
                                .map((line) => {
                                  const [left, usage = "other"] = line.split(":");
                                  const [name, cidr] = left.split("=");
                                  return {
                                    name: name?.trim() ?? "range",
                                    cidr: cidr?.trim() ?? "",
                                    usage:
                                      usage.trim() === "pods" ||
                                      usage.trim() === "services" ||
                                      usage.trim() === "alias" ||
                                      usage.trim() === "private-service-connect"
                                        ? (usage.trim() as "pods" | "services" | "alias" | "private-service-connect")
                                        : "other",
                                  };
                                }),
                            }
                          : current
                      )
                    }
                  />
                </Field>
              </>
            ) : null}

            {component.kind === "vmInstance" ? (
              <>
                <Field label="Subnet">
                  <NativeSelect
                    value={component.subnetId ?? ""}
                    onChange={(event) =>
                      patch((current) =>
                        current.kind === "vmInstance"
                          ? {
                              ...current,
                              subnetId: event.target.value || undefined,
                              vpcId:
                                event.target.value
                                  ? (subnets.find((subnet) => subnet.id === event.target.value)?.vpcId ?? current.vpcId)
                                  : current.vpcId,
                              region:
                                event.target.value
                                  ? (subnets.find((subnet) => subnet.id === event.target.value)?.region ?? current.region)
                                  : current.region,
                            }
                          : current
                      )
                    }
                  >
                    <option value="">Select a subnet</option>
                    {subnets.map((subnet) => (
                      <option key={subnet.id} value={subnet.id}>
                        {subnet.name}
                      </option>
                    ))}
                  </NativeSelect>
                </Field>
                <Field label="Zone">
                  <NativeSelect
                    value={component.zone}
                    onChange={(event) =>
                      patch((current) =>
                        current.kind === "vmInstance" ? { ...current, zone: event.target.value } : current
                      )
                    }
                  >
                    {ZONE_OPTIONS.map((zone) => (
                      <option key={zone} value={zone}>
                        {zone}
                      </option>
                    ))}
                  </NativeSelect>
                </Field>
                <Field label="Machine Type">
                  <Input
                    value={component.machineType}
                    onChange={(event) =>
                      patch((current) =>
                        current.kind === "vmInstance" ? { ...current, machineType: event.target.value } : current
                      )
                    }
                  />
                </Field>
                <Field label="Internal IP">
                  <Input
                    value={component.internalIp ?? ""}
                    onChange={(event) =>
                      patch((current) =>
                        current.kind === "vmInstance"
                          ? { ...current, internalIp: event.target.value || undefined }
                          : current
                      )
                    }
                  />
                </Field>
                <Field label="Network Tags" hint="Comma-separated">
                  <Input
                    value={component.networkTags.join(", ")}
                    onChange={(event) =>
                      patch((current) =>
                        current.kind === "vmInstance"
                          ? { ...current, networkTags: parseCsvList(event.target.value) }
                          : current
                      )
                    }
                  />
                </Field>
                <Field label="Exposed Ports" hint="Comma-separated">
                  <Input
                    value={component.exposedPorts.join(", ")}
                    onChange={(event) =>
                      patch((current) =>
                        current.kind === "vmInstance"
                          ? { ...current, exposedPorts: parseNumberList(event.target.value) }
                          : current
                      )
                    }
                  />
                </Field>
              </>
            ) : null}

            {component.kind === "firewallRule" ? (
              <>
                <Field label="VPC">
                  <NativeSelect
                    value={component.vpcId ?? ""}
                    onChange={(event) =>
                      patch((current) =>
                        current.kind === "firewallRule"
                          ? { ...current, vpcId: event.target.value || undefined }
                          : current
                      )
                    }
                  >
                    <option value="">Select a VPC</option>
                    {vpcs.map((vpc) => (
                      <option key={vpc.id} value={vpc.id}>
                        {vpc.name}
                      </option>
                    ))}
                  </NativeSelect>
                </Field>
                <Field label="Priority">
                  <Input
                    type="number"
                    value={component.priority}
                    onChange={(event) =>
                      patch((current) =>
                        current.kind === "firewallRule"
                          ? { ...current, priority: Number(event.target.value) || 1000 }
                          : current
                      )
                    }
                  />
                </Field>
                <Field label="Direction">
                  <NativeSelect
                    value={component.direction}
                    onChange={(event) =>
                      patch((current) =>
                        current.kind === "firewallRule"
                          ? { ...current, direction: event.target.value as typeof current.direction }
                          : current
                      )
                    }
                  >
                    <option value="INGRESS">INGRESS</option>
                    <option value="EGRESS">EGRESS</option>
                  </NativeSelect>
                </Field>
                <Field label="Action">
                  <NativeSelect
                    value={component.action}
                    onChange={(event) =>
                      patch((current) =>
                        current.kind === "firewallRule"
                          ? { ...current, action: event.target.value as typeof current.action }
                          : current
                      )
                    }
                  >
                    <option value="allow">allow</option>
                    <option value="deny">deny</option>
                  </NativeSelect>
                </Field>
                <Field label="Protocol">
                  <NativeSelect
                    value={component.protocol}
                    onChange={(event) =>
                      patch((current) =>
                        current.kind === "firewallRule"
                          ? { ...current, protocol: event.target.value as typeof current.protocol }
                          : current
                      )
                    }
                  >
                    <option value="tcp">tcp</option>
                    <option value="udp">udp</option>
                    <option value="icmp">icmp</option>
                    <option value="all">all</option>
                  </NativeSelect>
                </Field>
                <Field label="Ports" hint="Comma-separated">
                  <Input
                    value={component.ports.join(", ")}
                    onChange={(event) =>
                      patch((current) =>
                        current.kind === "firewallRule"
                          ? { ...current, ports: parseNumberList(event.target.value) }
                          : current
                      )
                    }
                  />
                </Field>
                <Field label="Source Ranges" hint="Comma-separated">
                  <Input
                    value={component.sourceRanges.join(", ")}
                    onChange={(event) =>
                      patch((current) =>
                        current.kind === "firewallRule"
                          ? { ...current, sourceRanges: parseCsvList(event.target.value) }
                          : current
                      )
                    }
                  />
                </Field>
                <Field label="Destination Ranges" hint="Comma-separated">
                  <Input
                    value={component.destinationRanges.join(", ")}
                    onChange={(event) =>
                      patch((current) =>
                        current.kind === "firewallRule"
                          ? { ...current, destinationRanges: parseCsvList(event.target.value) }
                          : current
                      )
                    }
                  />
                </Field>
                <Field label="Target Tags" hint="Comma-separated">
                  <Input
                    value={component.targetTags.join(", ")}
                    onChange={(event) =>
                      patch((current) =>
                        current.kind === "firewallRule"
                          ? { ...current, targetTags: parseCsvList(event.target.value) }
                          : current
                      )
                    }
                  />
                </Field>
              </>
            ) : null}

            {component.kind === "cloudRouter" ? (
              <>
                <Field label="VPC">
                  <NativeSelect
                    value={component.vpcId ?? ""}
                    onChange={(event) =>
                      patch((current) =>
                        current.kind === "cloudRouter"
                          ? { ...current, vpcId: event.target.value || undefined }
                          : current
                      )
                    }
                  >
                    <option value="">Select a VPC</option>
                    {vpcs.map((vpc) => (
                      <option key={vpc.id} value={vpc.id}>
                        {vpc.name}
                      </option>
                    ))}
                  </NativeSelect>
                </Field>
                <Field label="BGP ASN">
                  <Input
                    type="number"
                    value={component.bgpAsn}
                    onChange={(event) =>
                      patch((current) =>
                        current.kind === "cloudRouter"
                          ? { ...current, bgpAsn: Number(event.target.value) || 64514 }
                          : current
                      )
                    }
                  />
                </Field>
              </>
            ) : null}

            {component.kind === "cloudNat" ? (
              <>
                <Field label="VPC">
                  <NativeSelect
                    value={component.vpcId ?? ""}
                    onChange={(event) =>
                      patch((current) =>
                        current.kind === "cloudNat" ? { ...current, vpcId: event.target.value || undefined } : current
                      )
                    }
                  >
                    <option value="">Select a VPC</option>
                    {vpcs.map((vpc) => (
                      <option key={vpc.id} value={vpc.id}>
                        {vpc.name}
                      </option>
                    ))}
                  </NativeSelect>
                </Field>
                <Field label="Cloud Router">
                  <NativeSelect
                    value={component.routerId ?? ""}
                    onChange={(event) =>
                      patch((current) =>
                        current.kind === "cloudNat"
                          ? { ...current, routerId: event.target.value || undefined }
                          : current
                      )
                    }
                  >
                    <option value="">Select a router</option>
                    {routers.map((router) => (
                      <option key={router.id} value={router.id}>
                        {router.name}
                      </option>
                    ))}
                  </NativeSelect>
                </Field>
                <Field label="Subnet Scope" hint="Comma-separated subnet IDs or leave blank with appliesToAllSubnets">
                  <Input
                    value={component.subnetIds.join(", ")}
                    onChange={(event) =>
                      patch((current) =>
                        current.kind === "cloudNat"
                          ? { ...current, subnetIds: parseCsvList(event.target.value) }
                          : current
                      )
                    }
                  />
                </Field>
              </>
            ) : null}

            {component.kind === "dnsZone" ? (
              <>
                <Field label="Domain">
                  <Input
                    value={component.domain}
                    onChange={(event) =>
                      patch((current) =>
                        current.kind === "dnsZone" ? { ...current, domain: event.target.value } : current
                      )
                    }
                  />
                </Field>
                <Field label="Visibility">
                  <NativeSelect
                    value={component.visibility}
                    onChange={(event) =>
                      patch((current) =>
                        current.kind === "dnsZone"
                          ? { ...current, visibility: event.target.value as typeof current.visibility }
                          : current
                      )
                    }
                  >
                    <option value="PUBLIC">PUBLIC</option>
                    <option value="PRIVATE">PRIVATE</option>
                  </NativeSelect>
                </Field>
                <Field label="Associated VPC IDs" hint="Comma-separated">
                  <Input
                    value={component.vpcIds.join(", ")}
                    onChange={(event) =>
                      patch((current) =>
                        current.kind === "dnsZone"
                          ? { ...current, vpcIds: parseCsvList(event.target.value) }
                          : current
                      )
                    }
                  />
                </Field>
              </>
            ) : null}

            {component.kind === "gkeCluster" ? (
              <>
                <Field label="Subnet">
                  <NativeSelect
                    value={component.subnetId ?? ""}
                    onChange={(event) =>
                      patch((current) =>
                        current.kind === "gkeCluster"
                          ? { ...current, subnetId: event.target.value || undefined }
                          : current
                      )
                    }
                  >
                    <option value="">Select a subnet</option>
                    {subnets.map((subnet) => (
                      <option key={subnet.id} value={subnet.id}>
                        {subnet.name}
                      </option>
                    ))}
                  </NativeSelect>
                </Field>
                <Field label="Max Pods per Node">
                  <Input
                    type="number"
                    value={component.maxPodsPerNode}
                    onChange={(event) =>
                      patch((current) =>
                        current.kind === "gkeCluster"
                          ? { ...current, maxPodsPerNode: Number(event.target.value) || 110 }
                          : current
                      )
                    }
                  />
                </Field>
              </>
            ) : null}

            {component.kind === "onPremNetwork" ? (
              <>
                <Field label="CIDR">
                  <Input
                    value={component.cidr}
                    onChange={(event) =>
                      patch((current) =>
                        current.kind === "onPremNetwork" ? { ...current, cidr: event.target.value } : current
                      )
                    }
                  />
                </Field>
                <Field label="Location">
                  <Input
                    value={component.location}
                    onChange={(event) =>
                      patch((current) =>
                        current.kind === "onPremNetwork" ? { ...current, location: event.target.value } : current
                      )
                    }
                  />
                </Field>
              </>
            ) : null}

            <Button variant="destructive" onClick={removeSelected}>
              Delete Component
            </Button>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export function PropertiesEditor() {
  const architecture = useNetworkPlannerStore((state) => state.architecture);
  const selectedComponentId = useNetworkPlannerStore((state) => state.selectedComponentId);
  const selectedConnectionId = useNetworkPlannerStore((state) => state.selectedConnectionId);

  const component = selectedComponentId
    ? getComponentById(architecture, selectedComponentId)
    : undefined;
  const connection = selectedConnectionId
    ? architecture.connections.find((entry) => entry.id === selectedConnectionId)
    : undefined;

  if (connection) {
    return <ConnectionEditor connection={connection} />;
  }

  if (!component) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Properties</CardTitle>
          <CardDescription>Select a component or connection on the canvas to edit it.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return <ComponentEditor component={component} />;
}
