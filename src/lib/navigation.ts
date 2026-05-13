import { tools } from "@/lib/tools";
import { tutorials } from "@/lib/tutorials";

// ─── Tool URL helpers ────────────────────────────────────────────────────────

/** Maps ToolCategory → URL segment used in /tools/[category]/[slug] */
export const toolCategorySlug: Record<string, string> = {
  formatters: "formatters",
  encoders: "encoders",
  generators: "generators",
  converters: "converters",
  validators: "validators",
  networking: "networking",
};

export function getToolPath(slug: string): string {
  const tool = tools.find((t) => t.slug === slug);
  if (!tool) return `/tools/${slug}/`;
  const catSlug = toolCategorySlug[tool.category] ?? tool.category;
  return `/tools/${catSlug}/${slug}/`;
}

// ─── Sidebar navigation tree ─────────────────────────────────────────────────

export interface NavItem {
  title: string;
  href: string;
  badge?: string; // "New" | "Beta" | difficulty label
  children?: NavItem[];
}

export interface NavSection {
  title: string;
  slug: string;
  icon: string; // emoji / short text
  items: NavItem[];
}

/** Tutorial categories with display metadata, ordered for sidebar */
export const tutorialNavSections: NavSection[] = [
  {
    title: "GCP Networking",
    slug: "gcp-networking",
    icon: "🌐",
    items: [],
  },
  {
    title: "GCP Security",
    slug: "gcp-security",
    icon: "🔒",
    items: [],
  },
  {
    title: "GCP Compute",
    slug: "gcp-compute",
    icon: "⚙️",
    items: [],
  },
  {
    title: "GKE & Kubernetes",
    slug: "kubernetes",
    icon: "☸",
    items: [],
  },
  {
    title: "Terraform",
    slug: "terraform",
    icon: "🏗",
    items: [],
  },
  {
    title: "CI/CD",
    slug: "cicd",
    icon: "🔄",
    items: [],
  },
  {
    title: "Monitoring",
    slug: "monitoring",
    icon: "📊",
    items: [],
  },
  {
    title: "Cloudflare",
    slug: "cloudflare",
    icon: "☁",
    items: [],
  },
  {
    title: "DevOps",
    slug: "devops",
    icon: "🛠",
    items: [],
  },
  {
    title: "Architecture",
    slug: "architecture",
    icon: "🏛",
    items: [],
  },
  {
    title: "Networking",
    slug: "networking",
    icon: "🔗",
    items: [],
  },
  {
    title: "Security",
    slug: "security",
    icon: "🛡",
    items: [],
  },
  {
    title: "Linux & CLI",
    slug: "linux",
    icon: "🐧",
    items: [],
  },
  {
    title: "Web Development",
    slug: "web",
    icon: "💻",
    items: [],
  },
  {
    title: "Databases",
    slug: "databases",
    icon: "🗄",
    items: [],
  },
];

/** Tutorial category → tutorial keyword matching for sidebar grouping */
export const tutorialCategoryMapping: Record<string, string[]> = {
  "gcp-networking": ["gcp", "vpc", "subnet", "firewall", "cloud nat", "load balancing", "google cloud network"],
  "gcp-security": ["iam", "kms", "secret manager", "security command center", "gcp security"],
  "gcp-compute": ["cloud run", "gce", "app engine", "cloud functions", "gcp compute"],
  kubernetes: ["kubernetes", "gke", "k8s", "kubectl", "helm", "pod", "deployment"],
  terraform: ["terraform", "hcl", "provider", "module", "state"],
  cicd: ["ci/cd", "github actions", "cloud build", "argocd", "jenkins", "pipeline"],
  monitoring: ["monitoring", "prometheus", "grafana", "logging", "observability", "alert"],
  cloudflare: ["cloudflare", "zero trust", "workers", "tunnel", "waf"],
  devops: ["devops", "docker", "container", "git", "scripting"],
  architecture: ["architecture", "multi-cloud", "disaster recovery", "cost optimization"],
  networking: ["tcp", "dns", "http", "network", "bgp", "routing"],
  security: ["encryption", "tls", "ssl", "authentication", "authorization", "cryptography"],
  linux: ["linux", "bash", "shell", "cli", "command", "system administration"],
  web: ["react", "next.js", "api", "rest", "graphql", "frontend", "backend"],
  databases: ["sql", "nosql", "postgres", "mysql", "redis", "database"],
};

