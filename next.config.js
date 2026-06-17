/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Enable standalone output for Docker/containerized deployments
  output: 'standalone',
  // Image optimization
  images: {
    domains: [],
  },
  // Environment variables available to the browser
  env: {
    NEXT_PUBLIC_APP_NAME: 'baiduchat2api-manage',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },
}

module.exports = nextConfig
