import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    allowedDevOrigins: ["10.1.216.57", "localhost:3000", "localhost:3001"],
  },
};

export default nextConfig;
