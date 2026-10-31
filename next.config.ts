import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Webpack breaks @google/genai's auth dependency (gaxios) when bundled; load it from node_modules.
  serverExternalPackages: ["@google/genai"],
};

export default nextConfig;
