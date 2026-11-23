/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@project/shared'],
  async rewrites() {
    const backendUrl = process.env.BACKEND_INTERNAL_URL || 'http://127.0.0.1:4000';
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendUrl}/api/v1/:path*`,
      },
      {
        source: '/api/docs/:path*',
        destination: `${backendUrl}/api/docs/:path*`,
      },
      {
        source: '/api/docs',
        destination: `${backendUrl}/api/docs`,
      },
    ];
  },
};

module.exports = nextConfig;
