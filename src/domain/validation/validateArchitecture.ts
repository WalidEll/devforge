import type {
  CloudNat,
  ComputeInstance,
  DnsZone,
  FirewallRule,
  NetworkArchitecture,
  Subnet,
  ValidationIssue,
  ValidationSeverity,
  VpcPeering,
} from "@/domain/models/gcp-network";
import {
  getCloudRouterForNat,
  getCloudRouterForVpn,
  getComponentById,
  getComponentsByKind,
  getRepresentativeCidrComponents,
  getSubnetById,
  getSubnetsForVpc,
  getVpcById,
} from "@/domain/models/selectors";
import {
  cidrOverlaps,
  isGcpProhibitedSubnetRange,
  isRfc1918Range,
  isValidGoogleCloudSubnetCidr,
  parseCidr,
} from "./cidr";
import { findMatchingFirewallRule } from "@/domain/simulation/firewall";

function buildIssue(params: {
  severity: ValidationSeverity;
  category: ValidationIssue["category"];
  title: string;
  message: string;
  componentIds: string[];
  recommendation?: string;
}) {
  return {
    id: crypto.randomUUID(),
    ...params,
  } satisfies ValidationIssue;
}

export function validateCidrOverlap(architecture: NetworkArchitecture) {
  const ranges = getRepresentativeCidrComponents(architecture);
  const issues: ValidationIssue[] = [];

  for (let index = 0; index < ranges.length; index += 1) {
    for (let compareIndex = index + 1; compareIndex < ranges.length; compareIndex += 1) {
      const left = ranges[index];
      const right = ranges[compareIndex];

      if (!cidrOverlaps(left.cidr, right.cidr)) continue;

      issues.push(
        buildIssue({
          severity: "error",
          category: "cidr",
          title: "Overlapping CIDR ranges",
          message: `${left.label} (${left.cidr}) overlaps with ${right.label} (${right.cidr}).`,
          componentIds: [left.id, right.id].filter(Boolean),
          recommendation:
            "Use unique primary and secondary ranges across VPCs, peer networks, and connected on-prem environments.",
        })
      );
    }
  }

  return issues;
}

export function validateFirewallRules(architecture: NetworkArchitecture) {
  const issues: ValidationIssue[] = [];
  const rules = getComponentsByKind<FirewallRule>(architecture, "firewallRule");
  const instances = getComponentsByKind<ComputeInstance>(architecture, "vmInstance");

  for (const rule of rules) {
    if (!rule.vpcId || !getVpcById(architecture, rule.vpcId)) {
      issues.push(
        buildIssue({
          severity: "error",
          category: "firewall",
          title: "Firewall rule is not attached to a VPC",
          message: `${rule.name} does not reference a valid VPC network.`,
          componentIds: [rule.id],
          recommendation: "Attach each firewall rule to the VPC where it should apply.",
        })
      );
    }

    if (rule.priority < 0 || rule.priority > 65535) {
      issues.push(
        buildIssue({
          severity: "error",
          category: "firewall",
          title: "Invalid firewall priority",
          message: `${rule.name} uses priority ${rule.priority}, which is outside the common GCP range of 0-65535.`,
          componentIds: [rule.id],
          recommendation: "Use GCP firewall priorities from 0 to 65535.",
        })
      );
    }

    const opensWorldSsh =
      rule.direction === "INGRESS" &&
      rule.action === "allow" &&
      rule.protocol === "tcp" &&
      rule.ports.includes(22) &&
      rule.sourceRanges.some((range) => range === "0.0.0.0/0");

    if (opensWorldSsh) {
      issues.push(
        buildIssue({
          severity: "warning",
          category: "security",
          title: "World-open SSH rule",
          message: `${rule.name} allows SSH from 0.0.0.0/0.`,
          componentIds: [rule.id],
          recommendation: "Restrict SSH to trusted admin CIDRs or use IAP/VPN instead.",
        })
      );
    }
  }

  for (const instance of instances) {
    if (!instance.hasExternalIp || instance.exposedPorts.length === 0) continue;

    for (const port of instance.exposedPorts) {
      const matchingRule = findMatchingFirewallRule({
        architecture,
        vpcId: instance.vpcId ?? getSubnetById(architecture, instance.subnetId)?.vpcId,
        instance,
        direction: "INGRESS",
        sourceIp: "8.8.8.8",
        protocol: "tcp",
        port,
      });

      if (!matchingRule || matchingRule.action !== "allow") {
        issues.push(
          buildIssue({
            severity: "warning",
            category: "firewall",
            title: "Missing ingress allow rule",
            message: `${instance.name} exposes port ${port}, but no matching public ingress allow rule was found.`,
            componentIds: [instance.id],
            recommendation:
              "Add an explicit ingress firewall allow rule or remove the public exposure expectation for this VM.",
          })
        );
      }
    }
  }

  return issues;
}

