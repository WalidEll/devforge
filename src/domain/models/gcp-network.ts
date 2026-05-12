export type PlannerEnvironment = "dev" | "staging" | "prod" | "shared";
export type FirewallDirection = "INGRESS" | "EGRESS";
export type FirewallAction = "allow" | "deny";
export type NetworkProtocol = "tcp" | "udp" | "icmp" | "all";
export type SimulationDirection = "ingress" | "egress";
export type ValidationSeverity = "error" | "warning" | "info";
export type ValidationCategory =
  | "cidr"
  | "firewall"
  | "nat"
  | "dns"
  | "peering"
  | "topology"
  | "security"
  | "simulation";

export type GcpComponentKind =
  | "project"
  | "vpc"
  | "subnet"
  | "vmInstance"
  | "firewallRule"
  | "cloudRouter"
  | "cloudNat"
  | "loadBalancer"
  | "dnsZone"
  | "privateServiceConnect"
  | "vpcPeering"
  | "vpnGateway"
  | "gkeCluster"
  | "internet"
  | "onPremNetwork";

export interface CanvasPosition {
  x: number;
  y: number;
}

export interface NamedSecondaryRange {
  name: string;
  cidr: string;
  usage: "pods" | "services" | "alias" | "private-service-connect" | "other";
}

export interface BaseComponent {
  id: string;
  kind: GcpComponentKind;
  name: string;
  label: string;
  description?: string;
  position: CanvasPosition;
  region?: string;
  tags?: string[];
}

export interface GcpProject extends BaseComponent {
  kind: "project";
  projectId: string;
  environment: PlannerEnvironment;
}

export interface VpcNetwork extends BaseComponent {
  kind: "vpc";
  projectRef?: string;
  routingMode: "REGIONAL" | "GLOBAL";
  autoCreateSubnetworks: boolean;
  mtu: number;
  isSharedVpcHost: boolean;
}

export interface Subnet extends BaseComponent {
  kind: "subnet";
  vpcId?: string;
  cidr: string;
  purpose: "PRIVATE" | "PUBLIC" | "GKE" | "PROXY" | "GENERAL";
  privateGoogleAccess: boolean;
  flowLogs: boolean;
  secondaryRanges: NamedSecondaryRange[];
}

export interface ComputeInstance extends BaseComponent {
  kind: "vmInstance";
  vpcId?: string;
  subnetId?: string;
  zone: string;
  machineType: string;
  internalIp?: string;
  hasExternalIp: boolean;
  networkTags: string[];
  serviceAccount?: string;
  needsInternetEgress: boolean;
  exposedPorts: number[];
}

export interface FirewallRule extends BaseComponent {
  kind: "firewallRule";
  vpcId?: string;
  priority: number;
  direction: FirewallDirection;
  action: FirewallAction;
  sourceRanges: string[];
  destinationRanges: string[];
  targetTags: string[];
  targetServiceAccounts: string[];
  protocol: NetworkProtocol;
  ports: number[];
  loggingEnabled: boolean;
  disabled: boolean;
}

export interface CloudRouter extends BaseComponent {
  kind: "cloudRouter";
  vpcId?: string;
  bgpAsn: number;
  advertisedMode: "DEFAULT" | "CUSTOM";
}

export interface CloudNat extends BaseComponent {
  kind: "cloudNat";
  vpcId?: string;
  routerId?: string;
  subnetIds: string[];
  appliesToAllSubnets: boolean;
  natIpAllocateOption: "AUTO_ONLY" | "MANUAL_ONLY";
}

export interface LoadBalancer extends BaseComponent {
  kind: "loadBalancer";
  vpcId?: string;
  scheme: "EXTERNAL" | "INTERNAL";
  ports: number[];
  backendIds: string[];
}

export interface DnsZone extends BaseComponent {
  kind: "dnsZone";
  domain: string;
  visibility: "PUBLIC" | "PRIVATE";
  vpcIds: string[];
}

export interface PrivateServiceConnect extends BaseComponent {
  kind: "privateServiceConnect";
  region: string;
  producerVpcId?: string;
  consumerVpcId?: string;
}

export interface VpcPeering extends BaseComponent {
  kind: "vpcPeering";
  requesterVpcId?: string;
  accepterVpcId?: string;
  exportCustomRoutes: boolean;
  importCustomRoutes: boolean;
}

export interface VpnGateway extends BaseComponent {
  kind: "vpnGateway";
  vpcId?: string;
  cloudRouterId?: string;
  tunnelMode: "CLASSIC" | "HA";
  peerIp?: string;
  bgpEnabled: boolean;
}

export interface GkeCluster extends BaseComponent {
  kind: "gkeCluster";
  vpcId?: string;
  subnetId?: string;
  podSecondaryRangeName?: string;
  serviceSecondaryRangeName?: string;
  maxPodsPerNode: number;
  privateNodes: boolean;
}

export interface InternetGateway extends BaseComponent {
  kind: "internet";
}

export interface OnPremNetwork extends BaseComponent {
  kind: "onPremNetwork";
  cidr: string;
  location: string;
}

export type GcpComponent =
  | GcpProject
  | VpcNetwork
  | Subnet
  | ComputeInstance
  | FirewallRule
  | CloudRouter
  | CloudNat
  | LoadBalancer
  | DnsZone
  | PrivateServiceConnect
  | VpcPeering
  | VpnGateway
  | GkeCluster
  | InternetGateway
  | OnPremNetwork;

export interface NetworkConnection {
  id: string;
  sourceId: string;
  targetId: string;
  kind: "attachment" | "dependency" | "routing" | "peering" | "vpn" | "reference";
  label?: string;
}

