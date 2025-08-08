/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ disables ESLint errors from blocking your Vercel deploy
  },
};

module.exports = nextConfig;
