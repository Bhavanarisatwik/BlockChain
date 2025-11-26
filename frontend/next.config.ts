import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    // Exclude problematic node modules from build
    if (isServer) {
      config.externals = [...(config.externals || []), 'thread-stream', 'pino-transport'];
    }

    // Ignore test files and unnecessary files in modules
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    
    return config;
  },
  transpilePackages: ['@rainbow-me/rainbowkit', '@wagmi/connectors', 'viem'],
};

export default nextConfig;
