import type { NextConfig } from 'next';
import { buildRemotePatterns } from './src/lib/remote-patterns';

const { patterns, rejected } = buildRemotePatterns(
  process.env.API_URL,
  process.env.MEDIA_URL,
);

if (rejected.length > 0) {
  console.warn(
    `[next.config] Ignored image URLs (not plain http/https): ${rejected.join(', ')}`,
  );
}

const nextConfig: NextConfig = {
  output: 'standalone',
  reactCompiler: true,
  images: {
    remotePatterns: patterns,
    // In development the browser loads images straight from their source, because the dev
    // server may not reach the public media host (e.g. from inside Docker).
    unoptimized: process.env.NODE_ENV === 'development',
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};
export default nextConfig;
