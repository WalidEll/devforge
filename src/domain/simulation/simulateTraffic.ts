import type {
  ComputeInstance,
  FirewallDirection,
  GcpComponent,
  NetworkArchitecture,
  SimulationRequest,
  SimulationResult,
  SimulationHop,
  VpcPeering,
} from "@/domain/models/gcp-network";
import {
  getCloudRouterForVpn,
  getComponentById,
  getNatForSubnet,
  getPeeringBetweenVpcs,
  getSubnetById,
  getVpcById,
} from "@/domain/models/selectors";
import { evaluateFirewallRules } from "./firewall";
import { firstUsableIp, representativeIpFromCidr } from "@/domain/validation/cidr";

interface RouteResolution {
  path: SimulationHop[];
  natUsed: boolean;
  publicPath: boolean;
  sourceIp?: string;
  destinationIp?: string;
  warnings: string[];
}

function hop(component: GcpComponent): SimulationHop {
  return {
    componentId: component.id,
    label: component.name,
    kind: component.kind,
  };
}

function zoneMatchesRegion(zone: string, region?: string) {
  return region ? zone.startsWith(`${region}-`) : true;
}

function instanceInternalIp(architecture: NetworkArchitecture, instance: ComputeInstance) {
  if (instance.internalIp) return instance.internalIp;
  const subnet = getSubnetById(architecture, instance.subnetId);
  return subnet ? representativeIpFromCidr(subnet.cidr) ?? firstUsableIp(subnet.cidr) : undefined;
}

export function determineNatPath(architecture: NetworkArchitecture, instance: ComputeInstance) {
  const subnet = getSubnetById(architecture, instance.subnetId);
  if (!subnet) return { nat: undefined, warning: "VM has no subnet, so NAT resolution cannot be determined." };

  if (instance.hasExternalIp) {
    return { nat: undefined, warning: undefined };
  }

  const nat = getNatForSubnet(architecture, subnet);
  if (!nat) {
    return { nat: undefined, warning: "Private VM has no Cloud NAT path for internet egress." };
  }

  return { nat, warning: undefined };
}

