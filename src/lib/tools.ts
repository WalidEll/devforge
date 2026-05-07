export type ToolCategory = "formatters" | "encoders" | "generators" | "converters" | "validators";

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
  validators: {
    label: "Validators",
    description: "Validate formats, expressions, and data",
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
  // --- Formatters ---
  {
    name: "XML Formatter",
    slug: "xml-formatter",
    description:
      "Format and pretty-print XML documents with proper indentation. Validates XML structure and highlights errors.",
    shortDescription: "Format & validate XML",
    category: "formatters",
    keywords: ["xml formatter", "xml beautifier", "xml pretty print", "xml validator", "xml indenter"],
    icon: "XML",
    relatedSlugs: ["html-formatter", "xml-to-json", "json-to-xml"],
  },
  {
    name: "HTML Formatter",
    slug: "html-formatter",
    description:
      "Beautify and format HTML markup with proper indentation and structure. Makes minified HTML readable.",
    shortDescription: "Format & beautify HTML",
    category: "formatters",
    keywords: ["html formatter", "html beautifier", "html pretty print", "html indenter", "format html online"],
    icon: "HTML",
    relatedSlugs: ["xml-formatter", "html-validator", "javascript-beautifier"],
  },
  {
    name: "JavaScript Beautifier",
    slug: "javascript-beautifier",
    description:
      "Beautify or minify JavaScript code. Formats messy or minified JS with proper indentation and readability.",
    shortDescription: "Beautify or minify JS",
    category: "formatters",
    keywords: ["javascript beautifier", "js formatter", "javascript minifier", "js beautify", "format javascript"],
    icon: "JS",
    relatedSlugs: ["css-beautifier", "html-formatter", "json-formatter"],
  },
  {
    name: "CSS Beautifier",
    slug: "css-beautifier",
    description:
      "Beautify or minify CSS stylesheets. Formats compressed CSS with proper indentation and clean structure.",
    shortDescription: "Beautify or minify CSS",
    category: "formatters",
    keywords: ["css beautifier", "css formatter", "css minifier", "css pretty print", "format css online"],
    icon: "CSS",
    relatedSlugs: ["javascript-beautifier", "html-formatter", "json-formatter"],
  },
  // --- Encoders ---
  {
    name: "HMAC Generator",
    slug: "hmac-generator",
    description:
      "Generate HMAC signatures using SHA-256, SHA-512, SHA-1, or MD5. Enter your message and secret key to produce a cryptographic hash.",
    shortDescription: "Generate HMAC signatures",
    category: "encoders",
    keywords: ["hmac generator", "hmac sha256", "hmac sha512", "message authentication code", "hmac online"],
    icon: "HMAC",
    relatedSlugs: ["hash-generator", "base64-encode-decode", "jwt-decoder"],
  },
  {
    name: "JavaScript Escape",
    slug: "javascript-escape",
    description:
      "Escape or unescape JavaScript strings. Handles quotes, newlines, tabs, backslashes, and Unicode characters.",
    shortDescription: "Escape JS strings",
    category: "encoders",
    keywords: ["javascript escape", "js string escape", "escape javascript", "unescape javascript", "js escape online"],
    icon: "JS\\",
    relatedSlugs: ["json-escape", "xml-escape", "url-encode-decode"],
  },
  {
    name: "JSON Escape",
    slug: "json-escape",
    description:
      "Escape a string for safe embedding inside a JSON value, or unescape a JSON-encoded string back to plain text.",
    shortDescription: "Escape JSON strings",
    category: "encoders",
    keywords: ["json escape", "json string escape", "escape json", "unescape json", "json encode string"],
    icon: "J\\",
    relatedSlugs: ["javascript-escape", "xml-escape", "json-formatter"],
  },
  {
    name: "XML Escape",
    slug: "xml-escape",
    description:
      "Escape or unescape XML special characters. Converts &, <, >, \", and ' to their XML entity equivalents and back.",
    shortDescription: "Escape XML characters",
    category: "encoders",
    keywords: ["xml escape", "xml encode", "xml special characters", "xml entities", "escape xml online"],
    icon: "X\\",
    relatedSlugs: ["html-entity-encoder", "javascript-escape", "json-escape"],
  },
  {
    name: "SQL Escape",
    slug: "sql-escape",
    description:
      "Escape strings for safe use inside SQL queries. Escapes single quotes and other special characters to prevent SQL injection.",
    shortDescription: "Escape SQL strings",
    category: "encoders",
    keywords: ["sql escape", "sql string escape", "escape sql", "sql injection prevention", "sql encode"],
    icon: "SQL\\",
    relatedSlugs: ["javascript-escape", "json-escape", "xml-escape"],
  },
  {
    name: "CSV Escape",
    slug: "csv-escape",
    description:
      "Escape or unescape CSV fields per RFC 4180. Wraps values containing commas, quotes, or newlines in double quotes.",
    shortDescription: "Escape CSV fields",
    category: "encoders",
    keywords: ["csv escape", "csv encode", "escape csv field", "rfc 4180", "csv quote"],
    icon: "CSV\\",
    relatedSlugs: ["csv-to-json", "csv-to-xml", "json-escape"],
  },
  // --- Converters ---
  {
    name: "XML to JSON Converter",
    slug: "xml-to-json",
    description:
      "Convert XML documents to JSON format. Handles attributes, nested elements, and text content automatically.",
    shortDescription: "Convert XML to JSON",
    category: "converters",
    keywords: ["xml to json", "xml json converter", "convert xml to json online", "xml parser"],
    icon: "X→J",
    relatedSlugs: ["json-to-xml", "xml-formatter", "json-formatter"],
  },
  {
    name: "JSON to XML Converter",
    slug: "json-to-xml",
    description:
      "Convert JSON objects to XML format. Generates well-formed XML from JSON data with configurable root element name.",
    shortDescription: "Convert JSON to XML",
    category: "converters",
    keywords: ["json to xml", "json xml converter", "convert json to xml online", "json serializer"],
    icon: "J→X",
    relatedSlugs: ["xml-to-json", "xml-formatter", "json-formatter"],
  },
  {
    name: "CSV to JSON Converter",
    slug: "csv-to-json",
    description:
      "Convert CSV data to JSON format. Uses the first row as headers and produces an array of objects.",
    shortDescription: "Convert CSV to JSON",
    category: "converters",
    keywords: ["csv to json", "csv json converter", "convert csv to json online", "csv parser"],
    icon: "C→J",
    relatedSlugs: ["json-to-csv", "csv-to-xml", "json-formatter"],
  },
  {
    name: "CSV to XML Converter",
    slug: "csv-to-xml",
    description:
      "Convert CSV data to XML format. Uses the first row as element names and wraps each row in a configurable record tag.",
    shortDescription: "Convert CSV to XML",
    category: "converters",
    keywords: ["csv to xml", "csv xml converter", "convert csv to xml online", "csv parser xml"],
    icon: "C→X",
    relatedSlugs: ["csv-to-json", "xml-formatter", "json-to-xml"],
  },
  {
    name: "URL Parser",
    slug: "url-parser",
    description:
      "Parse any URL into its components: protocol, hostname, port, pathname, query string parameters, and hash fragment.",
    shortDescription: "Parse URL components",
    category: "converters",
    keywords: ["url parser", "url splitter", "parse url online", "query string parser", "url components"],
    icon: "URL",
    relatedSlugs: ["url-encode-decode", "json-formatter", "base64-encode-decode"],
  },
  // --- Generators ---
  {
    name: "QR Code Generator",
    slug: "qr-code-generator",
    description:
      "Generate QR codes from any text or URL. Download as PNG or SVG with configurable size and error correction level.",
    shortDescription: "Generate QR codes",
    category: "generators",
    keywords: ["qr code generator", "qr code maker", "generate qr code", "qr code online", "qr code free"],
    icon: "QR",
    relatedSlugs: ["url-encode-decode", "base64-encode-decode", "uuid-generator"],
  },
  // --- Validators ---
  {
    name: "HTML Validator",
    slug: "html-validator",
    description:
      "Validate HTML markup for structural errors and parse issues. Identifies unclosed tags, missing attributes, and malformed content.",
    shortDescription: "Validate HTML markup",
    category: "validators",
    keywords: ["html validator", "html checker", "validate html online", "html error checker", "html lint"],
    icon: "✓H",
    relatedSlugs: ["html-formatter", "xml-validator", "regex-tester"],
  },
  {
    name: "XPath Tester",
    slug: "xpath-tester",
    description:
      "Test XPath expressions against XML documents. View matching nodes, text content, and attributes in real-time.",
    shortDescription: "Test XPath expressions",
    category: "validators",
    keywords: ["xpath tester", "xpath evaluator", "test xpath online", "xpath expression", "xml xpath"],
    icon: "XP",
    relatedSlugs: ["xml-formatter", "xml-to-json", "regex-tester"],
  },
  {
    name: "Credit Card Validator",
    slug: "credit-card-validator",
    description:
      "Validate credit card numbers using the Luhn algorithm. Detects card type (Visa, Mastercard, Amex, etc.) and checks validity.",
    shortDescription: "Validate credit card numbers",
    category: "validators",
    keywords: ["credit card validator", "luhn algorithm", "card number checker", "validate credit card", "credit card checker"],
    icon: "CC",
    relatedSlugs: ["hash-generator", "regex-tester", "uuid-generator"],
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
