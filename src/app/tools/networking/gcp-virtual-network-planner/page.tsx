import Link from "next/link";
import GcpVirtualNetworkPlanner from "@/components/GcpVirtualNetworkPlanner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateFaqJsonLd, generateToolJsonLd } from "@/lib/seo";
import { getToolBySlug } from "@/lib/tools";

const tool = getToolBySlug("gcp-virtual-network-planner")!;

const faqs = [
  {
    question: "Does this simulate Google Cloud exactly?",
    answer:
      "No. The planner is educational and approximates major routing, firewall, NAT, and topology decisions. It should not replace Google Cloud Network Intelligence Center, policy analyzer outputs, or live environment validation.",
  },
  {
    question: "What can I export from the planner?",
    answer:
      "You can export architecture JSON, Terraform, gcloud command scaffolding, Markdown documentation, and canvas images as PNG or SVG.",
  },
  {
    question: "Which components are included in the MVP?",
    answer:
      "The first production-ready slice focuses on VPCs, subnets, Compute Engine VMs, firewall rules, Cloud NAT, internet endpoints, validation, traffic simulation, and Terraform export.",
  },
];

const toolJsonLd = generateToolJsonLd(tool);
const faqJsonLd = generateFaqJsonLd(faqs);

export default function GcpVirtualNetworkPlannerPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="mx-auto max-w-[1600px] px-4 py-8">
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-4xl">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{tool.name}</h1>
              <p className="mt-3 text-base text-gray-600 dark:text-gray-300">{tool.description}</p>
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                Model Google Cloud VPC architectures visually, run design-time checks for common
                production mistakes, and generate infrastructure scaffolding without leaving the
                browser.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="success">Client-side only</Badge>
              <Badge variant="secondary">Terraform export</Badge>
              <Badge variant="warning">Traffic simulation</Badge>
              <Badge variant="outline">Educational GCP model</Badge>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <a
              href="/examples/gcp-virtual-network-planner-web-tier.json"
              download
              className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
            >
              Download sample JSON
            </a>
            <Link
              href="/tutorials/subnetting-and-cidr-planning-in-google-cloud"
              className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900"
            >
              Read CIDR planning tutorial
            </Link>
          </div>
        </section>

        <section className="mt-6">
          <GcpVirtualNetworkPlanner />
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>How to use it</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <p>Drag a VPC, subnets, VMs, firewall rules, Cloud Router, and Cloud NAT onto the canvas.</p>
              <p>Connect components to infer common relationships, then refine details in the properties panel.</p>
              <p>Run validation for CIDR, security, NAT, and topology issues, then simulate traffic paths.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What the MVP models</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <p>Custom VPC design, subnet attachments, VM placement, firewall intent, and private egress via Cloud NAT.</p>
              <p>Educational routing paths for internet, east-west VM traffic, and on-prem ingress via VPN assumptions.</p>
              <p>Export-ready architecture JSON and Terraform scaffolding for iteration outside the planner.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommended workflow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <p>Start with naming, regions, and CIDR boundaries before placing compute or security controls.</p>
              <p>Use the bundled sample architectures to compare healthy private egress designs with intentionally risky public patterns.</p>
              <p>Export Terraform only after validation is clean and the traffic simulator matches your expected ingress and egress paths.</p>
            </CardContent>
          </Card>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <div className="mt-4 space-y-4">
            {faqs.map((faq) => (
              <Card key={faq.question}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600 dark:text-gray-300">
                  {faq.answer}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
