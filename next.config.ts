import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: true,
  // This application does not use next/image. Disable the optimizer so the
  // bundled Sharp code has no runtime route exposed by the application.
  images: {
    unoptimized: true,
  },
  // PWA headers
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
        ],
      },
    ];
  },
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

const sentryConfig: NextConfig = withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  sourcemaps: { deleteSourcemapsAfterUpload: true },
  webpack: {
    treeshake: { removeDebugLogging: true },
    automaticVercelMonitors: true,
    reactComponentAnnotation: { enabled: true },
  },
});

export default process.env.NEXT_PUBLIC_SENTRY_DSN ? sentryConfig : nextConfig;
