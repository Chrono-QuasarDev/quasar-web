import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async rewrites() {
    // Optional: proxy API in dev to avoid CORS surprises when API runs elsewhere.
    // The app primarily uses NEXT_PUBLIC_API_URL directly.
    return [];
  },
};

export default nextConfig;
