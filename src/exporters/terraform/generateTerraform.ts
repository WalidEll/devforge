import type {
  CloudNat,
  CloudRouter,
  ComputeInstance,
  FirewallRule,
  NetworkArchitecture,
  Subnet,
  VpcNetwork,
} from "@/domain/models/gcp-network";
import { getComponentById, getComponentsByKind } from "@/domain/models/selectors";

function tfName(input: string) {
  return input.replace(/[^a-zA-Z0-9_]/g, "_").replace(/^(\d)/, "_$1");
}

function quotedList(values: string[]) {
  return `[${values.map((value) => `"${value}"`).join(", ")}]`;
}

function numberList(values: number[]) {
  return `[${values.map((value) => `"${value}"`).join(", ")}]`;
}

function renderFirewallBlock(rule: FirewallRule) {
  const blockType = rule.action === "allow" ? "allow" : "deny";
  const lines = [`  ${blockType} {`, `    protocol = "${rule.protocol}"`];

  if (rule.ports.length > 0 && rule.protocol !== "icmp" && rule.protocol !== "all") {
    lines.push(`    ports    = ${numberList(rule.ports)}`);
  }

  lines.push("  }");
  return lines.join("\n");
}

function renderNetwork(network: VpcNetwork) {
  const name = tfName(network.id);
  return `resource "google_compute_network" "${name}" {
  name                    = "${network.name}"
  auto_create_subnetworks = ${network.autoCreateSubnetworks}
  routing_mode            = "${network.routingMode}"
  mtu                     = ${network.mtu}
}
`;
}

function renderSubnet(subnet: Subnet) {
  const name = tfName(subnet.id);
  const network = tfName(subnet.vpcId ?? "missing_vpc");
  const secondaryRanges = subnet.secondaryRanges
    .map(
      (range) => `  secondary_ip_range {
    range_name    = "${range.name}"
    ip_cidr_range = "${range.cidr}"
  }`
    )
    .join("\n");

  return `resource "google_compute_subnetwork" "${name}" {
  name                     = "${subnet.name}"
  region                   = "${subnet.region ?? "us-central1"}"
  ip_cidr_range            = "${subnet.cidr}"
  network                  = google_compute_network.${network}.id
  private_ip_google_access = ${subnet.privateGoogleAccess}

  log_config {
    aggregation_interval = "INTERVAL_10_MIN"
    flow_sampling        = ${subnet.flowLogs ? "0.5" : "0.0"}
    metadata             = "INCLUDE_ALL_METADATA"
  }
${secondaryRanges ? `\n${secondaryRanges}` : ""}
}
`;
}

function renderFirewallRule(rule: FirewallRule) {
  const name = tfName(rule.id);
  const network = tfName(rule.vpcId ?? "missing_vpc");
  const sourceRanges = rule.sourceRanges.length ? `\n  source_ranges = ${quotedList(rule.sourceRanges)}` : "";
  const destinationRanges = rule.destinationRanges.length
    ? `\n  destination_ranges = ${quotedList(rule.destinationRanges)}`
    : "";
  const targetTags = rule.targetTags.length ? `\n  target_tags   = ${quotedList(rule.targetTags)}` : "";
  const targetServiceAccounts = rule.targetServiceAccounts.length
    ? `\n  target_service_accounts = ${quotedList(rule.targetServiceAccounts)}`
    : "";

  return `resource "google_compute_firewall" "${name}" {
  name      = "${rule.name}"
  network   = google_compute_network.${network}.name
  direction = "${rule.direction}"
  priority  = ${rule.priority}${sourceRanges}${destinationRanges}${targetTags}${targetServiceAccounts}

${renderFirewallBlock(rule)}

  log_config {
    metadata = "${rule.loggingEnabled ? "INCLUDE_ALL_METADATA" : "EXCLUDE_ALL_METADATA"}"
  }
}
`;
}

