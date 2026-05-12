import { z } from "zod";

const positionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

const secondaryRangeSchema = z.object({
  name: z.string().min(1),
  cidr: z.string().min(1),
  usage: z.enum(["pods", "services", "alias", "private-service-connect", "other"]),
});

const baseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  label: z.string().min(1),
  description: z.string().optional(),
  position: positionSchema,
  region: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const projectSchema = baseSchema.extend({
  kind: z.literal("project"),
  projectId: z.string().min(1),
  environment: z.enum(["dev", "staging", "prod", "shared"]),
});

export const vpcSchema = baseSchema.extend({
  kind: z.literal("vpc"),
  projectRef: z.string().optional(),
  routingMode: z.enum(["REGIONAL", "GLOBAL"]),
  autoCreateSubnetworks: z.boolean(),
  mtu: z.number().int(),
  isSharedVpcHost: z.boolean(),
});

export const subnetSchema = baseSchema.extend({
  kind: z.literal("subnet"),
  vpcId: z.string().optional(),
  cidr: z.string().min(1),
  purpose: z.enum(["PRIVATE", "PUBLIC", "GKE", "PROXY", "GENERAL"]),
  privateGoogleAccess: z.boolean(),
  flowLogs: z.boolean(),
  secondaryRanges: z.array(secondaryRangeSchema),
});

export const vmInstanceSchema = baseSchema.extend({
  kind: z.literal("vmInstance"),
  vpcId: z.string().optional(),
  subnetId: z.string().optional(),
  zone: z.string().min(1),
  machineType: z.string().min(1),
  internalIp: z.string().optional(),
  hasExternalIp: z.boolean(),
  networkTags: z.array(z.string()),
  serviceAccount: z.string().optional(),
  needsInternetEgress: z.boolean(),
  exposedPorts: z.array(z.number().int()),
});

export const firewallRuleSchema = baseSchema.extend({
  kind: z.literal("firewallRule"),
  vpcId: z.string().optional(),
  priority: z.number().int(),
  direction: z.enum(["INGRESS", "EGRESS"]),
  action: z.enum(["allow", "deny"]),
  sourceRanges: z.array(z.string()),
  destinationRanges: z.array(z.string()),
  targetTags: z.array(z.string()),
  targetServiceAccounts: z.array(z.string()),
  protocol: z.enum(["tcp", "udp", "icmp", "all"]),
  ports: z.array(z.number().int()),
  loggingEnabled: z.boolean(),
  disabled: z.boolean(),
});

export const cloudRouterSchema = baseSchema.extend({
  kind: z.literal("cloudRouter"),
  vpcId: z.string().optional(),
  bgpAsn: z.number().int(),
  advertisedMode: z.enum(["DEFAULT", "CUSTOM"]),
});

export const cloudNatSchema = baseSchema.extend({
  kind: z.literal("cloudNat"),
  vpcId: z.string().optional(),
  routerId: z.string().optional(),
  subnetIds: z.array(z.string()),
  appliesToAllSubnets: z.boolean(),
  natIpAllocateOption: z.enum(["AUTO_ONLY", "MANUAL_ONLY"]),
});

export const loadBalancerSchema = baseSchema.extend({
  kind: z.literal("loadBalancer"),
  vpcId: z.string().optional(),
  scheme: z.enum(["EXTERNAL", "INTERNAL"]),
  ports: z.array(z.number().int()),
  backendIds: z.array(z.string()),
});

export const dnsZoneSchema = baseSchema.extend({
  kind: z.literal("dnsZone"),
  domain: z.string().min(1),
  visibility: z.enum(["PUBLIC", "PRIVATE"]),
  vpcIds: z.array(z.string()),
});

export const privateServiceConnectSchema = baseSchema.extend({
  kind: z.literal("privateServiceConnect"),
  region: z.string().min(1),
  producerVpcId: z.string().optional(),
  consumerVpcId: z.string().optional(),
});

export const vpcPeeringSchema = baseSchema.extend({
  kind: z.literal("vpcPeering"),
  requesterVpcId: z.string().optional(),
  accepterVpcId: z.string().optional(),
  exportCustomRoutes: z.boolean(),
  importCustomRoutes: z.boolean(),
});

export const vpnGatewaySchema = baseSchema.extend({
  kind: z.literal("vpnGateway"),
  vpcId: z.string().optional(),
  cloudRouterId: z.string().optional(),
  tunnelMode: z.enum(["CLASSIC", "HA"]),
  peerIp: z.string().optional(),
  bgpEnabled: z.boolean(),
});

export const gkeClusterSchema = baseSchema.extend({
  kind: z.literal("gkeCluster"),
  vpcId: z.string().optional(),
  subnetId: z.string().optional(),
  podSecondaryRangeName: z.string().optional(),
  serviceSecondaryRangeName: z.string().optional(),
  maxPodsPerNode: z.number().int(),
  privateNodes: z.boolean(),
});

export const internetSchema = baseSchema.extend({
  kind: z.literal("internet"),
});

export const onPremNetworkSchema = baseSchema.extend({
  kind: z.literal("onPremNetwork"),
  cidr: z.string().min(1),
  location: z.string().min(1),
});

export const componentSchema = z.discriminatedUnion("kind", [
  projectSchema,
  vpcSchema,
  subnetSchema,
  vmInstanceSchema,
  firewallRuleSchema,
  cloudRouterSchema,
  cloudNatSchema,
  loadBalancerSchema,
  dnsZoneSchema,
  privateServiceConnectSchema,
  vpcPeeringSchema,
  vpnGatewaySchema,
  gkeClusterSchema,
  internetSchema,
  onPremNetworkSchema,
]);

export const connectionSchema = z.object({
  id: z.string().min(1),
  sourceId: z.string().min(1),
  targetId: z.string().min(1),
  kind: z.enum(["attachment", "dependency", "routing", "peering", "vpn", "reference"]),
  label: z.string().optional(),
});

export const architectureSchema = z.object({
  version: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  components: z.array(componentSchema),
  connections: z.array(connectionSchema),
});

export type ArchitectureInput = z.infer<typeof architectureSchema>;
