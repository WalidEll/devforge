# DevForge

DevForge is a Next.js application for browser-based developer tools and hands-on tutorials. This repo now includes the **GCP Virtual Network Planner**, an interactive client-side network modeling tool for Google Cloud.

## Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## GCP Virtual Network Planner

Route: `http://localhost:3000/gcp-virtual-network-planner`

The planner is a browser-based MVP for designing and validating Google Cloud network topologies. It includes:

- React Flow canvas with drag-and-drop GCP components
- Editable properties panel backed by Zustand state
- Pure TypeScript validation rules for CIDR overlap, NAT gaps, firewall risk, DNS issues, and peering assumptions
- Educational traffic simulation for VM, internet, and on-prem paths
- Client-side exports for JSON, Terraform, gcloud commands, Markdown, PNG, and SVG

The simulator is intentionally educational. It approximates GCP behavior and is **not** a replacement for Google Cloud Network Intelligence Center or production policy validation.

## Example architecture

A ready-to-import sample is available at:

- `public/examples/gcp-virtual-network-planner-web-tier.json`

You can also load built-in samples directly from the planner toolbar.

## Testing

```bash
npm run test
```

Current test coverage focuses on the planner engines:

- CIDR overlap detection
- Firewall rule matching
- Cloud NAT validation
- Traffic simulation
- Terraform generation

## Useful scripts

```bash
npm run dev
npm run build
npm run lint
npm run test
```
