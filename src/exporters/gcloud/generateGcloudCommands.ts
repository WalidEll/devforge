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

function list(values: string[]) {
  return values.join(",");
}

function renderVpc(network: VpcNetwork) {
  return `gcloud compute networks create ${network.name} \\
  --subnet-mode=${network.autoCreateSubnetworks ? "auto" : "custom"} \\
  --bgp-routing-mode=${network.routingMode.toLowerCase()} \\
  --mtu=${network.mtu}`;
}

function renderSubnet(subnet: Subnet) {
  const flags = [
    `gcloud compute networks subnets create ${subnet.name} \\`,
    `  --network=${subnet.vpcId ?? "VPC_NAME"} \\`,
    `  --region=${subnet.region ?? "us-central1"} \\`,
    `  --range=${subnet.cidr}`,
  ];

  if (subnet.privateGoogleAccess) {
    flags.push("  --enable-private-ip-google-access");
  }

  if (subnet.flowLogs) {
    flags.push("  --enable-flow-logs");
  }

  return flags.join("\n");
}

function renderFirewall(rule: FirewallRule) {
  const pieces = [
    `gcloud compute firewall-rules create ${rule.name} \\`,
    `  --network=${rule.vpcId ?? "VPC_NAME"} \\`,
    `  --direction=${rule.direction} \\`,
    `  --priority=${rule.priority} \\`,
    `  --action=${rule.action} \\`,
    `  --rules=${rule.protocol}${rule.ports.length ? `:${list(rule.ports.map(String))}` : ""}`,
  ];

  if (rule.sourceRanges.length) {
    pieces.push(`  --source-ranges=${list(rule.sourceRanges)} \\`);
  }

  if (rule.destinationRanges.length) {
    pieces.push(`  --destination-ranges=${list(rule.destinationRanges)} \\`);
  }

  if (rule.targetTags.length) {
    pieces.push(`  --target-tags=${list(rule.targetTags)} \\`);
  }

  if (rule.loggingEnabled) {
    pieces.push("  --enable-logging");
  }

  return pieces.join("\n");
}

function renderRouter(router: CloudRouter) {
  return `gcloud compute routers create ${router.name} \\
  --network=${router.vpcId ?? "VPC_NAME"} \\
  --region=${router.region ?? "us-central1"} \\
  --asn=${router.bgpAsn}`;
}

function renderNat(nat: CloudNat, architecture: NetworkArchitecture) {
  const router = nat.routerId ? getComponentById<CloudRouter>(architecture, nat.routerId) : undefined;
  if (!router) {
    return `# Skipped Cloud NAT ${nat.name}: attach a Cloud Router first.`;
  }

  const subnetFlag = nat.appliesToAllSubnets
    ? "  --nat-all-subnet-ip-ranges"
    : `  --nat-custom-subnet-ip-ranges=${list(nat.subnetIds)}`;

  return `gcloud compute routers nats create ${nat.name} \\
  --router=${router.name} \\
  --router-region=${nat.region ?? router.region ?? "us-central1"} \\
${subnetFlag}`;
}

function renderInstance(instance: ComputeInstance) {
  const flags = [
    `gcloud compute instances create ${instance.name} \\`,
    `  --zone=${instance.zone} \\`,
    `  --machine-type=${instance.machineType} \\`,
    `  --subnet=${instance.subnetId ?? "SUBNET_NAME"} \\`,
    `  --image-family=debian-12 \\`,
    `  --image-project=debian-cloud`,
  ];

  if (instance.networkTags.length) {
    flags.push(`  --tags=${list(instance.networkTags)} \\`);
  }

  if (!instance.hasExternalIp) {
    flags.push("  --no-address");
  }

  return flags.join("\n");
}

export function generateGcloudCommands(architecture: NetworkArchitecture) {
  const networks = getComponentsByKind<VpcNetwork>(architecture, "vpc");
  const subnets = getComponentsByKind<Subnet>(architecture, "subnet");
  const firewalls = getComponentsByKind<FirewallRule>(architecture, "firewallRule");
  const routers = getComponentsByKind<CloudRouter>(architecture, "cloudRouter");
  const nats = getComponentsByKind<CloudNat>(architecture, "cloudNat");
  const instances = getComponentsByKind<ComputeInstance>(architecture, "vmInstance");

  return [
    "# Set your active project first",
    "gcloud config set project PROJECT_ID",
    "",
    ...networks.map(renderVpc),
    "",
    ...subnets.map(renderSubnet),
    "",
    ...firewalls.map(renderFirewall),
    "",
    ...routers.map(renderRouter),
    "",
    ...nats.map((nat) => renderNat(nat, architecture)),
    "",
    ...instances.map(renderInstance),
  ].join("\n");
}
