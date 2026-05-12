import { describe, expect, it } from "vitest";
import { SAMPLE_ARCHITECTURES } from "@/domain/models/sampleArchitectures";
import { findMatchingFirewallRule } from "@/domain/simulation/firewall";

describe("findMatchingFirewallRule", () => {
  it("matches the web ingress rule for public HTTP traffic", () => {
    const architecture = structuredClone(SAMPLE_ARCHITECTURES[0]);
    const webVm = architecture.components.find(
      (component) => component.kind === "vmInstance" && component.id === "vm-web"
    );

    if (!webVm || webVm.kind !== "vmInstance") {
      throw new Error("Expected web VM sample data to exist.");
    }

    const matchingRule = findMatchingFirewallRule({
      architecture,
      vpcId: webVm.vpcId,
      instance: webVm,
      direction: "INGRESS",
      sourceIp: "203.0.113.10",
      protocol: "tcp",
      port: 80,
    });

    expect(matchingRule?.id).toBe("fw-web");
  });
});
