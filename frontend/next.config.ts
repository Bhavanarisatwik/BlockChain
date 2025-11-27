import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile these packages for compatibility
  transpilePackages: ['@rainbow-me/rainbowkit', '@wagmi/connectors', 'viem'],

  // Disable strict mode for Web3 compatibility
  reactStrictMode: false,

  // Ignore TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },

  // Enable Turbopack compatibility
  turbopack: {},

  // Mark problematic packages as external for server
  serverExternalPackages: ['pino', 'pino-pretty', 'thread-stream'],

  // Webpack config to handle pino/thread-stream issues
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': false,
    };

    if (!isServer) {
      // Don't resolve 'fs', 'net', etc on client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
      };
    }

    // Ignore pino test files that cause issues
    config.module = config.module || {};
    config.module.noParse = [/thread-stream\/test/];

    return config;
  },
};

export default nextConfig;
