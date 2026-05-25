import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emits a minimal self-contained server bundle in .next/standalone for
  // Docker builds. The Dockerfile copies that folder plus .next/static and
  // ./public, then runs `node server.js` — no node_modules at runtime.
  output: "standalone",
};

export default nextConfig;
