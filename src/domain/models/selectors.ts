import type {
  CloudNat,
  CloudRouter,
  ComputeInstance,
  DnsZone,
  FirewallRule,
  GcpComponent,
  GcpComponentKind,
  GkeCluster,
  NetworkArchitecture,
  Subnet,
  VpcNetwork,
  VpcPeering,
  VpnGateway,
} from "./gcp-network";

interface RepresentativeCidrComponent {
  id: string;
  label: string;
  cidr: string;
  kind: "subnet" | "onPremNetwork";
  parentId?: string;
}

export function getComponentById<T extends GcpComponent = GcpComponent>(
  architecture: NetworkArchitecture,
  componentId: string
) {
  return architecture.components.find((component) => component.id === componentId) as T | undefined;
}

export function getComponentsByKind<T extends GcpComponent = GcpComponent>(
  architecture: NetworkArchitecture,
  kind: GcpComponentKind
) {
  return architecture.components.filter((component) => component.kind === kind) as T[];
}

export function getVpcById(architecture: NetworkArchitecture, vpcId?: string) {
  return vpcId ? getComponentById<VpcNetwork>(architecture, vpcId) : undefined;
}

export function getSubnetById(architecture: NetworkArchitecture, subnetId?: string) {
  return subnetId ? getComponentById<Subnet>(architecture, subnetId) : undefined;
}

export function getRouterById(architecture: NetworkArchitecture, routerId?: string) {
  return routerId ? getComponentById<CloudRouter>(architecture, routerId) : undefined;
}

export function getFirewallRulesForVpc(architecture: NetworkArchitecture, vpcId?: string) {
  return getComponentsByKind<FirewallRule>(architecture, "firewallRule").filter(
    (rule) => rule.vpcId && vpcId && rule.vpcId === vpcId
  );
}

export function getSubnetsForVpc(architecture: NetworkArchitecture, vpcId?: string) {
  return getComponentsByKind<Subnet>(architecture, "subnet").filter(
    (subnet) => subnet.vpcId && vpcId && subnet.vpcId === vpcId
  );
}

export function getInstancesForSubnet(architecture: NetworkArchitecture, subnetId?: string) {
  return getComponentsByKind<ComputeInstance>(architecture, "vmInstance").filter(
    (instance) => instance.subnetId && subnetId && instance.subnetId === subnetId
  );
}

export function getDnsZonesForVpc(architecture: NetworkArchitecture, vpcId?: string) {
  return getComponentsByKind<DnsZone>(architecture, "dnsZone").filter(
    (zone) => zone.visibility === "PRIVATE" && vpcId !== undefined && zone.vpcIds.includes(vpcId)
  );
}

export function getNatsForVpc(architecture: NetworkArchitecture, vpcId?: string) {
  return getComponentsByKind<CloudNat>(architecture, "cloudNat").filter(
    (nat) => nat.vpcId && vpcId && nat.vpcId === vpcId
  );
}

export function getNatForSubnet(architecture: NetworkArchitecture, subnet?: Subnet) {
  if (!subnet?.vpcId) return undefined;

  return getNatsForVpc(architecture, subnet.vpcId).find((nat) => {
    if (nat.region !== subnet.region) return false;
    if (nat.appliesToAllSubnets) return true;
    return nat.subnetIds.includes(subnet.id);
  });
}

export function getVpcForInstance(architecture: NetworkArchitecture, instance: ComputeInstance) {
  const subnet = getSubnetById(architecture, instance.subnetId);
  return subnet?.vpcId ? getVpcById(architecture, subnet.vpcId) : undefined;
}

export function getPeeringBetweenVpcs(
  architecture: NetworkArchitecture,
  requesterVpcId?: string,
  accepterVpcId?: string
) {
  return getComponentsByKind<VpcPeering>(architecture, "vpcPeering").find((peering) => {
    const direct =
      peering.requesterVpcId === requesterVpcId && peering.accepterVpcId === accepterVpcId;
    const reverse =
      peering.requesterVpcId === accepterVpcId && peering.accepterVpcId === requesterVpcId;
    return direct || reverse;
  });
}

export function getCloudRouterForNat(architecture: NetworkArchitecture, nat: CloudNat) {
  return nat.routerId ? getRouterById(architecture, nat.routerId) : undefined;
}

export function getCloudRouterForVpn(architecture: NetworkArchitecture, vpn: VpnGateway) {
  return vpn.cloudRouterId ? getRouterById(architecture, vpn.cloudRouterId) : undefined;
}

export function getRepresentativeCidrComponents(
  architecture: NetworkArchitecture
): RepresentativeCidrComponent[] {
  return architecture.components.reduce<RepresentativeCidrComponent[]>((accumulator, component) => {
    if (component.kind === "subnet") {
      accumulator.push(
        {
          id: component.id,
          label: component.name,
          cidr: component.cidr,
          kind: component.kind,
          parentId: component.vpcId,
        },
        ...component.secondaryRanges.map(
          (range): RepresentativeCidrComponent => ({
            id: `${component.id}:${range.name}`,
            label: `${component.name} / ${range.name}`,
            cidr: range.cidr,
            kind: component.kind,
            parentId: component.vpcId,
          })
        )
      );
      return accumulator;
    }

    if (component.kind === "onPremNetwork") {
      accumulator.push({
        id: component.id,
        label: component.name,
        cidr: component.cidr,
        kind: component.kind,
        parentId: undefined,
      });
      return accumulator;
    }

    return accumulator;
  }, []);
}

export function listRegions(architecture: NetworkArchitecture) {
  return Array.from(
    new Set(
      architecture.components
        .map((component) => component.region)
        .filter((region): region is string => Boolean(region))
    )
  );
}

export function getClusterSubnet(architecture: NetworkArchitecture, cluster: GkeCluster) {
  return getSubnetById(architecture, cluster.subnetId);
}