export function validateNatRequirements(architecture: NetworkArchitecture) {
  const issues: ValidationIssue[] = [];
  const natComponents = getComponentsByKind<CloudNat>(architecture, "cloudNat");
  const instances = getComponentsByKind<ComputeInstance>(architecture, "vmInstance");

  for (const nat of natComponents) {
    const router = getCloudRouterForNat(architecture, nat);
    if (!router) {
      issues.push(
        buildIssue({
          severity: "error",
          category: "nat",
          title: "Cloud NAT has no Cloud Router",
          message: `${nat.name} does not reference a Cloud Router.`,
          componentIds: [nat.id],
          recommendation: "Attach Cloud NAT to a Cloud Router in the same VPC and region.",
        })
      );
    }
  }

  for (const instance of instances) {
    if (instance.hasExternalIp || !instance.needsInternetEgress) continue;

    const subnet = getSubnetById(architecture, instance.subnetId);
    const nat = subnet
      ? natComponents.find((candidate) => {
          if (candidate.vpcId !== (instance.vpcId ?? subnet.vpcId)) return false;
          if (candidate.region !== subnet.region) return false;
          return candidate.appliesToAllSubnets || candidate.subnetIds.includes(subnet.id);
        })
      : undefined;

    if (!nat) {
      issues.push(
        buildIssue({
          severity: "warning",
          category: "nat",
          title: "Private VM has no NAT path",
          message: `${instance.name} is private and marked as needing internet egress, but no Cloud NAT was found for its subnet.`,
          componentIds: [instance.id],
          recommendation: "Attach Cloud NAT to the subnet or disable internet egress expectations for the VM.",
        })
      );
    }
  }

  return issues;
}

export function validateVpcPeering(architecture: NetworkArchitecture) {
  const issues: ValidationIssue[] = [];
  const peerings = getComponentsByKind<VpcPeering>(architecture, "vpcPeering");

  for (const peering of peerings) {
    if (!peering.requesterVpcId || !peering.accepterVpcId) {
      issues.push(
        buildIssue({
          severity: "error",
          category: "peering",
          title: "Incomplete VPC peering",
          message: `${peering.name} is missing one side of the peering relationship.`,
          componentIds: [peering.id],
          recommendation: "Set both requester and accepter VPCs for each peering object.",
        })
      );
      continue;
    }

    if (peering.requesterVpcId === peering.accepterVpcId) {
      issues.push(
        buildIssue({
          severity: "error",
          category: "peering",
          title: "Invalid self-peering",
          message: `${peering.name} points both sides of the peering to the same VPC.`,
          componentIds: [peering.id],
          recommendation: "A VPC peering must connect two distinct VPC networks.",
        })
      );
    }

    const requesterSubnets = getSubnetsForVpc(architecture, peering.requesterVpcId);
    const accepterSubnets = getSubnetsForVpc(architecture, peering.accepterVpcId);

    for (const requesterSubnet of requesterSubnets) {
      for (const accepterSubnet of accepterSubnets) {
        if (cidrOverlaps(requesterSubnet.cidr, accepterSubnet.cidr)) {
          issues.push(
            buildIssue({
              severity: "error",
              category: "peering",
              title: "Peered VPC CIDR overlap",
              message: `${requesterSubnet.name} overlaps with ${accepterSubnet.name}, so VPC peering assumptions are invalid.`,
              componentIds: [peering.id, requesterSubnet.id, accepterSubnet.id],
              recommendation: "Use non-overlapping subnet ranges before relying on VPC peering.",
            })
          );
        }
      }
    }
  }

  return issues;
}

