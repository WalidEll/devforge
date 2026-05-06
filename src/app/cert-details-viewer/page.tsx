"use client";

import { useState } from "react";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("cert-details-viewer")!;

const faqs = [
  {
    question: "What certificate formats are supported?",
    answer:
      "This tool supports PEM-encoded X.509 certificates — the format that starts with -----BEGIN CERTIFICATE-----. This is the most common format used by web servers, including certificates from Let's Encrypt, DigiCert, and other CAs.",
  },
  {
    question: "Is my certificate data sent to a server?",
    answer:
      "No. All parsing happens entirely in your browser using JavaScript. Your certificate data never leaves your machine. This makes the tool safe to use with production certificates.",
  },
  {
    question: "What information can I see?",
    answer:
      "You can view the subject (CN, O, OU, C), issuer, serial number, validity period (not before / not after), Subject Alternative Names (SANs), public key algorithm and size, signature algorithm, and key usage extensions.",
  },
  {
    question: "How do I get a certificate in PEM format?",
    answer:
      "You can export a certificate from your browser (click the padlock → Certificate → Export), use OpenSSL (openssl s_client -connect example.com:443 </dev/null | openssl x509), or copy it from your server's certificate files (usually .crt or .pem files).",
  },
];

// ─── Minimal ASN.1 DER parser ───────────────────────────────────────────────

