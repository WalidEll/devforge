import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",       // Static export — all 27 pages are pre-rendered
  trailingSlash: true,    // Cloudflare Pages serves index.html from /tool/ paths
  images: {
    unoptimized: true,    // next/image optimization requires a server; we're fully static
  },
};

export default nextConfig;
