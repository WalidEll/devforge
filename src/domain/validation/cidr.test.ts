import { describe, expect, it } from "vitest";
import { SAMPLE_ARCHITECTURES } from "@/domain/models/sampleArchitectures";
import { validateCidrOverlap } from "@/domain/validation/validateArchitecture";

describe("validateCidrOverlap", () => {
  it("reports overlapping subnet ranges", () => {
    const architecture = structuredClone(SAMPLE_ARCHITECTURES[0]);
    const appSubnet = architecture.components.find(
      (component) => component.kind === "subnet" && component.id === "subnet-app"
    );

    if (!appSubnet || appSubnet.kind !== "subnet") {
      throw new Error("Expected app subnet sample data to exist.");
    }

    appSubnet.cidr = "10.10.0.128/25";

    const issues = validateCidrOverlap(architecture);

    expect(issues.some((issue) => issue.title === "Overlapping CIDR ranges")).toBe(true);
  });
});
