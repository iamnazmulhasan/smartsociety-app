/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bloomapp.club',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;