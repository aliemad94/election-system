import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: true,
  // allowedDevOrigins is only meaningful in development.
  // In production, Railway serves over HTTPS with a fixed hostname.
  allowedDevOrigins: isDev
    ? [
        "localhost",
        "127.0.0.1",
        "192.168.1.102",
      ]
    : [],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
