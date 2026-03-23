import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Required for static export
  },
  // If deploying to a project page (e.g. username.github.io/repo-name), 
  // you might need basePath and assetPrefix.
  // basePath: '/your-repo-name',
};

export default nextConfig;
