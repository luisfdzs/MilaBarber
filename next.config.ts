import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  images: {
    loader: 'custom',
    loaderFile: './sanity/imageLoader.ts',
    deviceSizes: [420, 640, 828, 1200, 1600, 2048, 2560],
    qualities: [75, 82],
  },

  async redirects() {
    return [
      { source: '/login', destination: '/entrar', permanent: true },
      { source: '/user/home', destination: '/cuenta', permanent: true },
      { source: '/user/services', destination: '/servicios', permanent: true },
      { source: '/user/profile', destination: '/cuenta/perfil', permanent: true },
    ]
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ]
  },
}

export default nextConfig
