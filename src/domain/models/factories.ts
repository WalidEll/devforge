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
  NetworkConnection,
  OnPremNetwork,
  PrivateServiceConnect,
  Subnet,
  VpcNetwork,
  VpcPeering,
  VpnGateway,
} from "./gcp-network";

function nextName(kind: GcpComponentKind) {
  return `new-${kind}`;
}

export function createDefaultComponent(kind: GcpComponentKind, position: { x: number; y: number }): GcpComponent {
  const base = {
    id: crypto.randomUUID(),
    kind,
    name: nextName(kind),
    label: nextName(kind),
    position,
  } as const;

  switch (kind) {
    case "project":
      return {
        ...base,
        kind,
        name: "devforge-project",
        label: "Project",
        projectId: "devforge-sandbox",
        environment: "dev",
      };
    case "vpc":
      return {
        ...base,
        kind,
        name: "core-vpc",
        label: "VPC",
        routingMode: "REGIONAL",
        autoCreateSubnetworks: false,
        mtu: 1460,
        isSharedVpcHost: false,
      } satisfies VpcNetwork;
    case "subnet":
      return {
        ...base,
        kind,
        name: "app-subnet",
        label: "Subnet",
        region: "us-central1",
        cidr: "10.10.0.0/24",
        purpose: "GENERAL",
        privateGoogleAccess: true,
        flowLogs: true,
        secondaryRanges: [],
      } satisfies Subnet;
    case "vmInstance":
      return {
        ...base,
        kind,
        name: "app-vm-01",
        label: "VM",
        region: "us-central1",
        zone: "us-central1-a",
        machineType: "e2-medium",
        hasExternalIp: false,
        networkTags: ["app"],
        needsInternetEgress: true,
        exposedPorts: [443],
      } satisfies ComputeInstance;
    case "firewallRule":
      return {
        ...base,
        kind,
        name: "allow-app-https",
        label: "Firewall",
        priority: 1000,
        direction: "INGRESS",
        action: "allow",
        sourceRanges: ["0.0.0.0/0"],
        destinationRanges: [],
        targetTags: ["app"],
        targetServiceAccounts: [],
        protocol: "tcp",
        ports: [443],
        loggingEnabled: true,
        disabled: false,
      } satisfies FirewallRule;
    case "cloudRouter":
      return {
        ...base,
        kind,
        name: "core-router",
        label: "Cloud Router",
        region: "us-central1",
        bgpAsn: 64514,
        advertisedMode: "DEFAULT",
      } satisfies CloudRouter;
    case "cloudNat":
      return {
        ...base,
        kind,
        name: "core-nat",
        label: "Cloud NAT",
        region: "us-central1",
        subnetIds: [],
        appliesToAllSubnets: false,
        natIpAllocateOption: "AUTO_ONLY",
      } satisfies CloudNat;
    case "loadBalancer":
      return {
        ...base,
        kind,
        name: "public-lb",
        label: "Load Balancer",
        region: "us-central1",
        scheme: "EXTERNAL",
        ports: [80, 443],
        backendIds: [],
      };
    case "dnsZone":
      return {
        ...base,
        kind,
        name: "internal-zone",
        label: "DNS Zone",
        domain: "corp.internal.",
        visibility: "PRIVATE",
        vpcIds: [],
      } satisfies DnsZone;
    case "privateServiceConnect":
      return {
        ...base,
        kind,
        name: "psc-endpoint",
        label: "PSC",
        region: "us-central1",
      } satisfies PrivateServiceConnect;
    case "vpcPeering":
      return {
        ...base,
        kind,
        name: "vpc-peering",
        label: "Peering",
        exportCustomRoutes: true,
        importCustomRoutes: true,
      } satisfies VpcPeering;
    case "vpnGateway":
      return {
        ...base,
        kind,
        name: "ha-vpn",
        label: "VPN Gateway",
        region: "us-central1",
        tunnelMode: "HA",
        bgpEnabled: true,
      } satisfies VpnGateway;
    case "gkeCluster":
      return {
        ...base,
        kind,
        name: "gke-cluster",
        label: "GKE",
        region: "us-central1",
        maxPodsPerNode: 110,
        privateNodes: true,
      } satisfies GkeCluster;
    case "internet":
      return {
        ...base,
        kind,
        name: "internet",
        label: "Internet",
      };
    case "onPremNetwork":
      return {
        ...base,
        kind,
        name: "onprem-dc",
        label: "On-prem",
        cidr: "172.16.0.0/16",
        location: "datacenter-a",
      } satisfies OnPremNetwork;
  }
}

