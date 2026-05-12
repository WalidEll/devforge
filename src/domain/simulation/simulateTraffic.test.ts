import { describe, expect, it } from "vitest";
import { SAMPLE_ARCHITECTURES } from "@/domain/models/sampleArchitectures";
import { simulateTraffic } from "@/domain/simulation/simulateTraffic";

describe("simulateTraffic", () => {
  it("models private VM internet egress through Cloud NAT", () => {
    const architecture = structuredClone(SAMPLE_ARCHITECTURES[0]);

    const result = simulateTraffic(architecture, {
      sourceComponentId: "vm-app",
      destinationComponentId: "internet",
      protocol: "tcp",
      port: 443,
      direction: "egress",
    });

    expect(result.allowed).toBe(true);
    expect(result.natUsed).toBe(true);
    expect(result.matchingFirewallRuleId).toBe("fw-app-egress");
    expect(result.routePath.map((hop) => hop.componentId)).toContain("nat-core");
  });
});
