import type { NextConfig } from 'next';
import packageJson from './package.json';

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',

  // Optimize for production
  reactStrictMode: true,

  // Mantine optimization
  experimental: {
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
  },

  // Expose app version from package.json
  env: {
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
  },
};

export default nextConfig;
