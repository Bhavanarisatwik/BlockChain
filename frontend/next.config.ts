import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Use empty turbopack config to silence the warning
  // The app works fine without custom webpack config for production
  turbopack: {},
  
  // Transpile these packages for compatibility
  transpilePackages: ['@rainbow-me/rainbowkit', '@wagmi/connectors', 'viem'],
  
  // Disable strict mode for Web3 compatibility
  reactStrictMode: false,
  
  // Ignore TypeScript/ESLint errors during build (optional, for faster deploys)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
