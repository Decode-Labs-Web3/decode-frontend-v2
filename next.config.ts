import type { NextConfig } from "next";

const PROD = process.env.NODE_ENV === "production";
const PROD_ORIGIN =
  process.env.PUBLIC_FRONTEND_URL || "https://decode.decodenetwork.app";
if (PROD && !PROD_ORIGIN) {
  throw new Error("PUBLIC_FRONTEND_URL is required in production builds");
}

const BACKEND = process.env.BACKEND_BASE_URL || "";
const SIO_URL = process.env.NEXT_PUBLIC_SIO_URL || "";

// host ws/wss to add to CSP
let SIO_CONNECT_SRC = "";
try {
  if (SIO_URL) {
    const u = new URL(SIO_URL);
    // Engine.io ws(s)://host[:port]/socket.io
    SIO_CONNECT_SRC = `${u.protocol.startsWith("wss") ? "wss" : "ws"}://${
      u.host
    }`;
  }
} catch {
  /* ignore */
}

const nextConfig: NextConfig = {
  reactStrictMode: false,
  serverExternalPackages: ["@reown/appkit"],
  env: {
    BACKEND_BASE_URL: process.env.BACKEND_BASE_URL,
  },

  output: "standalone",

  // Compiler optimizations
  compiler: {
    // Remove console.log in production only
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },

  // Optimize images
  images: {
    unoptimized: true,
    domains: [],
    remotePatterns: [],
    // Enable modern image formats
    formats: ["image/webp", "image/avif"],
    // Optimize image loading
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
