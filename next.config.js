/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export', // Comment this out to enable API routes
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;