export function resolveRoute(
  architecture: NetworkArchitecture,
  request: SimulationRequest
): RouteResolution {
  const warnings: string[] = [];
  const source = getComponentById(architecture, request.sourceComponentId);
  const destination = getComponentById(architecture, request.destinationComponentId);

  if (!source || !destination) {
    return {
      path: [],
      natUsed: false,
      publicPath: false,
      warnings: ["Source or destination component could not be resolved."],
    };
  }

  if (source.kind === "vmInstance" && destination.kind === "internet") {
    const subnet = getSubnetById(architecture, source.subnetId);
    const vpc = getVpcById(architecture, source.vpcId ?? subnet?.vpcId);
    const { nat, warning } = determineNatPath(architecture, source);

    if (warning) warnings.push(warning);

    const path = [hop(source)];
    if (subnet) path.push(hop(subnet));
    if (vpc) path.push(hop(vpc));
    if (nat) path.push(hop(nat));
    path.push(hop(destination));

    return {
      path,
      natUsed: Boolean(nat),
      publicPath: source.hasExternalIp || Boolean(nat),
      sourceIp: instanceInternalIp(architecture, source),
      destinationIp: "8.8.8.8",
      warnings,
    };
  }

  if (source.kind === "internet" && destination.kind === "vmInstance") {
    const subnet = getSubnetById(architecture, destination.subnetId);
    const vpc = getVpcById(architecture, destination.vpcId ?? subnet?.vpcId);
    const path = [hop(source)];
    if (vpc) path.push(hop(vpc));
    if (subnet) path.push(hop(subnet));
    path.push(hop(destination));

    return {
      path,
      natUsed: false,
      publicPath: true,
      sourceIp: request.sourceIpOverride ?? "8.8.8.8",
      destinationIp: instanceInternalIp(architecture, destination),
      warnings,
    };
  }

  if (source.kind === "vmInstance" && destination.kind === "vmInstance") {
    const sourceSubnet = getSubnetById(architecture, source.subnetId);
    const destinationSubnet = getSubnetById(architecture, destination.subnetId);
    const sourceVpc = getVpcById(architecture, source.vpcId ?? sourceSubnet?.vpcId);
    const destinationVpc = getVpcById(architecture, destination.vpcId ?? destinationSubnet?.vpcId);

    const path = [hop(source)];
    if (sourceSubnet) path.push(hop(sourceSubnet));
    if (sourceVpc) path.push(hop(sourceVpc));

    const peering: VpcPeering | undefined =
      sourceVpc && destinationVpc && sourceVpc.id !== destinationVpc.id
        ? getPeeringBetweenVpcs(architecture, sourceVpc.id, destinationVpc.id)
        : undefined;

    if (sourceVpc && destinationVpc && sourceVpc.id !== destinationVpc.id) {
      if (peering) {
        path.push(hop(peering));
      } else {
        warnings.push("Cross-VPC traffic requires VPC peering or another explicit connectivity path.");
      }
    }

    if (destinationVpc && (!sourceVpc || sourceVpc.id !== destinationVpc.id)) {
      path.push(hop(destinationVpc));
    }
    if (destinationSubnet && (!sourceSubnet || sourceSubnet.id !== destinationSubnet.id)) {
      path.push(hop(destinationSubnet));
    }
    path.push(hop(destination));

    return {
      path,
      natUsed: false,
      publicPath: false,
      sourceIp: instanceInternalIp(architecture, source),
      destinationIp: instanceInternalIp(architecture, destination),
      warnings,
    };
  }

  if (source.kind === "onPremNetwork" && destination.kind === "vmInstance") {
    const destinationSubnet = getSubnetById(architecture, destination.subnetId);
    const destinationVpc = getVpcById(architecture, destination.vpcId ?? destinationSubnet?.vpcId);
    const vpn = architecture.components.find(
      (component) => component.kind === "vpnGateway" && component.vpcId === destinationVpc?.id
    );

    const path = [hop(source)];
    if (vpn) {
      path.push(hop(vpn));
      if (vpn.kind === "vpnGateway" && vpn.bgpEnabled && !getCloudRouterForVpn(architecture, vpn)) {
        warnings.push("VPN gateway has BGP enabled but no Cloud Router is attached.");
      }
    } else {
      warnings.push("On-prem traffic has no VPN gateway path into the destination VPC.");
    }

    if (destinationVpc) path.push(hop(destinationVpc));
    if (destinationSubnet) path.push(hop(destinationSubnet));
    path.push(hop(destination));

    return {
      path,
      natUsed: false,
      publicPath: false,
      sourceIp: representativeIpFromCidr(source.cidr) ?? firstUsableIp(source.cidr),
      destinationIp: instanceInternalIp(architecture, destination),
      warnings,
    };
  }

  return {
    path: [hop(source), hop(destination)],
    natUsed: false,
    publicPath: source.kind === "internet" || destination.kind === "internet",
    warnings: ["This traffic path is not fully modeled in the MVP simulation engine yet."],
  };
}

export function generateSimulationExplanation(result: {
  request: SimulationRequest;
  source?: GcpComponent;
  destination?: GcpComponent;
  firewallDirection: FirewallDirection;
  route: RouteResolution;
  firewallEvaluation?: ReturnType<typeof evaluateFirewallRules>;
  routeAllowed: boolean;
}) {
  const { request, source, destination, firewallDirection, route, firewallEvaluation, routeAllowed } = result;

  if (!source || !destination) {
    return "The simulator could not resolve the selected source or destination component.";
  }

  const routeSummary = route.path.map((item) => item.label).join(" -> ");
  const firewallSummary = firewallEvaluation?.matchingRule
    ? `Matched firewall rule ${firewallEvaluation.matchingRule.name}.`
    : firewallDirection === "EGRESS"
      ? "No explicit egress rule matched, so the implied allow egress rule was used."
      : "No ingress allow rule matched, so the implied deny ingress rule applied.";

  const natSummary = route.natUsed
    ? "Traffic uses Cloud NAT for internet egress."
    : request.destinationComponentId === destination.id && destination.kind === "internet"
      ? "Traffic does not use Cloud NAT."
      : "No NAT was required for this path.";

  if (!routeAllowed) {
    return `Traffic from ${source.name} to ${destination.name} is denied. ${firewallSummary} Route path attempted: ${routeSummary}. ${natSummary}`;
  }

  return `Traffic from ${source.name} to ${destination.name} is allowed. ${firewallSummary} Route path: ${routeSummary}. ${natSummary}`;
}