export function createConnection(sourceId: string, targetId: string): NetworkConnection {
  return {
    id: crypto.randomUUID(),
    sourceId,
    targetId,
    kind: "attachment",
  };
}

export function applyConnectionInference(
  architecture: NetworkArchitecture,
  sourceId: string,
  targetId: string
) {
  const source = architecture.components.find((component) => component.id === sourceId);
  const target = architecture.components.find((component) => component.id === targetId);

  if (!source || !target) return architecture;

  return {
    ...architecture,
    components: architecture.components.map((component) => {
      if (component.id === target.id) {
        if (source.kind === "project" && target.kind === "vpc") {
          return { ...target, projectRef: source.id };
        }

        if (source.kind === "vpc" && target.kind === "subnet") {
          return { ...target, vpcId: source.id, region: target.region ?? source.region ?? "us-central1" };
        }

        if (source.kind === "subnet" && target.kind === "vmInstance") {
          return { ...target, subnetId: source.id, vpcId: source.vpcId, region: source.region };
        }

        if (source.kind === "subnet" && target.kind === "gkeCluster") {
          return { ...target, subnetId: source.id, vpcId: source.vpcId, region: source.region };
        }

        if (source.kind === "vpc" && target.kind === "firewallRule") {
          return { ...target, vpcId: source.id };
        }

        if (source.kind === "vpc" && target.kind === "cloudRouter") {
          return { ...target, vpcId: source.id, region: target.region ?? source.region ?? "us-central1" };
        }

        if (source.kind === "vpc" && target.kind === "cloudNat") {
          return { ...target, vpcId: source.id, region: target.region ?? source.region ?? "us-central1" };
        }

        if (source.kind === "cloudRouter" && target.kind === "cloudNat") {
          return {
            ...target,
            routerId: source.id,
            vpcId: target.vpcId ?? source.vpcId,
            region: target.region ?? source.region,
          };
        }

        if (source.kind === "subnet" && target.kind === "cloudNat") {
          return {
            ...target,
            subnetIds: target.subnetIds.includes(source.id) ? target.subnetIds : [...target.subnetIds, source.id],
            vpcId: target.vpcId ?? source.vpcId,
            region: target.region ?? source.region,
          };
        }

        if (source.kind === "vpc" && target.kind === "dnsZone" && target.visibility === "PRIVATE") {
          return {
            ...target,
            vpcIds: target.vpcIds.includes(source.id) ? target.vpcIds : [...target.vpcIds, source.id],
          };
        }

        if (source.kind === "vpc" && target.kind === "vpnGateway") {
          return { ...target, vpcId: source.id, region: target.region ?? source.region ?? "us-central1" };
        }

        if (source.kind === "cloudRouter" && target.kind === "vpnGateway") {
          return { ...target, cloudRouterId: source.id, vpcId: target.vpcId ?? source.vpcId, region: target.region ?? source.region };
        }
      }

      if (component.id === source.id) {
        if (source.kind === "vpcPeering" && target.kind === "vpc") {
          if (!source.requesterVpcId) {
            return { ...source, requesterVpcId: target.id };
          }

          if (!source.accepterVpcId && source.requesterVpcId !== target.id) {
            return { ...source, accepterVpcId: target.id };
          }
        }

        if (source.kind === "privateServiceConnect" && target.kind === "vpc") {
          if (!source.consumerVpcId) {
            return { ...source, consumerVpcId: target.id };
          }
        }
      }

      return component;
    }),
  };
}
