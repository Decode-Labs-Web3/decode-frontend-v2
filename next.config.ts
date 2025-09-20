import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["@reown/appkit"],
  env: {
    BACKEND_BASE_URL: process.env.BACKEND_BASE_URL,
  },

  images: {
    unoptimized: true,
    domains: [],
    remotePatterns: [],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // CORS Configuration - Restrictive
          {
            key: "Access-Control-Allow-Origin",
            value:
              process.env.NODE_ENV === "production"
                ? "https://decode.com"
                : "http://localhost:3000",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization, frontend-internal-request",
          },
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
          // Security Headers
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://api.pinata.cloud https://gateway.pinata.cloud https://fonts.reown.com https://api.web3modal.org https://registry.npmjs.org https://pulse.walletconnect.org https://verify.walletconnect.org https://api.reown.com https://explorer-api.walletconnect.com wss://relay.walletconnect.org wss://*.walletconnect.org; frame-src 'self' https://verify.walletconnect.org; object-src 'none'; base-uri 'self'; form-action 'self'; worker-src 'self' blob:; child-src 'self' blob:;",
          },
        ],
      },
    ];
  },

  webpack: (config, { isServer }) => {
    if (Array.isArray(config.externals)) {
      config.externals.push("pino-pretty", "lokijs", "encoding");
    } else {
      config.externals = ["pino-pretty", "lokijs", "encoding"];
    }

    // Fix for dynamic imports and chunk loading issues
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Ensure proper handling of dynamic imports
    config.optimization.splitChunks = {
      ...config.optimization.splitChunks,
      cacheGroups: {
        ...config.optimization.splitChunks?.cacheGroups,
        appkit: {
          test: /[\\/]node_modules[\\/]@reown[\\/]/,
          name: "appkit",
          chunks: "all",
          priority: 10,
        },
      },
    };

    return config;
  },
};

export default nextConfig;
