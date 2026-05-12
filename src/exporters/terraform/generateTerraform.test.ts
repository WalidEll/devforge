import { describe, expect, it } from "vitest";
import { SAMPLE_ARCHITECTURES } from "@/domain/models/sampleArchitectures";
import { generateTerraform } from "@/exporters/terraform/generateTerraform";

describe("generateTerraform", () => {
  it("renders the core network, firewall, NAT, and VM resources", () => {
    const output = generateTerraform(structuredClone(SAMPLE_ARCHITECTURES[0]));

    expect(output).toContain('resource "google_compute_network"');
    expect(output).toContain('resource "google_compute_subnetwork"');
    expect(output).toContain('resource "google_compute_firewall"');
    expect(output).toContain('resource "google_compute_router_nat"');
    expect(output).toContain('resource "google_compute_instance"');
    expect(output).toContain('source  = "hashicorp/google"');
  });
});
