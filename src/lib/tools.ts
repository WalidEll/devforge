export type ToolCategory = "formatters" | "encoders" | "generators" | "converters";

export interface Tool {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: ToolCategory;
  keywords: string[];
  icon: string;
  relatedSlugs: string[];
}

export const categories: Record<ToolCategory, { label: string; description: string }> = {
  formatters: {
    label: "Formatters",
    description: "Format and beautify your code instantly",
  },
  encoders: {
    label: "Encoders & Decoders",
    description: "Encode, decode, and hash data",
  },
  generators: {
    label: "Generators",
    description: "Generate UUIDs, lorem ipsum, and more",
  },
  converters: {
    label: "Converters",
    description: "Convert between data formats",
  },
};

export const tools: Tool[] = [
  {
    name: "JSON Formatter",
    slug: "json-formatter",
    description:
      "Format, validate, and beautify your JSON data instantly. Minify or pretty-print with syntax highlighting and error detection.",
    shortDescription: "Format & validate JSON",
    category: "formatters",
    keywords: ["json formatter", "json beautifier", "json validator", "json pretty print"],
    icon: "{ }",
    relatedSlugs: ["json-to-csv", "yaml-to-json", "sql-formatter"],
  },
  {
    name: "JSON to CSV Converter",
    slug: "json-to-csv",
    description:
      "Convert JSON arrays to CSV format instantly. Download as a CSV file or copy to clipboard.",
    shortDescription: "Convert JSON to CSV",
    category: "converters",
    keywords: ["json to csv", "json csv converter", "convert json to csv online"],
    icon: "CSV",
    relatedSlugs: ["json-formatter", "yaml-to-json", "sql-formatter"],
  },
  {
    name: "Base64 Encode/Decode",
    slug: "base64-encode-decode",
    description:
      "Encode text to Base64 or decode Base64 strings instantly. Supports UTF-8 text and file encoding.",
    shortDescription: "Encode & decode Base64",
    category: "encoders",
    keywords: ["base64 encode", "base64 decode", "base64 encoder", "base64 decoder"],
    icon: "B64",
    relatedSlugs: ["url-encode-decode", "html-entity-encoder", "hash-generator"],
  },
  {
    name: "JWT Decoder",
    slug: "jwt-decoder",
    description:
      "Decode JSON Web Tokens instantly. View header, payload, expiration status, and signature information.",
    shortDescription: "Decode JWT tokens",
    category: "encoders",
    keywords: ["jwt decoder", "jwt parser", "decode jwt token", "json web token decoder"],
    icon: "JWT",
    relatedSlugs: ["base64-encode-decode", "json-formatter", "hash-generator"],
  },
  {
    name: "URL Encode/Decode",
    slug: "url-encode-decode",
    description:
      "Encode or decode URLs and query parameters. Supports full URL encoding and component-level encoding.",
    shortDescription: "Encode & decode URLs",
    category: "encoders",
    keywords: ["url encode", "url decode", "url encoder", "percent encoding"],
    icon: "%",
    relatedSlugs: ["base64-encode-decode", "html-entity-encoder", "hash-generator"],
  },
  {
    name: "Regex Tester",
    slug: "regex-tester",
    description:
      "Test regular expressions in real-time with match highlighting, capture groups, and a built-in cheat sheet.",
    shortDescription: "Test regex patterns",
    category: "formatters",
    keywords: ["regex tester", "regex validator", "regular expression tester", "regex online"],
    icon: ".*",
    relatedSlugs: ["json-formatter", "sql-formatter", "hash-generator"],
  },
  {
    name: "Cron Expression Generator",
    slug: "cron-expression-generator",
    description:
      "Build and validate cron expressions with a visual editor. See human-readable descriptions and next execution times.",
    shortDescription: "Build cron expressions",
    category: "generators",
    keywords: [
      "cron expression generator",
      "cron job builder",
      "crontab generator",
      "cron schedule",
    ],
    icon: "CLK",
    relatedSlugs: ["unix-timestamp-converter", "uuid-generator", "regex-tester"],
  },
  {
    name: "UUID Generator",
    slug: "uuid-generator",
    description:
      "Generate UUIDs (v4 and v7) instantly. Bulk generate up to 100 UUIDs and copy them all at once.",
    shortDescription: "Generate UUIDs",
    category: "generators",
    keywords: ["uuid generator", "uuid v4", "uuid v7", "guid generator", "random uuid"],
    icon: "ID",
    relatedSlugs: ["password-generator", "hash-generator", "lorem-ipsum-generator"],
  },
  {
    name: "Unix Timestamp Converter",
    slug: "unix-timestamp-converter",
    description:
      "Convert Unix timestamps to human-readable dates and vice versa. Supports multiple timezones and relative time.",
    shortDescription: "Convert timestamps",
    category: "converters",
    keywords: [
      "unix timestamp converter",
      "epoch converter",
      "timestamp to date",
      "date to timestamp",
    ],
    icon: "T",
    relatedSlugs: ["cron-expression-generator", "uuid-generator", "json-formatter"],
  },
  {
    name: "Color Converter",
    slug: "color-converter",
    description:
      "Convert colors between HEX, RGB, and HSL formats. Live preview swatch and copy any format.",
    shortDescription: "Convert color formats",
    category: "converters",
    keywords: ["color converter", "hex to rgb", "rgb to hex", "hsl converter", "color picker"],
    icon: "#",
    relatedSlugs: ["hash-generator", "base64-encode-decode", "markdown-preview"],
  },
  {
    name: "Markdown Preview",
    slug: "markdown-preview",
    description:
      "Write Markdown and see a live preview side by side. Supports GitHub Flavored Markdown with tables, code blocks, and more.",
    shortDescription: "Preview Markdown live",
    category: "formatters",
    keywords: ["markdown preview", "markdown editor", "markdown renderer", "gfm preview"],
    icon: "MD",
    relatedSlugs: ["html-entity-encoder", "json-formatter", "lorem-ipsum-generator"],
  },
  {
    name: "HTML Entity Encoder",
    slug: "html-entity-encoder",
    description:
      "Encode special characters to HTML entities or decode them back. Includes a common entities reference table.",
    shortDescription: "Encode/decode HTML entities",
    category: "encoders",
    keywords: [
      "html entity encoder",
      "html entity decoder",
      "html special characters",
      "html escape",
    ],
    icon: "&;",
    relatedSlugs: ["url-encode-decode", "base64-encode-decode", "markdown-preview"],
  },
  {
    name: "SQL Formatter",
    slug: "sql-formatter",
    description:
      "Format and beautify SQL queries with proper indentation. Supports SELECT, INSERT, UPDATE, and CREATE statements.",
    shortDescription: "Format SQL queries",
    category: "formatters",
    keywords: ["sql formatter", "sql beautifier", "format sql online", "sql pretty print"],
    icon: "SQL",
    relatedSlugs: ["json-formatter", "yaml-to-json", "regex-tester"],
  },
  {
    name: "YAML to JSON Converter",
    slug: "yaml-to-json",
    description:
      "Convert YAML to JSON or JSON to YAML instantly. Validate and format both formats with syntax highlighting.",
    shortDescription: "Convert YAML & JSON",
    category: "converters",
    keywords: ["yaml to json", "json to yaml", "yaml converter", "yaml parser"],
    icon: "YML",
    relatedSlugs: ["json-formatter", "json-to-csv", "sql-formatter"],
  },
  {
    name: "Hash Generator",
    slug: "hash-generator",
    description:
      "Generate MD5, SHA-1, SHA-256, and SHA-512 hashes from text input. Compare and copy individual hashes.",
    shortDescription: "Generate MD5/SHA hashes",
    category: "encoders",
    keywords: [
      "hash generator",
      "md5 generator",
      "sha256 generator",
      "sha512 hash",
      "checksum generator",
    ],
    icon: "#!",
    relatedSlugs: ["base64-encode-decode", "uuid-generator", "jwt-decoder"],
  },
  {
    name: "Lorem Ipsum Generator",
    slug: "lorem-ipsum-generator",
    description:
      "Generate placeholder text in paragraphs, sentences, or words. Perfect for mockups and prototyping.",
    shortDescription: "Generate placeholder text",
    category: "generators",
    keywords: ["lorem ipsum generator", "placeholder text", "dummy text generator", "lipsum"],
    icon: "Aa",
    relatedSlugs: ["uuid-generator", "markdown-preview", "color-converter"],
  },
  {
    name: "Password Generator",
    slug: "password-generator",
    description:
      "Generate strong, random passwords with custom length, character sets, and complexity rules. Includes entropy and strength indicator.",
    shortDescription: "Generate secure passwords",
    category: "generators",
    keywords: ["password generator", "random password", "strong password generator", "secure password"],
    icon: "PWD",
    relatedSlugs: ["uuid-generator", "hash-generator", "base64-encode-decode"],
  },
  {
    name: "Certificate Details Viewer",
    slug: "cert-details-viewer",
    description:
      "Parse and inspect SSL/TLS certificates from PEM input. View subject, issuer, validity dates, SANs, key info, and extensions.",
    shortDescription: "Inspect SSL certificates",
    category: "encoders",
    keywords: ["ssl certificate viewer", "x509 certificate parser", "tls certificate decoder", "pem certificate viewer"],
    icon: "SSL",
    relatedSlugs: ["jwt-decoder", "hash-generator", "base64-encode-decode"],
  },
];

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}

export function getRelatedTools(slug: string): Tool[] {
  const tool = getToolBySlug(slug);
  if (!tool) return [];
  return tool.relatedSlugs.map((s) => getToolBySlug(s)).filter(Boolean) as Tool[];
}

export function getToolsByCategory(category: ToolCategory): Tool[] {
  return tools.filter((t) => t.category === category);
}
