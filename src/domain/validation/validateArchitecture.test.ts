import { describe, expect, it } from "vitest";
import { SAMPLE_ARCHITECTURES } from "@/domain/models/sampleArchitectures";
import { validateNatRequirements } from "@/domain/validation/validateArchitecture";

describe("validateNatRequirements", () => {
  it("flags private VMs that require egress but have no Cloud NAT path", () => {
    const architecture = structuredClone(SAMPLE_ARCHITECTURES[0]);

    architecture.components = architecture.components.filter((component) => component.id !== "nat-core");
    architecture.connections = architecture.connections.filter(
      (connection) => connection.sourceId !== "nat-core" && connection.targetId !== "nat-core"
    );

    const issues = validateNatRequirements(architecture);

    expect(
      issues.some(
        (issue) =>
          issue.title === "Private VM has no NAT path" && issue.componentIds.includes("vm-app")
      )
    ).toBe(true);
  });
});
