import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  output: "export",       // Static export — all 27 pages are pre-rendered
  trailingSlash: true,    // Cloudflare Pages serves index.html from /tool/ paths
  images: {
    unoptimized: true,    // next/image optimization requires a server; we're fully static
  },
};

export default withSentryConfig(nextConfig, {
  org: "walid-vx",
  project: "devforge",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  // tunnelRoute omitted — requires a server; this app is fully static
  webpack: {
    automaticVercelMonitors: true,
    treeshake: {
      removeDebugLogging: true,
    },
  },
});