/** Tool nav sections — computed from the tools data */
export const toolNavSections: NavSection[] = [
  {
    title: "Networking",
    slug: "networking",
    icon: "🔗",
    items: tools
      .filter((t) => t.category === "networking")
      .map((t) => ({ title: t.name, href: getToolPath(t.slug) })),
  },
  {
    title: "Formatters",
    slug: "formatters",
    icon: "{ }",
    items: tools
      .filter((t) => t.category === "formatters")
      .map((t) => ({ title: t.name, href: getToolPath(t.slug) })),
  },
  {
    title: "Encoders & Decoders",
    slug: "encoders",
    icon: "🔐",
    items: tools
      .filter((t) => t.category === "encoders")
      .map((t) => ({ title: t.name, href: getToolPath(t.slug) })),
  },
  {
    title: "Generators",
    slug: "generators",
    icon: "✨",
    items: tools
      .filter((t) => t.category === "generators")
      .map((t) => ({ title: t.name, href: getToolPath(t.slug) })),
  },
  {
    title: "Converters",
    slug: "converters",
    icon: "⇄",
    items: tools
      .filter((t) => t.category === "converters")
      .map((t) => ({ title: t.name, href: getToolPath(t.slug) })),
  },
  {
    title: "Validators",
    slug: "validators",
    icon: "✓",
    items: tools
      .filter((t) => t.category === "validators")
      .map((t) => ({ title: t.name, href: getToolPath(t.slug) })),
  },
];

/** Flat list of all nav sections for quick lookup */
export function getAllNavSections(): NavSection[] {
  return [...tutorialNavSections, ...toolNavSections];
}

/** Build tutorial nav items from the static tutorials array using keyword matching */
export function getTutorialNavItems(sectionSlug: string): NavItem[] {
  const keywords = tutorialCategoryMapping[sectionSlug] ?? [];
  const section = tutorialNavSections.find((s) => s.slug === sectionSlug);

  const matched = tutorials
    .filter((t) => {
      const haystack = `${t.title} ${t.description} ${t.keywords.join(" ")}`.toLowerCase();
      return keywords.some((kw) => haystack.includes(kw));
    })
    .slice(0, 8)
    .map((t) => ({
      title: t.title,
      href: `/tutorials/${t.slug}/`,
      badge: t.difficulty,
    }));

  if (matched.length === 0) {
    return [{ title: `Browse ${section?.title ?? sectionSlug}`, href: "/tutorials/" }];
  }

  return [
    ...matched,
    { title: "Browse all tutorials →", href: "/tutorials/" },
  ];
}

// ─── Breadcrumb helpers ───────────────────────────────────────────────────────

export interface BreadcrumbItem {
  label: string;
  href: string;
}

/** Derives breadcrumb trail from a URL pathname */
export function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const crumbs: BreadcrumbItem[] = [{ label: "Home", href: "/" }];
  const segments = pathname.replace(/\/$/, "").split("/").filter(Boolean);

  const labelMap: Record<string, string> = {
    tutorials: "Tutorials",
    tools: "Tools",
    paths: "Learning Paths",
    formatters: "Formatters",
    encoders: "Encoders & Decoders",
    generators: "Generators",
    converters: "Converters",
    validators: "Validators",
    networking: "Networking",
    security: "Security",
    gcp: "GCP",
    kubernetes: "Kubernetes",
    terraform: "Terraform",
    devops: "DevOps",
    cicd: "CI/CD",
    monitoring: "Monitoring",
    cloudflare: "Cloudflare",
    architecture: "Architecture",
    linux: "Linux & CLI",
    web: "Web Dev",
    databases: "Databases",
  };

  let built = "";
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    built += `/${seg}`;

    // For the last segment, try to match a tool name (client-safe — tools array has no fs deps)
    if (i === segments.length - 1) {
      const tool = tools.find((t) => t.slug === seg);
      if (tool) {
        crumbs.push({ label: tool.name, href: `${built}/` });
        break;
      }
      // For learning paths, match from static list
      const path = learningPaths.find((p) => p.slug === seg);
      if (path) {
        crumbs.push({ label: path.title, href: `${built}/` });
        break;
      }
    }

    const label = labelMap[seg] ?? seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    crumbs.push({ label, href: `${built}/` });
  }

  return crumbs;
}