export function validateDnsConfig(architecture: NetworkArchitecture) {
  const issues: ValidationIssue[] = [];
  const zones = getComponentsByKind<DnsZone>(architecture, "dnsZone");

  for (const zone of zones) {
    if (zone.visibility === "PRIVATE" && zone.vpcIds.length === 0) {
      issues.push(
        buildIssue({
          severity: "error",
          category: "dns",
          title: "Private DNS zone has no VPC association",
          message: `${zone.name} is private but is not associated with any VPC.`,
          componentIds: [zone.id],
          recommendation: "Associate private DNS zones with one or more VPC networks.",
        })
      );
    }

    for (const vpcId of zone.vpcIds) {
      if (!getVpcById(architecture, vpcId)) {
        issues.push(
          buildIssue({
            severity: "error",
            category: "dns",
            title: "DNS zone references a missing VPC",
            message: `${zone.name} references VPC ${vpcId}, which does not exist in the architecture.`,
            componentIds: [zone.id],
            recommendation: "Update the zone association or add the missing VPC component.",
          })
        );
      }
    }
  }

  return issues;
}

export function validateSecurityRisks(architecture: NetworkArchitecture) {
  const issues: ValidationIssue[] = [];
  const instances = getComponentsByKind<ComputeInstance>(architecture, "vmInstance");
  const rules = getComponentsByKind<FirewallRule>(architecture, "firewallRule");

  for (const instance of instances) {
    if (instance.hasExternalIp && instance.exposedPorts.includes(22)) {
      issues.push(
        buildIssue({
          severity: "warning",
          category: "security",
          title: "Public VM exposes SSH",
          message: `${instance.name} has an external IP and exposes SSH.`,
          componentIds: [instance.id],
          recommendation: "Use IAP, a bastion, or tightly scoped admin source ranges instead of broad public SSH access.",
        })
      );
    }
  }

  for (const rule of rules) {
    const opensAllTraffic =
      rule.action === "allow" &&
      rule.direction === "INGRESS" &&
      rule.protocol === "all" &&
      rule.sourceRanges.includes("0.0.0.0/0");

    if (opensAllTraffic) {
      issues.push(
        buildIssue({
          severity: "warning",
          category: "security",
          title: "Rule allows all internet traffic",
          message: `${rule.name} allows all protocols from the public internet.`,
          componentIds: [rule.id],
          recommendation: "Scope the rule to required protocols, ports, and trusted source ranges only.",
        })
      );
    }
  }

  const subnets = getComponentsByKind<Subnet>(architecture, "subnet");
  for (const subnet of subnets) {
    if (!isRfc1918Range(subnet.cidr)) {
      issues.push(
        buildIssue({
          severity: "info",
          category: "security",
          title: "Subnet uses non-RFC1918 space",
          message: `${subnet.name} uses ${subnet.cidr}, which is not RFC1918 private space.`,
          componentIds: [subnet.id],
          recommendation: "Use RFC1918 ranges by default unless you have a specific and documented reason not to.",
        })
      );
    }
  }

  return issues;
}

