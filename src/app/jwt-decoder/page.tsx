"use client";

import { useState } from "react";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("jwt-decoder")!;

const faqs = [
  {
    question: "What is a JWT?",
    answer:
      "A JSON Web Token (JWT) is a compact, URL-safe way to represent claims between two parties. It consists of three parts separated by dots: header, payload, and signature.",
  },
  {
    question: "Does this tool verify the JWT signature?",
    answer:
      "This tool decodes and displays the JWT contents but does not verify the signature. Signature verification requires the secret key or public key used to sign the token.",
  },
  {
    question: "Is my token safe?",
    answer:
      "Yes. All decoding happens locally in your browser. Your JWT is never sent to any server.",
  },
];

interface DecodedJWT {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  isExpired: boolean;
  expiresAt: string | null;
  issuedAt: string | null;
}

function decodeJWT(token: string): DecodedJWT {
  const parts = token.trim().split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT: must have 3 parts separated by dots");

  const decode = (str: string) => {
    const padded = str.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(padded));
  };

  const header = decode(parts[0]);
  const payload = decode(parts[1]);

  const now = Math.floor(Date.now() / 1000);
  const exp = payload.exp ? Number(payload.exp) : null;
  const iat = payload.iat ? Number(payload.iat) : null;

  return {
    header,
    payload,
    signature: parts[2],
    isExpired: exp !== null && exp < now,
    expiresAt: exp ? new Date(exp * 1000).toISOString() : null,
    issuedAt: iat ? new Date(iat * 1000).toISOString() : null,
  };
}

export default function JwtDecoderPage() {
  const [input, setInput] = useState("");
  const [decoded, setDecoded] = useState<DecodedJWT | null>(null);
  const [error, setError] = useState("");

  function decode() {
    try {
      setDecoded(decodeJWT(input));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JWT");
      setDecoded(null);
    }
  }

  return (
    <ToolLayout
      tool={tool}
      faqs={faqs}
      howToUse="Paste a JSON Web Token into the input field and click Decode. The tool splits the token into its three parts (header, payload, signature), decodes the Base64URL-encoded header and payload, and displays them as formatted JSON. It also checks the expiration claim and shows whether the token is expired."
      useCases={[
        "Inspecting authentication tokens during API development",
        "Debugging OAuth 2.0 and OpenID Connect flows",
        "Verifying token claims and expiration before deployment",
        "Understanding JWT structure for security audits",
      ]}
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            JWT Token
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="eyJhbGciOiJIUzI1NiIs..."
            rows={5}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-mono text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500"
          />
        </div>

        <button
          onClick={decode}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Decode
        </button>

        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
            {error}
          </div>
        )}

        {decoded && (
          <div className="space-y-4">
            {decoded.expiresAt && (
              <div
                className={`rounded-lg border px-4 py-3 text-sm ${
                  decoded.isExpired
                    ? "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
                    : "border-green-300 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400"
                }`}
              >
                {decoded.isExpired ? "Token is EXPIRED" : "Token is valid"} — Expires:{" "}
                {decoded.expiresAt}
              </div>
            )}

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Header
                </label>
                <CopyButton text={JSON.stringify(decoded.header, null, 2)} />
              </div>
              <pre className="overflow-auto rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 font-mono text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
                {JSON.stringify(decoded.header, null, 2)}
              </pre>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Payload
                </label>
                <CopyButton text={JSON.stringify(decoded.payload, null, 2)} />
              </div>
              <pre className="overflow-auto rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 font-mono text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
                {JSON.stringify(decoded.payload, null, 2)}
              </pre>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Signature
              </label>
              <code className="block break-all rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 font-mono text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
                {decoded.signature}
              </code>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
