import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    turbopack: false,
  },
  webpack: (config, { isServer }) => {
    // Exclude problematic node modules from build
    config.externals = config.externals || [];
    
    if (isServer) {
      config.externals.push('thread-stream');
    }

    return config;
  },
};

export default nextConfig;