function validateTopology(architecture: NetworkArchitecture) {
  const issues: ValidationIssue[] = [];

  for (const component of architecture.components) {
    if (component.kind === "subnet") {
      if (!component.vpcId || !getVpcById(architecture, component.vpcId)) {
        issues.push(
          buildIssue({
            severity: "error",
            category: "topology",
            title: "Subnet has no valid VPC",
            message: `${component.name} is not attached to a valid VPC.`,
            componentIds: [component.id],
            recommendation: "Connect the subnet to a VPC and set its vpcId property.",
          })
        );
      }

      if (!isValidGoogleCloudSubnetCidr(component.cidr)) {
        issues.push(
          buildIssue({
            severity: "error",
            category: "cidr",
            title: "Invalid subnet CIDR",
            message: `${component.name} uses ${component.cidr}, which is not a valid Google Cloud subnet range.`,
            componentIds: [component.id],
            recommendation: "Use a network-aligned CIDR between /4 and /29 that avoids prohibited GCP ranges.",
          })
        );
      } else if (isGcpProhibitedSubnetRange(component.cidr)) {
        issues.push(
          buildIssue({
            severity: "error",
            category: "cidr",
            title: "Prohibited subnet range",
            message: `${component.name} uses ${component.cidr}, which overlaps a prohibited GCP subnet range.`,
            componentIds: [component.id],
            recommendation: "Choose a private RFC1918 range or another valid GCP subnet range.",
          })
        );
      }

      for (const range of component.secondaryRanges) {
        if (!parseCidr(range.cidr)) {
          issues.push(
            buildIssue({
              severity: "error",
              category: "cidr",
              title: "Invalid secondary CIDR",
              message: `${component.name} secondary range ${range.name} uses invalid CIDR ${range.cidr}.`,
              componentIds: [component.id],
              recommendation: "Use a network-aligned secondary range for Pods, Services, or alias IPs.",
            })
          );
        }
      }
    }

    if (component.kind === "vmInstance") {
      const subnet = getSubnetById(architecture, component.subnetId);
      if (!subnet) {
        issues.push(
          buildIssue({
            severity: "error",
            category: "topology",
            title: "VM has no subnet",
            message: `${component.name} is not attached to a valid subnet.`,
            componentIds: [component.id],
            recommendation: "Attach the VM to a subnet before simulating traffic or exporting IaC.",
          })
        );
      } else if (component.region && subnet.region && component.region !== subnet.region) {
        issues.push(
          buildIssue({
            severity: "warning",
            category: "topology",
            title: "Cross-region VM and subnet mismatch",
            message: `${component.name} is in ${component.region}, but its subnet is in ${subnet.region}.`,
            componentIds: [component.id, subnet.id],
            recommendation: "Use a subnet that belongs to the same region as the VM.",
          })
        );
      }

      if (component.zone && component.region && !component.zone.startsWith(`${component.region}-`)) {
        issues.push(
          buildIssue({
            severity: "warning",
            category: "topology",
            title: "VM zone does not match region",
            message: `${component.name} uses zone ${component.zone}, which does not align with region ${component.region}.`,
            componentIds: [component.id],
            recommendation: "Set the VM region and zone consistently.",
          })
        );
      }
    }

    if (component.kind === "cloudNat") {
      const router = getCloudRouterForNat(architecture, component);
      if (router && component.region && router.region && component.region !== router.region) {
        issues.push(
          buildIssue({
            severity: "error",
            category: "topology",
            title: "Cloud NAT and router region mismatch",
            message: `${component.name} is in ${component.region}, but its router ${router.name} is in ${router.region}.`,
            componentIds: [component.id, router.id],
            recommendation: "Cloud NAT and its Cloud Router should live in the same region.",
          })
        );
      }
    }

    if (component.kind === "vpnGateway") {
      const router = getCloudRouterForVpn(architecture, component);
      if (component.bgpEnabled && !router) {
        issues.push(
          buildIssue({
            severity: "error",
            category: "topology",
            title: "VPN gateway is missing Cloud Router",
            message: `${component.name} has BGP enabled but no Cloud Router attached.`,
            componentIds: [component.id],
            recommendation: "Attach a Cloud Router for HA VPN or BGP-based routing.",
          })
        );
      }
    }
  }

  for (const connection of architecture.connections) {
    if (!getComponentById(architecture, connection.sourceId) || !getComponentById(architecture, connection.targetId)) {
      issues.push(
        buildIssue({
          severity: "warning",
          category: "topology",
          title: "Dangling visual connection",
          message: `Connection ${connection.id} references a missing source or target component.`,
          componentIds: [],
          recommendation: "Remove stale canvas connections after deleting components.",
        })
      );
    }
  }

  return issues;
}

export function validateArchitecture(architecture: NetworkArchitecture) {
  const issues = [
    ...validateTopology(architecture),
    ...validateCidrOverlap(architecture),
    ...validateFirewallRules(architecture),
    ...validateNatRequirements(architecture),
    ...validateVpcPeering(architecture),
    ...validateDnsConfig(architecture),
    ...validateSecurityRisks(architecture),
  ];

  return issues.sort((left, right) => {
    const severityRank: Record<ValidationSeverity, number> = {
      error: 0,
      warning: 1,
      info: 2,
    };

    return severityRank[left.severity] - severityRank[right.severity];
  });
}
