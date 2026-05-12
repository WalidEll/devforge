import type {
  ComputeInstance,
  FirewallDirection,
  FirewallRule,
  NetworkArchitecture,
  NetworkProtocol,
} from "@/domain/models/gcp-network";
import { getFirewallRulesForVpc, getSubnetById } from "@/domain/models/selectors";
import { cidrContainsIp, firstUsableIp, representativeIpFromCidr } from "@/domain/validation/cidr";

function protocolMatches(ruleProtocol: NetworkProtocol, requestedProtocol: Exclude<NetworkProtocol, "all">) {
  return ruleProtocol === "all" || ruleProtocol === requestedProtocol;
}

function portMatches(rule: FirewallRule, port?: number) {
  if (rule.protocol === "icmp" || rule.protocol === "all") return true;
  if (port === undefined) return rule.ports.length === 0;
  if (rule.ports.length === 0) return true;
  return rule.ports.includes(port);
}

function targetMatches(rule: FirewallRule, instance: ComputeInstance) {
  const matchesTags =
    rule.targetTags.length === 0 ||
    rule.targetTags.some((tag) => instance.networkTags.includes(tag));

  const matchesServiceAccount =
    rule.targetServiceAccounts.length === 0 ||
    (instance.serviceAccount !== undefined &&
      rule.targetServiceAccounts.includes(instance.serviceAccount));

  return matchesTags && matchesServiceAccount;
}

function deriveInstanceIp(architecture: NetworkArchitecture, instance: ComputeInstance) {
  if (instance.internalIp) return instance.internalIp;
  const subnet = getSubnetById(architecture, instance.subnetId);
  return subnet ? representativeIpFromCidr(subnet.cidr) ?? firstUsableIp(subnet.cidr) : undefined;
}

export function findMatchingFirewallRule(params: {
  architecture: NetworkArchitecture;
  vpcId?: string;
  instance: ComputeInstance;
  direction: FirewallDirection;
  sourceIp?: string;
  destinationIp?: string;
  protocol: Exclude<NetworkProtocol, "all">;
  port?: number;
}) {
  const { architecture, vpcId, instance, direction, sourceIp, destinationIp, protocol, port } = params;

  const rules = getFirewallRulesForVpc(architecture, vpcId)
    .filter((rule) => !rule.disabled)
    .filter((rule) => rule.direction === direction)
    .filter((rule) => protocolMatches(rule.protocol, protocol))
    .filter((rule) => portMatches(rule, port))
    .filter((rule) => targetMatches(rule, instance))
    .filter((rule) => {
      if (direction === "INGRESS") {
        if (rule.sourceRanges.length === 0) return true;
        if (!sourceIp) return false;
        return rule.sourceRanges.some((range) => cidrContainsIp(range, sourceIp));
      }

      if (rule.destinationRanges.length === 0) return true;
      if (!destinationIp) return false;
      return rule.destinationRanges.some((range) => cidrContainsIp(range, destinationIp));
    })
    .sort((left, right) => left.priority - right.priority);

  return rules[0];
}

export function evaluateFirewallRules(params: {
  architecture: NetworkArchitecture;
  instance: ComputeInstance;
  direction: FirewallDirection;
  sourceIp?: string;
  destinationIp?: string;
  protocol: Exclude<NetworkProtocol, "all">;
  port?: number;
}) {
  const { architecture, instance, direction, sourceIp, destinationIp, protocol, port } = params;
  const vpcId = instance.vpcId ?? getSubnetById(architecture, instance.subnetId)?.vpcId;
  const matchingRule = findMatchingFirewallRule({
    architecture,
    vpcId,
    instance,
    direction,
    sourceIp,
    destinationIp,
    protocol,
    port,
  });

  if (matchingRule) {
    return {
      allowed: matchingRule.action === "allow",
      matchingRule,
      effectiveSourceIp: sourceIp,
      effectiveDestinationIp: destinationIp ?? deriveInstanceIp(architecture, instance),
    };
  }

  return {
    allowed: direction === "EGRESS",
    matchingRule: undefined,
    effectiveSourceIp: sourceIp,
    effectiveDestinationIp: destinationIp ?? deriveInstanceIp(architecture, instance),
  };
}
