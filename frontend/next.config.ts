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
      {
        source: '/api/invitations/:path*',
        destination: 'http://localhost:3002/api/invitations/:path*', // Job Service
      },
      {
        source: '/storage/:path*',
        destination: 'http://localhost:3011/storage/:path*', // Keep /storage prefix
      },
      {
        source: '/api/admin/:path*',
        destination: 'http://localhost:3009/:path*', // Admin Service
      },
      {
        source: '/api/analytics/:path*',
        destination: 'http://localhost:3014/api/analytics/:path*', // Analytics Service
      },
      {
        source: '/api/payments/:path*',
        destination: 'http://localhost:3005/api/payments/:path*', // Payment Service
      },
      {
        source: '/api/clouds/:path*',
        destination: 'http://localhost:3017/api/clouds/:path*', // Talent Cloud Service
      },
      {
        source: '/api/search/:path*',
        destination: 'http://localhost:3010/api/search/:path*', // Search Service
      },
      {
        source: '/api/contracts/:path*',
        destination: 'http://localhost:3004/api/contracts/:path*', // Contract Service
      },
    ];
  },
};

export default nextConfig;
