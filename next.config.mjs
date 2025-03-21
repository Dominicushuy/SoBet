/**
 * @type {import('next').NextConfig}
 */

const nextConfig = {
  // Strict mode giúp phát hiện các vấn đề tiềm ẩn trong quá trình phát triển
  reactStrictMode: true,

  // Cấu hình ESLint tích hợp với Next.js
  eslint: {
    // Cảnh báo thay vì fail build khi có lỗi ESLint trong production
    ignoreDuringBuilds: false,
    dirs: ['app', 'components', 'lib', 'types'],
  },

  // Cấu hình TypeScript
  typescript: {
    // Cảnh báo thay vì fail build khi có lỗi TypeScript trong production
    ignoreBuildErrors: false,
  },

  // Cấu hình output - standalone tạo ra build tối ưu cho production
  output: 'standalone',

  // Tối ưu hóa hình ảnh
  images: {
    domains: [
      'localhost',
      // Domain của Supabase storage
      'flxypumojeqxufdlogdd.supabase.co',
    ],
    formats: ['image/avif', 'image/webp'],
    // Cấu hình kích thước mặc định cho các hình ảnh
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Hỗ trợ đa ngôn ngữ - Lưu ý: cần chuyển sang middleware trong Next.js 14
  i18n: {
    locales: ['vi', 'en'],
    defaultLocale: 'vi',
    // Không tự động phát hiện ngôn ngữ theo trình duyệt
    localeDetection: false,
  },

  // Đường dẫn API proxy (nếu cần)
  async rewrites() {
    return [
      // Ví dụ rewrites nếu bạn cần
      // {
      //   source: '/api/external/:path*',
      //   destination: 'https://api.external-service.com/:path*',
      // },
    ];
  },

  // Cấu hình các redirect (nếu cần)
  async redirects() {
    return [
      {
        source: '/bet-history',
        destination: '/account/bets',
        permanent: true,
      },
      {
        source: '/admin-panel',
        destination: '/admin',
        permanent: true,
      },
    ];
  },

  // Headers bảo mật
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Cấu hình webpack tùy chỉnh (nếu cần)
  webpack: (config, { dev, isServer }) => {
    // Hỗ trợ import SVG như React components
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },

  // Cấu hình experimental features cho Next.js 14.1.3
  experimental: {
    // Server Actions đã có sẵn mặc định, không cần serverActions: true nữa
    serverComponentsExternalPackages: [],
    optimizeCss: true, // Tối ưu CSS trong production
  },

  // Cấu hình compiler
  compiler: {
    // Loại bỏ console.log trong production build
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn'],
          }
        : false,
  },

  // Cấu hình biến môi trường cho public runtime (truy cập từ client)
  env: {
    NEXT_PUBLIC_APP_NAME: 'Lottery Betting App',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    NEXT_PUBLIC_SUPABASE_PROJECT_ID: 'flxypumojeqxufdlogdd',
  },

  // Tối ưu hóa build
  poweredByHeader: false,
  generateEtags: true,

  // Xóa thông số telemetry (không sử dụng analyticsId: false)
};

export default nextConfig;
