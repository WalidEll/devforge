import Link from "next/link";
import { toolNavSections, tutorialNavSections } from "@/lib/navigation";

export default function Footer() {
  const tutorialLinks = [
    { label: "GCP Networking", href: "/tutorials/" },
    { label: "GCP Security", href: "/tutorials/" },
    { label: "GKE & Kubernetes", href: "/tutorials/" },
    { label: "Terraform", href: "/tutorials/" },
    { label: "CI/CD", href: "/tutorials/" },
    { label: "Monitoring", href: "/tutorials/" },
    { label: "DevOps Fundamentals", href: "/tutorials/" },
    { label: "Architecture Patterns", href: "/tutorials/" },
  ];

  const toolLinks = toolNavSections.map((s) => ({
    label: s.title,
    href: `/tools/${s.slug}/`,
  }));

  const pathLinks = [
    { label: "GCP Networking Engineer", href: "/paths/gcp-networking-engineer/" },
    { label: "Kubernetes Administrator", href: "/paths/kubernetes-administrator/" },
    { label: "Terraform Practitioner", href: "/paths/terraform-practitioner/" },
    { label: "DevOps Foundations", href: "/paths/devops-foundations/" },
    { label: "GCP Security Engineer", href: "/paths/gcp-security-engineer/" },
  ];

  return (
    <footer className="border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Sitemap grid */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {/* Tutorials */}
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Tutorials
            </h3>
            <ul className="space-y-2">
              {tutorialLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/tutorials/"
                  className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  All tutorials →
                </Link>
              </li>
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Tools
            </h3>
            <ul className="space-y-2">
              {toolLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Learning Paths */}
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Learning Paths
            </h3>
            <ul className="space-y-2">
              {pathLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Platform
            </h3>
            <ul className="space-y-2">
              {[
                { label: "Home", href: "/" },
                { label: "About", href: "/about/" },
                { label: "Privacy Policy", href: "/privacy-policy/" },
                { label: "Terms", href: "/terms/" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="https://ko-fi.com/devforgetools"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300 transition-colors"
                >
                  ☕ Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-gray-200 pt-6 dark:border-gray-800">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              &copy; {new Date().getFullYear()}{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                <span className="text-blue-600">Dev</span>Forge
              </span>
              . Free cloud engineering tools & tutorials.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-600">
              Built for cloud engineers, DevOps practitioners, and platform teams.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
