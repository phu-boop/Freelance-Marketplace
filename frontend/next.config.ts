import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: 'http://localhost:3001/api/auth/:path*', // User Service
      },
      {
        source: '/api/users/:path*',
        destination: 'http://localhost:3001/api/users/:path*', // User Service
      },
      {
        source: '/api/jobs/:path*',
        destination: 'http://localhost:3002/jobs/:path*', // Ensure /jobs prefix is kept
      },
      { // Special case for flat job routes if any
        source: '/jobs/:path*',
        destination: 'http://localhost:3002/jobs/:path*',
      },
      {
        source: '/storage/:path*',
        destination: 'http://localhost:3011/storage/:path*', // Keep /storage prefix
      },
      {
        source: '/api/admin/:path*',
        destination: 'http://localhost:3009/:path*', // Admin Service
      },
    ];
  },
};

export default nextConfig;
