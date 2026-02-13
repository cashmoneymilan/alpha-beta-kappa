import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@the-convocation/twitter-scraper",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "unavatar.io",
      },
      {
        protocol: "https",
        hostname: "www.google.com",
      },
      {
        protocol: "https",
        hostname: "pbs.twimg.com",
      },
    ],
  },
};

export default nextConfig;
