import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    ".space-z.ai",
    ".railway.app",
    ".up.railway.app",
    "192.168.1.102",
    "127.0.0.1",
    "localhost",
    ".loca.lt",
    ".lhr.life",
    ".trycloudflare.com",
    "*.trycloudflare.com",
    ".pinggy-free.link",
    "*.pinggy-free.link",
    "*.run.pinggy-free.link",
  ],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
