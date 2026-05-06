/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  },
  images: {
    domains: ['localhost', 'via.placeholder.com', 'images.unsplash.com'],
  },
};

module.exports = nextConfig;
