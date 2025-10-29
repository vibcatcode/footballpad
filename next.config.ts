import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/hosanna',
        destination: '/hpl.html',
      },
    ];
  },
};

export default nextConfig;
