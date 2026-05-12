const IPV4_PART = "(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)";
const IPV4_REGEX = new RegExp(`^${IPV4_PART}\\.${IPV4_PART}\\.${IPV4_PART}\\.${IPV4_PART}$`);

const GCP_PROHIBITED_RANGES = [
  "0.0.0.0/8",
  "127.0.0.0/8",
  "169.254.0.0/16",
  "224.0.0.0/4",
  "255.255.255.255/32",
  "199.36.153.4/30",
  "199.36.153.8/30",
] as const;

export interface ParsedCidr {
  cidr: string;
  ip: string;
  prefix: number;
  networkAddress: string;
  start: number;
  end: number;
  totalAddresses: number;
  usableAddresses: number;
}

export function isValidIpv4(ip: string) {
  return IPV4_REGEX.test(ip);
}

export function ipToInt(ip: string) {
  if (!isValidIpv4(ip)) return null;
  return ip
    .split(".")
    .map(Number)
    .reduce((acc, part) => ((acc << 8) | part) >>> 0, 0);
}

export function intToIp(value: number) {
  return [
    (value >>> 24) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 8) & 0xff,
    value & 0xff,
  ].join(".");
}

function maskFromPrefix(prefix: number) {
  if (prefix < 0 || prefix > 32) return null;
  if (prefix === 0) return 0;
  return (0xffffffff << (32 - prefix)) >>> 0;
}

export function parseCidr(cidr: string): ParsedCidr | null {
  const [ip, prefixValue] = cidr.trim().split("/");
  const prefix = Number(prefixValue);
  const ipInt = ipToInt(ip);
  const mask = maskFromPrefix(prefix);

  if (ipInt === null || Number.isNaN(prefix) || mask === null) {
    return null;
  }

  const networkInt = (ipInt & mask) >>> 0;
  if (networkInt !== ipInt) {
    return null;
  }

  const hostBits = 32 - prefix;
  const totalAddresses = 2 ** hostBits;
  const end = (networkInt + totalAddresses - 1) >>> 0;

  return {
    cidr,
    ip,
    prefix,
    networkAddress: intToIp(networkInt),
    start: networkInt,
    end,
    totalAddresses,
    usableAddresses: prefix >= 31 ? totalAddresses : Math.max(0, totalAddresses - 4),
  };
}

export function cidrContainsIp(cidr: string, ip: string) {
  const parsedCidr = parseCidr(cidr);
  const ipValue = ipToInt(ip);
  if (!parsedCidr || ipValue === null) return false;
  return ipValue >= parsedCidr.start && ipValue <= parsedCidr.end;
}

export function cidrOverlaps(left: string, right: string) {
  const a = parseCidr(left);
  const b = parseCidr(right);
  if (!a || !b) return false;
  return a.start <= b.end && b.start <= a.end;
}

export function firstUsableIp(cidr: string, offset = 2) {
  const parsed = parseCidr(cidr);
  if (!parsed) return undefined;

  const candidate = parsed.start + offset;
  if (candidate >= parsed.end - 1) {
    return intToIp(parsed.start);
  }

  return intToIp(candidate);
}

export function representativeIpFromCidr(cidr: string, preferredOffset = 10) {
  const parsed = parseCidr(cidr);
  if (!parsed) return undefined;

  const candidate = parsed.start + preferredOffset;
  if (candidate < parsed.end - 1) {
    return intToIp(candidate);
  }

  return firstUsableIp(cidr, 2);
}

export function isRfc1918Range(cidr: string) {
  return ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"].some((range) => cidrOverlaps(cidr, range));
}

export function isGcpProhibitedSubnetRange(cidr: string) {
  return GCP_PROHIBITED_RANGES.some((range) => cidrOverlaps(cidr, range));
}

export function isValidGoogleCloudSubnetCidr(cidr: string) {
  const parsed = parseCidr(cidr);
  if (!parsed) return false;
  if (parsed.prefix < 4 || parsed.prefix > 29) return false;
  if (isGcpProhibitedSubnetRange(cidr)) return false;
  return true;
}

export function parseCsvList(input: string) {
  return input
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export function parseNumberList(input: string) {
  return parseCsvList(input)
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));
}