function renderRouter(router: CloudRouter) {
  const name = tfName(router.id);
  const network = tfName(router.vpcId ?? "missing_vpc");
  return `resource "google_compute_router" "${name}" {
  name    = "${router.name}"
  network = google_compute_network.${network}.name
  region  = "${router.region ?? "us-central1"}"

  bgp {
    asn = ${router.bgpAsn}
  }
}
`;
}

function renderNat(nat: CloudNat, architecture: NetworkArchitecture) {
  const name = tfName(nat.id);
  const router = nat.routerId ? getComponentById<CloudRouter>(architecture, nat.routerId) : undefined;
  if (!router) {
    return `# Skipped Cloud NAT ${nat.name}: no Cloud Router is attached.\n`;
  }

  const routerName = tfName(router.id);
  const subnetBlocks = nat.appliesToAllSubnets
    ? ""
    : nat.subnetIds
        .map((subnetId) => {
          const subnet = getComponentById<Subnet>(architecture, subnetId);
          if (!subnet) return "";
          return `  subnetwork {
    name                    = google_compute_subnetwork.${tfName(subnet.id)}.id
    source_ip_ranges_to_nat = ["ALL_IP_RANGES"]
  }`;
        })
        .filter(Boolean)
        .join("\n");

  return `resource "google_compute_router_nat" "${name}" {
  name                               = "${nat.name}"
  router                             = google_compute_router.${routerName}.name
  region                             = "${nat.region ?? router.region ?? "us-central1"}"
  nat_ip_allocate_option             = "${nat.natIpAllocateOption}"
  source_subnetwork_ip_ranges_to_nat = "${nat.appliesToAllSubnets ? "ALL_SUBNETWORKS_ALL_IP_RANGES" : "LIST_OF_SUBNETWORKS"}"
${subnetBlocks ? `\n${subnetBlocks}` : ""}
}
`;
}

function renderInstance(instance: ComputeInstance) {
  const name = tfName(instance.id);
  const subnet = tfName(instance.subnetId ?? "missing_subnet");
  const tags = instance.networkTags.length ? `\n  tags         = ${quotedList(instance.networkTags)}` : "";

  return `resource "google_compute_instance" "${name}" {
  name         = "${instance.name}"
  zone         = "${instance.zone}"
  machine_type = "${instance.machineType}"${tags}

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-12"
      size  = 20
      type  = "pd-balanced"
    }
  }

  network_interface {
    subnetwork = google_compute_subnetwork.${subnet}.id
${instance.hasExternalIp ? "\n    access_config {}\n" : ""}
  }

  metadata = {
    enable-oslogin = "TRUE"
  }
}
`;
}

export function generateTerraform(architecture: NetworkArchitecture) {
  const networks = getComponentsByKind<VpcNetwork>(architecture, "vpc");
  const subnets = getComponentsByKind<Subnet>(architecture, "subnet");
  const firewalls = getComponentsByKind<FirewallRule>(architecture, "firewallRule");
  const routers = getComponentsByKind<CloudRouter>(architecture, "cloudRouter");
  const nats = getComponentsByKind<CloudNat>(architecture, "cloudNat");
  const instances = getComponentsByKind<ComputeInstance>(architecture, "vmInstance");

  const primaryRegion =
    subnets[0]?.region ?? routers[0]?.region ?? instances[0]?.region ?? "us-central1";
  const primaryZone = instances[0]?.zone ?? `${primaryRegion}-a`;

  return `terraform {
  required_version = ">= 1.7.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 7.0"
    }
  }
}

variable "project_id" {
  type = string
}

provider "google" {
  project = var.project_id
  region  = "${primaryRegion}"
  zone    = "${primaryZone}"
}

${networks.map(renderNetwork).join("\n")}
${subnets.map(renderSubnet).join("\n")}
${firewalls.map(renderFirewallRule).join("\n")}
${routers.map(renderRouter).join("\n")}
${nats.map((nat) => renderNat(nat, architecture)).join("\n")}
${instances.map(renderInstance).join("\n")}
`;
}
