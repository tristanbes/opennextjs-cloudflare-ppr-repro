import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This flag enables Partial Pre-Rendering (PPR).
  // With @opennextjs/cloudflare, the first request (cache MISS) renders correctly,
  // but all subsequent requests (cache HIT) serve only the static shell
  // without streaming the dynamic content — causing permanent loading states.
  cacheComponents: true,
};

export default nextConfig;