function base64ToBytesUnpadded(b64: string): Uint8Array {
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

function pemToDer(pem: string): Uint8Array {
  const lines = pem
    .replace(/-----BEGIN CERTIFICATE-----|-----END CERTIFICATE-----/g, "")
    .replace(/\s+/g, "");
  return base64ToBytesUnpadded(lines);
}

interface AsnNode {
  tag: number;
  tagClass: number; // 0=universal,1=application,2=context,3=private
  constructed: boolean;
  length: number;
  valueOffset: number;
  children?: AsnNode[];
  raw: Uint8Array;
}

function parseAsn1(bytes: Uint8Array, offset = 0): AsnNode {
  const tagByte = bytes[offset];
  const tagClass = (tagByte >> 6) & 0x3;
  const constructed = !!(tagByte & 0x20);
  const tag = tagByte & 0x1f;
  offset++;

  let length = bytes[offset++];
  if (length & 0x80) {
    const numBytes = length & 0x7f;
    length = 0;
    for (let i = 0; i < numBytes; i++) length = (length << 8) | bytes[offset++];
  }

  const valueOffset = offset;
  const raw = bytes.slice(valueOffset, valueOffset + length);

  const node: AsnNode = { tag, tagClass, constructed, length, valueOffset, raw };

  if (constructed) {
    node.children = [];
    let pos = 0;
    while (pos < length) {
      const child = parseAsn1(raw, pos);
      node.children.push(child);
      pos += (child.valueOffset - 0) + child.length;
      // re-parse to get correct child total size
    }
    // Re-parse children with correct offsets
    node.children = [];
    pos = 0;
    while (pos < length) {
      const childBytes = raw.slice(pos);
      const child = parseAsn1WithSize(childBytes);
      node.children.push(child.node);
      pos += child.totalSize;
    }
  }

  return node;
}

function parseAsn1WithSize(bytes: Uint8Array): { node: AsnNode; totalSize: number } {
  const tagByte = bytes[0];
  const tagClass = (tagByte >> 6) & 0x3;
  const constructed = !!(tagByte & 0x20);
  const tag = tagByte & 0x1f;
  let offset = 1;

  let length = bytes[offset++];
  if (length & 0x80) {
    const numBytes = length & 0x7f;
    length = 0;
    for (let i = 0; i < numBytes; i++) length = (length << 8) | bytes[offset++];
  }

  const headerSize = offset;
  const raw = bytes.slice(headerSize, headerSize + length);
  const totalSize = headerSize + length;

  const node: AsnNode = { tag, tagClass, constructed, length, valueOffset: headerSize, raw };

  if (constructed) {
    node.children = [];
    let pos = 0;
    while (pos < raw.length) {
      const childBytes = raw.slice(pos);
      if (childBytes.length === 0) break;
      try {
        const child = parseAsn1WithSize(childBytes);
        node.children.push(child.node);
        pos += child.totalSize;
      } catch {
        break;
      }
    }
  }

  return { node, totalSize };
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(":");
}

function parseOid(bytes: Uint8Array): string {
  if (bytes.length === 0) return "";
  const parts: number[] = [];
  parts.push(Math.floor(bytes[0] / 40));
  parts.push(bytes[0] % 40);
  let val = 0;
  for (let i = 1; i < bytes.length; i++) {
    val = (val << 7) | (bytes[i] & 0x7f);
    if (!(bytes[i] & 0x80)) {
      parts.push(val);
      val = 0;
    }
  }
  return parts.join(".");
}

function parseUtf8OrPrintable(bytes: Uint8Array): string {
  try {
    return new TextDecoder("utf-8").decode(bytes);
  } catch {
    return Array.from(bytes)
      .map((b) => String.fromCharCode(b))
      .join("");
  }
}

function parseDate(bytes: Uint8Array, tag: number): string {
  const str = parseUtf8OrPrintable(bytes);
  if (tag === 23) {
    // UTCTime: YYMMDDHHMMSSZ
    const yy = parseInt(str.slice(0, 2));
    const year = yy >= 50 ? 1900 + yy : 2000 + yy;
    return `20${str.slice(0, 2).padStart(2, "0")}-${str.slice(2, 4)}-${str.slice(4, 6)} ${str.slice(6, 8)}:${str.slice(8, 10)}:${str.slice(10, 12)} UTC`
      .replace(/^20/, year >= 2000 ? "20" : "19");
  }
  // GeneralizedTime: YYYYMMDDHHMMSSZ
  return `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)} ${str.slice(8, 10)}:${str.slice(10, 12)}:${str.slice(12, 14)} UTC`;
}

const OID_NAMES: Record<string, string> = {
  "2.5.4.3": "CN",
  "2.5.4.6": "C",
  "2.5.4.7": "L",
  "2.5.4.8": "ST",
  "2.5.4.10": "O",
  "2.5.4.11": "OU",
  "1.2.840.113549.1.1.1": "RSA",
  "1.2.840.113549.1.1.5": "sha1WithRSAEncryption",
  "1.2.840.113549.1.1.11": "sha256WithRSAEncryption",
  "1.2.840.113549.1.1.12": "sha384WithRSAEncryption",
  "1.2.840.113549.1.1.13": "sha512WithRSAEncryption",
  "1.2.840.10040.4.1": "DSA",
  "1.2.840.10045.2.1": "EC",
  "1.2.840.10045.4.3.2": "ecdsa-with-SHA256",
  "1.2.840.10045.4.3.3": "ecdsa-with-SHA384",
  "1.2.840.10045.4.3.4": "ecdsa-with-SHA512",
  "2.5.29.17": "Subject Alternative Name",
  "2.5.29.19": "Basic Constraints",
  "2.5.29.15": "Key Usage",
  "2.5.29.37": "Extended Key Usage",
  "2.5.29.14": "Subject Key Identifier",
  "2.5.29.35": "Authority Key Identifier",
  "1.3.6.1.5.5.7.3.1": "TLS Web Server Auth",
  "1.3.6.1.5.5.7.3.2": "TLS Web Client Auth",
};

function parseDN(seq: AsnNode): string {
  const parts: string[] = [];
  for (const rdn of seq.children ?? []) {
    for (const atv of rdn.children ?? []) {
      const [oidNode, valueNode] = atv.children ?? [];
      if (!oidNode || !valueNode) continue;
      const oid = parseOid(oidNode.raw);
      const key = OID_NAMES[oid] ?? oid;
      const value = parseUtf8OrPrintable(valueNode.raw);
      parts.push(`${key}=${value}`);
    }
  }
  return parts.join(", ");
}

export interface CertInfo {
  version: string;
  serialNumber: string;
  subject: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  isExpired: boolean;
  daysRemaining: number | null;
  signatureAlgorithm: string;
  publicKeyAlgorithm: string;
  publicKeySize: string;
  sans: string[];
  keyUsage: string[];
  extKeyUsage: string[];
  isCA: boolean;
  fingerprint: string;
  subjectDN: Record<string, string>;
  issuerDN: Record<string, string>;
}

async function parseCertificate(pem: string): Promise<CertInfo> {
  const der = pemToDer(pem);
  const { node: cert } = parseAsn1WithSize(der);

  // Certificate SEQUENCE → [tbsCert, sigAlgId, sigValue]
  const tbsCert = cert.children?.[0];
  const sigAlgNode = cert.children?.[1];

  if (!tbsCert?.children) throw new Error("Invalid certificate structure");

  let idx = 0;
  // [0] version (optional, explicit)
  let version = "v1";
  if (tbsCert.children[0].tagClass === 2 && tbsCert.children[0].tag === 0) {
    const versionInt = tbsCert.children[0].children?.[0]?.raw[0] ?? 0;
    version = `v${versionInt + 1}`;
    idx = 1;
  }

  const serialNode = tbsCert.children[idx++];
  const sigAlgInTbs = tbsCert.children[idx++];
  const issuerNode = tbsCert.children[idx++];
  const validityNode = tbsCert.children[idx++];
  const subjectNode = tbsCert.children[idx++];
  const pubKeyNode = tbsCert.children[idx++];

  // Serial number
  const serialNumber = bytesToHex(serialNode.raw);

  // Signature algorithm (from outer)
  const sigAlgOid = sigAlgNode?.children?.[0]?.raw
    ? parseOid(sigAlgNode.children[0].raw)
    : parseOid(sigAlgInTbs.children?.[0]?.raw ?? new Uint8Array());
  const signatureAlgorithm = OID_NAMES[sigAlgOid] ?? sigAlgOid;

  // Issuer and subject DNs
  const issuerStr = parseDN(issuerNode);
  const subjectStr = parseDN(subjectNode);

  function parseDNMap(seq: AsnNode): Record<string, string> {
    const map: Record<string, string> = {};
    for (const rdn of seq.children ?? []) {
      for (const atv of rdn.children ?? []) {
        const [oidNode, valueNode] = atv.children ?? [];
        if (!oidNode || !valueNode) continue;
        const oid = parseOid(oidNode.raw);
        const key = OID_NAMES[oid] ?? oid;
        map[key] = parseUtf8OrPrintable(valueNode.raw);
      }
    }
    return map;
  }

  const subjectDN = parseDNMap(subjectNode);
  const issuerDN = parseDNMap(issuerNode);

  // Validity
  const [notBeforeNode, notAfterNode] = validityNode.children ?? [];
  const validFrom = parseDate(notBeforeNode.raw, notBeforeNode.tag);
  const validTo = parseDate(notAfterNode.raw, notAfterNode.tag);

  // Check expiry
  function parseDateValue(bytes: Uint8Array, tag: number): Date {
    const str = parseUtf8OrPrintable(bytes);
    if (tag === 23) {
      const yy = parseInt(str.slice(0, 2));
      const year = yy >= 50 ? 1900 + yy : 2000 + yy;
      return new Date(`${year}-${str.slice(2, 4)}-${str.slice(4, 6)}T${str.slice(6, 8)}:${str.slice(8, 10)}:${str.slice(10, 12)}Z`);
    }
    return new Date(`${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)}T${str.slice(8, 10)}:${str.slice(10, 12)}:${str.slice(12, 14)}Z`);
  }
  const notAfterDate = parseDateValue(notAfterNode.raw, notAfterNode.tag);
  const now = new Date();
  const isExpired = notAfterDate < now;
  const daysRemaining = isExpired
    ? null
    : Math.ceil((notAfterDate.getTime() - now.getTime()) / 86400000);

  // Public key
  const pubKeyAlgNode = pubKeyNode.children?.[0]?.children?.[0];
  const pubKeyAlgOid = pubKeyAlgNode ? parseOid(pubKeyAlgNode.raw) : "";
  const publicKeyAlgorithm = OID_NAMES[pubKeyAlgOid] ?? pubKeyAlgOid;

  // Key size from BIT STRING
  let publicKeySize = "";
  const pubKeyBits = pubKeyNode.children?.[1];
  if (pubKeyBits) {
    // RSA: BIT STRING → SEQUENCE { INTEGER (modulus), INTEGER (exponent) }
    const inner = pubKeyBits.raw.slice(1); // skip unused bits byte
    try {
      const { node: innerSeq } = parseAsn1WithSize(inner);
      const modulus = innerSeq.children?.[0]?.raw;
      if (modulus) {
        // Remove leading 0x00 if present
        const start = modulus[0] === 0 ? 1 : 0;
        publicKeySize = `${(modulus.length - start) * 8}-bit`;
      }
    } catch {
      publicKeySize = `${(inner.length) * 8 - 8}-bit (approx)`;
    }
  }

  // Extensions (tag [3] context)
  const sans: string[] = [];
  const keyUsage: string[] = [];
  const extKeyUsage: string[] = [];
  let isCA = false;

  const extensionsWrapper = tbsCert.children.find(
    (c) => c.tagClass === 2 && c.tag === 3
  );
  if (extensionsWrapper?.children?.[0]?.children) {
    for (const ext of extensionsWrapper.children[0].children) {
      const oidNode = ext.children?.[0];
      if (!oidNode) continue;
      const oid = parseOid(oidNode.raw);

      // Value is either [oid, critical, value] or [oid, value]
      const valueNode = ext.children?.[2] ?? ext.children?.[1];
      if (!valueNode) continue;

      // Extensions are wrapped in OCTET STRING
      try {
        const { node: extContent } = parseAsn1WithSize(valueNode.raw);

        if (oid === "2.5.29.17") {
          // SAN
          for (const san of extContent.children ?? []) {
            if (san.tagClass === 2 && san.tag === 2) {
              // dNSName
              sans.push(parseUtf8OrPrintable(san.raw));
            } else if (san.tagClass === 2 && san.tag === 7) {
              // iPAddress
              if (san.raw.length === 4) {
                sans.push(Array.from(san.raw).join("."));
              } else if (san.raw.length === 16) {
                const parts: string[] = [];
                for (let i = 0; i < 16; i += 2) {
                  parts.push(((san.raw[i] << 8) | san.raw[i + 1]).toString(16));
                }
                sans.push(parts.join(":"));
              }
            }
          }
        } else if (oid === "2.5.29.19") {
          // Basic constraints
          for (const c of extContent.children ?? []) {
            if (c.tag === 1 && c.raw[0] === 0xff) isCA = true;
          }
        } else if (oid === "2.5.29.15") {
          // Key usage - bit string
          const bits = extContent.raw;
          const unusedBits = bits[0];
          const byte1 = bits[1] ?? 0;
          const usages = [
            "Digital Signature", "Non Repudiation", "Key Encipherment",
            "Data Encipherment", "Key Agreement", "Key Cert Sign",
            "CRL Sign", "Encipher Only",
          ];
          for (let i = 0; i < 8 - unusedBits && i < usages.length; i++) {
            if (byte1 & (0x80 >> i)) keyUsage.push(usages[i]);
          }
        } else if (oid === "2.5.29.37") {
          // Extended key usage
          for (const ekuNode of extContent.children ?? []) {
            const ekuOid = parseOid(ekuNode.raw);
            extKeyUsage.push(OID_NAMES[ekuOid] ?? ekuOid);
          }
        }
      } catch {
        // skip malformed extension
      }
    }
  }

  // SHA-256 fingerprint
  const hashBuffer = await crypto.subtle.digest("SHA-256", der.buffer.slice(der.byteOffset, der.byteOffset + der.byteLength) as ArrayBuffer);
  const fingerprint = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(":");

  return {
    version,
    serialNumber,
    subject: subjectStr || subjectDN.CN || "",
    issuer: issuerStr || issuerDN.CN || "",
    validFrom,
    validTo,
    isExpired,
    daysRemaining,
    signatureAlgorithm,
    publicKeyAlgorithm,
    publicKeySize,
    sans,
    keyUsage,
    extKeyUsage,
    isCA,
    fingerprint,
    subjectDN,
    issuerDN,
  };
}

const EXAMPLE_PEM = `-----BEGIN CERTIFICATE-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2a2rwplBQLzHPZe5TNJT
lDNKRakBLi0M3rBOaMHm5CKtxDRF0QIDAQAB
-----END CERTIFICATE-----`;

function Field({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className={`mt-1 text-sm text-gray-900 dark:text-white sm:col-span-2 sm:mt-0 ${mono ? "font-mono break-all" : ""}`}>
        {value}
      </dd>
    </div>
  );
}

export default function CertDetailsViewerPage() {
  const [input, setInput] = useState("");
  const [certInfo, setCertInfo] = useState<CertInfo | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function parse() {
    setError("");
    setCertInfo(null);
    setLoading(true);
    try {
      const pem = input.trim().includes("BEGIN CERTIFICATE")
        ? input.trim()
        : `-----BEGIN CERTIFICATE-----\n${input.trim()}\n-----END CERTIFICATE-----`;
      const info = await parseCertificate(pem);
      setCertInfo(info);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to parse certificate");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolLayout
      tool={tool}
      faqs={faqs}
      howToUse="Paste a PEM-encoded X.509 certificate into the input field and click Parse. The tool decodes the certificate client-side and displays all key fields including subject, issuer, validity dates, Subject Alternative Names, public key details, and extensions."
      useCases={[
        "Inspecting SSL/TLS certificates before deploying to production",
        "Verifying certificate expiry dates and SANs during renewals",
        "Debugging certificate chain issues in web applications",
        "Auditing certificates for compliance with security policies",
      ]}
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            PEM Certificate
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={"-----BEGIN CERTIFICATE-----\nMIID...\n-----END CERTIFICATE-----"}
            rows={8}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-mono text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
          />
        </div>

        <button
          onClick={parse}
          disabled={!input.trim() || loading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Parsing…" : "Parse Certificate"}
        </button>

        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
            {error}
          </div>
        )}

        {certInfo && (
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Status banner */}
            <div className={`flex items-center justify-between px-4 py-3 text-sm font-medium ${
              certInfo.isExpired
                ? "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400"
                : certInfo.daysRemaining !== null && certInfo.daysRemaining < 30
                ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400"
                : "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400"
            }`}>
              <span>
                {certInfo.isExpired
                  ? "Certificate EXPIRED"
                  : `Valid · ${certInfo.daysRemaining} days remaining`}
              </span>
              {certInfo.isCA && (
                <span className="ml-3 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  CA Certificate
                </span>
              )}
            </div>

            <dl className="divide-y divide-gray-200 px-4 dark:divide-gray-700">
              <Field label="Subject" value={certInfo.subject} />
              <Field label="Issuer" value={certInfo.issuer} />
              <Field label="Version" value={certInfo.version} />
              <Field label="Serial Number" value={certInfo.serialNumber} mono />
              <Field label="Valid From" value={certInfo.validFrom} />
              <Field label="Valid To" value={certInfo.validTo} />
              <Field label="Signature Algorithm" value={certInfo.signatureAlgorithm} />
              <Field
                label="Public Key"
                value={`${certInfo.publicKeyAlgorithm}${certInfo.publicKeySize ? ` · ${certInfo.publicKeySize}` : ""}`}
              />

              {certInfo.sans.length > 0 && (
                <Field
                  label="Subject Alternative Names"
                  value={
                    <div className="flex flex-wrap gap-1">
                      {certInfo.sans.map((san) => (
                        <span
                          key={san}
                          className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs dark:bg-gray-800"
                        >
                          {san}
                        </span>
                      ))}
                    </div>
                  }
                />
              )}

              {certInfo.keyUsage.length > 0 && (
                <Field
                  label="Key Usage"
                  value={certInfo.keyUsage.join(", ")}
                />
              )}

              {certInfo.extKeyUsage.length > 0 && (
                <Field
                  label="Extended Key Usage"
                  value={certInfo.extKeyUsage.join(", ")}
                />
              )}

              <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  SHA-256 Fingerprint
                </dt>
                <dd className="mt-1 sm:col-span-2 sm:mt-0 flex items-start gap-2">
                  <span className="font-mono text-xs text-gray-900 dark:text-white break-all">
                    {certInfo.fingerprint}
                  </span>
                  <CopyButton text={certInfo.fingerprint} label="" className="shrink-0 !px-2 !py-1 text-xs" />
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
