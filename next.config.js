/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost', 'your-domain.com'],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  env: {
    NEXT_PUBLIC_APP_NAME: 'Hair Salon Pro',
    NEXT_PUBLIC_TIMEZONE: 'Europe/London',
  },
};

module.exports = nextConfig;
