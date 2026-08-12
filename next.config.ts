import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Your existing config options...

  async redirects() {
    return [
      // 1. Redirect all old blog category pages back to the main blog page
      {
        source: '/blog/category/:path*',
        destination: '/blog',
        permanent: true, // 301 Redirect tells Google to drop the old links
      },
      // 2. Fix the malformed junk URLs by redirecting them to the homepage
      {
        source: '/&',
        destination: '/',
        permanent: true,
      },
      {
        source: '/$',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;