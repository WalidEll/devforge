"use client";

import { useMemo } from "react";
import { AlertTriangle, CheckCircle2, ShieldAlert, Waypoints } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SimulationRequest } from "@/domain/models/gcp-network";
import { useNetworkPlannerStore } from "@/store/useNetworkPlannerStore";

interface ValidationPanelProps {
  activeTab: string;
  onActiveTabChange: (tab: string) => void;
  onRunSimulation: () => void;
}

export function ValidationPanel({
  activeTab,
  onActiveTabChange,
  onRunSimulation,
}: ValidationPanelProps) {
  const architecture = useNetworkPlannerStore((state) => state.architecture);
  const validationIssues = useNetworkPlannerStore((state) => state.validationIssues);
  const simulationRequest = useNetworkPlannerStore((state) => state.simulationRequest);
  const setSimulationRequest = useNetworkPlannerStore((state) => state.setSimulationRequest);
  const simulationResult = useNetworkPlannerStore((state) => state.simulationResult);
  const exportPreview = useNetworkPlannerStore((state) => state.exportPreview);

  const simulationCandidates = useMemo(
    () =>
      architecture.components.filter((component) =>
        ["vmInstance", "internet", "onPremNetwork"].includes(component.kind)
      ),
    [architecture.components]
  );

  const issueCounts = useMemo(
    () => ({
      error: validationIssues.filter((issue) => issue.severity === "error").length,
      warning: validationIssues.filter((issue) => issue.severity === "warning").length,
      info: validationIssues.filter((issue) => issue.severity === "info").length,
    }),
    [validationIssues]
  );

  function patchSimulation(partial: Partial<SimulationRequest>) {
    if (!simulationRequest) return;
    setSimulationRequest({ ...simulationRequest, ...partial });
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Validation and Results</CardTitle>
            <CardDescription>
              Educational model that approximates GCP behavior. Not a replacement for Network
              Intelligence Center.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant={issueCounts.error ? "destructive" : "success"}>
              {issueCounts.error} errors
            </Badge>
            <Badge variant={issueCounts.warning ? "warning" : "secondary"}>
              {issueCounts.warning} warnings
            </Badge>
            <Badge variant="secondary">{issueCounts.info} info</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[calc(100%-96px)]">
        <Tabs value={activeTab} onValueChange={onActiveTabChange} className="h-full">
          <TabsList>
            <TabsTrigger value="validation">Validation</TabsTrigger>
            <TabsTrigger value="simulation">Traffic Simulation</TabsTrigger>
            <TabsTrigger value="exports">Export Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="validation" className="h-[calc(100%-56px)]">
            <ScrollArea className="h-full pr-3">
              <div className="space-y-3">
                {validationIssues.length === 0 ? (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
                    No validation issues were found in the current architecture snapshot.
                  </div>
                ) : (
                  validationIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950"
                    >
                      <div className="flex items-center gap-2">
                        {issue.severity === "error" ? (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        ) : issue.severity === "warning" ? (
                          <ShieldAlert className="h-4 w-4 text-amber-600" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-blue-600" />
                        )}
                        <div className="font-medium text-gray-900 dark:text-white">{issue.title}</div>
                        <Badge
                          variant={
                            issue.severity === "error"
                              ? "destructive"
                              : issue.severity === "warning"
                                ? "warning"
                                : "secondary"
                          }
                        >
                          {issue.severity}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{issue.message}</p>
                      {issue.recommendation ? (
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          Recommendation: {issue.recommendation}
                        </p>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="simulation" className="h-[calc(100%-56px)]">
            <div className="grid h-full gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
              <div className="space-y-3">
                {simulationRequest ? (
                  <>
                    <div className="space-y-2">
                      <Label>Source</Label>
                      <select
                        value={simulationRequest.sourceComponentId}
                        onChange={(event) => patchSimulation({ sourceComponentId: event.target.value })}
                        className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                      >
                        {simulationCandidates.map((component) => (
                          <option key={component.id} value={component.id}>
                            {component.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Destination</Label>
                      <select
                        value={simulationRequest.destinationComponentId}
                        onChange={(event) => patchSimulation({ destinationComponentId: event.target.value })}
                        className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                      >
                        {simulationCandidates.map((component) => (
                          <option key={component.id} value={component.id}>
                            {component.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Protocol</Label>
                      <select
                        value={simulationRequest.protocol}
                        onChange={(event) =>
                          patchSimulation({
                            protocol: event.target.value as SimulationRequest["protocol"],
                          })
                        }
                        className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                      >
                        <option value="tcp">TCP</option>
                        <option value="udp">UDP</option>
                        <option value="icmp">ICMP</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Port</Label>
                      <Input
                        type="number"
                        value={simulationRequest.port ?? ""}
                        onChange={(event) =>
                          patchSimulation({ port: event.target.value ? Number(event.target.value) : undefined })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Direction</Label>
                      <select
                        value={simulationRequest.direction}
                        onChange={(event) =>
                          patchSimulation({
                            direction: event.target.value as SimulationRequest["direction"],
                          })
                        }
                        className="h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
                      >
                        <option value="egress">egress</option>
                        <option value="ingress">ingress</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Source IP Override</Label>
                      <Input
                        value={simulationRequest.sourceIpOverride ?? ""}
                        onChange={(event) =>
                          patchSimulation({ sourceIpOverride: event.target.value || undefined })
                        }
                        placeholder="Optional, useful for internet or on-prem simulation"
                      />
                    </div>

                    <Button className="w-full" onClick={onRunSimulation}>
                      <Waypoints className="h-4 w-4" />
                      Run Simulation
                    </Button>
                  </>
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Add at least one VM and one internet or on-prem component to enable traffic
                    simulation defaults.
                  </div>
                )}
              </div>

              <ScrollArea className="h-full rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="space-y-4 p-4">
                  {simulationResult ? (
                    <>
                      <div className="flex items-center gap-2">
                        <Badge variant={simulationResult.allowed ? "success" : "destructive"}>
                          {simulationResult.allowed ? "Allowed" : "Denied"}
                        </Badge>
                        {simulationResult.matchingFirewallRuleId ? (
                          <Badge variant="secondary">
                            Firewall: {simulationResult.matchingFirewallRuleId}
                          </Badge>
                        ) : null}
                        {simulationResult.natUsed ? <Badge variant="warning">Uses NAT</Badge> : null}
                        {simulationResult.publicPath ? <Badge variant="outline">Public path</Badge> : null}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {simulationResult.explanation}
                      </p>
                      <div>
                        <div className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                          Route path
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          {simulationResult.routePath.map((hop, index) => (
                            <div key={`${hop.componentId}-${index}`} className="flex items-center gap-2">
                              <Badge variant="secondary">{hop.label}</Badge>
                              {index < simulationResult.routePath.length - 1 ? (
                                <span className="text-gray-400">→</span>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </div>
                      {simulationResult.warnings.length > 0 ? (
                        <div>
                          <div className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                            Warnings
                          </div>
                          <ul className="list-disc space-y-1 pl-5 text-sm text-amber-700 dark:text-amber-300">
                            {simulationResult.warnings.map((warning) => (
                              <li key={warning}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                      {simulationResult.recommendations.length > 0 ? (
                        <div>
                          <div className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                            Recommendations
                          </div>
                          <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700 dark:text-gray-300">
                            {simulationResult.recommendations.map((recommendation) => (
                              <li key={recommendation}>{recommendation}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Run a traffic simulation to see firewall evaluation, route path, NAT usage, and
                      planner recommendations.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="exports" className="h-[calc(100%-56px)]">
            <div className="grid h-full gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
              <div className="space-y-3">
                <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200">
                  Toolbar export buttons both download files and update the preview here.
                </div>
                {exportPreview ? (
                  <>
                    <Badge variant="secondary">{exportPreview.format}</Badge>
                    <div className="text-sm text-gray-600 dark:text-gray-300">{exportPreview.filename}</div>
                  </>
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Generate a Terraform, JSON, gcloud, or Markdown export to inspect it here.
                  </div>
                )}
              </div>
              <ScrollArea className="h-full rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="p-4">
                  {exportPreview ? (
                    <pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs text-gray-900 dark:text-gray-100">
                      <code>{exportPreview.content}</code>
                    </pre>
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Export preview will appear here.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
