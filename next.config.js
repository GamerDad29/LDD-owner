/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'luckyduckdealz.com',
        pathname: '/cdn/shop/files/**',
      },
    ],
  },
}

module.exports = nextConfig