// ─── Learning paths (lightweight definition) ─────────────────────────────────

export interface LearningPath {
  slug: string;
  title: string;
  description: string;
  icon: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedHours: number;
  tags: string[];
  modules: {
    title: string;
    tutorials: string[]; // tutorial slugs in order
  }[];
}

export const learningPaths: LearningPath[] = [
  {
    slug: "gcp-networking-engineer",
    title: "GCP Networking Engineer",
    description:
      "Master Google Cloud VPC networking, firewall policies, load balancing, Cloud NAT, and hybrid connectivity. Build production-grade network architectures from scratch.",
    icon: "🌐",
    difficulty: "intermediate",
    estimatedHours: 8,
    tags: ["GCP", "Networking", "VPC", "Firewall"],
    modules: [
      {
        title: "VPC Foundations",
        tutorials: [
          "gcp-vpc-beginner-guide",
          "gcp-firewall-rules-explained-with-real-examples",
          "gcp-routing-tutorial",
        ],
      },
      {
        title: "Advanced Networking",
        tutorials: [
          "cloud-dns-explained-for-cloud-engineers",
          "advanced-gcp-networking-tutorials",
        ],
      },
    ],
  },
  {
    slug: "kubernetes-administrator",
    title: "Kubernetes Administrator",
    description:
      "Go from zero to running production Kubernetes clusters on GKE. Learn workload management, networking, storage, and cluster operations.",
    icon: "☸",
    difficulty: "intermediate",
    estimatedHours: 12,
    tags: ["Kubernetes", "GKE", "Docker", "Containers"],
    modules: [
      {
        title: "Cluster Fundamentals",
        tutorials: [],
      },
      {
        title: "Workloads & Services",
        tutorials: [],
      },
    ],
  },
  {
    slug: "terraform-practitioner",
    title: "Terraform Practitioner",
    description:
      "Learn Infrastructure as Code with Terraform. Write reusable modules, manage state, and provision GCP infrastructure declaratively.",
    icon: "🏗",
    difficulty: "beginner",
    estimatedHours: 6,
    tags: ["Terraform", "IaC", "GCP", "Modules"],
    modules: [
      {
        title: "Terraform Basics",
        tutorials: [],
      },
      {
        title: "Modules & State",
        tutorials: [],
      },
    ],
  },
  {
    slug: "devops-foundations",
    title: "DevOps Foundations",
    description:
      "Build a strong DevOps foundation: Git workflows, Docker, CI/CD pipelines, monitoring, and cloud deployment practices.",
    icon: "🛠",
    difficulty: "beginner",
    estimatedHours: 10,
    tags: ["DevOps", "Docker", "CI/CD", "Git"],
    modules: [
      {
        title: "Version Control & CI/CD",
        tutorials: [],
      },
      {
        title: "Containers & Orchestration",
        tutorials: [],
      },
    ],
  },
  {
    slug: "gcp-security-engineer",
    title: "GCP Security Engineer",
    description:
      "Secure your Google Cloud workloads. Master IAM, VPC Service Controls, Secret Manager, Cloud Armor, and security monitoring.",
    icon: "🔒",
    difficulty: "advanced",
    estimatedHours: 10,
    tags: ["GCP", "Security", "IAM", "Compliance"],
    modules: [
      {
        title: "Identity & Access",
        tutorials: [],
      },
      {
        title: "Network Security",
        tutorials: [],
      },
    ],
  },
];
