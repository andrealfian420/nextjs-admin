/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      // { protocol: 'https', hostname: 'i.pravatar.cc' }, // Example for external image source
    ],
  },
};
export default nextConfig;