export function simulateTraffic(
  architecture: NetworkArchitecture,
  request: SimulationRequest
): SimulationResult {
  const source = getComponentById(architecture, request.sourceComponentId);
  const destination = getComponentById(architecture, request.destinationComponentId);
  const route = resolveRoute(architecture, request);
  const warnings = [...route.warnings];
  const recommendations: string[] = [];

  if (!source || !destination) {
    return {
      allowed: false,
      routePath: route.path,
      natUsed: route.natUsed,
      publicPath: route.publicPath,
      warnings,
      recommendations: ["Select valid source and destination components."],
      explanation: "The simulator could not resolve the selected traffic endpoints.",
    };
  }

  let firewallDirection: FirewallDirection = request.direction === "ingress" ? "INGRESS" : "EGRESS";
  let firewallEvaluation: ReturnType<typeof evaluateFirewallRules> | undefined;
  let routeAllowed = true;

  if (source.kind === "internet" && destination.kind === "vmInstance") {
    firewallDirection = "INGRESS";

    if (!destination.hasExternalIp) {
      routeAllowed = false;
      warnings.push("Destination VM has no external IP, so direct public ingress is not available.");
      recommendations.push("Add an external load balancer or external IP if public ingress is required.");
    }

    firewallEvaluation = evaluateFirewallRules({
      architecture,
      instance: destination,
      direction: "INGRESS",
      sourceIp: route.sourceIp,
      destinationIp: route.destinationIp,
      protocol: request.protocol,
      port: request.port,
    });
  } else if (source.kind === "vmInstance" && destination.kind === "internet") {
    firewallDirection = "EGRESS";
    firewallEvaluation = evaluateFirewallRules({
      architecture,
      instance: source,
      direction: "EGRESS",
      sourceIp: route.sourceIp,
      destinationIp: route.destinationIp,
      protocol: request.protocol,
      port: request.port,
    });

    if (!source.hasExternalIp && !route.natUsed) {
      routeAllowed = false;
      recommendations.push("Attach Cloud NAT or give the VM a controlled public egress path.");
    }
  } else if (source.kind === "vmInstance" && destination.kind === "vmInstance") {
    if (!zoneMatchesRegion(source.zone, source.region) || !zoneMatchesRegion(destination.zone, destination.region)) {
      warnings.push("One or more VMs use a zone that does not align with the configured region.");
    }

    firewallEvaluation = evaluateFirewallRules({
      architecture,
      instance: destination,
      direction: "INGRESS",
      sourceIp: route.sourceIp,
      destinationIp: route.destinationIp,
      protocol: request.protocol,
      port: request.port,
    });
  } else {
    warnings.push("This traffic path is approximated for educational use and may omit GCP-specific edge cases.");
  }

  const allowed = routeAllowed && (firewallEvaluation?.allowed ?? true);

  if (!allowed && source.kind === "internet" && destination.kind === "vmInstance") {
    recommendations.push("Check ingress firewall source ranges, target tags, and the VM external exposure model.");
  }

  if (!allowed && source.kind === "vmInstance" && destination.kind === "internet") {
    recommendations.push("Check egress firewall rules and whether Cloud NAT is attached to the source subnet.");
  }

  if (source.kind === "vmInstance" && destination.kind === "internet" && route.natUsed) {
    recommendations.push("Confirm Cloud NAT is intentionally scoped to this subnet and region.");
  }

  return {
    allowed,
    matchingFirewallRuleId: firewallEvaluation?.matchingRule?.id,
    routePath: route.path,
    natUsed: route.natUsed,
    publicPath: route.publicPath,
    warnings,
    recommendations,
    explanation: generateSimulationExplanation({
      request,
      source,
      destination,
      firewallDirection,
      route,
      firewallEvaluation,
      routeAllowed,
    }),
  };
}
