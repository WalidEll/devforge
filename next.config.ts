import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  output: "export",       // Static export — all pages are pre-rendered
  trailingSlash: true,    // Cloudflare Pages serves index.html from /tool/ paths
  images: {
    unoptimized: true,    // next/image optimization requires a server; we're fully static
  },
};

export default withSentryConfig(nextConfig, {
  org: "walid-vx",
  project: "devforge",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Upload a larger set of source maps for prettier stack traces
  widenClientFileUpload: true,

  // tunnelRoute omitted — requires a server; this app uses output: "export"

  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },
});
