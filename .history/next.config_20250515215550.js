/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/images/**',
      }
    ],
    unoptimized: false
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    };
    return config;
  },
  // Add rewrites for product URLs
  async rewrites() {
    return [
      {
        source: '/:slug',
        destination: '/products/:slug',
        has: [
          {
            type: 'query',
            key: 'slug',
            value: '(?!api|_next|static|favicon.ico|about-us|cart|checkout|login|register|my-orders|order-success|warranty-policy|return-policy|care-instructions|help|settings|saved-items|admin|tops|bottoms|accessories).*',
          },
        ],
      },
    ]
  },
  // Add this to ensure static files are served correctly
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          }
        ]
      }
    ];
  },
};

module.exports = nextConfig;