export interface NetworkArchitecture {
  version: string;
  name: string;
  description?: string;
  components: GcpComponent[];
  connections: NetworkConnection[];
}

export interface SimulationRequest {
  sourceComponentId: string;
  destinationComponentId: string;
  protocol: Exclude<NetworkProtocol, "all">;
  port?: number;
  direction: SimulationDirection;
  sourceIpOverride?: string;
}

export interface SimulationHop {
  componentId: string;
  label: string;
  kind: GcpComponentKind;
}

export interface SimulationResult {
  allowed: boolean;
  matchingFirewallRuleId?: string;
  routePath: SimulationHop[];
  natUsed: boolean;
  publicPath: boolean;
  warnings: string[];
  recommendations: string[];
  explanation: string;
}

export interface ValidationIssue {
  id: string;
  severity: ValidationSeverity;
  category: ValidationCategory;
  title: string;
  message: string;
  componentIds: string[];
  recommendation?: string;
}

export interface ComponentCatalogEntry {
  kind: GcpComponentKind;
  label: string;
  shortLabel: string;
  category: "Core" | "Security" | "Connectivity" | "Platform" | "External";
  colorClass: string;
  mvpReady: boolean;
  description: string;
}

export const COMPONENT_CATALOG: ComponentCatalogEntry[] = [
  {
    kind: "project",
    label: "Project",
    shortLabel: "PRJ",
    category: "Core",
    colorClass: "from-slate-500 to-slate-700",
    mvpReady: true,
    description: "Top-level GCP project boundary.",
  },
  {
    kind: "vpc",
    label: "VPC",
    shortLabel: "VPC",
    category: "Core",
    colorClass: "from-blue-500 to-indigo-600",
    mvpReady: true,
    description: "Global GCP Virtual Private Cloud network.",
  },
  {
    kind: "subnet",
    label: "Subnet",
    shortLabel: "SNET",
    category: "Core",
    colorClass: "from-cyan-500 to-blue-500",
    mvpReady: true,
    description: "Regional subnet with primary and optional secondary ranges.",
  },
  {
    kind: "vmInstance",
    label: "VM Instance",
    shortLabel: "VM",
    category: "Core",
    colorClass: "from-emerald-500 to-teal-600",
    mvpReady: true,
    description: "Compute Engine instance.",
  },
  {
    kind: "firewallRule",
    label: "Firewall Rule",
    shortLabel: "FW",
    category: "Security",
    colorClass: "from-amber-500 to-orange-600",
    mvpReady: true,
    description: "GCP VPC firewall rule.",
  },
  {
    kind: "cloudRouter",
    label: "Cloud Router",
    shortLabel: "RTR",
    category: "Connectivity",
    colorClass: "from-fuchsia-500 to-violet-600",
    mvpReady: true,
    description: "Cloud Router for BGP, VPN, and NAT.",
  },
  {
    kind: "cloudNat",
    label: "Cloud NAT",
    shortLabel: "NAT",
    category: "Connectivity",
    colorClass: "from-pink-500 to-rose-600",
    mvpReady: true,
    description: "Outbound internet access for private workloads.",
  },
  {
    kind: "loadBalancer",
    label: "Load Balancer",
    shortLabel: "LB",
    category: "Connectivity",
    colorClass: "from-violet-500 to-purple-600",
    mvpReady: false,
    description: "External or internal load balancer.",
  },
  {
    kind: "dnsZone",
    label: "Cloud DNS Zone",
    shortLabel: "DNS",
    category: "Platform",
    colorClass: "from-lime-500 to-green-600",
    mvpReady: false,
    description: "Public or private DNS zone.",
  },
  {
    kind: "privateServiceConnect",
    label: "Private Service Connect",
    shortLabel: "PSC",
    category: "Connectivity",
    colorClass: "from-indigo-500 to-purple-500",
    mvpReady: false,
    description: "Private service connectivity endpoint.",
  },
  {
    kind: "vpcPeering",
    label: "VPC Peering",
    shortLabel: "PEER",
    category: "Connectivity",
    colorClass: "from-sky-500 to-blue-600",
    mvpReady: false,
    description: "Private connectivity between VPCs.",
  },
  {
    kind: "vpnGateway",
    label: "VPN Gateway",
    shortLabel: "VPN",
    category: "Connectivity",
    colorClass: "from-orange-500 to-red-600",
    mvpReady: false,
    description: "Classic or HA VPN gateway.",
  },
  {
    kind: "gkeCluster",
    label: "GKE Cluster",
    shortLabel: "GKE",
    category: "Platform",
    colorClass: "from-emerald-500 to-green-700",
    mvpReady: false,
    description: "VPC-native GKE cluster with alias IPs.",
  },
  {
    kind: "internet",
    label: "External Internet",
    shortLabel: "NET",
    category: "External",
    colorClass: "from-gray-500 to-gray-700",
    mvpReady: true,
    description: "Public internet entry or egress path.",
  },
  {
    kind: "onPremNetwork",
    label: "On-prem Network",
    shortLabel: "LAN",
    category: "External",
    colorClass: "from-stone-500 to-stone-700",
    mvpReady: false,
    description: "On-premises connected network.",
  },
];

export const REGION_OPTIONS = [
  "us-central1",
  "us-east1",
  "us-west1",
  "europe-west1",
  "europe-west4",
  "asia-southeast1",
  "asia-northeast1",
];

export const ZONE_OPTIONS = [
  "us-central1-a",
  "us-central1-b",
  "us-east1-b",
  "us-west1-a",
  "europe-west1-b",
  "europe-west4-b",
  "asia-southeast1-a",
];
