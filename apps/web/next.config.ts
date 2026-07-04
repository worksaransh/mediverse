import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@mediverse/ui",
    "@mediverse/db",
    "@mediverse/ai",
    "@mediverse/ingestion",
  ],
};

export default nextConfig;
